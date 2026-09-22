// src/lib/track.js
// The Center of CX - one shared analytics vocabulary for the whole suite.
//
// WHY THIS EXISTS
//
// Doctrine Amendment 11: instrumentation precedes proof. The platform is
// arithmetically defensible and correctly findable, and it is not observable.
// Every decision about which tools matter, which journeys convert, and what
// deserves funding is guesswork until a stranger's visit is visible. Proving
// behaviour first is step one of the whole zero-spend strategy, and step one
// was not running.
//
// WHY NOT VERCEL CUSTOM EVENTS
//
// Measured 8 Sep 2026 against Vercel's own documentation, not assumed: custom
// events are available on the Pro and Enterprise plans. On Hobby, window.va
// accepts the call and the event is dropped. The four call sites that lived in
// ReportActions.jsx were therefore collecting nothing, and had been for as long
// as they existed. Pageviews still work on Hobby and are unaffected; the
// <Analytics /> mount in App.jsx stays exactly where it is.
//
// Vercel Pro is $20/month and further limits the number of custom properties
// per event by plan, which the shapes below would exceed. Paying for it would
// also buy the wrong thing: the constraint is zero recurring spend until
// behaviour is proven, and instrumentation is precisely what proves it.
// Spending to measure whether spending is justified inverts the order.
//
// WHY POSTHOG, AND WHY NOT ITS SDK
//
// PostHog Cloud's free tier allows 1,000,000 analytics events per month with no
// credit card. This platform will not approach that this year. The transport
// below is a single POST to the documented public capture endpoint using the
// write-only project key, so posthog-js is never installed. That matters: the
// bundle is one chunk at roughly 2,918 kB raw and 742 kB gzipped with majority
// mobile traffic, and that is the largest open reachability defect on the
// platform. Adding an analytics SDK to it in order to measure reachability
// would be self-defeating. The SDK's headline feature, autocapture, is also the
// one thing this platform must never have: autocapture reads input values, and
// the input values here are a reader's own cost per contact and wage data.
//
// WHAT LEAVES THE BROWSER
//
// An event name from a fixed vocabulary, and a small set of coarse properties
// from a fixed allowlist: a tool id, a confidence grade, a severity band, a
// count, a boolean. Never an input value, never a scenario, never a wage, never
// an email, never a company. buildPayload below is the only path to the wire
// and it drops anything not on the allowlist, whatever a caller passes. The
// guard is a pure function so the harness can prove it directly.
//
// SAFETY
//
// track() never throws and never blocks a tool. Storage may be disabled,
// private browsing may reject writes, the network may fail, an ad blocker may
// eat the request. Every one of those paths ends in a silent no-op.

/* ------------------------------------------------------------------ config */

const env = (k) => {
  try {
    return (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[k]) || "";
  } catch { return ""; }
};

/* Project keys are write-only and PostHog documents them as safe in client
   code. Held in an environment variable anyway so the host or key can change,
   or collection be switched off entirely, without a source deploy. */
export const CONFIG = {
  key: env("VITE_POSTHOG_KEY"),
  host: env("VITE_POSTHOG_HOST") || "https://us.i.posthog.com",
};

export const isConfigured = () => !!CONFIG.key;

/* ------------------------------------------------------------- vocabulary */

/* The canonical event vocabulary. Add here, never ad hoc inside a tool. A name
   absent from this object is refused, so a typo produces no data rather than a
   second silent funnel nobody knows to look at. */
export const EV = {
  TOOL_VIEW: "tool_view",              // a tool route was opened
  TOOL_COMPLETE: "tool_complete",      // a result rendered, with a confidence grade
  REPORT_EXPORT: "report_export",      // the PDF was generated. Highest intent action on the site.
  REPORT_COPY: "report_copy_requested",
  REVIEW_OPENED: "review_form_opened",
  REVIEW_SUBMIT: "expert_read_submit", // medium intent: submitted a result for a human read
  NEXT_STEP: "next_step_click",        // clicked a journey CTA into another tool
  SCENARIO_SHARE: "scenario_shared",
  SCENARIO_LOAD: "scenario_loaded",
};

const EVENT_NAMES = new Set(Object.values(EV));

/* ---------------------------------------------------------------- severity */

