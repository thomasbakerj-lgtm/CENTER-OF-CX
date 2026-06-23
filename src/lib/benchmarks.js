/**
 * benchmarks.js — single source of truth for CX/CC benchmarks.
 * Every tool imports these classifiers so thresholds can never drift
 * between the color logic, the labels, the findings, and the actions.
 *
 * CANON (ratified for Tool Upgrades 2.0):
 *   Occupancy  — healthy < 85% · caution 85–90% · critical > 90% · target band 83–87%
 *   Shrinkage  — typical 28–35% · investigate above 35%
 *   Service    — default target 80% answered within 20s
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
      message: `Above ${pctStr(cautionMax)}, recovery time between contacts collapses. Burnout and attrition risk is high — add capacity or reduce load.`,
    };
  if (occ > healthyMax)
    return {
      band: "caution",
      color: COLORS.amber,
      label: "Caution",
      message: `Sustained occupancy above ${pctStr(healthyMax)} correlates with attrition and quality loss. Target the ${pctStr(targetLow)}–${pctStr(targetHigh)} band.`,
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
      message: `${pctStr(sh)} is above the typical ${pctStr(typicalLow)}–${pctStr(typicalHigh)} range. Worth decomposing before you treat it as fixed.`,
    };
  return {
    elevated: false,
    message: `${pctStr(sh)} sits within the typical ${pctStr(typicalLow)}–${pctStr(typicalHigh)} range.`,
  };
}
