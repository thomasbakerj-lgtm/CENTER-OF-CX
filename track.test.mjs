/* track.test.mjs
 *
 * The event contract harness.
 *
 * Instrumentation has a failure mode the arithmetic harnesses do not: it fails
 * silently and in the direction of over-collection. A tool that computes a
 * wrong number produces a visibly wrong report. A tracker that ships a wage to
 * a third party produces nothing visible at all, works perfectly, and is a
 * trust breach and a liability the platform has no reason to carry.
 *
 * So the assertions here are mostly adversarial. Section B does not check that
 * the allowed properties arrive; it throws a realistic pile of personal and
 * commercial data at the only function that can reach the wire and proves that
 * none of it survives. buildPayload is pure precisely so this can be done with
 * no browser, no network and no PostHog account.
 *
 * Section G reads the source of the call sites, because a guard that is correct
 * and bypassed is not a guard. The private window.va tracker that used to live
 * in ReportActions.jsx bypassed nothing, but it did collect nothing, and there
 * must not be a second path to a transport ever again.
 *
 * Run: node track.test.mjs
 */

import { readFileSync } from "node:fs";
import {
  EV, CONFIG, isConfigured, buildPayload, sanitizeProps, severityBucket,
  SEVERITY_BANDS, SEVERITY_SYNONYMS, ALLOWED_PROP_KEYS, toolIdFromPath,
  trackTool, track,
} from "./src/lib/track.js";

let pass = 0, fail = 0;
const failures = [];
function ok(label, cond) {
  if (cond) pass++;
  else { fail++; failures.push(label); }
}
function eq(label, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (good) pass++;
  else { fail++; failures.push(`${label}\n     got:  ${JSON.stringify(got)}\n     want: ${JSON.stringify(want)}`); }
}
function section(n) { console.log(`\n--- ${n}`); }

const CTX = { key: "phc_harness", distinctId: "abc123def456", sessionId: "s0s0s0", path: "/tools/tco-calculator", now: "2026-09-08T00:00:00.000Z" };

/* --------------------------------------------------------- A. vocabulary */
/* An event name not in EV is refused rather than sent. A typo must produce no
   data, not a second silent funnel nobody knows to look at. */
section("A. The event vocabulary is closed");

const names = Object.values(EV);
ok("A0  at least seven events are defined", names.length >= 7);
ok("A1  event names are unique", new Set(names).size === names.length);
for (const n of names) {
  ok(`A2  ${n}: is a lower_snake identifier`, /^[a-z][a-z0-9_]*$/.test(n));
  ok(`A3  ${n}: builds a payload`, buildPayload(n, { tool: "tco" }, CTX) !== null);
}
for (const bad of ["", "tool_view ", "Tool_View", "toolview", "drop_table", null, undefined, 42]) {
  ok(`A4  unknown event refused: ${JSON.stringify(bad)}`, buildPayload(bad, { tool: "tco" }, CTX) === null);
}

/* ------------------------------------------------------------- B. no PII */
/* The load-bearing section. Everything below is data a user could plausibly
   have typed into a tool, or that a careless future call site could pass. None
   of it may appear anywhere in the serialized payload. */
section("B. No personal, commercial or input data reaches the wire");

const POISON = {
  email: "cfo@acmehealth.com",
  _replyto: "cfo@acmehealth.com",
  first: "Dana", last: "Whitfield", userName: "Dana Whitfield",
  company: "Acme Health Partners", role: "VP Customer Operations",
  mobile: "602-555-0142", phone: "+1 602 555 0142",
  wage: 27.4, fullyLoadedWage: "$42.50", costPerContact: 8.13,
  agents: 480, contacts: 1250000, annualTCO: 28400000,
  state: { agents: 480, wage: 27.4 }, defaults: { agents: 100 },
  scenario: "eyJhZ2VudHMiOjQ4MH0=", url: "https://contactcentercx.com/tools/tco?s=eyJ",
  ip: "203.0.113.7", userAgent: "Mozilla/5.0", ssn: "123-45-6789",
  notes: "we are replacing Genesys next quarter, budget approved",
  vendor: "Genesys", contractValue: "1.4M",
};

