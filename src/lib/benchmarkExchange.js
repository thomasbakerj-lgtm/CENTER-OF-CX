// src/lib/benchmarkExchange.js
//
// The reader benchmark (open item 10, TB 14 Oct 2026: build it; storage A, PostHog; publish a group from 5
// contributions; figures as recommended; no lawyer's read for now). Pure: no network, no browser.
//
// What a reader can add, from four tools: first contact resolution (FCR Leakage), handle time (AHT Decomposition), cost
// per contact (Cost per Contact) and annual agent attrition (Attrition). With it: an industry (the site's ten, or
// other) and an agent count band. Nothing else: no name, email, company, note or exact figure.
//
// Rules, each gated by benchmark.test.mjs:
//   - Opt in, shown first. The reader sees exactly what is sent, ticks a box and presses a button; nothing is sent
//     before that, and nothing on a tool's opening values.
//   - Rounded in the browser before it is sent (ROUND), and dropped outside the tool's valid range (MIN, MAX).
//   - One contribution per figure per browser every 90 days (local storage; a cleared browser can send again, which
//     the trimmed pooling below tolerates).
//   - Sent with a fresh random id, so a contribution cannot be linked to the browser's other events.
//   - Published only as pooled groups: 5 to 9 contributions show the median and the count; from 10 the middle half
//     (25th to 75th percentile) shows too. All industries first; an industry or size group shows once it reaches 5.
//   - Labelled "Reported by Center of CX readers, not verified", beside the sourced rows, never averaged with them, and
//     never read by any tool's arithmetic, default, flag or grade.

export const METRICS = {
  fcr: { tool: "fcr-leakage", label: "First contact resolution", unit: "%", round: 1, min: 1, max: 99, places: 0 },
  aht: { tool: "aht-decomposition", label: "Average handle time", unit: "s", round: 10, min: 30, max: 3600, places: 0 },
  cpc: { tool: "cost-per-contact", label: "Cost per contact", unit: "$", round: 0.1, min: 0.1, max: 500, places: 2 },
  attrition: { tool: "attrition-cost", label: "Annual agent attrition", unit: "%", round: 1, min: 1, max: 300, places: 0 },
};
export const METRIC_IDS = Object.keys(METRICS);
export const metricForTool = (tool) => METRIC_IDS.find((m) => METRICS[m].tool === tool) || null;

export const INDUSTRIES = [
  ["financial-services", "Financial services"], ["healthcare", "Healthcare"], ["retail", "Retail and ecommerce"], ["telecom", "Telecom"],
  ["insurance", "Insurance"], ["travel", "Travel and hospitality"], ["government", "Government"], ["utilities", "Utilities"],
  ["manufacturing", "Manufacturing"], ["education", "Education"], ["other", "Another industry"],
];
export const SIZE_BANDS = [["s1", "Under 50 agents"], ["s2", "50 to 199 agents"], ["s3", "200 to 499 agents"], ["s4", "500 to 1,999 agents"], ["s5", "2,000 agents or more"]];
const INDUSTRY_IDS = new Set(INDUSTRIES.map(([k]) => k));
const SIZE_IDS = new Set(SIZE_BANDS.map(([k]) => k));

export const MIN_GROUP = 5;
export const QUARTILES_FROM = 10;
export const REPEAT_DAYS = 90;
export const READER_LABEL = "Reported by Center of CX readers, not verified";

/** A figure rounded to its metric's step, at the metric's places. Null when it is not a finite number. */
export function roundValue(metric, v) {
  const m = METRICS[metric];
  const n = Number(v);
  if (!m || !Number.isFinite(n)) return null;
  /* toFixed first, so 8.35 / 0.1 (83.49999...) rounds as the reader reads it, to 8.4. */
  return Number((Math.round(Number((n / m.round).toFixed(6))) * m.round).toFixed(m.places));
}

/** True when a rounded figure is inside its metric's range. */
export const inRange = (metric, v) => !!METRICS[metric] && Number.isFinite(v) && v >= METRICS[metric].min && v <= METRICS[metric].max;

/** The properties a contribution sends, or null if any part fails. */
export function contribution(metric, raw, industry, size) {
  if (!METRICS[metric] || !INDUSTRY_IDS.has(industry) || !SIZE_IDS.has(size)) return null;
  const value = roundValue(metric, raw);
  if (!inRange(metric, value)) return null;
  return { tool: METRICS[metric].tool, metric, value, industry, size_band: size };
}

/** How a figure reads to a person. */
export function show(metric, v) {
  const m = METRICS[metric];
  if (!m || !Number.isFinite(v)) return "";
  if (m.unit === "%") return `${v}%`;
  if (m.unit === "$") return `$${v.toFixed(2)}`;
  const t = Math.round(v), min = Math.floor(t / 60), s = t % 60;
  return min ? `${min}m ${s}s` : `${s}s`;
}

/* Local storage key for the 90 day limit, one per figure. */
export const limitKey = (metric) => `coc:bx:${metric}`;
/** True when this browser may contribute this figure now (`last` is the stored time in ms, or null). */
export const mayContribute = (last, now) => !(Number(last) > 0) || now - Number(last) >= REPEAT_DAYS * 86400000;

/* ---------------------------------------------------------------- pooling */

/** The p-th percentile (0 to 1) of sorted numbers, by linear interpolation between ranks. */
export function percentile(sorted, p) {
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/** One group's published figures, or null below the minimum. Never the lowest or highest single value. */
export function summarize(metric, values) {
  const v = values.filter((x) => inRange(metric, x)).sort((a, b) => a - b);
  if (v.length < MIN_GROUP) return null;
  const r = (x) => roundValue(metric, x);
  const out = { n: v.length, median: r(percentile(v, 0.5)) };
  if (v.length >= QUARTILES_FROM) { out.p25 = r(percentile(v, 0.25)); out.p75 = r(percentile(v, 0.75)); }
  return out;
}

/** Pool raw contribution rows ({ metric, value, industry, size_band }) into the published file's shape. Rows that fail
 *  the same checks the browser applies are dropped and counted. */
export function pool(rows, pooled) {
  const ok = [], dropped = { invalid: 0 };
  for (const r of rows || []) {
    const c = r && contribution(r.metric, r.value, r.industry, r.size_band);
    if (c && c.value === Number(r.value)) ok.push(c); else dropped.invalid++;
  }
  const metrics = {};
  for (const m of METRIC_IDS) {
    const mine = ok.filter((c) => c.metric === m);
    const groups = [];
    const all = summarize(m, mine.map((c) => c.value));
    if (all) groups.push({ id: "all", label: "All industries, all sizes", ...all });
    for (const [k, label] of INDUSTRIES) if (k !== "other") { const s = summarize(m, mine.filter((c) => c.industry === k).map((c) => c.value)); if (s) groups.push({ id: `ind-${k}`, label, ...s }); }
    for (const [k, label] of SIZE_BANDS) { const s = summarize(m, mine.filter((c) => c.size_band === k).map((c) => c.value)); if (s) groups.push({ id: `size-${k}`, label, ...s }); }
    metrics[m] = { contributions: mine.length, groups };
  }
  return { pooled: pooled || null, minGroup: MIN_GROUP, quartilesFrom: QUARTILES_FROM, metrics, dropped };
}
