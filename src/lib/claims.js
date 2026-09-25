/* claims.js
 *
 * The content claims registry (full site scan part 4, TB approved S23). The doctrine's claim classes applied to the
 * industry pages: every figure on a converted page resolves to one entry here, and the page renders it by kind.
 *
 *   fact        a published figure, checked on the publisher's own page: publisher, title, year, url, date checked.
 *   assumption  a planning figure from practice, labelled as such, with its reasoning and the tool that tests it
 *               with the reader's own numbers.
 *   example     a worked illustration; the arithmetic or the scenario is in the sentence itself.
 *   none        no public benchmark exists; the page says so and links the tool that measures the reader's own figure.
 *               Unknown is never shown as weak.
 *
 * Page text carries a token, [[id]], in place of the figure. `research: "pending"` marks an entry whose source has not
 * yet been checked; claims.test.mjs refuses to pass while any converted page uses one.
 */

export const KINDS = ["fact", "assumption", "example", "none"];

/* The tool that tests a figure with the reader's own numbers. Every href is a live route (claims.test.mjs). */
export const TESTS = {
  fcr:        { href: "/tools/fcr-leakage", label: "FCR Leakage Diagnostic" },
  aht:        { href: "/tools/aht-decomposition", label: "AHT Decomposition" },
  attrition:  { href: "/tools/attrition-cost", label: "Attrition Cost Calculator" },
  deflection: { href: "/tools/ai-deflection", label: "AI Deflection Reality Check" },
  channel:    { href: "/tools/channel-shift", label: "Channel Shift Model" },
  staffing:   { href: "/tools/staffing-calculator", label: "Staffing Calculator" },
  forecast:   { href: "/tools/forecast-accuracy", label: "Forecast Accuracy" },
  cpc:        { href: "/tools/cost-per-contact", label: "Cost Per Contact" },
  qa:         { href: "/tools/qa-scorecard", label: "QA Scorecard" },
  contract:   { href: "/tools/contract-risk", label: "Contract Risk" },
};

import healthcare from "./claims/healthcare.js";
import mfg from "./claims/mfg.js";
import gov from "./claims/gov.js";
import utl from "./claims/utl.js";
import ins from "./claims/ins.js";
import fs from "./claims/fs.js";
import edu from "./claims/edu.js";
import trv from "./claims/trv.js";
import tel from "./claims/tel.js";
import retail from "./claims/retail.js";

export const CLAIMS = { ...healthcare, ...retail, ...tel, ...trv, ...edu, ...fs, ...ins, ...utl, ...gov, ...mfg };

/* The build's prerender records every claim a page renders, so the page's structured data can cite exactly the
   sources the reader sees (entry-server.jsx). In the browser nothing is recording and noteClaim does nothing. */
let recording = null;
export function recordClaims() { recording = new Set(); }
export function recordedClaims() { const ids = recording ? [...recording] : []; recording = null; return ids; }
export function noteClaim(id) { if (recording) recording.add(id); }

/* Throws on an unknown id, so a typo in page text cannot render as a silent blank. */
export function claim(id) {
  const c = CLAIMS[id];
  if (!c) throw new Error(`claims: unknown claim "${id}"`);
  return c;
}

const TOKEN = /\[\[([a-z0-9.\-]+)\]\]/g;

/* Splits page text into plain runs and claim ids, in order. */
export function tokens(text) {
  const out = [];
  let last = 0;
  for (const m of String(text).matchAll(TOKEN)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ id: m[1] });
    last = m.index + m[0].length;
  }
  if (last < String(text).length) out.push({ text: String(text).slice(last) });
  return out;
}

/* Every claim id used anywhere inside a page's data, first appearance first. */
export function claimIds(value, seen = new Set()) {
  if (typeof value === "string") { for (const m of value.matchAll(TOKEN)) seen.add(m[1]); }
  else if (Array.isArray(value)) value.forEach((v) => claimIds(v, seen));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => claimIds(v, seen));
  return [...seen];
}

/* Plain text for places that cannot hold markup (titles, meta descriptions, PDFs). */
export function plain(text) {
  return String(text).replace(TOKEN, (_, id) => {
    const c = claim(id);
    if (c.kind === "none") return "no public benchmark";
    return c.kind === "example" && c.text ? c.text : c.value;
  });
}
