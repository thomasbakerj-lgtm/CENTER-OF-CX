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
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

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
  ok("the checkpoint is the one the registry was built from", R.checkpoint === "V1_1_MIGRATED_PRE_GOTO");
  ok("schema version 1.1 (Research Method v2)", R.schemaVersion === "1.1");
  ok("Phase 2 ratings are recorded as locked", R.phase2RatingsLocked === true);
  ok("exactly twenty-two vendors passed a completion gate", slugs.length === 22 && RS.CCAAS_COMPLETE_COUNT === 22);
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
  ok("Vendor_IDs run VEN-CC-0001 to VEN-CC-0022 with no gap", ids.slice().sort().join(",") === Array.from({ length: 22 }, (_, i) => `VEN-CC-${String(i + 1).padStart(4, "0")}`).join(","));
}

/* ------------------------------------------------------- 2. the labels */
section("2. Every CCaaS profile gets exactly one research status and one label");
{
  const all = [...getCoreVendors(), ...getAdjacentVendors()];
  ok("28 CCaaS and adjacent profiles are covered", all.length === 28);
  const complete = all.filter((v) => RS.ccaasResearchStatus(v.slug) === "complete");
  const phase1 = all.filter((v) => RS.ccaasResearchStatus(v.slug) === "phase1");
  ok("22 read as current research complete", complete.length === 22);
  ok("6 read as Phase 1 context", phase1.length === 6);
  ok("no adjacent suite reads as researched", getAdjacentVendors().every((v) => RS.ccaasResearchStatus(v.slug) === "phase1"));
  for (const v of all) {
    const L = RS.ccaasResearchLabel(v.slug);
    ok(`${v.slug}: the label matches the status`, L.status === RS.ccaasResearchStatus(v.slug));
    ok(`${v.slug}: the label says scores are withdrawn`, /withdrawn/.test(L.text));
    ok(`${v.slug}: the label claims no score`, !/\bscored\b|\d+\s*\/\s*100|tier/i.test(L.text));
    ok(`${v.slug}: the label carries no dash`, noDash(L.text + L.short));
  }
  ok("a researched label names its validation date", /22 September 2026/.test(RS.ccaasResearchLabel("dialpad").text));
  ok("a Cohort 3 label names its own validation date", /23 September 2026/.test(RS.ccaasResearchLabel("vonage").text));
  ok("an unresearched label says so", /not yet researched/.test(RS.ccaasResearchLabel("goto").text));
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

  const CV = readFileSync("./CategoryVerticalPage.jsx", "utf8") + readFileSync("./CCaaSIndustry.jsx", "utf8");
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
for (const f of ["CCaaSCategory.jsx", "CategoryVerticalPage.jsx", "CCaaSIndustry.jsx", "src/lib/researchStatus.js", "freeze.test.mjs", "Homepage.jsx", "HowToChoose.jsx", "src/lib/Phase1Directory.jsx", "VendorProfile.jsx", "IVACategory.jsx", "WEMCategory.jsx"]) {
  ok(`${f}: no em-dash or en-dash`, noDash(readFileSync("./" + f, "utf8")));
}

/* ----------------------------------- 7. the freeze extended to every category */
section("7. S23: the seven other categories, their profiles and the industry pages carry no Phase 1 score");
{
  ok("the status registry reads CCaaS from the corpus and every other category as Phase 1", RS.researchStatus("ccaas", "genesys") === "complete" && RS.researchStatus("ccaas", "goto") === "phase1" && Object.keys(RS.PHASE1_CATEGORIES).every((c) => RS.researchStatus(c, "anything") === "phase1"));
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
    const sorted = /\]\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\)\.map\(\(v, i\)/.test(src)
      || (/from "\.\/src\/lib\/IndustryPage\.jsx"/.test(src) && /\[\.\.\.vendors\.items\]\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\)/.test(readFileSync("./src/lib/IndustryPage.jsx", "utf8")));
    ok(`${v}.jsx: the platform list carries no score and is sorted by name`, !/\{ name: "[^"]+", score:/.test(src) && !/v\.score/.test(src) && sorted && !/strongest for|score highest|vendors scored/i.test(src));
  }
  const COPY = { "Industries.jsx": 0, "Research.jsx": 0, "Vendors.jsx": 0, "CXEcosystem.jsx": 0, "index.html": 0 };
  for (const f of Object.keys(COPY)) {
    const src = readFileSync("./" + f, "utf8");
    ok(`${f}: no scored-vendor claim`, !/\b\d+\+? (?:IVA |CCaaS )?(?:vendors|platforms) scored|scored vendor|we score vendors|vendor scoring|scoring dimensions|scored by vertical|is scored for each vertical|who leads/i.test(src), (src.match(/\b\d+\+? (?:IVA |CCaaS )?(?:vendors|platforms) scored|scored vendor|we score vendors|vendor scoring|scoring dimensions/i) || [""])[0]);
  }
  const GR = readFileSync("./GatedReport.jsx", "utf8");
  ok("both Phase 1 buyer guides carry the Phase 1 edition notice", (GR.match(/phase1: true/g) || []).length === 2 && /report\.phase1 && <p/.test(GR));
  ok("the default and vendor profile descriptions claim no scores", !/Vendor scoring|Scores, strengths/.test(readFileSync("./src/lib/seo.js", "utf8")));
  // Found in redesign Phase 4: the vendor hub and About still described every vendor as scored.
  for (const f of ["./Vendors.jsx", "./About.jsx"]) {
    const t = readFileSync(f, "utf8");
    ok(`${f.slice(2)} claims no scoring of vendors`, !/scoring rubric|scoring model|Scored, weighted|Vendors assessed|Mapped and evaluated|350\+ vendors/i.test(t));
  }
  // Site audit item 3 (29 Sep): two calls to action still offered "CCaaS Vendor Scores" (WEM category page, CCaaS cost
  // article). No page, component or data file may offer to show vendor scores or rankings.
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => /^(node_modules|dist|dist-ssr|\.git|docs|public)$/.test(e.name) ? [] : e.isDirectory() ? walk(d + "/" + e.name) : /\.(jsx|js)$/.test(e.name) ? [d + "/" + e.name] : []);
  const OFFER = /\b(?:see|view|compare|explore|browse|check)(?: our| the)? (?:[A-Za-z]+ )?vendor (?:scores|rankings|ratings)\b/i;
  const offers = walk(".").filter((f) => OFFER.test(readFileSync(f, "utf8")));
  ok("no page offers to show vendor scores, rankings or ratings", offers.length === 0, offers.join(", "));
  ok("the offer rule fires on the retired wording", OFFER.test("See Our CCaaS Vendor Scores") && OFFER.test("See CCaaS Vendor Scores") && !OFFER.test("Browse CCaaS Platforms by Job"));
}

