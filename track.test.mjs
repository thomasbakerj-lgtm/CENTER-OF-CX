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

import { readFileSync, readdirSync } from "node:fs";
import {
  EV, CONFIG, isConfigured, buildPayload, sanitizeProps, severityBucket,
  SEVERITY_BANDS, SEVERITY_SYNONYMS, ALLOWED_PROP_KEYS, toolIdFromPath, TAXONOMY_VERSION, landingProps, pageType,
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
  grade: "Directional", bound_axis: "evidence+completeness", severity: "high", real: true, depth: 3,
  via_rail: true, repeat: true, page_type: "tool", utm_source: "linkedin", utm_medium: "social", utm_campaign: "2026-10-healthcare", ref: "linkedin.com",
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
  ["grade", "Finance-grade", "finance-grade"],
  ["grade", "Planning-grade", "planning-grade"],
  ["grade", "Void", "void"],
  ["grade", "Sparkling", undefined],
  ["grade", "finance", undefined],
  ["grade", "planning", undefined],
  ["bound_axis", "evidence", "evidence"],
  ["bound_axis", "realization+completeness", "realization+completeness"],
  ["bound_axis", "evidence+realization+completeness", "evidence+realization+completeness"],
  ["bound_axis", "completeness+evidence", undefined],
  ["bound_axis", "vibes", undefined],
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

/* G6a exists because G7 did not. tool_complete was locked to a single source and
   tool_view was not, so TCOCalculator and BusinessCaseBuilder each kept a mount
   call of their own after Journey took over centrally. Both fired. Every view of
   the two most commercially important tools on the platform was counted twice,
   which halves the completion rate that decides which tools survive triage.
   Journey in App.jsx is the only permitted source. */
const viewCallers = readdirSync(".")
  .filter((f) => f.endsWith(".jsx"))
  .filter((f) => /trackTool\.view\(/.test(readFileSync(f, "utf8")));
eq("G6a tool_view has exactly one source file", viewCallers.length, 1);
ok("G6b that source is App.jsx, not a tool", viewCallers[0] === "App.jsx");
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

/* -------------------------------------- I. repeat is decided once per session */
/* Each "page load" is a fresh module instance against persisted storage, which
   is exactly what a reload or a second visit is. Transport is captured through
   fetch so the body is readable; no sendBeacon on the stub navigator. */
section("I. repeat is true only if the browser id predates this session");

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), _m: m }; };
const bodies = [];
let loadN = 0;
async function pageLoad() {
  const mod = await import(`./src/lib/track.js?load=${++loadN}`);
  mod.CONFIG.key = "phc_harness";
  return mod;
}
function run(win, nav, fn) {
  const rw = globalThis.window, rn = globalThis.navigator, rf = globalThis.fetch;
  globalThis.window = win;
  Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true, writable: true });
  globalThis.fetch = (u, o) => { bodies.push(JSON.parse(o.body)); return Promise.resolve(); };
  try { fn(); } finally {
    globalThis.window = rw; globalThis.fetch = rf;
    Object.defineProperty(globalThis, "navigator", { value: rn, configurable: true, writable: true });
  }
}
const repeats = () => bodies.map((b) => b.properties.repeat);
const LOC = { pathname: "/tools/tco-calculator" };

