// corrections.js
//
// The vendor correction policy (decision D2, TB 27 Sep 2026: points 1 to 5, no vendor response block; accepted
// corrections logged on the vendor page) and the log itself. Truth surface: Vendor Intelligence.
//
// A correction changes research only through the research process (a new corpus checkpoint and research sync), never
// by editing a page. This log records what changed, for the reader, on the profile it affects. Each entry:
//   { vendorId, date: "YYYY-MM-DD", record: the finding or record id, changed: what changed, in plain words,
//     source: the public https link that supported it }
// research.test.mjs checks every entry names a researched vendor, an ISO date, a record id of the research's own form
// and an https source. The log starts empty: no correction has been accepted yet.

import { isVendorSlug, vendorDisplayName } from "../seo.js";

export const POLICY = [
  { id: "report", title: "Anyone can report an error", text: "Anyone, including a vendor, can report a factual error with the form on this page. A report names the statement, the source that contradicts it and a public link to that source." },
  { id: "time", title: "We answer on a clock", text: "We acknowledge a report within five working days and decide within twenty." },
  { id: "evidence", title: "Public evidence decides", text: "A finding changes only when public, citable evidence supports the change, through the same research process as every other finding. A private briefing, a demo or a marketing claim can raise a question for the research; on its own it cannot change a published finding." },
  { id: "log", title: "Every change is shown", text: "Each accepted correction is noted on the vendor's page with its date and what changed. A report we do not accept receives the reason." },
  { id: "independence", title: "No vendor pays, previews or approves", text: "A vendor cannot pay for, sponsor, review in advance or approve any research page." },
];

export const RESPONSE_DAYS = { acknowledge: 5, decide: 20 };

export const CORRECTIONS = [];

export const correctionsFor = (vendorId, log = CORRECTIONS) => log.filter((c) => c.vendorId === vendorId).sort((a, b) => b.date.localeCompare(a.date) || a.record.localeCompare(b.record));

/** The corrections form link for one profile. Only a known profile slug travels; anything else opens the plain form. */
export const correctionHref = (slug) => (slug && isVendorSlug(slug) ? `/corrections?vendor=${encodeURIComponent(slug)}#report` : "/corrections#report");

/** The vendor a corrections link names, or null. */
export function readCorrection(search) {
  const slug = new URLSearchParams(typeof search === "string" ? search : "").get("vendor");
  return slug && isVendorSlug(slug) ? { slug, name: vendorDisplayName(slug) } : null;
}

/** An entry is valid when every field has the form the log promises. */
export const validCorrection = (c, researchedIds) => !!c && researchedIds.includes(c.vendorId) && /^\d{4}-\d{2}-\d{2}$/.test(c.date)
  && /^[A-Z]{3}-CC-\d{4,6}$/.test(c.record) && typeof c.changed === "string" && c.changed.length > 10 && /^https:\/\/[^\s<>"]+$/.test(c.source);
