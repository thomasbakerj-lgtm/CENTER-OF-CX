/* freeze.test.mjs
 *
 * CCaaS integrity freeze, research Stage 2 (TB decision 23 Sep 2026, S22).
 *
 * Phase 1 CCaaS scores, tiers, vertical fit numbers and rank order no longer render on
 * public surfaces, and every CCaaS profile states its research status. The CCaaS Phase 2
 * corpus holds numeric ratings locked (phase2_ratings_locked) and treats Phase 1 as a
 * hypothesis source only, so a public page that prints "Genesys 94, Strategic
 * Foundation" contradicts the research the platform stands on.
 *
 * This harness keeps the freeze from eroding one render at a time: it checks the status
 * registry against the vendor data, and it gates the source of every CCaaS surface
 * against the retired score fields.
 *
 * Run from repo root: node freeze.test.mjs
 */
import { readFileSync } from "node:fs";

const { vendors, getCoreVendors, getAdjacentVendors } = await import("./VendorData.js");
const RS = await import("./src/lib/researchStatus.js");
const { resolveSeo } = await import("./src/lib/seo.js");

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = [String.fromCharCode(0x2014), String.fromCharCode(0x2013)];
const noDash = (s) => DASH.every((d) => s.indexOf(d) < 0);

/* ------------------------------------------------ 1. the status registry */
section("1. The research status registry matches the corpus checkpoint and the site data");
{
  const R = RS.CCAAS_RESEARCH;
  const slugs = Object.keys(R.complete);
  ok("the checkpoint is the one the registry was built from", R.checkpoint === "PRODUCTION_COHORT2_DIALPAD_COMPLETE");
  ok("schema version 1.0", R.schemaVersion === "1.0");
  ok("Phase 2 ratings are recorded as locked", R.phase2RatingsLocked === true);
  ok("exactly twelve vendors passed the completion gate", slugs.length === 12 && RS.CCAAS_COMPLETE_COUNT === 12);
  for (const slug of slugs) {
    const rec = R.complete[slug];
    ok(`${slug}: resolves to a site profile`, Object.prototype.hasOwnProperty.call(vendors, slug));
    ok(`${slug}: the profile is core CCaaS`, vendors[slug] && vendors[slug].categorySlug === "ccaas");
    ok(`${slug}: carries a durable corpus Vendor_ID`, /^VEN-CC-\d{4}$/.test(rec.vendorId));
    ok(`${slug}: carries an ISO validation date on or before the checkpoint`, /^\d{4}-\d{2}-\d{2}$/.test(rec.validated) && rec.validated <= R.asOf);
    ok(`${slug}: the record carries no rating, class or finding`, Object.keys(rec).sort().join(",") === "validated,vendorId");
  }
  const ids = slugs.map((s) => R.complete[s].vendorId);
  ok("Vendor_IDs are unique", new Set(ids).size === ids.length);
  ok("Vendor_IDs run VEN-CC-0001 to VEN-CC-0012 with no gap", ids.slice().sort().join(",") === Array.from({ length: 12 }, (_, i) => `VEN-CC-${String(i + 1).padStart(4, "0")}`).join(","));
}

/* ------------------------------------------------------- 2. the labels */
section("2. Every CCaaS profile gets exactly one research status and one label");
{
  const all = [...getCoreVendors(), ...getAdjacentVendors()];
  ok("28 CCaaS and adjacent profiles are covered", all.length === 28);
  const complete = all.filter((v) => RS.ccaasResearchStatus(v.slug) === "complete");
  const phase1 = all.filter((v) => RS.ccaasResearchStatus(v.slug) === "phase1");
  ok("12 read as current research complete", complete.length === 12);
  ok("16 read as Phase 1 context", phase1.length === 16);
  ok("no adjacent suite reads as researched", getAdjacentVendors().every((v) => RS.ccaasResearchStatus(v.slug) === "phase1"));
  for (const v of all) {
    const L = RS.ccaasResearchLabel(v.slug);
    ok(`${v.slug}: the label matches the status`, L.status === RS.ccaasResearchStatus(v.slug));
    ok(`${v.slug}: the label says scores are withdrawn`, /withdrawn/.test(L.text));
    ok(`${v.slug}: the label claims no score`, !/\bscored\b|\d+\s*\/\s*100|tier/i.test(L.text));
    ok(`${v.slug}: the label carries no dash`, noDash(L.text + L.short));
  }
  ok("a researched label names its validation date", /22 September 2026/.test(RS.ccaasResearchLabel("dialpad").text));
  ok("an unresearched label says so", /not yet researched/.test(RS.ccaasResearchLabel("avaya").text));
  for (const k of ["__proto__", "toString", "constructor", "hasOwnProperty", "", "undefined"])
    ok(`prototype or empty key "${k}" reads as Phase 1`, RS.ccaasResearchStatus(k) === "phase1");
}