{
  const ls = mem(), ss1 = mem();
  let m = await pageLoad();
  bodies.length = 0;
  run({ localStorage: ls, sessionStorage: ss1, location: LOC }, {}, () => { m.track(EV.TOOL_VIEW, { tool: "tco" }); m.track(EV.TOOL_COMPLETE, { tool: "tco" }); m.track(EV.REPORT_EXPORT, { tool: "tco" }); });
  eq("I1  first visit: every event in the session reports repeat false", repeats(), [false, false, false]);

  m = await pageLoad(); bodies.length = 0;
  run({ localStorage: ls, sessionStorage: ss1, location: LOC }, {}, () => { m.track(EV.TOOL_VIEW, { tool: "tco" }); m.track(EV.TOOL_VIEW, { tool: "tco" }); });
  eq("I2  reload inside the first session still reports repeat false", repeats(), [false, false]);

  const ss2 = mem();
  m = await pageLoad(); bodies.length = 0;
  run({ localStorage: ls, sessionStorage: ss2, location: LOC }, {}, () => { m.track(EV.TOOL_VIEW, { tool: "tco" }); m.track(EV.TOOL_COMPLETE, { tool: "tco" }); });
  eq("I3  a new session on a known browser reports repeat true throughout", repeats(), [true, true]);
  eq("I4  the distinct id is stable across sessions", new Set(bodies.map((b) => b.distinct_id)).size, 1);

  const ssLegacy = mem(); ssLegacy.setItem("coc:sid", "legacysession01");
  m = await pageLoad(); bodies.length = 0;
  run({ localStorage: ls, sessionStorage: ssLegacy, location: LOC }, {}, () => m.track(EV.TOOL_VIEW, { tool: "tco" }));
  eq("I5  a session with no pinned answer reports no repeat rather than a guess", repeats(), [undefined]);

  m = await pageLoad(); bodies.length = 0;
  run({ localStorage: throwingStorage, sessionStorage: mem(), location: LOC }, {}, () => m.track(EV.TOOL_VIEW, { tool: "tco" }));
  eq("I6  localStorage denied: repeat is unknown, not false", repeats(), [undefined]);
}

/* ------------------------------------- J. real is normalised before comparing */
section("J. inputsMoved normalises types before comparing to defaults");
const { inputsMoved } = await import("./src/lib/scenarioUrl.js");
const D = { agents: 50, wage: 18.5, ai: true, mix: [1, 2], name: "acme" };
eq("J1  untouched defaults are not real", inputsMoved({ ...D }, D), false);
eq("J2  numeric string equal to the default is not real", inputsMoved({ ...D, agents: "50" }, D), false);
eq("J3  padded or comma string equal to the default is not real", inputsMoved({ ...D, agents: " 50 ", wage: "18.50" }, D), false);
eq("J4  thousands separator equal to the default is not real", inputsMoved({ agents: "1,200" }, { agents: 1200 }), false);
eq("J5  boolean string equal to the default is not real", inputsMoved({ ...D, ai: "true" }, D), false);
eq("J6  a structurally equal copy of an array is not real", inputsMoved({ ...D, mix: [1, 2] }, D), false);
eq("J7  a moved number is real", inputsMoved({ ...D, agents: 51 }, D), true);
eq("J8  a moved numeric string is real", inputsMoved({ ...D, agents: "51" }, D), true);
eq("J9  a flipped boolean is real", inputsMoved({ ...D, ai: false }, D), true);
eq("J10 a changed array is real", inputsMoved({ ...D, mix: [2, 1] }, D), true);
eq("J11 a cleared field is real", inputsMoved({ ...D, agents: "" }, D), true);
eq("J12 a key absent from state is not a change", inputsMoved({}, D), false);
eq("J13 hostile input never throws and reads false", inputsMoved(null, undefined), false);

const ra = src("./ReportActions.jsx");
const fcBody = (ra.match(/const fireComplete = \(\) => \{[\s\S]*?\n  \};/) || [""])[0];
ok("J14 tool_complete is sent only from fireComplete", (ra.match(/trackTool\.complete\(/g) || []).length === 1 && /trackTool\.complete\(/.test(fcBody));
ok("J15 real is computed inside fireComplete, at fire time", /inputsMoved\(state, defaults\)/.test(fcBody));
ok("J16 no empty-deps effect fires tool_complete on mount", !/useEffect\(\(\) => \{[^}]*(fireComplete|trackTool\.complete)[\s\S]{0,400}?\}, \[\]\)/.test(ra));
ok("J17 the mount pass records a snapshot and returns without firing",
   /if \(mountSnapRef\.current === undefined\) \{ mountSnapRef\.current = stateSnap; return; \}/.test(ra));
ok("J18 an input change after mount fires", /stateSnap !== mountSnapRef\.current\) fireComplete\(\)/.test(ra));
for (const [name, re] of [
  ["PDF export", /onClickCapture=\{fireComplete\}[^>]*><ReportExport/],
  ["email a copy", /setCopyState\("sent"\);\s*fireComplete\(\);/],
  ["review submit", /setReviewState\("sent"\);\s*fireComplete\(\);/],
  ["copy scenario link", /setLinkCopied\(true\); fireComplete\(\);/],
  ["review opened", /setReviewOpen\(true\); fireComplete\(\);/],
]) ok(`J19 report action fires tool_complete: ${name}`, re.test(ra));

