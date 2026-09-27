// subpage.test.mjs
//
// The industry segment pages on the new design (redesign Phase 8 part 1): all 61, through the one shared component.
// Renders every segment in the framework (vendor lists open) and the results phase, and proves: one h1; every layer,
// capability, figure and named vendor renders; every [[claim]] still goes through ClaimText and the sources list; the
// Have, Need and Planned controls are words with a mark and a pressed state; named vendors are labelled as examples,
// never a recommendation, and each offers an introduction (a profile slug when the link names a profile); the results
// state counts in words; nothing is sent except the review request; tokens only.
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const nodeRequire = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {}, scrollTo() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const require = (m) => (m === "react-router-dom" ? { useParams: () => ({ slug: globalThis.__slug }) } : nodeRequire(m));
const r = await build({ entryPoints: ["./src/lib/SubVerticalPage.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const Page = mod.exports.default;
const React = nodeRequire("react");
const { renderToString } = nodeRequire("react-dom/server");
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;| /g, " ").replace(/\s+/g, " ");
const { isVendorSlug } = await import("./src/lib/seo.js");
const { CATEGORIES } = await import("./src/lib/verticals.js");
const { tokens } = await import("./src/lib/claims.js");
const plain = (s) => tokens(s).filter((p) => !p.id).map((p) => p.text).join(" ").replace(/\s+/g, " ").trim();

const files = readdirSync(".").filter((f) => /^[A-Za-z]+SubVerticalData\.js$/.test(f));
let segments = 0;
const problems = [];
for (const f of files) {
  const m = await import("./" + f);
  const getter = Object.entries(m).find(([k]) => /^get[A-Za-z]*SubVertical$/.test(k))[1];
  const all = Object.entries(m).find(([k, v]) => /^getAll/.test(k))[1]();
  for (const slug of all) {
    segments++;
    globalThis.__slug = slug;
    const sv = getter(slug);
    const expanded = Object.fromEntries(sv.layers.map((_, i) => [i, true]));
    let html;
    try { html = renderToString(React.createElement(Page, { industry: sv.parent, href: "/industries/x", getSubVertical: getter, initial: { expanded } })); }
    catch (e) { problems.push(`${slug} threw ${e.message}`); continue; }
    const t = text(html);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${slug} h1`);
    if (/\[object Object\]|>\s*(null|undefined|NaN)\s*</.test(html) || /\bNaN\b|\bundefined\b/.test(t)) problems.push(`${slug} bad text`);
    if (/\[\[/.test(t)) problems.push(`${slug} a claim token rendered raw`);
    for (const l of sv.layers) {
      if (!t.includes(`Layer ${l.layer}: ${l.name}`)) problems.push(`${slug} layer ${l.layer}`);
      for (const c of l.capabilities) if (!t.includes(c.replace(/\s+/g, " "))) problems.push(`${slug} capability missing`);
      for (const v of l.stack || []) {
        if (!t.includes(v.name) || !t.includes(plain(v.why).slice(0, 40))) problems.push(`${slug} vendor ${v.name}`);
        const m2 = typeof v.href === "string" && v.href.match(/^\/vendors\/([a-z0-9-]+)$/);
        const prof = m2 && !CATEGORIES[m2[1]] && isVendorSlug(m2[1]);
        if (prof && !html.includes(`href="/contact?intro=${m2[1]}&amp;from=industry"`)) problems.push(`${slug} intro for profile ${m2[1]}`);
        if (v.role === "None") { if (t.includes(`Request an introduction to ${v.name}`)) problems.push(`${slug} guidance row offers an introduction`); continue; }
        if (!prof && !t.includes(`Request an introduction to ${v.name}`)) problems.push(`${slug} intro for ${v.name}`);
      }
    }
    if (sv.layers.some((l) => (l.stack || []).length) && !t.includes("neither a research finding nor a recommendation")) problems.push(`${slug} vendor label`);
    if (/Recommended Technology Stack|recommended stack|recommended vendors?/i.test(t)) problems.push(`${slug} labels vendors as recommended`);
    if (!/aria-pressed="false"/.test(html) || !/Have/.test(t) || !/Planned/.test(t)) problems.push(`${slug} status controls`);
    // results
    const statuses = {};
    sv.layers.forEach((l, li) => l.capabilities.forEach((_, ci) => { statuses[`${li}-${ci}`] = ["Have", "Need", "Planned"][(li + ci) % 3]; }));
    const rt = text(renderToString(React.createElement(Page, { industry: sv.parent, href: "/industries/x", getSubVertical: getter, initial: { phase: "results", statuses } })));
    const total = sv.layers.reduce((a, l) => a + l.capabilities.length, 0), have = Object.values(statuses).filter((x) => x === "Have").length, need = Object.values(statuses).filter((x) => x === "Need").length;
    if (!rt.includes(`${have} of ${total} capabilities in place`) || !rt.includes(`${need} marked Need`) || !rt.includes(`What you marked Need (${need})`)) problems.push(`${slug} results words`);
  }
}
section("1. Every segment renders on the new design");
ok(`all ${segments} segments render, framework and results, with every layer, capability and named vendor [${problems.slice(0, 4).join(" | ")}]`, segments === 61 && problems.length === 0);

section("2. Source rules");
const SRC = readFileSync("./src/lib/SubVerticalPage.jsx", "utf8");
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(SRC));
ok("no Google font import or global reset", !/fonts\.googleapis|\*,\*::before/.test(SRC));
ok("text still goes through ClaimText and ClaimSources", /<ClaimText text=\{sv\.intro\}/.test(SRC) && /<ClaimSources ids=\{claimIds\(sv\)\}/.test(SRC));
ok("one send, inside the review request", (SRC.match(/fetch\(/g) || []).length === 1 && /const requestReview = async[\s\S]*?fetch\(/.test(SRC));
ok("no colour carries a status: statuses are words with a pressed state", !/status === "Have" \? [A-Z]+/.test(SRC) && /aria-pressed=\{status === opt\.label\}/.test(SRC));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
