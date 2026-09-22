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