section("8. Audit 30 Sep: the hub and category pages promise only what the profiles hold");
{
  const R = (f) => readFileSync("./" + f, "utf8");
  const V = R("Vendors.jsx");
  const RETIRED = /Proprietary rubrics|honest assessment|Competitive context|Every vendor gets|Architecture-level evaluation|We go deeper|scored shortlist/i;
  for (const f of ["Vendors.jsx", "AgentAssistCategory.jsx", "PlatformsTech.jsx"])
    ok(`${f} carries none of the retired promises`, !RETIRED.test(R(f)));
  /* Advisory describes a paid service, so its own words stay; it no longer offers scored shortlists. Phase 1 profiles
     label their weaknesses as the Phase 1 assessment. */
  ok("the help page offers no scored shortlist", !/scored (vendor )?shortlist/i.test(R("Contact.jsx")));
  ok("Phase 1 profiles label their assessment as Phase 1", !/label="Honest assessment"/.test(R("VendorProfile.jsx")) && (R("VendorProfile.jsx").match(/label="Phase 1 assessment"/g) || []).length === 2);
  ok("the rule fires on the retired wording", RETIRED.test("Proprietary rubrics built for operational reality.") && RETIRED.test("We can help you build a scored shortlist."));
  ok("the hub's category count is derived", /String\(CATEGORY_COUNT\)/.test(V) && !/\{ n: "8", l: "Vendor categories" \}/.test(V) && !/Nine categories/.test(V));
  ok("the hub says where the adjacent profiles sit, so the category counts add up", /VENDOR_PROFILE_COUNT - ADJACENT_PROFILE_COUNT/.test(V));
  const { isVendorSlug } = await import("./src/lib/seo.js");
  const named = [...V.matchAll(/\{ name: "([^"]+)"(?:, slug: "([^"]+)")? \}/g)];
  ok("every vendor the hub names links a real profile", named.length >= 40 && named.every((m) => m[2] && isVendorSlug(m[2])));
  ok("the hub links through the sitemap's profile list", /isVendorSlug\(s\)/.test(V) && !/getAllSlugs/.test(V));
  const P = R("PlatformsTech.jsx");
  ok("Platforms and Tech lists what each card shows, with vendors A to Z", !/Which vendors lead|When you need it \(and when you don't\)|Who owns this decision/.test(P)
    && [...P.matchAll(/vendors: "([^"]+)"/g)].every((m) => { const n = m[1].split(", "); return n.join() === [...n].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase())).join(); })
    && /Questions to settle before you buy/.test(P) && !/"Nuance"|, Nuance\b/.test(P));
  ok("the IVA page counts the categories it shows", /\{groups\.length\} market categories/.test(R("IVACategory.jsx")));
}