/* Coarse band so result intensity is visible without the number that produced
   it.

   "none" is a measurement: the tool ran and found no severity. A non-finite or
   unparseable input is not that, it is an absence of measurement, and returning
   "none" for it would report a confident zero where there is no reading at all.
   The doctrine forbids conflating "we do not know" with "we know, and the
   answer is no". Unknown returns the empty string, which fails the property
   validator and is dropped, so the event carries no severity rather than a
   false one. */
export function severityBucket(x) {
  if (x === null || x === undefined || x === "") return "";
  const v = Number(x);
  if (!isFinite(v)) return "";
  if (v <= 0) return "none";
  if (v < 0.25) return "low";
  if (v < 0.5) return "moderate";
  if (v < 0.75) return "high";
  return "severe";
}

export const SEVERITY_BANDS = ["none", "low", "moderate", "high", "severe"];

/* One vocabulary on the wire. Synonyms in from the tools, canonical bands out. */
export const SEVERITY_SYNONYMS = {
  normal: "low",
  elevated: "moderate",
  critical: "severe",
  blocked: "severe",
  clear: "none",
};

/* -------------------------------------------------------------- the guard */

/* The allowlist is the privacy boundary. A key not named here does not leave
   the browser, and each named key carries a validator, so a caller cannot
   smuggle a wage through `depth` or an email through `tool`. Enums are closed
   sets. Free-text keys are slug-shaped and length-capped, which no monetary
   figure, address or email address can satisfy. */
const SLUG = /^[a-z0-9][a-z0-9_-]{0,63}$/;

const isSlug = (v) => typeof v === "string" && SLUG.test(v);
const isBool = (v) => typeof v === "boolean";
const isSmallCount = (v) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 99;
const isOneOf = (set) => (v) => typeof v === "string" && set.has(v);

/* Confidence grades are a closed vocabulary in the epistemic standard. Lower
   cased at the boundary so "Directional" and "directional" cannot split one
   funnel into two.

   THIS SET WAS WRONG AND THE DAMAGE WAS SILENT. It carried indicative,
   directional, supported, validated, finance and none, a vocabulary retired when
   doctrine section 5 fixed the three grades. normalise truncated a grade at the
   first non-letter, so "Finance-grade" arrived as "finance" and passed, while
   "Planning-grade" arrived as "planning" and failed, and a failed validator drops
   the property. A drop reads downstream as "not published" rather than as a
   grade. The middle grade, which is the one most results land on, was absent from
   every tool_complete, report_export, report_copy and expert_read_submit event
   this platform has ever sent. Void was dropped too, so a voided export looked
   identical to an unpublished one.

   Fixed on both sides. The truncation is gone, because a lossy transform on a
   closed vocabulary can only ever lose, and the set now carries the doctrine
   words in full. Void is a state rather than a grade and is carried here so a
   voided export stays distinguishable. */
const GRADES = new Set(["directional", "planning-grade", "finance-grade", "void"]);

/* Which axis or axes hold the headline down, in fixed axis order. Closed set, so
   the funnel can be cut by remedy rather than by grade alone: get a better
   source, commit a harder lever, or finish the model. */
const BOUND_AXES = new Set([
  "evidence", "realization", "completeness",
  "evidence+realization", "evidence+completeness", "realization+completeness",
  "evidence+realization+completeness",
]);

export const ALLOWED_PROPS = {
  tool: isSlug,                               // tool id or route slug
  from: isSlug,                               // journey origin tool
  to: isSlug,                                 // journey destination tool
  grade: isOneOf(GRADES),                     // headline confidence grade
  bound_axis: isOneOf(BOUND_AXES),            // which axis or axes hold the headline down
  severity: isOneOf(new Set(SEVERITY_BANDS)), // result intensity band
  real: isBool,                               // inputs moved off the defaults
  depth: isSmallCount,                        // how many tools deep in this session
  via_rail: isBool,                           // arrived at this tool after another one
  repeat: isBool,                             // this browser has been here before
};

export const ALLOWED_PROP_KEYS = Object.keys(ALLOWED_PROPS);

/* Normalise before validating, so a grade in title case or a tool id carrying a
   space is corrected rather than silently dropped. Anything that still fails
   its validator is dropped, never coerced into something plausible. */
