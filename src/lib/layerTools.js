/* layerTools.js
 *
 * The diagnostics that test each layer of the seven-layer stack, as the 7-Layer CX Orchestration Framework guide
 * publishes them (frameworkGuide.js reads this list, and so does the homepage stack, so the two can never disagree).
 * A small file on its own so the homepage loads the list without the guide. Each entry: [route, name].
 */
export const LAYER_TOOLS = {
  1: [["/tools/cx-it-alignment", "CX IT Alignment"]],
  2: [["/tools/tco-calculator", "TCO Calculator"], ["/tools/aht-decomposition", "AHT Decomposition"]],
  3: [["/tools/contract-risk", "Contract Risk"], ["/tools/governance-model", "Governance Model"]],
  4: [["/tools/ai-deflection", "AI Deflection Reality Check"], ["/tools/ai-readiness", "AI Readiness"]],
  5: [["/tools/channel-shift", "Channel Shift"], ["/tools/fcr-leakage", "FCR Leakage"]],
  6: [["/tools/staffing-calculator", "Staffing Calculator"], ["/tools/occupancy-risk", "Occupancy Risk"]],
  7: [["/tools/forecast-accuracy", "Forecast Accuracy"], ["/tools/qa-scorecard", "QA Scorecard"], ["/tools/schedule-adherence", "Schedule Adherence"]],
};