/* ---------------------------------------- K. one tool_view per path per session */
section("K. tool_view is deduplicated per pathname per session");
{
  const ss = mem();
  let m = await pageLoad();
  const res = [];
  run({ sessionStorage: ss, location: LOC }, {}, () => {
    res.push(m.claimView("/tools/tco-calculator"));
    res.push(m.claimView("/tools/tco-calculator"));
    res.push(m.claimView("/tools/TCO-Calculator/"));
    res.push(m.claimView("/tools/staffing-calculator"));
  });
  eq("K1  first claim true, repeats and case or slash variants false, new path true", res, [true, false, false, true]);
  m = await pageLoad(); const r2 = [];
  run({ sessionStorage: ss, location: LOC }, {}, () => r2.push(m.claimView("/tools/tco-calculator")));
  eq("K2  a reload inside the session does not re-claim the path", r2, [false]);
  m = await pageLoad(); const r3 = [];
  run({ sessionStorage: mem(), location: LOC }, {}, () => r3.push(m.claimView("/tools/tco-calculator")));
  eq("K3  a new session claims the path again", r3, [true]);
  m = await pageLoad(); const r4 = [];
  run({ sessionStorage: throwingStorage, location: LOC }, {}, () => { r4.push(m.claimView("/tools/x")); r4.push(m.claimView("/tools/x")); });
  eq("K4  storage denied: memory still dedupes within the page load", r4, [true, false]);
}
const journey = (src("./App.jsx").match(/function Journey\(\) \{[\s\S]*?\n\}/) || [""])[0];
ok("K5  Journey claims the path before sending tool_view", /if \(id && claimView\(pathname\)\) trackTool\.view\(id\);/.test(journey));
ok("K6  Journey has exactly one tool_view call site", (journey.match(/trackTool\.view\(/g) || []).length === 1);
for (const f of ["./TCOCalculator.jsx", "./BusinessCaseBuilder.jsx"]) {
  ok(`K7  ${f}: no wrapper double-fires report_export around ReportActions`, !/trackTool\.pdf\(/.test(src(f)));
}

/* ------------------------------------------------ L. bot and internal guard */
section("L. automation and internal browsers never reach the wire");
{
  const m = await pageLoad();
  eq("L1  webdriver blocks", m.captureBlocked({ webdriver: true }, {}), true);
  eq("L2  cccx_internal=1 blocks", m.captureBlocked({}, { localStorage: { getItem: (k) => (k === "cccx_internal" ? "1" : null) } }), true);
  eq("L3  cccx_internal=0 does not block", m.captureBlocked({}, { localStorage: { getItem: () => "0" } }), false);
  eq("L4  webdriver false and no flag does not block", m.captureBlocked({ webdriver: false }, { localStorage: mem() }), false);
  eq("L5  storage throwing does not block", m.captureBlocked({}, { localStorage: throwingStorage }), false);
  eq("L6  webdriver blocks even when storage throws", m.captureBlocked({ webdriver: true }, { localStorage: throwingStorage }), true);
  eq("L7  missing navigator and window do not throw or block", m.captureBlocked(undefined, undefined), false);

  /* L12 onward: self-identified crawlers, added after the 22 Sep export. */
  const BOTS = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/125.0.6422.141 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.141 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Twitterbot/1.0",
    "python-requests/2.31.0",
    "curl/8.4.0",
    "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)",
    "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  ];
  const HUMANS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
    "Mozilla/5.0 (Linux; Android 12; CUBOT_X30 Build/SP1A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/128.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Abbott-Intranet",
  ];
  for (const ua of BOTS) eq(`L12 bot blocked: ${ua.slice(0, 60)}`, m.captureBlocked({ userAgent: ua }, { localStorage: mem() }), true);
  for (const ua of HUMANS) eq(`L13 human passes: ${ua.slice(0, 60)}`, m.captureBlocked({ userAgent: ua }, { localStorage: mem() }), false);
  eq("L14 bot blocked even when storage throws", m.captureBlocked({ userAgent: BOTS[0] }, { localStorage: throwingStorage }), true);
  eq("L15 empty user agent does not block", m.captureBlocked({ userAgent: "" }, { localStorage: mem() }), false);
  eq("L16 non-string user agent does not block or throw", m.captureBlocked({ userAgent: 42 }, { localStorage: mem() }), false);
  ok("L17 the user agent is never a wire property", !ALLOWED_PROP_KEYS.some((k) => /agent|ua/i.test(k)));

  const ls = mem(), ss = mem();
  bodies.length = 0;
  run({ localStorage: ls, sessionStorage: ss, location: LOC }, { webdriver: true }, () => { m.track(EV.TOOL_VIEW, { tool: "tco" }); m.trackTool.pdf("tco"); });
  eq("L8  a webdriver browser sends nothing", bodies.length, 0);
  eq("L9  a webdriver browser is never issued an id", ls._m.has("coc:aid") || ss._m.has("coc:sid"), false);

  const lsi = mem(); lsi.setItem("cccx_internal", "1");
  run({ localStorage: lsi, sessionStorage: mem(), location: LOC }, {}, () => m.trackTool.view("tco"));
  eq("L10 an internal browser sends nothing", bodies.length, 0);

  run({ localStorage: mem(), sessionStorage: mem(), location: LOC }, {}, () => m.trackTool.view("tco"));
  eq("L11 an ordinary browser still sends", bodies.length, 1);

  bodies.length = 0;
  const lsb = mem(), ssb = mem();
  run({ localStorage: lsb, sessionStorage: ssb, location: LOC }, { userAgent: BOTS[1] }, () => { m.trackTool.view("tco"); m.trackTool.pdf("tco"); });
  eq("L18 a rendering Googlebot sends nothing", bodies.length, 0);
  eq("L19 a rendering Googlebot is never issued an id", lsb._m.has("coc:aid") || ssb._m.has("coc:sid"), false);
}

section("M. A scenario link cannot reach an object's prototype or plant a key");
{
  const { decodeScenario, encodeScenario } = await import("./src/lib/scenarioUrl.js");
  const link = (d) => "?s=" + Buffer.from(`{"v":1,"t":"x","d":${d}}`).toString("base64url");
  const D = { agents: 100, mode: "a", nested: { x: 1 }, rows: [{ a: 1 }] };
  const plain = (o) => Object.getPrototypeOf(o) === Object.prototype;
  const attacks = [
    ["top-level __proto__", '{"__proto__":{"polluted":true}}'],
    ["nested __proto__", '{"nested":{"__proto__":{"polluted":true}}}'],
    ["constructor.prototype", '{"constructor":{"prototype":{"polluted":true}}}'],
    ["__proto__ inside a wholesale value", '{"extra":{"_v":{"__proto__":{"polluted":true},"ok":1}}}'],
    ["__proto__ inside an array row", '{"rows":{"0":{"__proto__":{"polluted":true}}}}'],
  ];
  for (const [label, d] of attacks) {
    const s = decodeScenario(link(d), "x", D);
    const reach = [s, s.nested, s.extra, s.rows && s.rows[0]].filter((o) => o && typeof o === "object");
    ok(`M ${label}: every decoded object keeps the plain prototype`, reach.every(plain));
    ok(`M ${label}: no decoded object inherits the planted value`, reach.every((o) => o.polluted === undefined));
    ok(`M ${label}: no unsafe name becomes an own key`, reach.every((o) => !["__proto__", "constructor", "prototype"].some((k) => Object.prototype.hasOwnProperty.call(o, k))));
    ok(`M ${label}: the global prototype is untouched`, ({}).polluted === undefined);
  }
  const wholesale = decodeScenario(link('{"extra":{"_v":{"__proto__":{"polluted":true},"ok":1}}}'), "x", D);
  eq("M a wholesale value keeps its safe keys", wholesale.extra && wholesale.extra.ok, 1);
  /* Ordinary links are unchanged: a state round-trips exactly. */
  const S = { agents: 250, mode: "b", nested: { x: 3, y: "new" }, rows: [{ a: 2 }, { a: 5, b: [1, 2] }], added: { k: 1 } };
  const back = decodeScenario("?s=" + encodeScenario("x", S, D), "x", D);
  eq("M an ordinary state round-trips exactly", JSON.stringify(back), JSON.stringify(S));
  eq("M a state carrying an unsafe key encodes without it", JSON.stringify(decodeScenario("?s=" + encodeScenario("x", JSON.parse('{"agents":1,"constructor":{"x":1}}'), D), "x", D)), JSON.stringify({ ...D, agents: 1 }));
}

/* ------------------------------------------ P. frozen taxonomy and landing */
/* P2 task 7: the names PostHog funnels are built on. Changing one means a new TAXONOMY_VERSION, a line in
   docs/MEASUREMENT.md, and these pins; a silent rename would break every funnel that uses it. */
section("P. The taxonomy is frozen at 1.0, and the landing event reads the channel");
{
  eq("P1 taxonomy version", TAXONOMY_VERSION, "1.0");
  eq("P2 event names are frozen", JSON.stringify(EV), JSON.stringify({
    SESSION_LANDING: "session_landing", TOOL_VIEW: "tool_view", TOOL_COMPLETE: "tool_complete", REPORT_EXPORT: "report_export",
    REPORT_COPY: "report_copy_requested", REVIEW_OPENED: "review_form_opened", REVIEW_SUBMIT: "expert_read_submit",
    NEXT_STEP: "next_step_click", SCENARIO_SHARE: "scenario_shared", SCENARIO_LOAD: "scenario_loaded" }));
  eq("P3 property keys are frozen", JSON.stringify(ALLOWED_PROP_KEYS), JSON.stringify(["tool", "from", "to", "grade", "bound_axis", "severity", "real", "depth", "via_rail", "repeat", "page_type", "utm_source", "utm_medium", "utm_campaign", "ref"]));
  const doc = readFileSync("./docs/MEASUREMENT.md", "utf8");
  ok("P4 docs/MEASUREMENT.md names every event and property and the version", Object.values(EV).every((n) => doc.includes("`" + n + "`")) && ALLOWED_PROP_KEYS.every((k) => doc.includes("`" + k + "`")) && doc.includes("Taxonomy version 1.0"));

  const L = landingProps("/tools/staffing-calculator", "?utm_source=LinkedIn&utm_medium=social&utm_campaign=2026 10 Healthcare&s=abc", "https://www.linkedin.com/feed/update/123?x=1", "www.contactcentercx.com");
  const sent = buildPayload(EV.SESSION_LANDING, L, CTX).properties;
  eq("P5 a tagged LinkedIn landing carries page type, UTMs (normalised) and the referrer host", JSON.stringify([sent.page_type, sent.utm_source, sent.utm_medium, sent.utm_campaign, sent.ref]), JSON.stringify(["tool", "linkedin", "social", "2026-10-healthcare", "linkedin.com"]));
  ok("P6 the referrer's path and query never leave", !JSON.stringify(sent).includes("feed") && !JSON.stringify(sent).includes("123"));
  ok("P7 the scenario parameter is not a channel", !("s" in L));
  ok("P8 a referrer on the site itself is not a channel", !("ref" in landingProps("/", "", "https://www.contactcentercx.com/about", "www.contactcentercx.com")));
  const pasted = buildPayload(EV.SESSION_LANDING, landingProps("/", "?utm_source=jane.doe@example.com&utm_campaign=" + "x".repeat(80), "", "x"), CTX).properties;
  ok("P9 a UTM value that is not a short slug (an address, an overlong value) is dropped", !("utm_source" in pasted) && !("utm_campaign" in pasted));
  ok("P10 no referrer, no ref", !("ref" in landingProps("/", "", "", "x")));
  eq("P11 page types", ["/", "/tools/tco-calculator", "/methodology/tco-calculator", "/changelog", "/industries/healthcare/health-insurance", "/vendors/genesys", "/research/ccaas-buyer-guide", "/about"].map(pageType).join(","), "home,tool,method,method,industry,vendor,research,other");
  const app = readFileSync("./App.jsx", "utf8");
  ok("P12 the app fires the landing once per session, on mount", /useEffect\(\(\) => \{ trackLanding\(\); \}, \[\]\)/.test(app) && /coc:landed/.test(readFileSync("./src/lib/track.js", "utf8")));
}

/* ------------------------------------------------------------------ report */

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
  if (failures.length > 40) console.log(`  ...and ${failures.length - 40} more`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
