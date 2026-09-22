/**
 * benchmarks.js. Single source of truth for CX/CC benchmarks.
 * Every tool imports these classifiers so thresholds can never drift
 * between the color logic, the labels, the findings, and the actions.
 *
 * CANON (ratified for Tool Upgrades 2.0):
 *   Occupancy. healthy < 85% · caution 85 to 90% · critical > 90% · target band 83 to 87%
 *   Shrinkage. typical 28 to 35% · investigate above 35%
 *   Service.   default target 80% answered within 20s
 */

export const COLORS = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  electric: "#0088DD",
  navy: "#0B1D3A",
  muted: "#6B7F99",
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
      message: `${pctStr(sh)} is above the typical ${pctStr(typicalLow)} to ${pctStr(typicalHigh)} range. Worth decomposing before you treat it as fixed.`,
    };
  return {
    elevated: false,
    message: `${pctStr(sh)} sits within the typical ${pctStr(typicalLow)} to ${pctStr(typicalHigh)} range.`,
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

export const BENCHMARK_SOURCES = {
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
  "staffing.wage.median": { tool: STF, kind: "market", value: 20.59, unit: "USD per hour", source: "US Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024, SOC 43-4051 Customer Service Representatives, national median hourly wage.", reviewed: REVIEWED, version: 1, rationale: "Cost fallback when no wage or per-agent cost arrives over the rail. The occupation median, labelled as a benchmark wherever it prices a plan. It grades evidence Directional because it is no figure of the user's own." },
  "staffing.load.multiple": sHeur(1.95, "multiple of base wage", "Wage to fully loaded cost: benefits, payroll tax, facilities, supervision and technology. Used only when the rail carries a wage and no per-agent cost."),
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
  "cpc.default.overhead": cHeur(1.35, "multiple of hourly wage", `${CPC_DEF} Loads the wage for the channel handle view only. Staffing loads at 1.95x for a fully loaded cost; the two tools model different things and the gap is logged for review.`),
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
  "cpc.wage.median": { tool: CPC, kind: "market", value: 20.59, unit: "USD per hour", source: "US Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024, SOC 43-4051 Customer Service Representatives, national median hourly wage.", reviewed: REVIEWED, version: 1, rationale: "Default agent wage for the channel handle view. The occupation median, labelled as a benchmark. It is no figure of the user's own and feeds no graded figure." },
  "cpc.guard.concurrencyFloor": cLine(1, "concurrent contacts", "An agent cannot work fewer than one contact at a time. A concurrency below one is an input error, corrected to one and disclosed. It reaches completeness through the correction."),
  "cpc.read.repeatShare": cLine(0.25, "share of handled contacts", "Repeat demand above this reads as a resolution problem. It is the point where the shared severity bucket turns moderate, so the flag and the published band agree. Framing only."),
  "cpc.read.lowFcr": cLine(0.7, "FCR", "Below this FCR, paired with a shallow M, the repeat path is likely understated. Holds completeness Directional until M is checked."),
  "cpc.read.shallowM": cLine(1.3, "contacts per unresolved issue", "An M under this with low FCR is implausibly shallow. Paired with the low FCR line, holds completeness Directional."),
  "cpc.read.fcrLeakLink": cLine(78, "percent FCR", "Below this FCR the page offers the FCR Leakage Diagnostic. The top of the internal vertical FCR range. Navigation only."),
  "cpc.band.gapAmber": cLine(20, "percent resolution premium", "Cost per resolution card turns amber above this premium. Colour only. It reaches no confidence axis."),
  "cpc.band.gapRed": cLine(40, "percent resolution premium", "Cost per resolution card turns red above this premium. Colour only. It reaches no confidence axis."),
  ...cpcVertEntries,
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