function normalise(key, value) {
  if (typeof value !== "string") return value;
  const v = value.trim().toLowerCase();
  /* No truncation. The three doctrine grades differ only after the hyphen, so
     cutting there collapsed two of them and dropped the rest. Case and stray
     whitespace are corrected; nothing else is. */
  if (key === "grade") return v.replace(/\s+/g, "-");
  /* Every rail-active tool now routes its severity through severityBucket, so
     nothing reaches this point that is not already a canonical band. Tracker
     1-15 closed the last three: TCOCalculator, StaffingCalculator and
     AIDeflection hand-wrote normal / elevated / high, which capped them at
     three of the five bands and, in two of the three, duplicated a signal the
     same block already published. Each now carries an argued ratio and its
     recorded rejections at the `severity:` line in the tool.

     The synonym map is retained rather than removed. It is a boundary guard on
     a shared vocabulary, not a shim for three specific callers, and the same
     value is appended to the manual review submission ReportActions builds
     from `signals`, so a word arriving here in an older shape should still be
     read rather than dropped in front of a human reviewer.

     An unrecognised word fails the validator and the property is dropped, which
     reads as "not published" and never as "none". rail-audit fails the suite on
     any literal severity value outside this allowlist, because a drop here is
     otherwise completely silent. */
  if (key === "severity") return SEVERITY_SYNONYMS[v] || v;
  if (key === "tool" || key === "from" || key === "to") {
    return v.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
  }
  return v;
}

export function sanitizeProps(props) {
  const out = {};
  if (!props || typeof props !== "object") return out;
  for (const key of ALLOWED_PROP_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
    const raw = props[key];
    if (raw === null || raw === undefined) continue;
    const value = normalise(key, raw);
    if (ALLOWED_PROPS[key](value)) out[key] = value;
  }
  return out;
}

/* The only thing that ever reaches the wire. Pure, so the harness can assert
   the no-PII rule with no browser, no network and no PostHog account. Returns
   null for anything that must not be sent at all. */
export function buildPayload(event, props, ctx = {}) {
  if (!EVENT_NAMES.has(event)) return null;
  const key = ctx.key || CONFIG.key;
  if (!key) return null;
  /* No coercion. The distinct id is an opaque random this module generates; a
     number arriving here means a caller invented one, and an invented id is the
     shape an account number or a phone number would take. Refuse rather than
     stringify something that was never ours. */
  const distinct = ctx.distinctId;
  if (!isSlug(distinct)) return null;

  return {
    api_key: key,
    event,
    distinct_id: distinct,
    properties: {
      ...sanitizeProps(props),
      /* Anonymous by construction. Without this the capture API treats every
         event as identified, which builds a person profile this platform
         neither needs nor has any business holding. */
      $process_person_profile: false,
      $session_id: ctx.sessionId,
      $current_url: ctx.path,
    },
    timestamp: ctx.now || new Date().toISOString(),
  };
}

/* --------------------------------------------------------------- identity */

/* Anonymous, generated here, never derived from anything about the person. The
   browser id persists so a returning reader is distinguishable from a new one,
   which is the behaviour that would justify accounts later. The session id
   lives in sessionStorage so a journey across tools in one visit is
   distinguishable from two unrelated visits. Both are opaque randoms. */
const AID = "coc:aid";
const SID = "coc:sid";

const rand = () => {
  try {
    const a = new Uint32Array(4);
    const c = globalThis.crypto;
    if (c && typeof c.getRandomValues === "function") {
      c.getRandomValues(a);
      if (a[0] || a[1]) return Array.from(a, (n) => n.toString(36)).join("").slice(0, 24);
    }
  } catch { /* fall through */ }
  return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
};

let memAid = null;
let memSid = null;
/* undefined means not yet computed for this page load. null means unknown,
   which sanitizeProps drops, so an unmeasured repeat is never reported false. */
let memRepeat;
const REP = "coc:rep";

function stored(store, key) {
  try {
    const s = typeof window !== "undefined" ? window[store] : null;
    if (!s) return null;
    const found = s.getItem(key);
    if (found && isSlug(found)) return { id: found, fresh: false };
    const made = rand();
    s.setItem(key, made);
    return { id: made, fresh: true };
  } catch {
    return null;
  }
}

