// src/lib/editions.js
//
// Special editions of the mark (Brand Guide 1.0 section 5). The everyday mark never changes; on set dates the voice bars
// carry three colours an occasion or community already owns, in turn, then return to sky. The C stays mist. Only the header draws an edition, and it
// switches after the page loads (the prerendered page always carries the everyday mark, so hydration never differs).
// Never on a result, a report, a method page or a vendor page: nothing outside the header reads this file.
//
// Adding an edition follows the guide: colours the community recognises, asked of someone from it before publishing;
// three voice colours and the X only; every colour visible on the house (editions.test.mjs checks 3:1 against ink and navy); a start
// and end date and one line on why we mark it.
import { HOUSE, PILLARS } from "./tokens.js";

export const EDITIONS = {
  pillar: {
    name: "Pillar edition",
    use: "Anniversaries, launch weeks and events",
    voices: [PILLARS.marketWatch.fill, PILLARS.industries.fill, PILLARS.vendors.fill], // the voice bars in turn: magenta, amber, teal
    x: HOUSE.sky,
  },
};

/* Dated editions, UTC days inclusive: { edition, start: "YYYY-MM-DD", end: "YYYY-MM-DD", why }. TB sets the dates; a
   community edition also needs its colours drawn and checked with that community first. */
export const SCHEDULE = [
  /* TB, 27 Sep 2026. */
  { edition: "pillar", start: "2026-10-05", end: "2026-10-09", why: "Customer Service Week and CX Day, the week the profession marks the people who serve customers." },
];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Why a schedule cannot ship, or [] when it can. */
export function scheduleProblems(schedule = SCHEDULE, editions = EDITIONS) {
  const out = [];
  schedule.forEach((s, i) => {
    if (!editions[s.edition]) out.push(`${i}: unknown edition ${s.edition}`);
    if (!DATE.test(s.start || "") || !DATE.test(s.end || "") || s.start > s.end) out.push(`${i}: start and end are YYYY-MM-DD, start first`);
    if (!s.why || s.why.length < 12) out.push(`${i}: one line on why we mark it`);
    const days = (Date.parse(s.end) - Date.parse(s.start)) / 864e5 + 1;
    if (days > 31) out.push(`${i}: an edition runs a month at most (${days} days)`);
    schedule.slice(i + 1).forEach((t, j) => { if (!(t.end < s.start || t.start > s.end)) out.push(`${i} and ${i + j + 1} overlap`); });
  });
  return out;
}

/** The edition on a UTC day ("YYYY-MM-DD"), or null for the everyday mark. */
export function editionFor(day, schedule = SCHEDULE, editions = EDITIONS) {
  const s = schedule.find((x) => x.start <= day && day <= x.end && editions[x.edition]);
  return s ? { ...editions[s.edition], id: s.edition, why: s.why } : null;
}

export const todayUtc = (now = new Date()) => now.toISOString().slice(0, 10);