/* ------------------------------------------------------ 3. list order */
section("3. No public CCaaS list is ordered by a Phase 1 score");
{
  const core = getCoreVendors();
  const names = core.map((v) => v.name);
  ok("the core list is alphabetical", names.join("|") === [...names].sort((a, b) => a.localeCompare(b)).join("|"));
  const byScore = [...core].sort((a, b) => (b.score || 0) - (a.score || 0)).map((v) => v.name).join("|");
  ok("the core list is not the score order", names.join("|") !== byScore);
  const VD = readFileSync("./VendorData.js", "utf8");
  ok("getCoreVendors sorts by name, never by score", /getCoreVendors = \(\) =>[^\n]*localeCompare/.test(VD) && !/getCoreVendors = \(\) =>[^\n]*\.score/.test(VD));
}

/* ------------------------------------------------ 4. surface source gates */
section("4. CCaaS surfaces render no score, tier or fit number");
{
  const CC = readFileSync("./CCaaSCategory.jsx", "utf8");
  ok("category: no score render", !/\{v\.score\}/.test(CC));
  ok("category: no tier grouping or tier render", !/v\.tier|tierConfig|\{t\.name\}/.test(CC));
  ok("category: no bell curve or composite ranking copy", !/bell curve|ranked by weighted composite|scored across 27/i.test(CC));
  ok("category: groups by research status", /ccaasResearchStatus\(v\.slug\)/.test(CC));
  ok("category: states that scores are withdrawn", /withdrawn/.test(CC));

  const VP = readFileSync("./VendorProfile.jsx", "utf8");
  const marker = "CCaaS VENDOR PROFILE";
  ok("profile: the CCaaS branch is found", VP.indexOf(marker) > 0);
  const branch = VP.slice(VP.indexOf(marker));
  ok("profile: no composite score badge", !/ScoreBadge score=\{v\./.test(branch) && !/\{v\.score\}|\{v\.tier\}/.test(branch));
  ok("profile: states research status", /ccaasResearchLabel\(v\.slug\)/.test(branch));
  ok("profile: vertical fit shows no number", !/\.map\(\(\[vert, score\]\)/.test(branch) && !/>\{score\}</.test(branch));
  ok("profile: vertical fit is not sorted by score", !/verticalFit\)\.sort\(\(a, b\) => b\[1\] - a\[1\]\)/.test(branch));

  const CV = readFileSync("./CategoryVerticalPage.jsx", "utf8");
  ok("industry page: no fit score, composite or tier", !/vertFit|CCAAS_VERTICAL_FIT|\{v\.score\}|\{v\.tier\}|fitLabel|fitColor/.test(CV));
  ok("industry page: no recommended or limited-fit bands", !/Recommended for|Conditionally Qualified|Limited Fit/.test(CV));
  ok("industry page: lists by research status", /ccaasResearchStatus\(v\.slug\)/.test(CV));
}

/* ------------------------------------------ 4b. narrative carries no score */
section("4b. CCaaS profile narrative carries no Phase 1 score or tier label");
{
  const RE = /\bscor(?:ed|e)\b[^.;,)]{0,25}\d|\b\d(?:\.\d)?\s*\/\s*5\b|\b\d{2,3}\s*\/\s*100\b|Strategic Foundation|Strong Contender|Situational Specialist|Limited Fit|weighted composite/i;
  const skip = new Set(["score", "tier", "verticalFit"]);
  for (const v of Object.values(vendors).filter((x) => x.categorySlug === "ccaas" || x.categorySlug === "adjacent")) {
    const texts = Object.entries(v).filter(([k]) => !skip.has(k)).flatMap(([, val]) => Array.isArray(val) ? val : [val]).filter((t) => typeof t === "string");
    ok(`${v.slug}: rendered narrative states no score or tier label`, !texts.some((t) => RE.test(t)));
  }
}

