/**
 * benchmarks.js. Single source of truth for CX/CC benchmarks.
 * Every tool imports these classifiers so thresholds can never drift
 * between the color logic, the labels, the findings, and the actions.
 *
 * CANON (ratified for Tool Upgrades 2.0):
 *   Occupancy. healthy < 85% · caution 85 to 90% · critical > 90% · target band 83 to 87%
 *   Shrinkage. planning range 28 to 35% (labelled heuristic) · decompose above 35%
 *   Service.   default target 80% answered within 20s
 */

export const COLORS = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  electric: "#0088DD",
  navy: "#0B1D3A",
  muted: "#5B6E88",
};

export const BENCH = {
  occupancy: { healthyMax: 0.85, cautionMax: 0.90, targetLow: 0.83, targetHigh: 0.87 },
  shrinkage: { typicalLow: 0.28, typicalHigh: 0.35 },
  serviceLevel: { defaultTarget: 0.80, defaultThresholdSec: 20 },
};

export const pctStr = (n, d = 0) => `${(n * 100).toFixed(d)}%`;

/** Occupancy → band, color, label, plain-language message. Used everywhere. */
export function classifyOccupancy(occ) {
  const { healthyMax, cautionMax, targetLow, targetHigh } = BENCH.occupancy;
  if (occ > cautionMax)
    return {
      band: "critical",
      color: COLORS.red,
      label: "Critical",
      message: `Above ${pctStr(cautionMax)}, recovery time between contacts collapses. Burnout and attrition risk is high. Add capacity or reduce load.`,
    };
  if (occ > healthyMax)
    return {
      band: "caution",
      color: COLORS.amber,
      label: "Caution",
      message: `Sustained occupancy above ${pctStr(healthyMax)} correlates with attrition and quality loss. Target the ${pctStr(targetLow)} to ${pctStr(targetHigh)} band.`,
    };
  return {
    band: "healthy",
    color: COLORS.green,
    label: "Healthy",
    message: `Inside a healthy operating range. Agents have adequate recovery time.`,
  };
}

/** Shrinkage → elevated flag + message, consistent with every preset we ship. */
export function classifyShrinkage(sh) {
  const { typicalLow, typicalHigh } = BENCH.shrinkage;
  if (sh > typicalHigh)
    return {
      elevated: true,
      message: `${pctStr(sh)} is above the ${pctStr(typicalLow)} to ${pctStr(typicalHigh)} planning range (a labelled heuristic). Worth decomposing before you treat it as fixed.`,
    };
  return {
    elevated: false,
    message: `${pctStr(sh)} is at or below the top of the ${pctStr(typicalLow)} to ${pctStr(typicalHigh)} planning range (a labelled heuristic).`,
  };
}
/* ------------------------------------------------------ benchmark registry */

/*
 * BENCHMARK_SOURCES. Every benchmark constant a tool ships lives here, with its
 * provenance, or the suite fails. Decision 1-07, ratified. The registry grows one
 * tool at a time, shaped by the constants that tool actually carries, never by a
 * one-time sweep.
 *
 * Three kinds, because they fail for different reasons:
 *
 *   market     A published external figure. Must name its source and the date it
 *              was checked. A market entry without both is a structural defect.
 *   heuristic  An internal planning value the platform set. Labelled as such in
 *              every place it surfaces, because an unsourced number presented as
 *              a benchmark is a defect of the same class as a fabricated grade.
 *              A driver still at a heuristic default grades evidence Directional.
 *   threshold  A judgment line: a plausibility guard, a dominance test, a status
 *              band. Doctrine structural test two: it carries a stated rationale,
 *              it is versioned, and it moves only because the evidence moved,
 *              never because of conversion, engagement or lead volume.
 *
 * Structural violations throw at load, the same rule confidence.js applies. Every
 * entry is static code, so a malformed one is a coding defect and must stop the
 * suite rather than ship an unexplained number.
 */
export const BENCHMARK_KINDS = ["market", "heuristic", "threshold"];

const LBG = "license-gap";
const REVIEWED = "2026-09-21";
const HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your quote.";
const mod = (value, rationale) => ({ tool: LBG, kind: "heuristic", value, unit: "USD per seat per month", source: HEUR, reviewed: REVIEWED, version: 1, rationale });
const seat = (value, rationale) => ({ tool: LBG, kind: "heuristic", value, unit: "USD per seat per month", source: HEUR, reviewed: REVIEWED, version: 1, rationale });
const line = (value, unit, rationale) => ({ tool: LBG, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });

/* Cost per Contact vs Cost per Resolution. Defaults are an internal operating
   profile so the tool opens on a runnable case. A driver still at one grades
   evidence Directional. The vertical ranges are internal planning ranges, labelled
   as such on the page. The wage is the same BLS figure Staffing cites, held as this
   tool's own entry until TCO lands as the third consumer and one shared entry
   replaces both. */
