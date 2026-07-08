/**
 * scenarioUrl.js, the shared scenario link encoder.
 *
 * Encodes a tool's operational inputs into a compact URL parameter so a user
 * can bookmark, email, or forward a link that rehydrates their exact scenario.
 * This is the zero-cost save-and-return layer. No backend, no database, no
 * account. The link IS the saved state.
 *
 * Why a link and not a PDF: a PDF is dead on arrival. A link re-runs. When a
 * director forwards their scenario to a CFO, the CFO lands inside the tool with
 * the numbers already loaded and can move one assumption. That is distribution
 * inside the buying unit, and it is free.
 *
 * Design notes:
 *   1. Only the DIFF against the tool's defaults is encoded. An untouched tool
 *      produces an empty payload. This is what keeps License-Gap-sized state
 *      (12 modules, seat classes, usage lines) inside practical URL limits.
 *   2. Payload is JSON, then base64url. Not encryption. Not obfuscation. Anyone
 *      can decode it, which is exactly why rule 3 exists.
 *   3. A URL is not a private channel. Personal data is denied at encode time,
 *      structurally, so no future caller can leak contact fields into a link.
 *   4. Every failure path returns null. A bad, truncated, tampered, or
 *      stale-version link must never throw and must never half-load a scenario.
 *
 * Storage: none. Nothing is persisted. The URL is the only carrier.
 */

const VERSION = 1;
const PARAM = "s";

/** Full link budget. Practical ceiling across mail clients and older browsers. */
const MAX_URL = 1900;

/**
 * Keys that must never ride in a URL. Defense in depth: calculator state should
 * never contain these, so if one appears we drop it silently rather than trust
 * the caller. Deliberately does NOT include bare "name" or "title", which are
 * legitimate structural keys (module.name, seat class titles).
 */
const PII_DENY = new Set([
  "email", "mail", "emailaddress", "replyto",
  "phone", "mobile", "tel", "telephone",
  "firstname", "lastname", "fullname",
  "company", "employer", "organization",
  "role", "jobtitle", "contact",
]);

const isPii = (k) => PII_DENY.has(String(k).toLowerCase().replace(/[_\s-]/g, ""));

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isArr = Array.isArray;

/** Round floats so 0.30000000000000004 does not cost eight characters. */
const norm = (v) => (typeof v === "number" && Number.isFinite(v) ? +v.toFixed(6) : v);

function sameLeaf(a, b) {
  if (typeof a === "number" && typeof b === "number") return norm(a) === norm(b);
  return a === b;
}

/* ---------------------------------------------------------------- diff ---- */

/**
 * Recursive sparse diff of `cur` against `def`.
 * Returns undefined when identical. Leaf-type changes are wrapped as { _v }
 * so patch() can tell "replace wholesale" from "recurse into".
 */
function diff(cur, def) {
  if (isArr(cur) && isArr(def)) {
    const out = {};
    if (cur.length !== def.length) out._n = cur.length;
    for (let i = 0; i < cur.length; i++) {
      const d = i < def.length ? diff(cur[i], def[i]) : { _v: strip(cur[i]) };
      if (d !== undefined) out[i] = d;
    }
    return Object.keys(out).length ? out : undefined;
  }

  if (isObj(cur) && isObj(def)) {
    const out = {};
    for (const k of Object.keys(cur)) {
      if (isPii(k)) continue;
      const d = k in def ? diff(cur[k], def[k]) : { _v: strip(cur[k]) };
      if (d !== undefined) out[k] = d;
    }
    return Object.keys(out).length ? out : undefined;
  }

  // Shape changed (scalar became object, array became scalar, and so on).
  if (isArr(cur) !== isArr(def) || isObj(cur) !== isObj(def)) {
    return { _v: strip(cur) };
  }

  return sameLeaf(cur, def) ? undefined : norm(cur);
}

/** Recursively remove denied keys from a wholesale value before it is embedded. */
function strip(v) {
  if (isArr(v)) return v.map(strip);
  if (isObj(v)) {
    const out = {};
    for (const k of Object.keys(v)) if (!isPii(k)) out[k] = strip(v[k]);
    return out;
  }
  return norm(v);
}

/* --------------------------------------------------------------- patch ---- */

function patch(def, d) {
  if (d === undefined) return def;
  if (isObj(d) && "_v" in d) return d._v;

  if (isArr(def) && isObj(d)) {
    const n = typeof d._n === "number" ? d._n : def.length;
    const out = [];
    for (let i = 0; i < n; i++) {
      const base = i < def.length ? def[i] : undefined;
      out.push(i in d || String(i) in d ? patch(base, d[i] ?? d[String(i)]) : base);
    }
    return out;
  }

  if (isObj(def) && isObj(d)) {
    const out = { ...def };
    for (const k of Object.keys(d)) {
      if (k === "_n") continue;
      out[k] = patch(def[k], d[k]);
    }
    return out;
  }

  return d;
}

/* -------------------------------------------------------------- base64 ---- */

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s) {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* --------------------------------------------------------------- public --- */

/**
 * Encode a scenario to a URL parameter value.
 * @returns {string|null} the encoded payload, or null if it will not fit.
 */
export function encodeScenario(toolId, state, defaults) {
  try {
    const d = diff(state, defaults);
    const payload = JSON.stringify({ v: VERSION, t: toolId, d: d ?? {} });
    const enc = b64urlEncode(payload);
    return enc.length + PARAM.length + 1 > MAX_URL - 120 ? null : enc;
  } catch {
    return null;
  }
}

/**
 * Build the full absolute scenario link.
 * @param {string} path route path, for example "/tools/license-gap"
 * @returns {string|null} absolute URL, or null when the scenario will not fit.
 */
export function scenarioLink(toolId, state, defaults, path) {
  const enc = encodeScenario(toolId, state, defaults);
  if (enc === null) return null;
  const origin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "https://www.contactcentercx.com";
  const url = `${origin}${path}?${PARAM}=${enc}`;
  return url.length > MAX_URL ? null : url;
}

/**
 * Decode a scenario from a query string.
 * @returns {object|null} the rehydrated state merged over defaults, or null.
 */
export function decodeScenario(search, toolId, defaults) {
  try {
    const raw = new URLSearchParams(search || "").get(PARAM);
    if (!raw) return null;
    const payload = JSON.parse(b64urlDecode(raw));
    if (!payload || payload.v !== VERSION) return null;
    if (payload.t !== toolId) return null;
    if (!isObj(payload.d)) return null;
    return patch(defaults, payload.d);
  } catch {
    return null;
  }
}

/**
 * Browser convenience: read the current location.
 * @returns {object|null} rehydrated state, or null when there is no valid link.
 */
export function readScenario(toolId, defaults) {
  if (typeof window === "undefined" || !window.location) return null;
  return decodeScenario(window.location.search, toolId, defaults);
}

/** True when the current URL carries a scenario payload of any kind. */
export function hasScenario() {
  if (typeof window === "undefined" || !window.location) return false;
  return !!new URLSearchParams(window.location.search).get(PARAM);
}

/**
 * Remove the scenario parameter from the address bar without a reload, after
 * the tool has rehydrated. Keeps the URL clean when the user then edits inputs,
 * so a stale link is never mistaken for the live state.
 */
export function clearScenarioParam() {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  const u = new URL(window.location.href);
  if (!u.searchParams.has(PARAM)) return;
  u.searchParams.delete(PARAM);
  window.history.replaceState({}, "", u.pathname + (u.search || "") + u.hash);
}

export const _internals = { diff, patch, b64urlEncode, b64urlDecode, MAX_URL, VERSION };
