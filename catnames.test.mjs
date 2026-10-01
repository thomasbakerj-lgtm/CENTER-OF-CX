// catnames.test.mjs
//
// One name per vendor category (TB, 1 Oct 2026: "intelligent consistency"; other names only where they mean exactly
// the same thing). CATEGORIES in src/lib/verticals.js holds the name, `also` (exact other names) and `related` (what
// buyers search for part of the category). Every heading, breadcrumb, card, back link, title, structured data name,
// llms.txt line and stack layer link reads the name; a retired name for a category fails this file.
//
// Run: node catnames.test.mjs

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const { CATEGORIES } = await import("./src/lib/verticals.js");
const { resolveSeo, structuredData } = await import("./src/lib/seo.js");
const { llmsTxt } = await import("./src/lib/llmsTxt.js");
const { PHASE1_CATEGORIES } = await import("./src/lib/researchStatus.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 400)); } };
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const KEYS = ["ccaas", "iva", "agent-assist", "wem-qm", "analytics", "acd-routing", "digital-engagement", "payments"];

console.log("\n1. The registry: one name, exact other names, related searches");
{
  ok("the eight categories are registered", KEYS.every((k) => CATEGORIES[k]) && Object.keys(CATEGORIES).length === 8);
  for (const k of KEYS) {
    const c = CATEGORIES[k];
    ok(`${k}: a name with words only (no +, & or /)`, typeof c.name === "string" && c.name.length > 2 && !/[+&/]/.test(c.name) && !DASH.test(c.name), c.name);
    ok(`${k}: also and related are lists of plain terms`, Array.isArray(c.also) && Array.isArray(c.related) && c.related.length > 0
      && [...c.also, ...c.related].every((t) => typeof t === "string" && t.trim() === t && t.length > 1 && !DASH.test(t)));
    const low = (t) => t.toLowerCase();
    ok(`${k}: no term repeats the name or appears twice`, new Set([c.name, ...c.also, ...c.related].map(low)).size === 1 + c.also.length + c.related.length);
    ok(`${k}: the old duplicate name field is gone`, !("full" in c));
  }
  ok("names are unique across categories", new Set(KEYS.map((k) => CATEGORIES[k].name)).size === KEYS.length);
  /* Each name describes the vendors profiled today (TB chose Routing and Orchestration; payments and analytics follow the
     same rule: no identity or trust vendor and no survey VoC vendor is profiled). */
  ok("routing, payments and analytics are named for what is profiled",
    CATEGORIES["acd-routing"].name === "Routing and Orchestration" && CATEGORIES.payments.name === "Payment Technology" && CATEGORIES.analytics.name === "CX Analytics");
  ok("no related search promises voice of the customer or identity, which no profile covers",
    !/voice of the customer|\bVoC\b|identity|fraud/i.test(JSON.stringify([CATEGORIES.analytics, CATEGORIES.payments])));
}

console.log("\n2. Retired names render nowhere");
{
  /* Category labels retired on 1 Oct 2026. Comment lines and the research program's own category registry are skipped. */
  const RETIRED = [
    "Core CX Platforms", "CCaaS Platforms", "Customer Automation", "IVA + Conversational AI", "Agent Assist & Knowledge",
    "Agent Assist + Knowledge", "Agent Assist Market Intelligence", "Market Intelligence</", "WEM + Quality", "WEM/QM Vendors",
    "WEM/QM Briefing", ">WEM/QM<", "Workforce & Quality", "Workforce + Quality", "Advanced Analytics", "Experience Analytics & VoC",
    "ACD + Routing", "ACD & Routing", "ACD / Routing", "ACD/Routing", "Payments + Identity", "Payments, Identity & Trust",
    "CX Orchestration & Workflow", "See All CCaaS Vendors", "See All IVA Vendors", "Compare IVA Platforms",
  ];
  const files = execSync("git ls-files '*.js' '*.jsx' '*.html'", { encoding: "utf8" }).split("\n")
    .filter((f) => f && !/\.test\.|^docs\/|^scripts\/|^src\/lib\/categoryRegistry\.js$/.test(f));
  const scan = (text) => {
    const hits = [];
    text.split("\n").forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) return;
      for (const r of RETIRED) if (line.includes(r)) hits.push(`${i + 1}: ${r}`);
    });
    return hits;
  };
  const found = files.flatMap((f) => scan(readFileSync(f, "utf8")).map((h) => `${f}:${h}`));
  ok(`no retired category name in a rendered file [${found.slice(0, 8).join("; ")}]`, found.length === 0);
  ok("the scan fires on a planted label", scan('<span>ACD / Routing</span>\n<h3>Core CX Platforms</h3>').length === 2);
}

