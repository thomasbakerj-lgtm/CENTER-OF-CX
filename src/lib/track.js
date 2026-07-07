// src/lib/track.js
// The Center of CX - one shared analytics vocabulary for the whole suite.
//
// Why this exists: proving demand (traffic, tool usage, repeat usage, progression,
// lead intent) requires the SAME event names and property shapes across all 30 tools.
// If each tool invents its own events, the funnel is unreadable. This is the metrics.js
// of behaviour: the single source of truth for what we measure and how.
//
// Zero cost and privacy: events ride the Vercel Analytics that is already installed in
// App.jsx. We send an event name plus a few COARSE properties (tool id, whether inputs
// look real versus default, a severity bucket). We never send raw inputs, scenarios,
// wages, or anything identifying. Buckets and counts only, so the future data moat stays
// anonymous by construction.
//
// Safety: never throws, never blocks a tool. Vercel's track() no-ops on its own when
// analytics is not active (local dev, SSR, blocked), and we wrap it anyway.

import { track as vercelTrack } from "@vercel/analytics";

// The canonical event vocabulary. Add here, never ad hoc inside a tool.
export const EV = {
  TOOL_VIEW: "tool_view",            // tool mounted
  TOOL_COMPLETE: "tool_complete",    // user reached a real result from real inputs
  PDF_EXPORT: "pdf_export",          // report generated or printed
  EXPERT_READ: "expert_read_submit", // medium intent: submitted a result for a human read
  NEXT_STEP: "next_step_click",      // clicked a journey CTA into another tool
  SCENARIO_SHARE: "scenario_shared", // copied a shareable scenario link
  SCENARIO_LOAD: "scenario_loaded",  // arrived via a shared scenario link
};

// Coarse severity bucket so we can see result intensity without sending the number.
// Pass any 0..1 ratio (for example a gap percentage or a leakage share).
export function severityBucket(x) {
  const v = Number(x);
  if (!isFinite(v) || v <= 0) return "none";
  if (v < 0.25) return "low";
  if (v < 0.5) return "moderate";
  if (v < 0.75) return "high";
  return "severe";
}

// Fire an event. props are coarse only. Fire and forget; failures are swallowed so
// telemetry can never break a tool.
export function track(event, props = {}) {
  try {
    vercelTrack(event, props);
  } catch {
    /* no-op */
  }
}

// One-line, consistent wrappers so every tool reports the same shapes.
export const trackTool = {
  view: (toolId) => track(EV.TOOL_VIEW, { tool: toolId }),
  complete: (toolId, { real = true, severity } = {}) =>
    track(EV.TOOL_COMPLETE, { tool: toolId, real, ...(severity != null ? { severity } : {}) }),
  pdf: (toolId) => track(EV.PDF_EXPORT, { tool: toolId }),
  expertRead: (toolId) => track(EV.EXPERT_READ, { tool: toolId }),
  nextStep: (fromTool, toTool) => track(EV.NEXT_STEP, { from: fromTool, to: toTool }),
  scenarioShare: (toolId) => track(EV.SCENARIO_SHARE, { tool: toolId }),
  scenarioLoad: (toolId) => track(EV.SCENARIO_LOAD, { tool: toolId }),
};
