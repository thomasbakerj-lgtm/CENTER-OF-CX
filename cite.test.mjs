// cite.test.mjs
//
// Copy audit batch 5 (1 Oct 2026): save, cite and find. Proves the scenario link is offered as the way to save and prints
// on the report cover (only a link to this site, escaped); each grade word carries a one-line meaning where the grade first
// shows; every method page and researched profile carries a "How to cite" line built from the same version and date the
// page shows; /llms.txt is generated at build from the live records and links only real pages; category pages carry an
// ItemList that is A to Z and marked unordered; a segment page with no public benchmark for any figure says so once.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const nodeRequire = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, info === undefined ? "" : info); } };
const section = (t) => console.log("\n" + t);
const R = (f) => readFileSync("./" + f, "utf8");
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const React = nodeRequire("react");
const { renderToString } = nodeRequire("react-dom/server");
globalThis.window = { location: { search: "", hash: "", pathname: "/", origin: "https://www.contactcentercx.com" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {}, scrollTo() {}, matchMedia: () => ({ matches: true }) };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const bundle = async (entry) => {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, nodeRequire);
  return mod.exports;
};
const SITEMAP = new Set([...R("public/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "")));
const BASE = "https://www.contactcentercx.com";

section("1. The scenario link is the save, and the report prints it");
{
  const RA = R("ReportActions.jsx");
  ok("the result says the link is how you keep the scenario, and who can see it", /Save this link\./.test(RA) && /It is how you keep this scenario/.test(RA) && /anyone with the link sees them/.test(RA));
  ok("ReportActions hands the link to the report", /reopen=\{link \|\| ""\}/.test(RA));
  const { reportHtml, safeReopen } = await bundle("./ReportExport.jsx");
  const good = `${BASE}/tools/staffing-calculator?s=abc123`;
  const h = reportHtml({ toolName: "Staffing", today: "1 October 2026", sections: [], reopen: good });
  ok("a link to this site prints on the cover and in the footer note", h.includes(`<strong>Reopen this scenario:</strong> ${good}`) && /open the scenario link on the cover/.test(h));
  for (const bad of ["javascript:alert(1)", "https://evil.example/tools/x", `${BASE}/tools/x?s="><script>alert(1)</script>`, "", null])
    ok(`a link that is not ours or not clean prints nothing (${String(bad).slice(0, 30)})`, !reportHtml({ toolName: "S", today: "x", sections: [], reopen: bad }).includes("Reopen this scenario") && safeReopen(bad) === "");
  ok("no report without a link mentions one", !reportHtml({ toolName: "S", today: "x", sections: [] }).includes("scenario link on the cover"));
}

section("2. Each grade word carries its meaning where it first shows");
{
  const { GRADE_MEANING, GRADES } = await import("./src/lib/confidence.js");
  ok("every grade has one line of meaning, no dash", GRADES.every((g) => typeof GRADE_MEANING[g] === "string" && GRADE_MEANING[g].length > 40 && !DASH.test(GRADE_MEANING[g])));
  const U = await bundle("./src/lib/ui.jsx");
  for (const g of GRADES) ok(`the grade badge shows what ${g} means`, renderToString(React.createElement(U.GradeBadge, { grade: g })).replace(/&#x27;/g, "'").includes(GRADE_MEANING[g]));
}

section("3. How to cite");
{
  const { citeMethod, citeResearch } = await import("./src/lib/cite.js");
  const { RUBRICS } = await import("./src/lib/rubrics/index.js");
  const { METHOD_VERSIONS, longDate } = await import("./src/lib/methodVersions.js");
  const ids = Object.keys(RUBRICS);
  ok(`every method's citation names its title, published version, date and page (${ids.length})`, ids.length >= 20 && ids.every((id) => {
    const r = RUBRICS[id], c = citeMethod({ title: r.title, version: r.version, published: r.published, id });
    return r.version === METHOD_VERSIONS[id].version && c === `The Center of CX, "${r.title} method", version ${r.version}, ${longDate(r.published)}, ${BASE}/methodology/${id}` && SITEMAP.has(`${BASE}/methodology/${id}`) && !DASH.test(c);
  }));
  ok("every method page renders the line from its own record", /<CiteLine text=\{citeMethod\(\{ title: r\.title, version: r\.version, published: r\.published, id \}\)\} \/>/.test(R("RubricPage.jsx")));
  const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
  ok("every researched profile's citation names its validation date and page", Object.entries(CCAAS_RESEARCH.complete).every(([slug, r]) => {
    const c = citeResearch({ name: "X", validated: r.validated, slug });
    return c.includes(`validated ${longDate(r.validated)}`) && c.endsWith(`${BASE}/vendors/${slug}`) && SITEMAP.has(`${BASE}/vendors/${slug}`);
  }));
  ok("the researched profile renders the line from its validation date", /<CiteLine text=\{citeResearch\(\{ name: v\.Supplier_Name, validated: v\.Last_Validated_Date, slug \}\)\} \/>/.test(R("ResearchedProfile.jsx")));
  const C = await bundle("./src/lib/CiteLine.jsx");
  ok("the line renders as selectable text labelled How to cite", /aria-label="How to cite"/.test(renderToString(React.createElement(C.CiteLine, { text: "T" }))) && renderToString(React.createElement(C.CiteLine, { text: "" })) === "");
}

section("4. /llms.txt");
{
  const { llmsTxt } = await import("./src/lib/llmsTxt.js");
  const t = llmsTxt();
  const links = [...t.matchAll(/\]\((https:[^)]+)\)|: (https:\/\/\S+)$/gm)].map((m) => (m[1] || m[2]).replace(/\/$/, ""));
  ok(`every link in it is a page in the sitemap (${links.length})`, links.length > 60 && links.every((u) => SITEMAP.has(u)), links.filter((u) => !SITEMAP.has(u)));
  const { SEO_MAP, TOOL_COUNT } = await import("./src/lib/seo.js");
  const tools = Object.keys(SEO_MAP).filter((p) => p.startsWith("/tools/"));
  ok(`it lists every tool (${TOOL_COUNT})`, tools.length === TOOL_COUNT && tools.every((p) => t.includes(`(${BASE}${p})`)));
  const { RUBRICS } = await import("./src/lib/rubrics/index.js");
  ok("it lists every method with its version", Object.entries(RUBRICS).every(([id, r]) => t.includes(`(${BASE}/methodology/${id}): version ${r.version}`)));
  const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
  ok("it lists every researched platform", Object.keys(CCAAS_RESEARCH.complete).every((s) => t.includes(`(${BASE}/vendors/${s})`)));
  ok("it carries no dash, no score, rank or tier claim, and states the crawler policy", !DASH.test(t) && !/\branked\b|\bscored\b|\btop \d/i.test(t) && /robots\.txt allows all crawlers/.test(t));
  ok("the build writes it", /writeFileSync\(join\(DIST, "llms\.txt"\), llmsTxt\(\)/.test(R("prerender.mjs")));
}

section("5. Category pages carry an unordered ItemList, A to Z");
{
  const S = await import("./src/lib/seo.js");
  const { CATEGORIES } = await import("./src/lib/verticals.js");
  for (const [id, c] of Object.entries(CATEGORIES)) {
    const g = S.structuredData(c.page, S.resolveSeo(c.page)).find((x) => x["@type"] === "ItemList");
    const names = g ? g.itemListElement.map((x) => x.name) : [];
    ok(`${id}: ItemList, unordered, A to Z, every item a real profile`, !!g && g.itemListOrder === "https://schema.org/ItemListUnordered" && g.numberOfItems === names.length && names.length > 5
      && names.join("\n") === [...names].sort((a, b) => a.localeCompare(b)).join("\n") && g.itemListElement.every((x) => SITEMAP.has(x.url)));
  }
  ok("no other page carries one", !S.structuredData("/vendors", S.resolveSeo("/vendors")).some((x) => x["@type"] === "ItemList"));
}

section("6. A segment with no public benchmark for any figure says so once");
{
  globalThis.__slug = "";
  const nodeReq = (m) => (m === "react-router-dom" ? { useParams: () => ({ slug: globalThis.__slug }) } : nodeRequire(m));
  const r = await build({ entryPoints: ["./src/lib/SubVerticalPage.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, nodeReq);
  const Page = mod.exports.default;
  const { claimIds, claim } = await import("./src/lib/claims.js");
  let collapsed = 0, tiles = 0, problems = [];
  for (const f of ["HCSubVerticalData.js", "RetailSubVerticalData.js", "InsuranceSubVerticalData.js", "GovernmentSubVerticalData.js"]) {
    const m = await import("./" + f);
    const getter = Object.entries(m).find(([k]) => /^get[A-Za-z]*SubVertical$/.test(k))[1];
    for (const slug of Object.entries(m).find(([k]) => /^getAll/.test(k))[1]()) {
      globalThis.__slug = slug;
      const sv = getter(slug);
      const none = sv.kpis.every((k) => { const ids = claimIds([k.avg]); return ids.length === 1 && claim(ids[0]).kind === "none"; });
      const html = renderToString(React.createElement(Page, { industry: sv.parent, href: "/industries/x", getSubVertical: getter }));
      const once = (html.match(/No public benchmark exists for these figures/g) || []).length + (html.match(/No public benchmark<br/g) || []).length;
      if (none) { collapsed++; if (once !== 1 || !sv.kpis.every((k) => html.includes(k.metric))) problems.push(slug); }
      else { tiles++; if (/No public benchmark exists for these figures/.test(html)) problems.push(slug + " (has figures)"); }
    }
  }
  ok(`every all-empty segment shows one list with every figure named (${collapsed} collapsed, ${tiles} with figures)`, problems.length === 0 && collapsed > 10, problems);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