section("9. Audit 30 Sep, batch 1: no withdrawn score wording on profiles, offers or guides");
{
  const R = (f) => readFileSync("./" + f, "utf8");
  /* Phase 1 profile prose renders on public pages, so it may carry no score claim ("Strongest AI and observability scores
     in tier"). The rule reads every profile-type field in the eight category data files. */
  const FIELD = /\b(?:profile|summary|differentiator|bestUseCase|diff|useCase): "([^"]*)"/g;
  const SCORE = /\bscor(?:e|es|ed)\b/i; // "scoring" alone names a QA capability
  const DATA = ["ACDRoutingData.js", "AnalyticsData.js", "AgentAssistData.js", "IVAData.js", "WEMData.js", "DigitalEngagementData.js", "PaymentData.js", "VendorData.js"];
  const hits = DATA.flatMap((f) => [...R(f).matchAll(FIELD)].filter((m) => SCORE.test(m[1])).map((m) => `${f}: ${m[1].slice(0, 60)}`));
  ok("no Phase 1 profile prose claims a score", hits.length === 0);
  if (hits.length) console.log("   ", hits.join("\n    "));
  ok("the profile rule fires on the retired wording", [...'profile: "IVA-first platform. Strongest AI and observability scores in tier."'.matchAll(FIELD)].some((m) => SCORE.test(m[1])));
  const VP = R("VendorProfile.jsx");
  ok("profiles no longer ask readers to score the vendor, or promise attributed reviews", !/Score this vendor|Every review is attributed/.test(VP) && /reviews are not published/.test(VP));
  ok("the help page carries no scored evaluation or competitive context", !/scored evaluation|competitive context/i.test(R("Contact.jsx")));
  ok("the hub's tiles are counts the site can show", !/Decision domains/.test(R("Vendors.jsx")) && /String\(Object\.keys\(CCAAS_RESEARCH\.complete\)\.length\), l: "Researched platforms"/.test(R("Vendors.jsx")));
  const G = R("GatedReport.jsx");
  ok("the CCaaS guide page says the edition chose its 12 vendors", !/top 12 vendors/.test(G) && /12 vendors, as that edition chose them/.test(G));
  ok("the guide pages make one independence statement, linked", !/No vendor sponsorship|No pay-to-play/.test(G) && /No vendor paid for, previewed or approved this guide\. <a href="\/about#independence"/.test(G));
  ok("site metadata makes no bare independence claims and types no profile count", ["index.html", "src/lib/seo.js", "src/lib/shareCard.js"].every((f) => !/Independent CX|Technology Intelligence|No vendor sponsorship|No pay-to-play|"282 vendor/.test(R(f))));
  ok("the tagline says what the site is in plain nouns", ["Homepage.jsx", "src/lib/Shell.jsx"].every((f) => !/Independent intelligence/.test(R(f)) && /Free tools and research for contact center decisions/.test(R(f))));
}

section("10. Audit 30 Sep, batch 2: the tools hub says what each tool gives you");
{
  const H = readFileSync("./HowToChoose.jsx", "utf8");
  const APP = readFileSync("./App.jsx", "utf8");
  ok("the hub carries none of the retired lines", !/CX Pro Tools|Popular|popular: true|Launch →|ROI narrative|85% occupancy|Tier classification|actually|Go\/no-go/.test(H));
  ok("the hub's heading counts the tools it lists", /\{totalTools\} free contact center tools<\/h1>/.test(H) && /Open →/.test(H));
  const hrefs = [...H.matchAll(/href: "(\/tools\/[a-z-]+)"/g)].map((m) => m[1]);
  const live = [...APP.matchAll(/<Route path="(\/tools\/[a-z-]+)" element=\{<(?!LegacyRedirect)/g)].map((m) => m[1]);
  ok(`the hub lists every live tool route once (${hrefs.length} of ${live.length})`, hrefs.length === live.length && new Set(hrefs).size === hrefs.length && live.every((r) => hrefs.includes(r)));
  const { METHOD_VERSIONS } = await import("./src/lib/methodVersions.js");
  const methods = [...H.matchAll(/method: "([a-z-]+)"/g)].map((m) => m[1]);
  ok("every method stamp on the hub names a published method", methods.length >= 20 && methods.every((m) => METHOD_VERSIONS[m]));
}

section("11. Audit 30 Sep, batch 3: the essay pages say what they hold");
{
  const R = (f) => readFileSync("./" + f, "utf8");
  const RETIRED = {
    "Industries.jsx": /Generic advice fails|2,135|checkpoints|strongest operators|change every recommendation|StateRAMP|moment of truth|generic CCaaS/,
    "HealthcareVertical.jsx": /generic platforms consistently underserve/,
    "HumanPremium.jsx": /exponentially|isn't a displacement story|Every analyst firm|changes everything|will outperform|Nobody talks/,
    "PlatformsTech.jsx": /isn't a vendor diagram|decision domains|CX technology landscape|vendor landscape/,
    "IVACategory.jsx": /no longer chatbot vs IVA/,
    "CXEcosystem.jsx": /take: "Best |that matter for CX|without vendor influence|can't replicate|Essential reference/,
    "Contact.jsx": /strategic clarity|integration landscape|technology landscape/,
    "VendorProfile.jsx": /integration landscape|competitive context and the questions/,
    "ReportActions.jsx": /numbers\s+actually support/,
    "WEMCategory.jsx": /What's Actually True|the market won't tell you/,
    "HCSubVerticalData.js": /exponentially harder/,
  };
  for (const [f, re] of Object.entries(RETIRED)) ok(`${f} carries none of the retired lines`, !re.test(R(f)));
  ok("the industries hub counts its segments from the sitemap", /\{SEGMENT_COUNT\} segments/.test(R("Industries.jsx")) && /import \{ SEGMENT_COUNT \} from "\.\/src\/lib\/seo\.js"/.test(R("Industries.jsx")));
}

section("12. Audit 30 Sep pass two: no rank, score or uncited analyst claim on any profile");
{
  const R = (f) => readFileSync("./" + f, "utf8");
  /* Every prose field a Phase 1 profile or category page renders, in all eight category data files. An analyst placement
     may appear only in an `analyst` field, quoted, with its link and check date (TB, 1 Oct: cite or quote). */
  const FIELD = /\b(?:profile|summary|differentiator|bestUseCase|diff|useCase|strength\d?|weakness\d?|watchout|rec|archetype)\s*:\s*"([^"]*)"/g;
  const RANK_I = /#\s?1\b|\b\d\s*\/\s*\d\b|\bleaders?\b|magic quadrant|marketscape|\bscor(?:e|es|ed)\b|\bnumber one\b|\b(?:best|strongest|deepest|most \w+|top)\b[^.]{0,60}\bin (?:the )?(?:entire )?(?:market|tier|segment|class|category|industry)\b|\bsets the standard\b|\bmarket[- ]leading\b/i;
  const RANK = { test: (t) => RANK_I.test(t) || /\bWave\b/.test(t) }; // "Wave" as Forrester's title; "first-wave" is an evaluation round
  const DATA = ["ACDRoutingData.js", "AnalyticsData.js", "AgentAssistData.js", "IVAData.js", "WEMData.js", "DigitalEngagementData.js", "PaymentData.js", "VendorData.js"];
  const hits = DATA.flatMap((f) => [...R(f).matchAll(FIELD)].filter((m) => RANK.test(m[1])).map((m) => `${f}: ${m[1].slice(0, 70)}`));
  ok("no profile prose claims a rank, a score, a leader position or an analyst placement", hits.length === 0);
  if (hits.length) console.log("   ", hits.join("\n    "));
  for (const bad of ['strength: "#1 social + digital care suite"', 'summary: "The strongest WFM alignment in the AI-native segment (tied at 6/6)."',
    'summary: "Named Leader in Forrester 2026 Wave for Conversational AI Platforms."', 'summary: "Revenue intelligence leader."'])
    ok(`the rule fires on ${bad.slice(0, 40)}`, [...bad.matchAll(FIELD)].some((m) => RANK.test(m[1])));
  const IVA = R("IVAData.js");
  const analyst = [...IVA.matchAll(/analyst: \{ said: "([^"]+)", by: "([^"]+)", url: "([^"]+)", checked: "(\d{4}-\d{2}-\d{2})" \}/g)];
  ok("every analyst line is quoted with who said it, a https link and a check date", analyst.length >= 1 && analyst.every((m) => /^https:\/\//.test(m[3])) && (IVA.match(/analyst:/g) || []).length === analyst.length);
  const VP = R("VendorProfile.jsx");
  ok("the profile shows an analyst line as a quoted, linked, dated fact that changes nothing", /Analyst coverage, as \{a\.by\} states it: "\{a\.said\}"/.test(VP) && /We have not read the report\. It is not scored and does not change any list or order on this site\./.test(VP) && /\{iv\.analyst && <AnalystNote a=\{iv\.analyst\} \/>\}/.test(VP));
  ok("back links name the page they open", !/Back to [^<]*Intelligence<|backLabel: "[^"]*Intelligence"/.test(VP + R("GatedReport.jsx")));
  ok("a layer with one vendor says so", /layer\.stack\.length === 1 \? "the vendor"/.test(R("src/lib/SubVerticalPage.jsx")));
}

console.log("\n13. Advisory and Contact are one page (TB, 1 Oct 2026)");
{
  const R = (f) => readFileSync("./" + f, "utf8");
  const C = R("Contact.jsx"), APP = R("App.jsx");
  const edge = JSON.parse(R("vercel.json")).redirects.find((r) => r.source === "/advisory");
  ok("/advisory redirects to /contact at the edge and in the app, and its page is gone",
    edge && edge.destination === "/contact" && edge.permanent && APP.includes('<Route path="/advisory" element={<LegacyRedirect to="/contact" />} />')
    && !APP.includes("import('./Advisory')") && !existsSync("./Advisory.jsx"));
  ok("/advisory is out of the sitemap and the metadata; /contact is in both",
    !R("public/sitemap.xml").includes("/advisory<") && R("public/sitemap.xml").includes("/contact</loc>") && !R("src/lib/seo.js").includes('"/advisory": {'));
  ok("the page says how consultants are chosen", /How consultants are chosen/.test(C) && /vetted/.test(C) && /independent consultant/.test(C));
  /* TB: never state how the site is paid. Only the rendered page is checked; the rule covers referral and commission language. */
  const PAID = /referral|commission|finder'?s fee|revenue share|we are paid|we get paid|pays us|paid by the consultant|kickback/i;
  ok("the page never says how the site is paid", !PAID.test(C));
  ok("the paid rule fires on a planted line", PAID.test("We earn a referral fee when you engage a consultant."));
  const files = execSync("git ls-files '*.js' '*.jsx' '*.html'", { encoding: "utf8" }).split("\n")
    .filter((f) => f && f !== "App.jsx" && !/\.test\.|^docs\/|^scripts\//.test(f) && /\.(jsx?|html)$/.test(f));
  const stale = files.filter((f) => /["'`(]\/advisory["'`#?)]/.test(R(f)));
  ok(`no page links /advisory [${stale.join(", ")}]`, stale.length === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
