/**
 * toolData.js — the shared data contract (write + read side).
 *
 * Tools publish their normalized outputs here keyed to the Part-A primitives
 * (volume, aht, shrinkage, occupancy, fte, serviceLevel, ...). This is what
 * lets one tool hand data to another, and what the consultant-prep email will
 * eventually read to say "you've assembled X, you still need Y."
 *
 * Storage: sessionStorage — survives navigation within a single visit, clears
 * when the tab closes. Safe in the deployed app (this is NOT a claude.ai
 * artifact, so storage APIs are available). All access is guarded + wrapped.
 */

const KEY = "coc:toolData";
const hasStorage = () => typeof window !== "undefined" && !!window.sessionStorage;

function readStore() {
  if (!hasStorage()) return { tools: {}, current: {} };
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY)) || { tools: {}, current: {} };
  } catch {
    return { tools: {}, current: {} };
  }
}

function stripEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== null && !(typeof v === "number" && isNaN(v))) out[k] = v;
  }
  return out;
}

/** Publish a tool's normalized primitives. Merges into both the per-tool
 *  record and a flat `current` snapshot for easy cross-tool reads. */
export function publishToolResult(toolId, primitives) {
  if (!hasStorage()) return;
  try {
    const store = readStore();
    const clean = stripEmpty(primitives);
    store.tools = store.tools || {};
    store.tools[toolId] = { ...clean, _ts: Date.now() };
    store.current = { ...(store.current || {}), ...clean, _lastTool: toolId, _ts: Date.now() };
    window.sessionStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* never let telemetry break the tool */
  }
}

/** Read the flat snapshot of the latest primitives across all tools. */
export function getCurrent() {
  return readStore().current || {};
}

/** Read a single primitive (e.g. getPrimitive("aht")). Returns undefined if unset. */
export function getPrimitive(key) {
  return getCurrent()[key];
}

/** Read a specific tool's last published result. */
export function getToolResult(toolId) {
  return readStore().tools?.[toolId];
}

/** List which tools have run this session — the spine of the prep checklist. */
export function getToolsRun() {
  const tools = readStore().tools || {};
  return Object.keys(tools);
}
