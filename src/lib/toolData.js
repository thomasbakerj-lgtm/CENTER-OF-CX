/**
 * toolData.js : the shared data contract (write + read side).
 *
 * Tools publish their normalized outputs here. This is what lets one tool hand data to
 * another, and it is the spine of the cross-tool journey.
 *
 * Storage: sessionStorage. Survives navigation within a single visit, clears when the tab
 * closes. All access is guarded and wrapped. Telemetry never breaks a tool.
 *
 * v2 changes, from the rail audit of 9 July 2026. Every one of these was a live defect.
 *
 *   1. NORMALIZE AT THE DOOR. publishToolResult now runs normalizeForPublish itself. In v1
 *      that call was voluntary. Five tools adopted it. AIDeflectionRealityCheck did not, and
 *      it is the sole producer of realisticDeflectionRate, the only cross-tool RATE in the
 *      suite, consumed by a locked tool. One tool opting out was enough to defeat the whole
 *      unit contract. The door is no longer optional.
 *
 *   2. ALIAS RESOLUTION ON READ AND WRITE. Publishing `marginalCPC` now writes
 *      `marginalPerContact`. Pulling `loadedCPC` now finds `costPerContact`. In v1 both
 *      silently missed.
 *
 *   3. DERIVED READS. getPrimitive("annualContacts") now returns monthlyContacts * 12 when
 *      only the monthly figure was published. Five tools pulled annualContacts. No tool has
 *      ever published it.
 *
 *   4. PROVENANCE. `capacityAction` is published by three tools into one flat namespace.
 *      Last writer wins. getPrimitiveWithSource() tells a puller which tool produced the
 *      value it just received, so a report can name its source instead of guessing.
 *
 *   5. ORPHAN PULL DETECTION. A getPrimitive() for a key no tool has published is recorded
 *      and, in dev, warned. A dead pull is a defect. It is not graceful degradation.
 *
 * Public API is unchanged. Existing call sites keep working.
 */

import { normalizeForPublish, normalizeOnPull, resolveKey, deriveFrom, isRegistered, derivations } from "./metrics.js";

const KEY = "coc:toolData";
const hasStorage = () => typeof window !== "undefined" && !!window.sessionStorage;

const EMPTY = () => ({ tools: {}, current: {}, src: {}, flags: [] });

const isDev = () => {
  if (typeof globalThis !== "undefined" && globalThis.__COC_RAIL_DEBUG__) return true;
  try { return !!(import.meta && import.meta.env && import.meta.env.DEV); } catch { return false; }
};

// Runtime record of pulls that found nothing. Not persisted. Read by railReport().
const orphanPulls = new Set();

function readStore() {
  if (!hasStorage()) return EMPTY();
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(KEY));
    if (!parsed || typeof parsed !== "object") return EMPTY();
    return { ...EMPTY(), ...parsed };
  } catch {
    return EMPTY();
  }
}

function writeStore(store) {
  if (!hasStorage()) return;
  try { window.sessionStorage.setItem(KEY, JSON.stringify(store)); } catch { /* quota, private mode */ }
}

/** Drop values that should never travel: undefined, null, NaN. Zero and false survive. */
function stripEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && !Number.isFinite(v)) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Publish a tool's normalized primitives.
 * Normalizes units and rewrites deprecated keys before anything touches the rail.
 * Merges into the per-tool record and into a flat `current` snapshot for cross-tool reads.
 * Records which tool produced each key.
 */
export function publishToolResult(toolId, primitives) {
  if (!hasStorage()) return { clean: {}, flags: [] };
  try {
    const { clean: normalized, flags } = normalizeForPublish(primitives, { sourceTool: toolId });
    const clean = stripEmpty(normalized);

    const store = readStore();
    store.tools[toolId] = { ...clean, _ts: Date.now() };
    store.current = { ...store.current, ...clean };
    for (const k of Object.keys(clean)) store.src[k] = toolId;
    store.current._lastTool = toolId;
    store.current._ts = Date.now();
    if (flags.length) store.flags = [...(store.flags || []), ...flags].slice(-40);

    writeStore(store);

    if (isDev() && flags.length) {
      for (const f of flags) console.warn("[rail]", f);
    }
    return { clean, flags };
  } catch {
    return { clean: {}, flags: [] };  // never let the rail break the tool
  }
}

/** Flat snapshot of the latest primitives across all tools this session. */
export function getCurrent() {
  return readStore().current || {};
}

