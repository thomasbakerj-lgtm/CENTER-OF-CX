// src/lib/llmsTxt.js
//
// /llms.txt (audit 30 Sep, answer engine basics): a plain-text map of the site for people and AI crawlers. Written at
// build by prerender.mjs from the same records the pages render (the metadata map, the method registry, the research
// registry), so it never names a tool, method or vendor page that does not exist. Pure: no file or network access.

import { BASE, SITE, SEO_MAP, TOOL_COUNT, VENDOR_PROFILE_COUNT, CATEGORY_COUNT, SEGMENT_COUNT, vendorDisplayName } from "./seo.js";
import { RUBRICS } from "./rubrics/index.js";
import { CCAAS_RESEARCH } from "./researchStatus.js";
import { CATEGORIES } from "./verticals.js";
import { longDate } from "./methodVersions.js";
import { citeMethod } from "./cite.js";

const name = (t) => String(t || "").replace(/\s*\|\s*The Center of CX\s*$/, "");

export function llmsTxt() {
  const tools = Object.entries(SEO_MAP).filter(([p]) => p.startsWith("/tools/")).map(([p, m]) => `- [${name(m.title)}](${BASE}${p}): ${m.desc}`);
  const methods = Object.entries(RUBRICS).sort(([a], [b]) => a.localeCompare(b))
    .map(([id, r]) => `- [${r.title} method](${BASE}/methodology/${id}): version ${r.version}, published ${longDate(r.published)}`);
  const researched = Object.entries(CCAAS_RESEARCH.complete).map(([slug, r]) => ({ slug, name: vendorDisplayName(slug), validated: r.validated }))
    .sort((a, b) => a.name.localeCompare(b.name)).map((v) => `- [${v.name}](${BASE}/vendors/${v.slug}): validated ${longDate(v.validated)}`);
  const industries = Object.entries(SEO_MAP).filter(([p]) => /^\/industries\/[a-z-]+$/.test(p)).map(([p, m]) => `- [${name(m.title)}](${BASE}${p})`);
  const example = Object.entries(RUBRICS).find(([id]) => id === "staffing-calculator") || Object.entries(RUBRICS)[0];
  return [
    `# ${SITE}`,
    "",
    "> Free tools and research for contact center decisions. Every figure is computed from inputs you can see, under stated assumptions, with a published method. No sign-in.",
    "",
    "## What this site is",
    "",
    `- ${TOOL_COUNT} free tools that run in the browser, each with a published method and a report.`,
    `- Vendor profiles in ${CATEGORY_COUNT} categories (${VENDOR_PROFILE_COUNT} profiles), listed A to Z. No vendor pays to appear or to move. ${Object.keys(CCAAS_RESEARCH.complete).length} ${CATEGORIES.ccaas.name} profiles are researched in full; the rest are Phase 1 context pages, labelled as such.`,
    `- Industry pages for ${industries.length} industries and ${SEGMENT_COUNT} segments, where every figure is sourced or says no public benchmark exists.`,
    "",
    "## How the numbers are made",
    "",
    "- Every displayed number is one of four kinds: a historical fact, an assumption, a conditional forecast or a measured outcome.",
    "- Results carry a grade: Directional, Planning-grade or Finance-grade, on three axes (evidence, realization, completeness). The headline is the weakest applicable axis.",
    "- Vendor research compares platforms within their competitive class. Unknown or unverified is not treated as weak. No scores, ranks or tiers are published.",
    `- How vendors are researched: ${BASE}/research/vendor-method`,
    `- Corrections: ${BASE}/corrections`,
    "",
    "## How to cite",
    "",
    `Cite the method or page with its version or validation date and address, for example: ${citeMethod({ title: example[1].title, version: example[1].version, published: example[1].published, id: example[0] })}`,
    "",
    "## Tools",
    "",
    ...tools,
    "",
    "## Published methods",
    "",
    ...methods,
    "",
    "## Vendor categories",
    "",
    ...Object.values(CATEGORIES).map((c) => `- [${c.name}](${BASE}${c.page}): ${c.vendorCount} profiles.${c.also.length ? ` Also called: ${c.also.join(", ")}.` : ""} Related searches: ${c.related.join(", ")}.`),
    "",
    `## Researched ${CATEGORIES.ccaas.name} (A to Z)`,
    "",
    ...researched,
    "",
    "## Industries",
    "",
    ...industries,
    "",
    "## More",
    "",
    `- [About](${BASE}/about)`,
    `- [Vendor directory](${BASE}/vendors)`,
    `- [Market Watch](${BASE}/market-watch): dated items about the market, each labelled by the source it rests on`,
    `- [Research](${BASE}/research)`,
    "",
    "## Crawlers",
    "",
    "robots.txt allows all crawlers, including answer engines. This is deliberate: the site is built to be cited.",
    "",
  ].join("\n");
}
