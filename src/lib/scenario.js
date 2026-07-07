// src/lib/scenario.js
// The Center of CX - zero-storage scenario sharing through the URL.
//
// Why this exists: users want to keep and share a result without an account, a database,
// or any server cost. Encoding the inputs into the query string turns a scenario into a
// shareable, bookmarkable link. Nothing is stored on our side; the whole state lives in
// the URL the user holds. It is also measurable and distributive: an arriving link with a
// scenario param is a scenario_loaded signal, and copying one is intent and reach at once.
//
// Format: ?s=<base64url(JSON)>. Compact, opaque enough to discourage casual tampering,
// and size guarded so a runaway object can never build a broken multi-kilobyte URL.

const PARAM = "s";
const MAX = 1500; // keep the encoded payload well under browser URL length limits

function b64urlEncode(str) {
  const b = btoa(unescape(encodeURIComponent(str)));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s) {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const b = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return decodeURIComponent(escape(atob(b)));
}

// Encode a plain object of inputs into a URL-safe token. Returns "" on failure or oversize.
export function encodeScenario(obj) {
  try {
    const token = b64urlEncode(JSON.stringify(obj));
    return token.length > MAX ? "" : token;
  } catch {
    return "";
  }
}

// Decode a token back into an object. Returns null on any failure.
export function decodeScenario(token) {
  try {
    const obj = JSON.parse(b64urlDecode(token));
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

// Read the scenario object from the current URL, or a supplied search string. null if none.
export function readScenarioFromUrl(search) {
  try {
    const src = search != null ? search : (typeof window !== "undefined" ? window.location.search : "");
    const token = new URLSearchParams(src).get(PARAM);
    return token ? decodeScenario(token) : null;
  } catch {
    return null;
  }
}

// Build a full shareable URL for a tool path plus a scenario object. "" if it will not fit.
export function buildShareUrl(toolPath, obj) {
  const token = encodeScenario(obj);
  if (!token) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${toolPath}?${PARAM}=${token}`;
}

// Copy a share URL to the clipboard. Resolves true or false. Never throws.
export async function copyShareUrl(toolPath, obj) {
  const url = buildShareUrl(toolPath, obj);
  if (!url) return false;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