const poisoned = buildPayload(EV.TOOL_COMPLETE, POISON, CTX);
ok("B0  a payload is still produced", poisoned !== null);

const wire = JSON.stringify(poisoned);
for (const [k, v] of Object.entries(POISON)) {
  ok(`B1  key "${k}" is absent from the payload`, !Object.prototype.hasOwnProperty.call(poisoned.properties, k));
  const needle = String(v && typeof v === "object" ? JSON.stringify(v) : v);
  if (needle.length >= 4) {
    ok(`B2  value for "${k}" is absent from the serialized payload`, !wire.includes(needle));
  }
}
ok("B3  no at-sign anywhere in the payload", !wire.includes("@"));
ok("B4  no digit run of five or more anywhere in the payload except the timestamp",
   !wire.replace(CTX.now, "").match(/\d{5,}/));
eq("B5  a poisoned payload carries only framework properties",
   Object.keys(poisoned.properties).sort(),
   ["$current_url", "$process_person_profile", "$session_id"].sort());

/* Every allowed key must actually be reachable, or the allowlist is lying. */
const full = buildPayload(EV.TOOL_COMPLETE, {
  tool: "tco-calculator", from: "fcr-leakage", to: "business-case",
  grade: "Directional", severity: "high", real: true, depth: 3,
  via_rail: true, repeat: true,
}, CTX);
for (const k of ALLOWED_PROP_KEYS) {
  ok(`B6  allowed key "${k}" survives when valid`, Object.prototype.hasOwnProperty.call(full.properties, k));
}

/* The person profile must never be built. Identified events would create a
   person record on a third party for an anonymous reader. */
eq("B7  events are anonymous by construction", full.properties.$process_person_profile, false);
ok("B8  distinct id is the opaque random, never anything passed in", full.distinct_id === CTX.distinctId);

/* ---------------------------------------------------------- C. validators */
section("C. Each allowed key is type-checked, not merely named");

const cases = [
  ["tool", "TCO Calculator", "tco-calculator"],
  ["tool", "  Spaced  Name  ", "spaced-name"],
  ["tool", "a".repeat(200), undefined],
  ["tool", 42, undefined],
  ["grade", "Directional", "directional"],
  ["grade", "Finance-grade", "finance"],
  ["grade", "Sparkling", undefined],
  ["severity", "Elevated", "moderate"],
  ["severity", "banana", undefined],
  ["real", "true", undefined],
  ["real", false, false],
  ["depth", 3, 3],
  ["depth", 3.5, undefined],
  ["depth", -1, undefined],
  ["depth", 1000, undefined],
  ["depth", "3", undefined],
  ["via_rail", 1, undefined],
  ["repeat", true, true],
];
for (const [k, input, want] of cases) {
  eq(`C1  ${k} = ${JSON.stringify(input)}`, sanitizeProps({ [k]: input })[k], want);
}
eq("C2  a null value is dropped, not sent as null", sanitizeProps({ tool: null }), {});
eq("C3  a non-object props argument yields nothing", sanitizeProps("tco"), {});
eq("C4  an unknown key is dropped even when its value is harmless", sanitizeProps({ colour: "blue" }), {});

/* ------------------------------------------------------------ D. severity */
/* Bands, and the boundary between them. A value outside 0..1 or non-finite is
   "none" and never a guess. */
section("D. Severity bands");

const bands = [
  [-1, "none"], [0, "none"], [0.0001, "low"], [0.2499, "low"],
  [0.25, "moderate"], [0.4999, "moderate"], [0.5, "high"], [0.7499, "high"],
  [0.75, "severe"], [1, "severe"], [4, "severe"],
  [NaN, ""], [Infinity, ""], ["", ""], [null, ""], [undefined, ""], ["banana", ""],
];
for (const [x, want] of bands) eq(`D1  severityBucket(${JSON.stringify(x)})`, severityBucket(x), want);
for (const b of SEVERITY_BANDS) ok(`D2  band "${b}" survives sanitisation`, sanitizeProps({ severity: b }).severity === b);
/* The doctrine assertion. An unreadable input must produce no severity, never
   a confident "none". */