/* ----------------------------------------------------- 5. public claims */
section("5. Public copy makes no claim the freeze made false");
{
  const HOME = readFileSync("./Homepage.jsx", "utf8");
  ok("homepage: no scored-vendors claim", !/scored vendors|scored independently|Independently scored|scored CCaaS vendors|\} scored →/.test(HOME));
  const H2C = readFileSync("./HowToChoose.jsx", "utf8");
  ok("how to choose: no scored-vendor shortlist claim", !/scored vendors/.test(H2C));
  const HUB = readFileSync("./Vendors.jsx", "utf8");
  ok("vendor hub: no CCaaS 27-dimension or tier description", !/CCaaS vendors, for example, are scored|Strategic Foundation, Strong Contender/.test(HUB));
  const SHELL = readFileSync("./index.html", "utf8");
  ok("shell meta: no published-methodologies claim", !/published methodologies/i.test(SHELL));
  for (const route of ["/", "/vendors", "/vendors/ccaas", "/tools/vendor-match", "/vendors/ccaas/healthcare"]) {
    const r = resolveSeo(route);
    ok(`${route}: metadata claims no published methodologies`, !/published methodologies/i.test(r.title + r.desc));
  }
  ok("/vendors/ccaas: metadata claims no score", !/scored/i.test(resolveSeo("/vendors/ccaas").title + resolveSeo("/vendors/ccaas").desc));
  ok("/vendors/ccaas/healthcare: metadata claims no scored fit", !/scored|rankings/i.test(resolveSeo("/vendors/ccaas/healthcare").title + resolveSeo("/vendors/ccaas/healthcare").desc));
  ok("/: metadata claims no scored vendors", !/vendors scored/i.test(resolveSeo("/").desc));
}

/* ------------------------------------------------------------ 6. dashes */
section("6. Every file this freeze touched carries no dash");
for (const f of ["CCaaSCategory.jsx", "CategoryVerticalPage.jsx", "src/lib/researchStatus.js", "freeze.test.mjs", "Homepage.jsx", "HowToChoose.jsx", "src/lib/Phase1Directory.jsx", "VendorProfile.jsx", "IVACategory.jsx", "WEMCategory.jsx"]) {
  ok(`${f}: no em-dash or en-dash`, noDash(readFileSync("./" + f, "utf8")));
}

