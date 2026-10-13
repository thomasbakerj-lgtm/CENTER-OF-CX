// src/lib/updates.js
//
// The Updates hub and its feeds (TB, 13 Oct 2026, open item 3: an Updates hub with a weekly Market Watch cadence, RSS
// and JSON feeds). Pure: no file or network access. One dated list, derived from the records the site already
// publishes, so the hub and the feeds never say something the pages do not:
//   - Market Watch items that pass `itemProblems` (each keeps its label: verified, news, vendor-supplied);
//   - researched vendor profiles, at their validation date (researchStatus.js);
//   - accepted research corrections (research/corrections.js).
// Method changes are left out on purpose (TB, 27 Sep: the change log is not for the audience).
// The prerender writes /feed.xml (RSS 2.0) and /feed.json (JSON Feed 1.1) from `updateEntries`; /updates renders it.

import { publishedItems, LABELS, KINDS } from "./marketWatch.js";
import { CCAAS_RESEARCH } from "./researchStatus.js";
import { CORRECTIONS } from "./research/corrections.js";
import { BASE, SITE, vendorDisplayName } from "./seo.js";

export const FEED = { rss: "/feed.xml", json: "/feed.json" };
export const FEED_TITLE = `${SITE}: Updates`;
export const FEED_DESC = "New Market Watch items, newly researched vendor profiles and research corrections from The Center of CX, newest first.";
export const FEED_LIMIT = 50;

/* The cadence, stated as practice: what we do each week, and what a quiet week looks like. */
export const CADENCE = "We review the market every week and add the Market Watch items that pass our source rules. A quiet week can add none; nothing is added to fill the space.";

export const TYPES = { marketWatch: "Market Watch", research: "Vendor research", correction: "Correction" };

/** Every update, newest first; ties A to Z by title. */
export function updateEntries({ items = publishedItems(), research = CCAAS_RESEARCH.complete, corrections = CORRECTIONS } = {}) {
  const mw = items.map((it) => ({
    id: it.id, date: it.date, type: "marketWatch", title: it.headline, summary: it.summary,
    path: `/market-watch#${it.id}`, tags: [LABELS[it.label].word.toLowerCase(), KINDS[it.kind]],
    source: it.source ? { publisher: it.source.publisher, url: it.source.url } : null,
  }));
  const rs = Object.entries(research).map(([slug, r]) => ({
    id: `research-${slug}`, date: r.validated, type: "research", title: `${vendorDisplayName(slug)} research published`,
    summary: `Our research on ${vendorDisplayName(slug)}: fit, findings with their sources, where it breaks, what it takes to run, and what to ask for. Validated ${r.validated}.`,
    path: `/vendors/${slug}`, tags: ["vendor research"], source: null,
  }));
  const slugOf = Object.fromEntries(Object.entries(research).map(([slug, r]) => [r.vendorId, slug]));
  const cs = corrections.filter((c) => slugOf[c.vendorId]).map((c) => ({
    id: `correction-${c.record}-${c.date}`, date: c.date, type: "correction", title: `Correction to ${vendorDisplayName(slugOf[c.vendorId])} research`,
    summary: c.changed, path: `/vendors/${slugOf[c.vendorId]}`, tags: ["correction"], source: { publisher: "Source", url: c.source },
  }));
  return [...mw, ...rs, ...cs].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** The Monday that starts a date's week (UTC), as YYYY-MM-DD. */
export function weekOf(date) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** Entries grouped by week, newest week first. */
export function byWeek(entries) {
  const out = [];
  for (const e of entries) {
    const w = weekOf(e.date);
    const last = out[out.length - 1];
    if (last && last.week === w) last.entries.push(e); else out.push({ week: w, entries: [e] });
  }
  return out;
}

const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const rfc822 = (date) => new Date(`${date}T12:00:00Z`).toUTCString().replace("GMT", "+0000");
const iso = (date) => `${date}T12:00:00Z`;
const abs = (path) => `${BASE}${path}`;

/** RSS 2.0. */
export function rssXml(entries = updateEntries()) {
  const list = entries.slice(0, FEED_LIMIT);
  const items = list.map((e) => [
    "    <item>",
    `      <title>${xml(e.title)}</title>`,
    `      <link>${xml(abs(e.path))}</link>`,
    `      <guid isPermaLink="false">${xml(e.id)}</guid>`,
    `      <pubDate>${rfc822(e.date)}</pubDate>`,
    `      <category>${xml(TYPES[e.type])}</category>`,
    `      <description>${xml(e.summary)}</description>`,
    "    </item>",
  ].join("\n"));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(FEED_TITLE)}</title>`,
    `    <link>${BASE}/updates</link>`,
    `    <atom:link href="${BASE}${FEED.rss}" rel="self" type="application/rss+xml" />`,
    `    <description>${xml(FEED_DESC)}</description>`,
    "    <language>en</language>",
    ...(list.length ? [`    <lastBuildDate>${rfc822(list[0].date)}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/** JSON Feed 1.1. */
export function jsonFeed(entries = updateEntries()) {
  return JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_TITLE,
    home_page_url: `${BASE}/updates`,
    feed_url: `${BASE}${FEED.json}`,
    description: FEED_DESC,
    language: "en",
    items: entries.slice(0, FEED_LIMIT).map((e) => ({
      id: e.id, url: abs(e.path), title: e.title, content_text: e.summary, date_published: iso(e.date),
      tags: [TYPES[e.type], ...e.tags.filter((t) => t !== TYPES[e.type])],
      ...(e.source ? { external_url: e.source.url } : {}),
    })),
  }, null, 2) + "\n";
}