const CPC = "cost-per-contact";
const CPC_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const cHeur = (value, unit, rationale) => ({ tool: CPC, kind: "heuristic", value, unit, source: CPC_HEUR, reviewed: REVIEWED, version: 1, rationale });
const cLine = (value, unit, rationale) => ({ tool: CPC, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const CPC_DEF = "Default so the tool opens on a runnable case.";
const CPC_VERTS = { fin: [8.5, 12, 11, 16, 72], health: [9, 14, 13, 20, 71], retail: [5, 8, 6, 10, 78] };
const CPC_VERT_FIELDS = [
  ["cpcLow", "USD per contact", "Low end of the internal cost per contact planning range"],
  ["cpcHigh", "USD per contact", "High end of the internal cost per contact planning range"],
  ["cprLow", "USD per resolution", "Low end of the internal cost per resolution planning range"],
  ["cprHigh", "USD per resolution", "High end of the internal cost per resolution planning range"],
  ["fcr", "percent", "Internal planning FCR for this vertical"],
];
const cpcVertEntries = Object.fromEntries(Object.entries(CPC_VERTS).flatMap(([k, vals]) =>
  CPC_VERT_FIELDS.map(([f, unit, what], i) => [`cpc.vert.${k}.${f}`, cHeur(vals[i], unit, `${what}. Context for the reader only. It feeds no figure and reaches no confidence axis.`)])));

/* Staffing Requirement Calculator. Presets are internal operating profiles, one per
   industry, so the tool opens on a runnable case. They are labelled heuristics in
   the registry and grade evidence Directional while a driver still holds one. */
const STF = "staffing-calculator";
const STF_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const sHeur = (value, unit, rationale) => ({ tool: STF, kind: "heuristic", value, unit, source: STF_HEUR, reviewed: REVIEWED, version: 1, rationale });
const sLine = (value, unit, rationale) => ({ tool: STF, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const STF_PRESETS = {
  general: [400, 360, 80, 20, 30], financial: [500, 320, 80, 20, 28], healthcare: [350, 420, 80, 30, 32],
  retail: [600, 280, 80, 20, 32], telecom: [550, 440, 80, 20, 30], insurance: [300, 480, 80, 30, 28], bpo: [700, 340, 80, 20, 34],
};
const STF_PRESET_FIELDS = [
  ["vol", "contacts per interval", "Voice contacts per interval for this profile"],
  ["aht", "seconds", "Average handle time for this profile"],
  ["slT", "percent answered", "Service level target for this profile"],
  ["slS", "seconds", "Answer threshold for this profile"],
  ["shrink", "percent", "Total shrinkage for this profile"],
];
const staffingPresetEntries = Object.fromEntries(Object.entries(STF_PRESETS).flatMap(([k, vals]) =>
  STF_PRESET_FIELDS.map(([f, unit, what], i) => [`staffing.preset.${k}.${f}`, sHeur(vals[i], unit, `${what}. An operating profile so the tool opens on a runnable case. A volume, handle time or shrinkage still at this value grades evidence Directional.`)])));

/* Channel Shift. Defaults are an internal operating profile so the tool opens on a
   runnable case, one entry per field under a template id. A graded driver still at
   its default grades evidence Directional. The wage is the same BLS figure Staffing
   and Cost per Contact cite, held as this tool's own entry until TCO lands and one
   shared entry replaces all three. Decision H, session 15. */
const CHS = "channel-shift";
const CHS_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const chHeur = (value, unit, rationale) => ({ tool: CHS, kind: "heuristic", value, unit, source: CHS_HEUR, reviewed: REVIEWED, version: 1, rationale });
const chLine = (value, unit, rationale) => ({ tool: CHS, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const CHS_DEF = "Default so the tool opens on a runnable case.";
const CHS_DEFAULTS = {
  monthlyContacts: [100000, "contacts per month", "A volume still at this value grades evidence Directional."],
  voicePct: [70, "percent of volume", "Voice share of the current mix."],
  voiceAHT: [7, "minutes", "A voice handle time still at this value grades evidence Directional."],
  voiceConc: [1, "concurrent contacts", "Voice is one contact at a time."],
  chatPct: [15, "percent of volume", "Chat share of the current mix."],
  chatAHT: [10, "minutes", "Chat handle time."],
  chatConc: [2.5, "concurrent contacts", "Typical chat session concurrency."],
  emailPct: [10, "percent of volume", "Email share of the current mix."],
  emailAHT: [5, "minutes", "Email handle time."],
  emailConc: [1, "concurrent contacts", "Email worked one at a time."],
  botPct: [5, "percent of volume", "Bot share of the current mix."],
  botCost: [0.5, "USD per bot contact", "A bot fee still at this value grades cost evidence Directional when the bot carries volume."],
  eligibility: [60, "percent of voice", "An eligibility still at this value grades evidence Directional."],
  shiftToChat: [10, "points of total volume", "Planned shift into chat."],
  shiftToBot: [10, "points of total volume", "Planned shift into the bot."],
  shiftToEmail: [0, "points of total volume", "Planned shift into email. Ships at zero."],
  resChat: [85, "percent resolved", "A chat resolution still at this value grades evidence Directional when chat carries a shift."],
  resBot: [65, "percent resolved", "A bot resolution still at this value grades evidence Directional when the bot carries a shift."],
  resEmail: [80, "percent resolved", "An email resolution still at this value grades evidence Directional when email carries a shift."],
  dispChat: [80, "percent displacing voice", "A chat displacement still at this value grades evidence Directional when chat carries a shift."],
  dispBot: [70, "percent displacing voice", "A bot displacement still at this value grades evidence Directional when the bot carries a shift."],
  dispEmail: [80, "percent displacing voice", "An email displacement still at this value grades evidence Directional when email carries a shift."],
  escReturnFactor: [1.2, "multiple of a normal call", "Friction of a recovery call after a failed shift."],
  trainingPerAgent: [1500, "USD per added agent", "Transition training cost."],
  rampWeeks: [4, "weeks", "Transition ramp length."],
};
const channelDefaultEntries = Object.fromEntries(Object.entries(CHS_DEFAULTS).map(([f, [v, unit, why]]) => [`channel.default.${f}`, chHeur(v, unit, `${CHS_DEF} ${why}`)]));

/* AI Deflection Reality Check. Defaults are an internal operating profile so the tool
   opens on a runnable case, one entry per field under a template id: aid.default for
   the shared inputs, aid.vendorA and aid.vendorB for the two assumption sets. A graded
   driver still at its set A default grades evidence Directional. The eligibility,
   resolution and repeat defaults are informed by published self-service ranges the
   page cites in its methodology, and are held as labelled heuristics because no single
   figure carries their denominator. Session 16, 11B. */
const AID = "ai-deflection";
const AID_HEUR = "Internal planning heuristic set by ContactCenterCX, informed by published self-service ranges. Not a cited benchmark. Replace with your own figures.";
const aHeur = (value, unit, rationale) => ({ tool: AID, kind: "heuristic", value, unit, source: AID_HEUR, reviewed: REVIEWED, version: 1, rationale });
const aLine = (value, unit, rationale) => ({ tool: AID, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const AID_DEF = "Default so the tool opens on a runnable case.";
const AID_DEFAULTS = {
  M: [80000, "contacts per month", "A volume still at this value grades evidence Directional."],
  cpc: [7, "USD per contact", "Loaded cost moves the vendor claim and moves net savings by exactly zero, so it reaches no confidence axis."],
  marg: [0, "USD per contact", "Zero means not supplied. The tool then derives marginal cost from loaded and grades cost evidence Directional."],
  eligibleRate: [55, "percent of total demand", "An eligibility still at this value grades evidence Directional."],
  rampMonths: [6, "months", "Ramp length when the ramp is on. It moves Year 1 and payback only."],
};
const AID_VENDOR_FIELDS = {
  apparentResolutionRate: ["percent of AI-involved conversations", "A resolution rate still at this value grades evidence Directional."],
  repeatLeakRate: ["percent of apparent resolutions", "A repeat rate still at this value grades evidence Directional."],
  escalationPenalty: ["percent handle time premium", "No single published figure exists. An escalation premium still at this value grades evidence Directional."],
  implOneTime: ["USD one time", "Ships at zero and is disclosed as optimistic while it stands."],
  botPlatformCost: ["USD per month", "A platform fee still at this value grades cost evidence Directional."],
  qaCost: ["USD per month", "Bot quality assurance cost."],
  tuningHours: ["hours per month", "Bot tuning effort."],
  tuningRate: ["USD per hour", "Bot tuning labor rate."],
  knowledgeMaintHours: ["hours per month", "Knowledge maintenance effort."],
  knowledgeRate: ["USD per hour", "Knowledge maintenance labor rate."],
};
const AID_VENDORS = {
  vendorA: [65, 18, 25, 0, 8000, 2000, 40, 65, 20, 55],
  vendorB: [58, 14, 18, 0, 5000, 1200, 25, 65, 12, 55],
};
const aidEntries = {
  ...Object.fromEntries(Object.entries(AID_DEFAULTS).map(([f, [v, unit, why]]) => [`aid.default.${f}`, aHeur(v, unit, `${AID_DEF} ${why}`)])),
  ...Object.fromEntries(Object.entries(AID_VENDORS).flatMap(([set, vals]) => Object.entries(AID_VENDOR_FIELDS).map(([f, [unit, why]], i) =>
    [`aid.${set}.${f}`, aHeur(vals[i], unit, `${AID_DEF} Assumption set ${set === "vendorA" ? "A, the graded set" : "B, shown for comparison and never graded"}. ${why}`)]))),
  "aid.derive.marginalShare": aHeur(0.6, "share of loaded cost", "Marginal cost derived from loaded when none is supplied. Disclosed on the page and grades cost evidence Directional."),
  "aid.band.estimate": aHeur(0.25, "share of net savings", "Sensitivity band printed around net savings when the resolution rate is an internal estimate. Display only. It reaches no confidence axis."),
  "aid.band.marketing": aHeur(0.25, "share of net savings", "Sensitivity band when the resolution rate comes from vendor marketing. Display only."),
  "aid.band.proposal": aHeur(0.15, "share of net savings", "Sensitivity band when the resolution rate comes from a proposal or SOW. Display only."),
  "aid.band.sla": aHeur(0.1, "share of net savings", "Sensitivity band when the resolution rate is a contracted floor with a remedy. Display only."),
  "aid.band.pilot": aHeur(0.1, "share of net savings", "Sensitivity band when the resolution rate was observed in the user's own environment. Display only."),
  "aid.upside.resolutionLift": aHeur(1.2, "multiple of apparent resolution", "Upside case resolution, capped at 100 percent. Feeds the verdict's upside test only. It reaches no confidence axis."),
  "aid.upside.repeatCut": aHeur(0.5, "multiple of repeat rate", "Upside case repeat rate. Feeds the verdict's upside test only."),
  "aid.read.margNearLoaded": aLine(0.85, "share of loaded cost", "Marginal cost at or above this share of loaded usually means loaded cost was entered twice. Disclosed, and holds completeness Directional."),
  "aid.read.eligibleRare": aLine(90, "percent of total demand", "Eligibility at or above this is rare outside narrow scopes. Disclosed on the page. Framing only."),
  "aid.read.resolutionRare": aLine(80, "percent of AI-involved conversations", "Apparent resolution at or above this is uncommon outside narrow FAQ scopes. Disclosed on the page. Framing only."),
  "aid.read.foundationFloor": aLine(0.35, "share of total demand", "Eligibility below this routes the verdict to fixing the foundation. A property of the answer. It reaches no confidence axis by doctrine."),
  "aid.guard.botNearFree": aLine(0.01, "USD operating cost per bot-attempted contact", "Operating cost at or below one cent per attempted conversation makes the program look costless and drives break-even toward zero. Set below the channel fee line because this cost is a flat monthly spend spread across volume, and a real program at scale runs a few cents. Holds completeness Directional."),
};

/* FCR Leakage Diagnostic. Defaults are an internal operating profile so the tool
   opens on a runnable case, one entry per field under fcr.default. A graded driver
   still at its default grades evidence Directional. The scope ceilings and the
   opportunity and capture curve are judgment values the page states openly. The
   thresholds hold completeness Directional when crossed, except where a rationale
   says display only. Session 18, 11B. */
const FCR = "fcr-leakage";
const FCR_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const fHeur = (value, unit, rationale) => ({ tool: FCR, kind: "heuristic", value, unit, source: FCR_HEUR, reviewed: REVIEWED, version: 1, rationale });
const fLine = (value, unit, rationale) => ({ tool: FCR, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const FCR_DEF = "Default so the tool opens on a runnable case.";
const FCR_DEFAULTS = {
  M: [50000, "contacts per month", "A volume still at this value grades evidence Directional."],
  fcrPct: [72, "percent", "An FCR still at this value grades evidence Directional."],
  mCPC: [6.5, "USD per contact", "A marginal cost still at this value grades cost evidence Directional."],
  lCPC: [11, "USD per contact", "Loaded cost is context for the unit metric only. It values no savings and reaches no confidence axis."],
  windowDays: [7, "days", "Callback window for the internal method. It moves a completeness check only."],
  measuredPct: [22, "percent of volume", "A measured repeat share still at this value grades evidence Directional."],
  measuredTargetPct: [0, "percent of volume", "Zero means model the target share proportionally on the measured base."],
  repeatMult: [1, "multiple of a first contact", "The conservative floor. At this value it cannot inflate the burden, so it does not bind evidence."],
  targetPct: [80, "percent", "Target FCR is the user's plan, not a claim about the operation. It reaches no evidence stream."],
  investOneTime: [150000, "USD one time", "A one-time cost still at this value grades cost evidence Directional."],
  investRecurring: [90000, "USD per year", "A recurring cost still at this value grades cost evidence Directional."],
};
const fcrEntries = {
  ...Object.fromEntries(Object.entries(FCR_DEFAULTS).map(([f, [v, unit, why]]) => [`fcr.default.${f}`, fHeur(v, unit, `${FCR_DEF} ${why}`)])),
  "fcr.scope.voice": fHeur(0.93, "practical maximum FCR", "Practical ceiling for assisted voice only, the most generous definition."),
  "fcr.scope.cc": fHeur(0.9, "practical maximum FCR", "Practical ceiling for contact center cross-channel resolution."),
  "fcr.scope.digital": fHeur(0.89, "practical maximum FCR", "Practical ceiling for digital plus assisted, which adds self-service to the resolution set."),
  "fcr.scope.enterprise": fHeur(0.88, "practical maximum FCR", "Practical ceiling for enterprise one-contact, the strictest definition and the substitution fallback."),
  "fcr.scope.undeclared": fHeur(0.9, "practical maximum FCR", "Ceiling applied while no scope is declared. An undeclared definition holds completeness Directional."),
  "fcr.curve.oppFloor": fHeur(0.15, "share of repeat burden", "Controllable opportunity at the strongest diagnostic score."),
  "fcr.curve.oppSpan": fHeur(0.65, "share of repeat burden", "Opportunity added from the strongest to the weakest diagnostic score."),
  "fcr.curve.oppCeil": fHeur(0.8, "share of repeat burden", "Controllable opportunity at the weakest diagnostic score."),
  "fcr.curve.capFloor": fHeur(0.25, "share of opportunity", "Year-one capture at the weakest diagnostic score."),
  "fcr.curve.capSpan": fHeur(0.65, "share of opportunity", "Capture added from the weakest to the strongest diagnostic score."),
  "fcr.curve.capCeil": fHeur(0.9, "share of opportunity", "Year-one capture at the strongest diagnostic score."),
  "fcr.band.estimate": fHeur(0.25, "share of burden", "Range printed around the burden when cost inputs are estimates. Display only. It reaches no confidence axis."),
  "fcr.band.ops": fHeur(0.15, "share of burden", "Range printed around the burden when cost inputs are operations data. Display only."),
  "fcr.band.finance": fHeur(0.1, "share of burden", "Range printed around the burden when cost inputs are finance-confirmed by the user's own account. Display only."),
  "fcr.ramp.months": fHeur(4, "months", "Linear ramp to steady-state savings. It moves payback and year-one net only."),
  "fcr.sens.aggMin": fHeur(1.5, "multiple of a first contact", "Floor of the aggressive repeat multiplier in the sensitivity rows. Display only."),
  "fcr.sens.aggMax": fHeur(3, "multiple of a first contact", "Ceiling of the aggressive repeat multiplier in the sensitivity rows. Display only."),
  "fcr.sens.aggStep": fHeur(0.4, "multiple of a first contact", "Step above the entered multiplier for the aggressive sensitivity row. Display only."),
  "fcr.read.margNearLoaded": fLine(0.85, "share of loaded cost", "Marginal cost at or above this share of loaded usually means loaded cost was entered as marginal. Disclosed, and holds completeness Directional."),
  "fcr.read.margFarBelow": fLine(0.35, "share of loaded cost", "Marginal cost at or below this share of loaded is outside the usual 50 to 75 percent range and burden scales with it. Disclosed, and holds completeness Directional."),
  "fcr.read.multHigh": fLine(2.5, "multiple of a first contact", "A repeat multiplier above this sits beyond most published estimates of 1.5x to 2x. Disclosed, and holds completeness Directional until validated."),
  "fcr.read.multElevated": fLine(2, "multiple of a first contact", "A repeat multiplier above this is elevated and noted on the page. Display only. It reaches no confidence axis."),
  "fcr.read.measuredMax": fLine(0.6, "share of volume", "A measured repeat share above this is outside the plausible range. Disclosed, and holds completeness Directional."),
  "fcr.read.windowShort": fLine(7, "days", "An internal callback window shorter than this undercounts return contacts and reads FCR high. Disclosed, and holds completeness Directional."),
  "fcr.guard.horizon": fLine(48, "months", "Payback search horizon. Beyond it the page reports beyond 48 months. A property of the answer, so it reaches no confidence axis."),
};

/* Shared entries. Owned by no single tool, cited by several.
   Decision H, session 15, deferred one shared wage entry until TCO landed. TCO has
   landed, so the three duplicate BLS wage entries collapse into one here.
   J10 names the load concepts. Three, and only three, multiples exist in the suite:
   benefits, marginal and fully loaded. Each names a different fact, so a tool cites the
   concept it actually means instead of inventing a multiple of its own. TCO's 1.25x for
   salaried staff is a fourth fact, a different population, and is registered to TCO. */
const SHARED = "shared";
const BLS_WAGE = "US Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024, SOC 43-4051 Customer Service Representatives, national median hourly wage.";
const TIME_DEF = "A definition: the full-time paid schedule of 40 hours a week for 52 weeks. Not a benchmark; change it where your contract hours differ.";
const shLoad = (value, rationale) => ({ tool: SHARED, kind: "heuristic", value, unit: "multiple of hourly wage", source: "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.", reviewed: REVIEWED, version: 1, rationale });

export const SHARED_BENCHMARKS = {
  "market.wage.agent": { tool: SHARED, kind: "market", value: 20.59, unit: "USD per hour", source: BLS_WAGE, reviewed: REVIEWED, version: 1, rationale: "The one agent wage benchmark the platform cites. Staffing, Cost per Contact and Channel Shift read it. It is the occupation median, no figure of the user's own, so a driver still at it grades evidence Directional." },
  "load.benefits": shLoad(1.30, "Wage plus benefits and employer payroll burden, and nothing else. The narrowest of the three loads. Use it wherever a wage becomes a loaded hourly rate for unit metrics."),
  "load.marginal": shLoad(1.18, "The variable cost that disappears when one contact goes away. The only load a saving may be valued on, because fixed technology and facilities do not fall with volume."),
  "load.fullyLoaded": shLoad(1.95, "Wage plus benefits, payroll tax, facilities, supervision and technology. The cost of standing a seat up. Use it only to price whole headcount, never to value a freed contact."),
  /* The full-time paid week and year. Definitions, not benchmarks, held once so every tool
     that prices a year of an agent uses the same hours. */
  "time.hours.week": { tool: SHARED, kind: "heuristic", value: 40, unit: "paid hours per week", source: TIME_DEF, reviewed: REVIEWED, version: 1, rationale: "Full-time paid week. Occupancy uses it to price the wages paid while a new hire ramps." },
  "time.hours.year": { tool: SHARED, kind: "heuristic", value: 2080, unit: "paid hours per year", source: TIME_DEF, reviewed: REVIEWED, version: 1, rationale: "The 2,080 hour full-time year (40 hours for 52 weeks). Occupancy prices an added agent on it; Shrinkage prices paid time off the queue on it." },
  /* The shrinkage planning range. Staffing flags a total above it and Shrinkage places a
     total against it. No published benchmark sets it, so it is a labelled planning range
     and says nothing about whether a total is right for an operation. */
  "shrinkage.range.low": { tool: SHARED, kind: "heuristic", value: BENCH.shrinkage.typicalLow, unit: "share of paid hours", source: "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.", reviewed: REVIEWED, version: 1, rationale: "Bottom of the planning range for total shrinkage. A total below it can mean coaching and training time is being skipped as easily as good control." },
  "shrinkage.range.high": { tool: SHARED, kind: "heuristic", value: BENCH.shrinkage.typicalHigh, unit: "share of paid hours", source: "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.", reviewed: REVIEWED, version: 1, rationale: "Top of the planning range for total shrinkage. Staffing flags a total above it as worth decomposing before it is treated as fixed." },
};

/* Total Cost of Ownership. TCO shipped a hand-written sources paragraph that named
   vendors for a containment range the tool does not model and cited BLS for a $19 wage
   that is not the BLS figure. Both claims are retired here. What remains is registered.

   The seven industry presets are an opening profile, not a benchmark set. They are
   internal planning values, and any field still sitting at one grades evidence
   Directional by the origin rule, so the tool never presents a preset as evidence. The
   wages are registered because a wage is the single number a reader is most likely to
   quote back as sourced. */
const TCO = "tco-calculator";
const TCO_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const tHeur = (value, unit, rationale) => ({ tool: TCO, kind: "heuristic", value, unit, source: TCO_HEUR, reviewed: REVIEWED, version: 1, rationale });
const tLine = (value, unit, rationale) => ({ tool: TCO, kind: "threshold", value, unit, source: "", reviewed: REVIEWED, version: 1, rationale });
const tWage = (value, label) => tHeur(value, "USD per hour", `Opening agent wage for the ${label} profile. An internal planning value, not a published median. The platform's sourced wage benchmark is market.wage.agent. A wage still at this value grades cost evidence Directional.`);

const tcoEntries = {
  "tco.load.salaried": tHeur(1.25, "multiple of hourly rate", "Supervisors, QA, WFM, trainers and IT are salaried and carry a lighter employer burden than an hourly agent, so they load at less than the agent benefits multiple. A fourth load concept because it prices a different population, not a different opinion about the same one."),
  "tco.hours.month": tHeur(173, "paid hours per staff member per month", "The 2,080 hour full-time year over twelve months. Labor cost is computed on paid hours, not productive hours, because shrinkage time is paid."),
  "tco.escalator.wage": { tool: TCO, kind: "market", label: "annual labor escalation", display: "3.5 percent a year", value: 0.035, unit: "annual rate", source: "US Bureau of Labor Statistics, Employment Cost Index, wages and salaries, private industry, twelve month change.", reviewed: REVIEWED, version: 1, rationale: "Annual labor escalation in the three year view. Applied only to the labor bucket, because wages and contracted license inflate at different rates." },
  "tco.escalator.license": tHeur(0.06, "annual rate", "Annual uplift on contracted recurring software at renewal. The middle of the 3 to 10 percent band enterprise renewal clauses commonly carry. Replace it with the uplift in your own contract."),
  "tco.escalator.blended": tHeur(0.045, "annual rate", "Single blended escalator, offered only when the user opts out of the split rates. A blended rate misstates a labor heavy base, so the split is the default."),
  "tco.check.perAgentCeiling": tLine(25000, "USD per agent per month", "Plausibility guard on input coding. A cost per agent per month above this sits outside any real operation and almost always means an annual or total figure was entered as monthly. Holds completeness Directional."),
  "tco.check.domShareMax": tLine(0.80, "share of the software bucket", "A single software line above this share of software cost is the signature of a miscategorized or mis-scaled input. Holds completeness Directional. AI usage is exempt, because usage pricing legitimately dominates."),
  "tco.check.spanMax": tLine(20, "agents per supervisor", "Span of control above this understates supervision cost and usually means supervisors were undercounted. Holds completeness Directional."),
  "tco.check.mixTol": tLine(0.005, "share of volume", "Tolerance on the channel mix totalling one. The voice share prices telephony, so a mix that does not total 100 percent misprices the usage bucket. Holds completeness Directional."),
  "tco.wage.general": tWage(19, "cross-industry"),
  "tco.wage.financial": tWage(22, "financial services"),
  "tco.wage.healthcare": tWage(20, "healthcare"),
  "tco.wage.retail": tWage(16, "retail and eCommerce"),
  "tco.wage.telecom": tWage(19, "telecommunications"),
  "tco.wage.insurance": tWage(21, "insurance"),
  "tco.wage.bpo": tWage(15, "BPO and outsourcer"),
};

/* Occupancy Risk Simulator. Occupancy itself is arithmetic (workload in Erlangs over
   agents) and needs no source. The bands are the platform's shared occupancy bands (BENCH).
   What this tool adds is a planning model of how attrition rises with occupancy; no
   published study gives a multiplier for a given occupancy, so both are labelled heuristics
   everywhere they appear, and the page says so beside every figure they drive. */
const OCC = "occupancy-risk";
const OCC_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const oHeur = (value, unit, rationale) => ({ tool: OCC, kind: "heuristic", value, unit, source: OCC_HEUR, reviewed: REVIEWED, version: 1, rationale });
const occEntries = {
  "occ.attrition.mult.caution": oHeur(1.15, "multiple of baseline attrition", "Attrition multiple applied while occupancy sits in the caution band, above the healthy maximum. Your entered attrition is taken as the rate at or below the healthy band."),
  "occ.attrition.mult.critical": oHeur(1.40, "multiple of baseline attrition", "Attrition multiple applied while occupancy sits in the critical band, above the caution maximum, and whenever offered load exceeds staffed agents."),
};

/* AHT Decomposition. Handle time is the sum of its parts, which is arithmetic. What the tool
   adds is a set of initiative levers, each a share of one component the initiative removes.
   No published study gives these shares for an operation, so every one is a labelled
   heuristic, opens as the default the buyer can edit, and only counts when the buyer turns
   its lever on. */
const AHT = "aht-decomposition";
const AHT_HEUR = "Internal planning heuristic set by ContactCenterCX. Not sourced to a published benchmark. Replace with your own figures.";
const ahHeur = (value, rationale) => ({ tool: AHT, kind: "heuristic", value, unit: "share of the component removed", source: AHT_HEUR, reviewed: REVIEWED, version: 1, rationale });
const ahtEntries = {
  "aht.lever.summarization.wrap": ahHeur(0.50, "After-call work removed by automatic call summaries and disposition."),
  "aht.lever.knowledge.search": ahHeur(0.40, "Knowledge search time removed when answers are surfaced during the contact."),
  "aht.lever.knowledge.hold": ahHeur(0.15, "Hold time removed when agents stop placing customers on hold to look things up."),
  "aht.lever.desktop.admin": ahHeur(0.50, "System and admin time removed by bringing the agent's applications into one desktop."),
  "aht.lever.desktop.hold": ahHeur(0.10, "Hold time removed when fewer holds wait on application switching."),
  "aht.lever.routing.transfer": ahHeur(0.50, "Transfer time removed when contacts reach the right agent first."),
  "aht.lever.routing.talk": ahHeur(0.05, "Talk time removed when the first agent reached can resolve the contact."),
};

export const BENCHMARK_SOURCES = {
  ...SHARED_BENCHMARKS,
  ...occEntries,
  ...ahtEntries,
  "lbg.module.wem": mod(25, "Starting price for a WEM or WFM add-on so the default case shows a non-zero gap."),
  "lbg.module.qa": mod(15, "Starting price for a quality management add-on."),
  "lbg.module.recording": mod(10, "Starting price for recording, shipped as included, so it prices only if the user reclassifies it."),
  "lbg.module.analytics": mod(20, "Starting price for speech and text analytics."),
  "lbg.module.ai": mod(25, "Starting price for AI and GenAI features, shipped as usage based."),
  "lbg.module.digital": mod(15, "Starting price for digital channels."),
  "lbg.module.outbound": mod(20, "Starting price for an outbound dialer."),
  "lbg.module.reporting": mod(10, "Starting price for advanced reporting."),
  "lbg.module.telephony": mod(5, "Starting price for BYOC or telephony, shipped as usage based."),
  "lbg.module.storage": mod(8, "Starting price for extended storage and archival."),
  "lbg.module.support": mod(12, "Starting price for premium support, shipped as included."),
  "lbg.module.services": mod(0, "Professional services are one time and priced only from the user's own quote, so the default is zero."),
  "lbg.seat.agent": seat(125, "Default agent seat so the tool opens on a runnable case."),
  "lbg.seat.sup": seat(150, "Default supervisor seat. Ships with a count of zero."),
  "lbg.seat.admin": seat(200, "Default admin seat. Ships with a count of zero."),
  "lbg.seat.analyst": seat(170, "Default analyst seat. Ships with a count of zero."),
  "lbg.guard.gapPct": line(500, "percent bundle gap", "Plausibility guard on input coding. A platform seat-equivalent above six times the quoted seat sits outside any bundle pattern the tool models and almost always means a one-time or total fee was entered as recurring per seat. It tests input coding only. The verdict is out of its reach by doctrine 5.5."),
  "lbg.guard.seatMultiple": line(5, "multiple of quoted seat", "Plausibility guard on input coding. An effective license seat above five times the quoted seat almost always means a line item is miscategorized. It tests input coding only."),
  "lbg.guard.recurDominance": line(0.8, "share of recurring license cost", "A single recurring line above 80 percent of recurring cost, with at least two lines present, is the signature of a one-time fee miscoded as recurring. Holds completeness below Finance-grade until its periodicity is confirmed."),
  "lbg.guard.usageDominance": line(0.8, "share of hidden annual", "Usage fees above 80 percent of the hidden annual make the finding a usage negotiation. Framing only. It reaches no confidence axis."),
  "lbg.band.gapAmber": line(40, "percent bundle gap", "Status band for the gap card. Amber from 40 percent, which lands in the shared moderate severity band in track.js, so the page colour and the published band agree. Colour only. It reaches no confidence axis."),
  "lbg.band.gapRed": line(80, "percent bundle gap", "Status band for the gap card. Red from 80 percent, which lands in the shared severe severity band in track.js. Colour only. It reaches no confidence axis."),

  ...staffingPresetEntries,
  "staffing.hours.month": sHeur(173, "paid hours per agent per month", "The 2,080 hour full-time year over twelve months. A planning convention for converting an hourly wage to a monthly cost."),
  "staffing.default.intv": sHeur(30, "minutes", "Default interval length. The most common forecasting interval, so the default case sits inside the Erlang C validity floor."),
  "staffing.default.capPct": sHeur(85, "percent occupancy", "Default occupancy ceiling offered when the cap is switched on. Set at the healthy maximum of the ratified occupancy canon."),
  "staffing.stress.spike": sHeur(1.2, "multiple of volume", "Volume spike the contingency finding prices. A planning stress step, labelled as one."),
  "staffing.stress.aht": sHeur(0.1, "share of AHT", "Handle time change the sensitivity finding prices, applied up and down."),
  "staffing.stress.shrinkPts": sHeur(5, "shrinkage points", "Shrinkage step the what-if grid prices."),
  "staffing.stress.shrinkCap": sHeur(70, "percent shrinkage", "Upper bound on the shrinkage what-if, so the step never prices an implausible plan."),
  "staffing.stress.slPts": sHeur(5, "service level points", "Service level step the what-if grid prices, up or down."),
  "staffing.stress.slEase": sHeur(95, "percent service level", "A target at or above this is eased in the what-if grid rather than raised."),
  "staffing.display.slCeiling": sLine(0.999, "service level", "Display floor. Erlang C never returns certainty, so a service level above this prints as above 99.9 percent. Display only. It reaches no confidence axis."),
  "staffing.validity.ratio": sLine(3, "interval as a multiple of AHT", "Erlang C steady state floor. An interval under three times AHT lets contacts spill across interval boundaries and the model understates staffing. Holds completeness Directional."),
  "staffing.validity.critical": sLine(1.5, "interval as a multiple of AHT", "Severity split inside an invalid model. Below 1.5 times AHT the disclosure reads critical. Framing only. The completeness hold is the same either side of it."),
  "staffing.read.premiumSl": sLine(0.88, "service level target", "A target at or above this is read as premium service in the analyst read and the premium signal. Framing only. It reaches no confidence axis."),
  "staffing.read.premiumSec": sLine(10, "seconds", "An answer threshold at or below this is read as premium service. Framing only. It reaches no confidence axis."),
  "staffing.read.overServePts": sLine(3, "service level points", "Delivered service level this far above target is read as over-serving. Framing only. It reaches no confidence axis."),
  "staffing.read.poolPenalty": sLine(0.05, "share of pooled FTE", "A split-queue penalty at or above this share is surfaced in the analyst read. Below it the effect is inside forecast noise. Framing only."),
  "staffing.aband.material": sLine(0.05, "share of contacts", "Estimated abandonment at or above this is material enough to show the Erlang A adjusted figure. Display only."),
  "staffing.aband.agents": sLine(2, "agents", "An abandonment adjustment of at least this many agents is shown even below the material share. Display only."),
  "staffing.band.queuesHigh": sLine(8, "queues", "Queue count band on the wire. High from eight. Signal only. It reaches no confidence axis."),
  "staffing.band.queuesMid": sLine(3, "queues", "Queue count band on the wire. Mid from three. Signal only."),
  "staffing.band.scaleVeryLarge": sLine(400, "scheduled FTE", "Scale band on the wire. Very large from 400 FTE. Signal only. It reaches no confidence axis."),
  "staffing.band.scaleLarge": sLine(150, "scheduled FTE", "Scale band on the wire. Large from 150 FTE. Signal only."),
  "staffing.band.scaleMid": sLine(40, "scheduled FTE", "Scale band on the wire. Mid from 40 FTE. Signal only."),

  "cpc.default.volume": cHeur(50000, "contacts per month", `${CPC_DEF} A volume still at this value grades evidence Directional.`),
  "cpc.default.fcr": cHeur(72, "percent", `${CPC_DEF} An FCR still at this value grades evidence Directional.`),
  "cpc.default.m": cHeur(2.4, "contacts per unresolved issue", `${CPC_DEF} An M still at this value grades evidence Directional.`),
  "cpc.default.loaded": cHeur(7, "USD per contact", `${CPC_DEF} A loaded cost still at this value grades evidence Directional.`),
  "cpc.default.marginal": cHeur(4.2, "USD per contact", `${CPC_DEF} A marginal cost still at this value grades evidence Directional.`),
  "cpc.default.productiveHours": cHeur(140, "productive hours per FTE per month", `${CPC_DEF} Also the fallback when no usable figure is entered, disclosed as a correction.`),
  "cpc.default.mix.voice": cHeur(60, "percent of volume", `${CPC_DEF} Voice share of the channel mix.`),
  "cpc.default.mix.chat": cHeur(25, "percent of volume", `${CPC_DEF} Chat share of the channel mix.`),
  "cpc.default.mix.email": cHeur(15, "percent of volume", `${CPC_DEF} Email share of the channel mix.`),
  "cpc.default.aht.voice": cHeur(7, "minutes", `${CPC_DEF} Voice handle time.`),
  "cpc.default.aht.chat": cHeur(9, "minutes", `${CPC_DEF} Chat handle time.`),
  "cpc.default.aht.email": cHeur(5, "minutes", `${CPC_DEF} Email handle time.`),
  "cpc.default.conc.voice": cHeur(1, "concurrent contacts", `${CPC_DEF} Voice is one contact at a time.`),
  "cpc.default.conc.chat": cHeur(2.5, "concurrent contacts", `${CPC_DEF} Typical chat session concurrency.`),
  "cpc.default.conc.email": cHeur(1, "concurrent contacts", `${CPC_DEF} Email worked one at a time.`),
  "cpc.derive.marginalShare": cHeur(0.6, "share of loaded cost", "Marginal cost derived from loaded when none is entered. Disclosed on the page and grades cost evidence Directional."),
  "cpc.fallback.effAht": cHeur(5.5, "minutes", "Effective handle time used when the channel mix or handle times give none. Disclosed, and holds completeness Directional."),
  "cpc.dividend.step1": cHeur(5, "FCR points", "First FCR improvement the dividend prices. Read as operational work."),
  "cpc.dividend.step2": cHeur(10, "FCR points", "Second FCR improvement the dividend prices, and the one the layers table and analyst read quote. Read as root-cause work."),
  "cpc.dividend.step3": cHeur(15, "FCR points", "Third FCR improvement the dividend prices. Read as a transformation case, never a base case."),
  "cpc.guard.concurrencyFloor": cLine(1, "concurrent contacts", "An agent cannot work fewer than one contact at a time. A concurrency below one is an input error, corrected to one and disclosed. It reaches completeness through the correction."),
  "cpc.read.repeatShare": cLine(0.25, "share of handled contacts", "Repeat demand above this reads as a resolution problem. It is the point where the shared severity bucket turns moderate, so the flag and the published band agree. Framing only."),
  "cpc.read.lowFcr": cLine(0.7, "FCR", "Below this FCR, paired with a shallow M, the repeat path is likely understated. Holds completeness Directional until M is checked."),
  "cpc.read.shallowM": cLine(1.3, "contacts per unresolved issue", "An M under this with low FCR is implausibly shallow. Paired with the low FCR line, holds completeness Directional."),
  "cpc.read.fcrLeakLink": cLine(78, "percent FCR", "Below this FCR the page offers the FCR Leakage Diagnostic. The top of the internal vertical FCR range. Navigation only."),
  "cpc.band.gapAmber": cLine(20, "percent resolution premium", "Cost per resolution card turns amber above this premium. Colour only. It reaches no confidence axis."),
  "cpc.band.gapRed": cLine(40, "percent resolution premium", "Cost per resolution card turns red above this premium. Colour only. It reaches no confidence axis."),
  ...cpcVertEntries,

  ...channelDefaultEntries,
  "channel.curve.mild": chHeur(0.08, "residual AHT uplift per unit of shift share", "Mild complexity curve. Easy volume leaves and residual voice gets slightly harder."),
  "channel.curve.moderate": chHeur(0.15, "residual AHT uplift per unit of shift share", "Moderate complexity curve. The typical support environment and the shipped choice."),
  "channel.curve.severe": chHeur(0.3, "residual AHT uplift per unit of shift share", "Severe complexity curve. Remaining voice work becomes materially harder."),
  "channel.plan.workdays": chHeur(22, "workdays per month", "Planning convention for productive time per FTE."),
  "channel.plan.hoursPerDay": chHeur(8, "paid hours per day", "Planning convention for productive time per FTE and for ramp cost."),
  "channel.plan.productiveShare": chHeur(0.7, "share of paid time", "Share of paid time an agent spends on contacts, used to convert freed minutes to FTE."),
  "channel.plan.daysPerWeek": chHeur(5, "workdays per week", "Planning convention for ramp cost."),
  "channel.plan.rampLoss": chHeur(0.3, "share of loaded time lost in ramp", "Productivity lost while a new chat agent ramps, priced into transition cost."),
  "channel.read.implausibleDeptAht": chLine(2, "minutes", "Displaced contacts implied to average under this handle time mean the complexity curve is too severe for the volume moved. Disclosed, and holds completeness Directional."),
  "channel.guard.botNearFree": chLine(0.1, "USD per bot contact", "A bot fee at or below this, with bot volume shifted, makes any shift look costless and drives break-even toward zero. Disclosed, and holds completeness Directional."),
  "channel.read.breakEvenFloor": chLine(1, "percent resolution", "A break-even below this reads as a shift profitable at any resolution. Framing only. It is a property of the answer and reaches no confidence axis by doctrine 5.5."),

  ...aidEntries,
  ...fcrEntries,
  ...tcoEntries,
};

for (const [id, e] of Object.entries(BENCHMARK_SOURCES)) {
  const bad = (why) => { throw new Error(`benchmarks: ${id} ${why}.`); };
  if (!BENCHMARK_KINDS.includes(e.kind)) bad(`has kind "${e.kind}", outside ${BENCHMARK_KINDS.join(", ")}`);
  if (typeof e.value !== "number" || !Number.isFinite(e.value)) bad("has no finite value");
  if (!e.tool || !e.unit || !e.reviewed || !Number.isInteger(e.version)) bad("is missing tool, unit, reviewed date or version");
  if (!String(e.rationale || "").trim()) bad("carries no rationale");
  if (e.kind === "market" && !String(e.source || "").trim()) bad("is a market figure with no named source");
  if (e.kind === "heuristic" && !String(e.source || "").trim()) bad("is a heuristic with no label");
  Object.freeze(e);
}
Object.freeze(BENCHMARK_SOURCES);

/** The value, or a throw. A tool never falls back to a literal for a missing id. */
export function benchmark(id) {
  const e = BENCHMARK_SOURCES[id];
  if (!e) throw new Error(`benchmarks: "${id}" is not in the registry. Register it with its provenance before shipping it.`);
  return e.value;
}

/** Every entry one tool owns, for its harness gate and its methodology block. */
export const benchmarksForTool = (tool) =>
  Object.entries(BENCHMARK_SOURCES).filter(([, e]) => e.tool === tool).map(([id, e]) => ({ id, ...e }));