/* ----------------------------------- 7. the freeze extended to every category */
section("7. S23: the seven other categories, their profiles and the industry pages carry no Phase 1 score");
{
  ok("the status registry reads CCaaS from the corpus and every other category as Phase 1", RS.researchStatus("ccaas", "genesys") === "complete" && RS.researchStatus("ccaas", "avaya") === "phase1" && Object.keys(RS.PHASE1_CATEGORIES).every((c) => RS.researchStatus(c, "anything") === "phase1"));
  ok("seven categories are named, CCaaS is not among them", Object.keys(RS.PHASE1_CATEGORIES).length === 7 && !("ccaas" in RS.PHASE1_CATEGORIES));
  const L = RS.phase1Label();
  ok("one Phase 1 label, saying scores, tiers and rankings are withdrawn", L.status === "phase1" && L.short === "Phase 1 context" && /scores, tiers and rankings are withdrawn/.test(L.text) && noDash(L.text));
  ok("the directory order is by name", [{ name: "b" }, { name: "A" }, { name: "c" }].sort(RS.byName).map((x) => x.name).join("") === "Abc");
  const strip = (x) => x.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  const DIR = strip(readFileSync("./src/lib/Phase1Directory.jsx", "utf8"));
  ok("the shared directory sorts by name and prints the Phase 1 label, never a score", /\.sort\(byName\)/.test(DIR) && /phase1Label\(\)/.test(DIR) && !/\.score\b|\.tier\b|\.rank\b|score=/.test(DIR));
  const RETIRED_PAGE = /\{v\.score\}|v\.tier\b|v\.rank\b|tierConfig|bell curve|ranked by|Vendors scored|Platforms scored|Leaderboard|b\.score - a\.score|b\.product - a\.product|quadrant/i;
  const PAGES = { iva: "IVACategory.jsx", "agent-assist": "AgentAssistCategory.jsx", "wem-qm": "WEMCategory.jsx", analytics: "AnalyticsCategory.jsx", "digital-engagement": "DigitalEngagementCategory.jsx", payments: "PaymentCategory.jsx", "acd-routing": "ACDRoutingCategory.jsx" };
  for (const [cat, f] of Object.entries(PAGES)) {
    const src = strip(readFileSync("./" + f, "utf8"));
    ok(`${f}: renders the withdrawn banner and the shared directory`, /<ScoresWithdrawn /.test(src) && /<Phase1Directory groups=\{groups\} \/>/.test(src));
    ok(`${f}: no score, tier, rank, quadrant, leaderboard or score order`, !RETIRED_PAGE.test(src), (src.match(RETIRED_PAGE) || [""])[0]);
    const seo = resolveSeo(`/vendors/${cat}`);
    ok(`/vendors/${cat}: metadata claims no scores, tiers or rankings`, !/scored|tier|ranking|quadrant|100-point|max score/i.test(seo.title + " " + seo.desc) && /withdrawn/i.test(seo.desc));
  }
  const VP = readFileSync("./VendorProfile.jsx", "utf8");
  const other = VP.slice(VP.indexOf("export default function VendorProfile"), VP.indexOf("CCaaS VENDOR PROFILE"));
  ok("vendor profiles: the seven non-CCaaS branches show the Phase 1 badge", (other.match(/<Phase1Badge \/>/g) || []).length === 7);
  ok("vendor profiles: no score badge, score, tier, rank, quadrant, dimension bar or fit rating in the non-CCaaS branches", !/ScoreBadge|\.score\b|\.tier\b|\.rank\b|quadrant|\/5<|\/6<|\/3<|\.fit\b|Leaderboard|Rank in layer|momentum|Routing Maturity Index/i.test(other), (other.match(/ScoreBadge|\.score\b|\.tier\b|\.rank\b|quadrant|\/5<|\.fit\b|Leaderboard|momentum/i) || [""])[0]);
  const VERT = ["EducationVertical", "FinancialServicesVertical", "GovernmentVertical", "HealthcareVertical", "InsuranceVertical", "ManufacturingVertical", "RetailVertical", "TelecomVertical", "TravelVertical", "UtilitiesVertical"];
  for (const v of VERT) {
    const src = readFileSync(`./${v}.jsx`, "utf8");
    ok(`${v}.jsx: the platform list carries no score and is sorted by name`, !/\{ name: "[^"]+", score:/.test(src) && !/v\.score/.test(src) && /\]\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\)\.map\(\(v, i\)/.test(src) && !/strongest for|score highest|vendors scored/i.test(src));
  }
  const COPY = { "Industries.jsx": 0, "Research.jsx": 0, "Vendors.jsx": 0, "CXEcosystem.jsx": 0, "index.html": 0 };
  for (const f of Object.keys(COPY)) {
    const src = readFileSync("./" + f, "utf8");
    ok(`${f}: no scored-vendor claim`, !/\b\d+\+? (?:IVA |CCaaS )?(?:vendors|platforms) scored|scored vendor|we score vendors|vendor scoring|scoring dimensions|scored by vertical|is scored for each vertical|who leads/i.test(src), (src.match(/\b\d+\+? (?:IVA |CCaaS )?(?:vendors|platforms) scored|scored vendor|we score vendors|vendor scoring|scoring dimensions/i) || [""])[0]);
  }
  const GR = readFileSync("./GatedReport.jsx", "utf8");
  ok("both Phase 1 buyer guides carry the Phase 1 edition notice", (GR.match(/phase1: true/g) || []).length === 2 && /report\.phase1 && <p/.test(GR));
  ok("the default and vendor profile descriptions claim no scores", !/Vendor scoring|Scores, strengths/.test(readFileSync("./src/lib/seo.js", "utf8")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