console.log("\n3. Pages read the name from the registry");
{
  const PAGES = { ccaas: "CCaaSCategory.jsx", iva: "IVACategory.jsx", "agent-assist": "AgentAssistCategory.jsx", "wem-qm": "WEMCategory.jsx",
    analytics: "AnalyticsCategory.jsx", "acd-routing": "ACDRoutingCategory.jsx", "digital-engagement": "DigitalEngagementCategory.jsx", payments: "PaymentCategory.jsx" };
  for (const [k, f] of Object.entries(PAGES)) {
    const s = readFileSync(f, "utf8");
    const ref = k.includes("-") ? `CATEGORIES["${k}"].name` : `CATEGORIES.${k}.name`;
    const h1 = (s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
    ok(`${f}: the heading is the registry name`, h1.trim() === `{${ref}}`, h1.slice(0, 120));
    ok(`${f}: shows its other names under the heading`, s.includes(`<CategoryTerms category="${k}" />`));
  }
  const vendors = readFileSync("Vendors.jsx", "utf8");
  ok("the vendor hub cards take their titles from the registry", vendors.includes("title: CATEGORIES[c.key].name") && !/key: "[a-z-]+", title:/.test(vendors));
  const pt = readFileSync("PlatformsTech.jsx", "utf8");
  ok("Platforms and Tech names each vendor category link from the registry", pt.includes("See ${c.name} vendors") && !pt.includes("Explore category"));
  const profile = readFileSync("VendorProfile.jsx", "utf8");
  ok("profile back links, breadcrumbs and all-vendor links read the registry",
    (profile.match(/← Back to \{CATEGORIES/g) || []).length === 8 && (profile.match(/>All \{CATEGORIES[^}]+\} vendors →/g) || []).length === 8);
  ok("every Phase 1 category label comes from the registry", KEYS.filter((k) => k !== "ccaas").every((k) => PHASE1_CATEGORIES[k] === CATEGORIES[k].name));
  const layers = RUBRICS["platform-decision"].layers.filter((l) => Object.values(CATEGORIES).some((c) => c.page === l.category));
  ok("each stack layer's vendor link is named for its category",
    layers.length >= 5 && layers.every((l) => l.categoryLabel === `${Object.values(CATEGORIES).find((c) => c.page === l.category).name} vendors`),
    layers.map((l) => l.categoryLabel));
}

console.log("\n4. Search titles, structured data and llms.txt");
{
  const text = llmsTxt();
  for (const k of KEYS) {
    const c = CATEGORIES[k];
    const seo = resolveSeo(c.page);
    const title = seo.title.split(" | ")[0];
    ok(`${k}: the search title carries the name or an exact other name`, [c.name, ...c.also].some((t) => title.toLowerCase().includes(t.toLowerCase())), title);
    const list = structuredData(c.page, seo).find((g) => g["@type"] === "ItemList");
    ok(`${k}: the ItemList is named for the category, with exact other names only`,
      list && list.name === c.name && JSON.stringify(list.alternateName || []) === JSON.stringify(c.also));
    ok(`${k}: llms.txt lists the name, page and terms`, text.includes(`[${c.name}](`) && text.includes(c.page) && c.related.every((t) => text.includes(t)));
  }
  const org = structuredData("/", resolveSeo("/")).find((g) => g["@type"] === "Organization");
  ok("the Organization names every category as the pages do", KEYS.every((k) => org.knowsAbout.includes(CATEGORIES[k].name)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
