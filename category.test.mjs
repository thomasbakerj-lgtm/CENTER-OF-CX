// category.test.mjs
//
// The CCaaS category page by competitive class (redesign Phase 7 part 3). Renders the page from the committed research
// snapshot's category index and proves: every researched vendor appears once, in its own class, A to Z inside the class,
// with its validation date, comparison boundary and first published best-when statement; each class card names its job,
// typical buyer, calibrated or draft status and vendor count, and filters the list to exactly its vendors; vendors not
// yet researched carry no class and no claim, the next one is marked, and a research request sends only an anonymous
// event; the page's own words add no score, rank, tier or count of states; every vendor offers an introduction; tokens
// only. Truth surface: Vendor Intelligence.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/vendors/ccaas" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };

const r = await build({ entryPoints: ["./CCaaSCategory.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const Page = mod.exports.default, PLAIN = mod.exports.PLAIN;
const React = require("react");
const { renderToString } = require("react-dom/server");
const { CCAAS_RESEARCH, ccaasResearchStatus, fmtDate } = await import("./src/lib/researchStatus.js");
const INDEX = JSON.parse(readFileSync("./src/data/research/ccaas/category.json", "utf8"));
const VD = await build({ entryPoints: ["./VendorData.js"], bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent" });
const vmod = { exports: {} };
new Function("module", "exports", "require", VD.outputFiles[0].text)(vmod, vmod.exports, require);
const core = vmod.exports.getCoreVendors(), adjacent = vmod.exports.getAdjacentVendors();
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const render = (props = {}) => renderToString(React.createElement(Page, props));
const SLUG = Object.fromEntries(Object.entries(CCAAS_RESEARCH.complete).map(([s, x]) => [x.vendorId, s]));

section("1. The whole page");
const html = render(), t = text(html);
ok("one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
ok("no bad text", !/\[object Object\]|>\s*(null|undefined|NaN)\s*</.test(html) && !/\b(NaN|undefined|Infinity)\b/.test(t.split("Avaya Infinity").join("")));
ok("states that Phase 1 scores are withdrawn", /Phase 1 scores and tiers are withdrawn/.test(t));
ok("states where the research stands", t.includes(`${Object.keys(CCAAS_RESEARCH.complete).length} of ${core.length} core platforms researched; ${core.length - Object.keys(CCAAS_RESEARCH.complete).length} not yet`)
  && t.includes(`${INDEX.classes.length} peer groups`) && (INDEX.classes.some((c) => c.draft) ? /of them provisional/.test(t) : !/of them provisional/.test(t))
  && t.includes(`between ${fmtDate("2026-09-19")} and ${fmtDate("2026-09-24")}`) && /ratings stay locked/i.test(t));
ok("every class has a plain name and job", INDEX.classes.every((c) => PLAIN[c.id] && t.includes(PLAIN[c.id].name) && t.includes(PLAIN[c.id].job)));

section("2. Classes and researched vendors");
let seen = [];
for (const c of INDEX.classes) {
  const card = `${PLAIN[c.id].name}`;
  const count = c.vendors.length === 1 ? "1 vendor" : `${c.vendors.length} vendors`;
  ok(`${c.id} card: job, buyer, status and count`, t.includes(`${card} ${PLAIN[c.id].job} ${c.buyer ? `Typical buyer: ${c.buyer} ` : ""}${c.draft ? "Provisional peer group" : "Peer group"} · ${count}`));
  ok(`${c.id}: status follows the corpus`, c.draft === !["LOCKED_CALIBRATED", "ACTIVE"].includes(c.status) && c.status !== "RETIRED");
  const names = c.vendors.map((v) => v.name);
  ok(`${c.id}: vendors A to Z`, JSON.stringify(names) === JSON.stringify([...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))));
  const only = render({ initialClass: c.id }), ot = text(only);
  const others = INDEX.classes.filter((x) => x.id !== c.id).flatMap((x) => x.vendors);
  ok(`${c.id} filter shows exactly its vendors`, c.vendors.every((v) => only.includes(`href="/vendors/${SLUG[v.id]}"`)) && others.every((v) => !only.includes(`href="/vendors/${SLUG[v.id]}"`)));
  ok(`${c.id} filter shows its research class word for word`, ot.includes(`Research class: ${c.name}. ${c.definition}`));
  let at = ot.indexOf(`Research class: ${c.name}`);
  for (const v of c.vendors) {
    seen.push(v.id);
    const i = ot.indexOf(v.name, at);
    ok(`${v.name}: in order inside ${c.id}`, i > at); at = i;
    const block = ot.slice(i, i + 900);
    ok(`${v.name}: best-when statement or its absence`, v.bestWhen ? block.includes(norm(v.bestWhen.statement)) : block.includes("No best-when statement is published"));
    ok(`${v.name}: compared on and validated`, block.includes(`Compared on: ${PLAIN[c.id].compared}`) && block.includes(`Research validated ${fmtDate(v.validated)}`));
    ok(`${v.name}: validation date equals the registry`, v.validated === CCAAS_RESEARCH.complete[SLUG[v.id]].validated);
  }
}
ok("every researched vendor appears exactly once", seen.length === Object.keys(CCAAS_RESEARCH.complete).length && new Set(seen).size === seen.length && Object.values(CCAAS_RESEARCH.complete).every((x) => seen.includes(x.vendorId)));
ok("no vendor falls outside a class", INDEX.unclassed.length === 0);

section("3. Not yet researched");
const notYet = core.filter((v) => ccaasResearchStatus(v.slug) !== "complete");
ok("the core vendors not yet researched (two)", notYet.length === 2);
const nyAt = t.indexOf("Not yet researched");
for (const v of notYet) {
  const i = t.indexOf(v.name, nyAt);
  ok(`${v.slug}: listed, with no class`, i > nyAt && !INDEX.classes.some((c) => c.vendors.some((x) => x.name === v.name)));
}
ok("the next vendor is marked researching next", CCAAS_RESEARCH.next === "goto" && /GoTo Contact Center Researching next/.test(t));
ok("every other not yet researched vendor offers a research request", notYet.filter((v) => v.slug !== CCAAS_RESEARCH.next).every((v) => t.includes(`Ask us to research ${v.name}`)));
const SRC = readFileSync("./CCaaSCategory.jsx", "utf8");
ok("the request sends one anonymous event and nothing else", /trackVendor\.action\(v\.slug, "request", "category"\)/.test(SRC) && !/fetch\(|formspree|localStorage/i.test(SRC));

section("4. Research law: the page's own words");
const strings = [];
const walk = (o) => { if (typeof o === "string") { if (o.length > 2) strings.push(norm(o)); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") Object.values(o).forEach(walk); };
walk(INDEX);
strings.sort((a, b) => b.length - a.length);
let own = t;
for (const x of strings) own = own.split(x).join(" ");
own = own.replace("Phase 1 scores and tiers are withdrawn", "").replace("nothing on this page ranks them", "").split("no quality grade").join("").split("never a quality grade").join("").split("carries no grade").join("");
ok(`no score, rank, tier, leader or grade word [${(own.match(/.{0,30}\b(scores?|rank\w*|tiers?|leader\w*|grade|top \d+|best-in)\b.{0,20}/i) || [""])[0]}]`, !/\b(scores?|rank\w*|tiers?|leader\w*|grade|top \d+|best-in)\b/i.test(own));
ok("no count of states", !/\b\d+\s+(findings?|claims?)\b/i.test(own));
ok("no weakness word", !/\bweak/i.test(own.replace("It is never counted as a weakness", "")));
ok("a mutation adding a score is caught", /\bscores?\b/i.test(own + " score 4"));
ok("no Phase 1 prose", core.every((v) => !(v.summary && v.summary.length > 30 && t.includes(norm(v.summary)))));
ok("the index carries no rating or Phase 1 field", !/"(?![A-Za-z]*Rating_Layer)[A-Za-z_]*(score|rating|tier|rank|phase1)[A-Za-z_]*":/i.test(JSON.stringify(INDEX)));

section("4b. Tags: what each vendor sells and the sizes it is sold to");
{
  const { tagsFor, SIZES, UC_LABEL } = await import("./src/lib/research/ccaasTags.js");
  const vendorsIn = (h) => INDEX.classes.flatMap((c) => c.vendors).filter((v) => h.includes(`href="/vendors/${SLUG[v.id]}"`)).map((v) => v.id).sort();
  for (const c of INDEX.classes) for (const v of c.vendors) {
    const tg = tagsFor(v.id);
    const i = t.indexOf(v.name + " " + tg.category);
    ok(`${v.name}: shows ${tg.category} and ${tg.sizes.map((z) => z.label).join(", ")}`, i > 0 && t.slice(i, i + 200).includes(tg.sizes.map((z) => z.label).join(" ")));
  }
  const all = INDEX.classes.flatMap((c) => c.vendors).map((v) => v.id).sort();
  for (const z of SIZES) {
    const h = renderToString(React.createElement(Page, { initialSize: z }));
    const want = all.filter((id) => tagsFor(id).sizes.some((x) => x.size === z));
    ok(`size filter ${z} keeps exactly the vendors sold to ${z} (${want.length})`, JSON.stringify(vendorsIn(h)) === JSON.stringify(want));
  }
  const hu = renderToString(React.createElement(Page, { initialUc: true }));
  const wantUc = all.filter((id) => tagsFor(id).uc);
  ok(`${UC_LABEL} filter keeps exactly those vendors (${wantUc.length})`, JSON.stringify(vendorsIn(hu)) === JSON.stringify(wantUc) && wantUc.length > 0);
  const hps = renderToString(React.createElement(Page, { initialPs: true }));
  const wantPs = all.filter((id) => tagsFor(id).publicSector);
  ok(`public sector filter keeps exactly those vendors (${wantPs.length})`, JSON.stringify(vendorsIn(hps)) === JSON.stringify(wantPs) && wantPs.length > 0);
  ok("every caveat renders under its vendor", INDEX.classes.every((c) => c.vendors.every((v) => tagsFor(v.id).notes.every((n) => t.includes(`${n.tag}: ${n.text}`)))));
  ok("Avaya's UCaaS tag carries its US public sector scope in the label", t.includes("UCaaS + CCaaS (US public sector)"));
  const hp = renderToString(React.createElement(Page, { initialSize: "SMB", initialClass: (INDEX.classes.find((c) => c.vendors.every((v) => !tagsFor(v.id).sizes.some((x) => x.size === "SMB"))) || INDEX.classes[0]).id }));
  ok("a class with no match after filtering says so", text(hp).includes("No researched vendor in this class matches these filters") || vendorsIn(hp).length > 0);
  ok("filters never reorder: a filtered class keeps A to Z", INDEX.classes.every((c) => { const h = text(renderToString(React.createElement(Page, { initialClass: c.id, initialSize: "Midmarket" }))); const names = c.vendors.filter((v) => tagsFor(v.id).sizes.some((x) => x.size === "Midmarket")).map((v) => v.name); let at = 0; return names.every((n) => { const k = h.indexOf(n, at); if (k < 0) return false; at = k; return true; }); }));
  ok("the not yet researched carry the Phase 1 description, labelled", core.filter((v) => ccaasResearchStatus(v.slug) !== "complete" && v.segment).every((v) => t.includes(`Earlier Phase 1 description: ${v.segment}`)));
}

section("5. Introductions, links and tokens");
const intros = (html.match(/href="\/contact\?intro=[^"&]+&amp;from=category"/g) || []).length;
ok(`every vendor offers an introduction (${intros})`, intros === core.length + adjacent.length);
ok("every profile link resolves to a site profile", [...html.matchAll(/href="\/vendors\/([^"#]+)"/g)].every(([, s]) => vmod.exports.getVendor(s)));
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(SRC));
ok("no dash in the page or the index", !/[\u2013\u2014]/.test(SRC + readFileSync("./src/data/research/ccaas/category.json", "utf8") + readFileSync("./src/lib/research/categoryView.js", "utf8")));
ok("no global style reset or third-party font", !/fonts\.googleapis|\*, \*::before/.test(SRC));

/* Audit 30 Sep (TB: agree): the page says the three large cloud suites are not researched yet, and claims nothing about them. */
{
  const SRC = readFileSync("./CCaaSCategory.jsx", "utf8");
  ok("the page names the three unresearched cloud suite offers and makes no claim about them",
    /Microsoft Dynamics 365 Contact Center/.test(SRC) && /Google Cloud's contact center offering/.test(SRC) && /Salesforce's own contact center/.test(SRC) && /makes no claim about them either way/.test(SRC) && /href="\/research#ideas"/.test(SRC));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