/* repeat is decided once, at the moment this session's id is created: true
   only if the browser id already existed before that moment. It is then pinned
   in sessionStorage, so every later event in the session, and a reload inside
   the session, reads the same answer. The old form set it on the second event
   of a first visit, because by then this module had written the browser id
   itself. A session that predates this rule has no pinned answer and reports
   none, rather than guessing. */
function identity() {
  const a = stored("localStorage", AID);
  if (a) memAid = a.id;
  else if (!memAid) memAid = rand();

  const s = stored("sessionStorage", SID);
  if (s) memSid = s.id;
  else if (!memSid) memSid = rand();

  if (memRepeat === undefined) {
    memRepeat = null;
    if (a) try {
      if (!s || s.fresh) { memRepeat = !a.fresh; if (s) window.sessionStorage.setItem(REP, +memRepeat); }
      else { const v = window.sessionStorage.getItem(REP); memRepeat = v === "1" ? true : v === "0" ? false : null; }
    } catch { /* pinned in memory only */ }
  }
  return { distinctId: memAid, sessionId: memSid, repeat: memRepeat };
}

/* ---------------------------------------------------------------- journey */

/* Session tool depth. The rail already records which tools ran in a visit, but
   the rail only sees tools that publish a result. Depth is counted here so a
   tool opened and abandoned still registers, and so a second tool entered in
   one session is distinguishable from two unrelated single-tool visits without
   any cross-visit identifier. */
const SEEN = "coc:seen";

function noteTool(toolId) {
  const id = normalise("tool", toolId);
  if (!isSlug(id)) return { depth: 1, viaRail: false };
  let list = [];
  try {
    const s = typeof window !== "undefined" ? window.sessionStorage : null;
    if (s) {
      const parsed = JSON.parse(s.getItem(SEEN));
      if (Array.isArray(parsed)) list = parsed;
    }
    if (!list.includes(id)) {
      list.push(id);
      if (s) s.setItem(SEEN, JSON.stringify(list.slice(0, 40)));
    }
  } catch { /* storage disabled. Depth degrades to 1 and never throws. */ }
  const depth = Math.max(1, Math.min(99, list.length || 1));
  return { depth, viaRail: depth > 1 };
}

/* Route slug as a fallback tool id, for the twenty-two tools that render
   ReportExport directly and never pass one. /tools/tco-calculator -> tco-calculator. */
export function toolIdFromPath(pathname) {
  const p = String(pathname || "");
  const m = p.match(/\/tools\/([a-z0-9-]+)/i);
  return m ? m[1].toLowerCase() : "";
}

export function sessionDepth() {
  try {
    const s = typeof window !== "undefined" ? window.sessionStorage : null;
    if (!s) return 0;
    const parsed = JSON.parse(s.getItem(SEEN));
    return Array.isArray(parsed) ? Math.min(99, parsed.length) : 0;
  } catch { return 0; }
}

/* ------------------------------------------------------- real, dedupe, guard */

/* One tool_view per pathname per session. React StrictMode runs effects twice
   in development, and a remount of the router would do the same in production,
   so the claim is recorded before the event is sent. Falls back to memory when
   sessionStorage is unavailable. */
const memViews = new Set();

export function claimView(pathname) {
  const p = String(pathname || "").toLowerCase().replace(/\/+$/, "") || "/";
  if (memViews.has(p)) return false;
  memViews.add(p);
  try {
    const s = window.sessionStorage, k = "coc:views";
    const list = JSON.parse(s.getItem(k)) || [];
    if (list.includes(p)) return false;
    s.setItem(k, JSON.stringify(list.concat(p)));
  } catch { /* storage denied: memory holds the claim for this page load */ }
  return true;
}

/* Automation and internal traffic never reach the wire. navigator.webdriver is
   set by Selenium, Playwright and Puppeteer. cccx_internal=1 in localStorage is
   the manual opt-out for TB's own browsers. Checked before identity() so a
   blocked browser is never issued an id at all. */