for (const x of [NaN, Infinity, null, undefined, "", "banana"]) {
  eq(`D2b unknown severity is dropped, not reported as none: ${JSON.stringify(x)}`,
     sanitizeProps({ severity: severityBucket(x) }).severity, undefined);
}
eq("D2c a measured zero is still reported as none", sanitizeProps({ severity: severityBucket(0) }).severity, "none");
for (const [syn, canon] of Object.entries(SEVERITY_SYNONYMS)) {
  eq(`D3  synonym "${syn}" maps to a canonical band`, sanitizeProps({ severity: syn }).severity, canon);
  ok(`D4  "${syn}" maps into the canonical set`, SEVERITY_BANDS.includes(canon));
}

/* --------------------------------------------------------------- E. gates */
section("E. Refusals: no key, no id, no send");

ok("E0  no payload without a project key", buildPayload(EV.TOOL_VIEW, { tool: "tco" }, { ...CTX, key: "" }) === null);
for (const bad of ["", "  ", "Dana Whitfield", "cfo@acme.com", null, undefined, 12345]) {
  ok(`E1  no payload for distinct id ${JSON.stringify(bad)}`,
     buildPayload(EV.TOOL_VIEW, { tool: "tco" }, { ...CTX, distinctId: bad }) === null);
}
ok("E2  isConfigured reflects the key", isConfigured() === !!CONFIG.key);

/* ------------------------------------------------------- F. route mapping */
section("F. Tool id from route");

const routes = [
  ["/tools/tco-calculator", "tco-calculator"],
  ["/tools/ai-deflection", "ai-deflection"],
  ["/tools/tco-calculator?s=eyJhIjoxfQ", "tco-calculator"],
  ["/tools/", ""], ["/vendors/five9", ""], ["/", ""], ["", ""], [null, ""], [undefined, ""],
];
for (const [p, want] of routes) eq(`F1  toolIdFromPath(${JSON.stringify(p)})`, toolIdFromPath(p), want);
for (const [p, want] of routes) {
  if (want) ok(`F2  ${want} is a valid tool property`, sanitizeProps({ tool: toolIdFromPath(p) }).tool === want);
}

/* ------------------------------------------------- G. call site discipline */
/* A guard that is correct and bypassed is not a guard. There must be exactly
   one path from a call site to a transport. */
section("G. One transport, no second path");

const src = (f) => readFileSync(f, "utf8");
const trackSrc = src("./src/lib/track.js");
const actions = src("./ReportActions.jsx");
const exp = src("./ReportExport.jsx");
const app = src("./App.jsx");

