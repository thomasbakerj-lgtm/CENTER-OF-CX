/* catvertical.test.mjs
 *
 * The 77 category by industry pages outside CCaaS (CategoryVerticalPage.jsx, data in src/lib/verticals.js). Audit item 7,
 * TB 29 Sep 2026: "Validate and source the research on these pages." Each page showed its industry's paragraph with
 * unsourced figures ("20-30% longer", "7+ minutes", "8-10x", "60-70% of volume", "99.999%"), a chip list that mixed rules
 * with operating wishes, and a hero line saying vendors were "evaluated" for the industry when nothing was evaluated.
 * This holds:
 *   1. Every figure in an industry paragraph is a claim from the registry (src/lib/claims.js), fact, labelled
 *      assumption or example, never pending; no bare figure, dash, superlative or "X, not Y" is left.
 *   2. Every rule named links its publisher's own page and says what it is; the retired chips are gone.
 *   3. The page renders the claims with their sources, the rules as links, and claims no evaluation of any vendor.
 *   4. The pre-audit text is kept only as lineage (`considerationsDraft`, `complianceDraft`) and never renders.
 *
 * Run from repo root: node catvertical.test.mjs
 */
import { readFileSync } from "node:fs";

const { VERTICALS: V0, CATEGORIES } = await import("./src/lib/verticals.js");
const { RULES, VERTICAL_CONTENT } = await import("./src/lib/verticalsContent.js");
const VERTICALS = Object.fromEntries(Object.keys(V0).map((k) => [k, VERTICAL_CONTENT[k]]));
const { claim, claimIds, plain } = await import("./src/lib/claims.js");
let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);

section("1. Industry paragraphs: every figure sourced");
for (const [slug, v] of Object.entries(VERTICALS)) {
  const t = v.considerations;
  const ids = claimIds([t]);
  ok(`${slug}: carries at least one sourced claim`, ids.length >= 1);
  ok(`${slug}: every claim resolves and none is pending`, ids.every((id) => { try { const c = claim(id); return c.research !== "pending" && c.kind !== "none"; } catch { return false; } }));
  const bare = t.replace(/\[\[[a-z0-9.\-]+\]\]/g, "").replace(/Regulation (E|261)/g, "").replace(/Title II/g, "").replace(/Section 508/g, "").replace(/\b20\d\d\b/g, ""); // a year dates the sourced figure beside it
  ok(`${slug}: no bare figure outside a claim`, !/\d/.test(bare), (bare.match(/[^.]*\d[^.]*/) || [""])[0]);
  ok(`${slug}: no dash`, !/[\u2013\u2014]/.test(t));
  ok(`${slug}: no superlative or verdict`, !/highest|strictest|longest|killer|table stakes|eliminat|the deepest|most complex|highest-ROI|increasingly expected/i.test(t));
  ok(`${slug}: no "X, not Y" cadence`, !/, not (a |an |the )?\w/.test(t));
  ok(`${slug}: plain text reads with its figures in place`, !/\[\[/.test(plain(t)) && plain(t).length > 200);
}

section("2. Rules link their publishers");
const RETIRED = /Seasonal 10x|Multi-currency|24\/7 global coverage|99\.999|FCC compliance|State insurance regulations|Data residency|Audit trails|PHI encryption|Emergency protocols|Multi-language|Payment tokenization|Claims data protection|Student data protection|Supply chain data protection|Carrier-grade telephony|State health privacy|StateRAMP"|PCI DSS Level 1/;
for (const [id, r] of Object.entries(RULES)) {
  ok(`${id}: https link, kind, note and how it was checked`, /^https:\/\//.test(r.url) && r.kind && r.note && /^(read \d{4}-\d{2}-\d{2}|refused)/.test(r.checked));
  ok(`${id}: no dash in its text`, !/[\u2013\u2014]/.test(r.name + r.kind + r.note));
}
for (const [slug, v] of Object.entries(VERTICALS)) {
  ok(`${slug}: names at least three rules, each in the registry`, (v.rules || []).length >= 3 && v.rules.every((r) => RULES[r]));
  ok(`${slug}: no retired chip is rendered`, !RETIRED.test(JSON.stringify(v.rules.map((r) => RULES[r]))));
}

section("3. The page");
const SRC = readFileSync("./CategoryVerticalPage.jsx", "utf8");
ok("the industry paragraph renders through ClaimText", /<ClaimText text=\{text\.considerations\} \/>/.test(SRC));
ok("the page lists the sources of its figures", /<ClaimSources ids=\{ids\}/.test(SRC));
ok("each rule links its publisher in a new tab", /href=\{r\.url\} target="_blank" rel="noopener noreferrer"/.test(SRC));
ok("the hero claims no evaluation of any vendor", !/evaluated for/.test(SRC) && /this page evaluates none/.test(SRC));
ok("the category name keeps its own capitals, and Vendor Match is described as the contact center tool it is", !/cat\.name\.toLowerCase/.test(SRC) && /A starting list of contact center platforms for/.test(SRC));
ok("the lineage fields never render", !/considerationsDraft|complianceDraft|vert\.compliance\b/.test(SRC));
ok("seven categories by ten industries: 70 pages here (CCaaS has its own)", Object.keys(CATEGORIES).filter((c) => c !== "ccaas").length * Object.keys(VERTICALS).length === 70);

ok("every industry has its content, and verticals.js (loaded on every page) carries none of it", Object.keys(V0).every((k) => VERTICAL_CONTENT[k]) && !/considerations|RULES|complianceDraft/.test(readFileSync("./src/lib/verticals.js", "utf8")));

section("4. Lineage kept");
for (const [slug, v] of Object.entries(VERTICALS)) ok(`${slug}: the pre-audit paragraph and chips are kept as drafts`, typeof v.considerationsDraft === "string" && Array.isArray(v.complianceDraft));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