/* Self-identified crawlers. Added 22 Sep 2026 after the first PostHog export:
   of 28 events, 7 came from Google's Council Bluffs data center in a four
   minute sweep and 11 more from a two minute burst across data-center cities.
   webdriver alone let every rendering crawler through, and each one counted as
   a first-time visitor on a new device. Counts inflated that way are worse than
   no counts, because they are believed.

   The pattern is anchored so a phone brand cannot trip it: "[a-z]bot/" needs
   the version slash crawlers put after their name, and bare "bot" needs a word
   boundary on both sides, so "CUBOT_X30" and "Abbott" pass. The user agent is
   read here and never sent; it is a fingerprinting input and stays local.

   Limit, recorded: a crawler that spoofs a desktop Chrome user agent passes.
   The Sep 15 burst may be that. It is caught downstream by filtering data
   center geography in PostHog, not here, because the browser cannot see it. */
export const BOT_UA = /\b(bot|crawler|spider|headless)\b|[a-z]bot\/|crawl|spider|slurp|headlesschrome|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|facebookexternalhit|slackbot|linkedinbot|twitterbot|discordbot|telegrambot|whatsapp\/|skypeuripreview|embedly|prerender|phantomjs|puppeteer|playwright|selenium|python-requests|python-urllib|curl\/|wget\/|go-http-client|axios\/|node-fetch|java\/|okhttp|httpclient|mediapartners-google|adsbot|google-inspectiontool|feedfetcher|google-read-aloud|bytespider|petalbot|yandex|baiduspider|duckduckbot|applebot|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|ccbot|amazonbot|semrush|ahrefs|mj12bot|dotbot|dataforseo|screaming frog/i;

export function isBotUA(ua) {
  return typeof ua === "string" && ua.length > 0 && BOT_UA.test(ua);
}

export function captureBlocked(nav, win) {
  try {
    if (nav?.webdriver === true) return true;
    if (isBotUA(nav?.userAgent)) return true;
    return win?.localStorage?.getItem("cccx_internal") === "1";
  }
  catch { return false; /* storage denied: not internal by any evidence we hold */ }
}

/* -------------------------------------------------------------- transport */

/* Fire and forget. sendBeacon survives the page being closed, which matters
   because the export event fires while a print window is opening. fetch with
   keepalive is the fallback. Neither is awaited and neither can reject into a
   render. */
function send(payload) {
  const url = `${CONFIG.host}/i/v0/e/`;
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch { /* fall through to fetch */ }
  try {
    if (typeof fetch === "function") {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        mode: "no-cors",
      }).catch(() => {});
    }
  } catch { /* offline, blocked, or no fetch. Nothing to do, nothing to report. */ }
}

/* -------------------------------------------------------------------- api */

/* The shape every call site already used. Kept deliberately, so the transport
   can change again without touching a single tool. */
export function track(event, props = {}) {
  try {
    if (typeof window === "undefined") return;
    if (!isConfigured()) return;
    if (captureBlocked(globalThis.navigator, window)) return;
    const id = identity();
    const payload = buildPayload(event, { repeat: id.repeat, ...props }, {
      distinctId: id.distinctId,
      sessionId: id.sessionId,
      path: window.location ? window.location.pathname : undefined,
    });
    if (payload) send(payload);
  } catch { /* telemetry must never break a tool */ }
}

export const trackTool = {
  view: (toolId) => {
    const { depth, viaRail } = noteTool(toolId);
    track(EV.TOOL_VIEW, { tool: toolId, depth, via_rail: viaRail });
  },
  complete: (toolId, { real = true, grade, severity, bound_axis } = {}) =>
    track(EV.TOOL_COMPLETE, {
      tool: toolId, real, depth: Math.max(1, sessionDepth()), grade, severity, bound_axis,
    }),
  pdf: (toolId, { grade, bound_axis } = {}) => track(EV.REPORT_EXPORT, { tool: toolId, grade, bound_axis }),
  copy: (toolId, { grade, bound_axis } = {}) => track(EV.REPORT_COPY, { tool: toolId, grade, bound_axis }),
  reviewOpened: (toolId) => track(EV.REVIEW_OPENED, { tool: toolId }),
  expertRead: (toolId, { grade, bound_axis } = {}) => track(EV.REVIEW_SUBMIT, { tool: toolId, grade, bound_axis }),
  nextStep: (fromTool, toTool) => track(EV.NEXT_STEP, { from: fromTool, to: toTool }),
  scenarioShare: (toolId) => track(EV.SCENARIO_SHARE, { tool: toolId }),
  scenarioLoad: (toolId) => track(EV.SCENARIO_LOAD, { tool: toolId }),
};