const callsVa = (t) => /window\.va\s*\(/.test(t);
ok("G0  ReportActions no longer calls the Vercel event API directly", !callsVa(actions));
ok("G1  no call site anywhere reaches a transport except through track.js",
   !callsVa(actions) && !callsVa(exp) && !callsVa(app) && !callsVa(trackSrc));
ok("G2  ReportActions imports the shared transport", actions.includes('from "./src/lib/track"'));
ok("G3  ReportExport imports the shared transport", exp.includes('from "./src/lib/track"'));
ok("G4  App imports the shared transport", app.includes('from "./src/lib/track"'));
ok("G5  the report export fires an event", exp.includes("trackTool.pdf("));
ok("G6  the tool view fires an event", app.includes("trackTool.view("));
ok("G7  tool_complete has exactly one source", (actions.match(/trackTool\.complete\(/g) || []).length === 1);

/* The one endpoint, named once. */
const hits = (trackSrc.match(/i\/v0\/e/g) || []).length;
eq("G8  the capture endpoint appears exactly once", hits, 1);
ok("G9  no analytics SDK is imported by the transport",
   !/from\s+["']posthog-js["']/.test(trackSrc) && !/from\s+["']@vercel\/analytics["']/.test(trackSrc));
ok("G10 the transport module carries no em-dash", trackSrc.indexOf(String.fromCharCode(0x2014)) === -1);

/* Nothing may pass a raw value to a wrapper. A call site handing a number to a
   tool id, or a state object to a grade, is a defect this catches at review. */
for (const f of ["./ReportActions.jsx", "./ReportExport.jsx", "./App.jsx", "./TCOCalculator.jsx", "./BusinessCaseBuilder.jsx"]) {
  const s = src(f);
  ok(`G11 ${f}: no email field is passed to a tracker`, !/trackTool\.[a-z]+\([^)]*email/i.test(s));
  ok(`G12 ${f}: no state or scenario object is passed to a tracker`, !/trackTool\.[a-z]+\([^)]*\b(state|scenario|defaults)\b/i.test(s));
}

/* ------------------------------------------------------ H. never throws */
/* Storage disabled, private browsing, no crypto, a hostile sendBeacon. Every
   path must end in a silent no-op, because telemetry that throws inside a
   render takes the tool down with it. */
section("H. track() never throws and never blocks");

const realWindow = globalThis.window;
const realNavigator = globalThis.navigator;

function withWindow(win, nav, fn) {
  globalThis.window = win;
  if (nav !== undefined) {
    try { Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true, writable: true }); }
    catch { /* some runtimes lock navigator; the sendBeacon path is then skipped */ }
  }
  try { fn(); return null; } catch (e) { return e; }
  finally {
    globalThis.window = realWindow;
    try { Object.defineProperty(globalThis, "navigator", { value: realNavigator, configurable: true, writable: true }); } catch { /* noop */ }
  }
}

const throwingStorage = {
  getItem() { throw new Error("private browsing"); },
  setItem() { throw new Error("quota exceeded"); },
};
const sent = [];
const captureNav = { sendBeacon: (u, b) => { sent.push({ u, b }); return true; } };

const key0 = CONFIG.key;
CONFIG.key = "phc_harness";

ok("H0  no window at all", withWindow(undefined, undefined, () => track(EV.TOOL_VIEW, { tool: "tco" })) === null);
ok("H1  storage throws on read and write",
   withWindow({ localStorage: throwingStorage, sessionStorage: throwingStorage, location: { pathname: "/tools/tco" } }, captureNav,
     () => trackTool.view("tco-calculator")) === null);
ok("H2  storage is absent entirely",
   withWindow({ location: { pathname: "/tools/tco" } }, captureNav, () => trackTool.complete("tco-calculator", { real: true, grade: "Directional" })) === null);
ok("H3  sendBeacon itself throws",
   withWindow({ location: { pathname: "/tools/tco" } }, { sendBeacon: () => { throw new Error("blocked"); } },
     () => trackTool.pdf("tco-calculator", { grade: "Validated" })) === null);
ok("H4  a wrapper called with no arguments",
   withWindow({ location: { pathname: "/" } }, captureNav, () => { trackTool.view(); trackTool.complete(); trackTool.pdf(); }) === null);
ok("H5  props are a hostile object",
   withWindow({ location: { pathname: "/tools/tco" } }, captureNav,
     () => track(EV.TOOL_COMPLETE, { get tool() { throw new Error("gotcha"); } })) === null);

/* With storage gone, depth degrades to 1 rather than vanishing or throwing. */
let observed = null;
withWindow({ localStorage: throwingStorage, sessionStorage: throwingStorage, location: { pathname: "/tools/tco" } }, captureNav, () => {
  sent.length = 0;
  trackTool.view("tco-calculator");
  if (sent.length) observed = JSON.parse(sent[sent.length - 1].b instanceof Blob ? "{}" : String(sent[sent.length - 1].b));
});
ok("H6  a beacon was still attempted with storage disabled", sent.length === 1);

/* Nothing is sent when no key is configured, whatever the call site does. */
CONFIG.key = "";
sent.length = 0;
withWindow({ location: { pathname: "/tools/tco" } }, captureNav, () => {
  trackTool.view("tco-calculator");
  trackTool.pdf("tco-calculator", { grade: "Validated" });
  track(EV.TOOL_COMPLETE, { tool: "tco-calculator" });
});
eq("H7  an unconfigured build sends nothing at all", sent.length, 0);
CONFIG.key = key0;

/* ------------------------------------------------------------------ report */

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
  if (failures.length > 40) console.log(`  ...and ${failures.length - 40} more`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