/**
 * Read a single primitive.
 * Resolves deprecated key names, then falls back to an exact arithmetic derivation.
 * Returns undefined when the rail cannot honestly supply the value.
 */
export function getPrimitive(key) {
  const res = getPrimitiveWithSource(key);
  return res.value === null ? undefined : res.value;
}

/**
 * Read a primitive along with its provenance.
 * Returns { value, sourceTool, derived, flag, confidenceImpact }.
 * `value` is null when the rail has nothing. `derived` is true when the value was computed
 * from a sibling metric rather than published directly.
 *
 * A puller that wants to cap its own confidence on an auto-corrected rail value should read
 * `confidenceImpact === "cap_planning"` and act on it. A puller that wants to name its source
 * in a report should read `sourceTool`.
 */
export function getPrimitiveWithSource(key) {
  const canonical = resolveKey(key);
  const store = readStore();
  const snapshot = store.current || {};

  const raw = snapshot[canonical];
  if (raw !== undefined && raw !== null) {
    const res = normalizeOnPull(canonical, raw, "rail");
    if (res.status === "invalid") {
      return { value: null, sourceTool: null, derived: false, flag: res.flag, confidenceImpact: "block" };
    }
    return {
      value: res.value,
      sourceTool: store.src?.[canonical] || null,
      derived: false,
      flag: res.flag,
      confidenceImpact: res.confidenceImpact,
    };
  }

  const derived = deriveFrom(canonical, snapshot);
  if (derived !== undefined) {
    const from = derivations[canonical]?.from;
    return { value: derived, sourceTool: (from && store.src?.[from]) || null, derived: true, flag: null, confidenceImpact: null };
  }

  // Nothing published, nothing derivable. Record it.
  orphanPulls.add(canonical);
  if (isDev()) {
    console.warn(
      `[rail] getPrimitive("${key}") found nothing. Canonical key "${canonical}" is ` +
        (isRegistered(canonical) ? "registered but unpublished by any tool this session." : "NOT in the metric registry.") +
        " A dead pull is a defect. Either a producer must publish it or the pull must be removed."
    );
  }
  return { value: null, sourceTool: null, derived: false, flag: null, confidenceImpact: null };
}

/**
 * Read a primitive ONLY if some OTHER tool produced it.
 *
 * This exists because both Cost per Contact and Channel Shift compute a `sourced` flag from
 * `pulled[key]`, and feed that flag into their Finance-grade gate. Cost per Contact is the
 * only publisher of `costPerContact`. So on a second visit within one session it pulled its
 * own prior output, set pulled.loadedCPC = true, and credentialed its own confidence grade
 * from a number it had invented with default inputs one navigation earlier.
 *
 * A value you published is not a value you sourced. Confidence gates must call this, never
 * getPrimitive. Auto-fill may still call getPrimitive: pre-populating a field from your own
 * last run is a convenience, and convenience is not evidence.
 */
export function getExternalPrimitive(key, selfToolId) {
  const res = getPrimitiveWithSource(key);
  if (res.value === null) return undefined;
  if (selfToolId && res.sourceTool === selfToolId) return undefined;
  return res.value;
}

/** True when every key was produced by a tool other than `selfToolId`. The confidence gate. */
export function sourcedExternally(keys, selfToolId) {
  return keys.every((k) => getExternalPrimitive(k, selfToolId) !== undefined);
}

/** Read a specific tool's last published result. */
export function getToolResult(toolId) {
  return readStore().tools?.[toolId];
}

/** Which tools have run this session. The spine of the prep checklist. */
export function getToolsRun() {
  return Object.keys(readStore().tools || {});
}

/**
 * Contract report. Call this from a dev console or a test.
 * `orphanPulls` is the list that must be empty before any tool locks.
 */
export function railReport() {
  const store = readStore();
  const published = Object.keys(store.current || {}).filter((k) => !k.startsWith("_"));
  return {
    toolsRun: Object.keys(store.tools || {}),
    published,
    sources: { ...(store.src || {}) },
    orphanPulls: [...orphanPulls],
    flags: [...(store.flags || [])],
  };
}

/** Test and dev helper. Clears the rail and the orphan record. */
export function resetRail() {
  orphanPulls.clear();
  if (hasStorage()) { try { window.sessionStorage.removeItem(KEY); } catch { /* noop */ } }
}
