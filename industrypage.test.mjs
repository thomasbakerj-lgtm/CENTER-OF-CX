// industrypage.test.mjs
//
// The ten industry pages and the hub on the new design (redesign Phase 8 part 2). Each industry file keeps its content
// as data and renders through src/lib/IndustryPage.jsx. Renders all ten and proves: one h1; every segment, failure mode,
// stack layer, benchmark row and outsourcing item renders; every segment links a real segment page; claim tokens render
// through ClaimText and the sources list names every one; named platforms are A to Z with an introduction and carry no
// blurb of ours; the files and the component carry no colour literal, Google font or old helper. The hub renders its
// ten cards and links. Tokens only.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const nodeRequire = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {}, scrollTo() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const React = nodeRequire("react");
const { renderToString } = nodeRequire("react-dom/server");
const bundle = async (entry) => {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent", metafile: true });
  const m = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, nodeRequire);
  return m.exports;
};
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
const { plain, tokens } = await import("./src/lib/claims.js");
/* What a text with claim tokens reads as on the page, less the tags beside each figure. */
const words = (s) => tokens(String(s)).map((p) => (p.id ? "\u0001" : p.text)).join("").split("\u0001")[0].replace(/\s+/g, " ").trim();
const FILES = { EducationVertical: "education", FinancialServicesVertical: "financial-services", GovernmentVertical: "government", HealthcareVertical: "healthcare", InsuranceVertical: "insurance",
  ManufacturingVertical: "manufacturing", RetailVertical: "retail", TelecomVertical: "telecom", TravelVertical: "travel", UtilitiesVertical: "utilities" };
const SUBDATA = { education: "EducationSubVerticalData", "financial-services": "FSSubVerticalData", government: "GovernmentSubVerticalData", healthcare: "HCSubVerticalData", insurance: "InsuranceSubVerticalData",
  manufacturing: "ManufacturingSubVerticalData", retail: "RetailSubVerticalData", telecom: "TelecomSubVerticalData", travel: "TravelSubVerticalData", utilities: "UtilitiesSubVerticalData" };

/* Capture the props each file passes, by rendering it with IndustryPage swapped for a recorder. */
const captured = {};
for (const [file, slug] of Object.entries(FILES)) {
  const src = readFileSync(`./${file}.jsx`, "utf8");
  section(`${file}`);
  ok("renders through the shared IndustryPage", /from "\.\/src\/lib\/IndustryPage\.jsx"/.test(src) && /<IndustryPage\b/.test(src));
  ok("no colour literal, Google font or old helper", !/#[0-9a-fA-F]{3,8}\b|rgba?\(|fonts\.googleapis|function FadeIn|function Nav|function LogoMark/.test(src));
  ok("no vendor blurb of ours", !/\{ name: "[^"]+", why: /.test(src));
  const mod = await bundle(`./${file}.jsx`);
  const html = renderToString(React.createElement(mod.default)), t = text(html);
  ok("one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
  ok("no bad text or raw token", !/\[object Object\]|>\s*(null|undefined|NaN)\s*</.test(html) && !/\[\[/.test(t));
  /* Re-render with a recorder to read the props. */
  const rec = await (async () => {
    const r = await build({ entryPoints: [`./${file}.jsx`], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom"], logLevel: "silent",
      plugins: [{ name: "rec", setup(b) { b.onResolve({ filter: /IndustryPage\.jsx$/ }, () => ({ path: "rec", namespace: "rec" })); b.onLoad({ filter: /.*/, namespace: "rec" }, () => ({ contents: "export default function R(p){ globalThis.__props = p; return null; }", loader: "js" })); } }] });
    const m = { exports: {} }; new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, nodeRequire);
    renderToString(React.createElement(m.exports.default)); return globalThis.__props;
  })();
  captured[file] = rec;
  ok("slug matches the route", rec.slug === slug);
  const subs = (await import(`./${SUBDATA[slug]}.js`));
  const getter = Object.entries(subs).find(([k]) => /^get[A-Za-z]*SubVertical$/.test(k))[1];
  ok("every segment renders and links a real segment page", rec.segments.items.every((sv) => t.includes(sv.name) && html.includes(`href="/industries/${slug}/${sv.slug}"`) && !!getter(sv.slug)));
  { const miss = rec.failures.items.filter((f) => !t.includes(f.title) || !t.includes(words(f.desc).slice(0, 40))); ok(`every failure mode renders [${miss.map((f) => words(f.desc).slice(0, 40)).join(" | ")}]`, miss.length === 0); }
  ok("every stack layer renders", rec.stack.items.length === 7 && rec.stack.items.every((l) => t.includes(`Layer ${l.layer}: ${l.name}`) && t.includes(`Vendors in this layer include ${l.vendors}`)));
  ok("every benchmark row renders", rec.benchmarks.rows.every((b) => t.includes(b.metric)) && rec.benchmarks.keys.every((k) => rec.benchmarks.rows.every((b) => typeof b[k] === "string")));
  ok("benchmark links resolve to live routes", (rec.benchmarks.links || []).every(([h]) => new RegExp(`path="${h.replace(/[/]/g, "\\/")}"`).test(readFileSync("./App.jsx", "utf8"))));
  if (rec.bpo) ok("every outsourcing item renders", [...(rec.bpo.value || []), ...(rec.bpo.risk || [])].every((x) => t.includes(words(x).slice(0, 30))));
  ok("the sources list is present", html.includes('id="sources"') && rec.sources.ids.length > 0);
  const vend = rec.vendors.items.map((v) => v.name);
  ok("named platforms A to Z, each with an introduction", vend.length > 0 && vend.every((n) => t.includes(`Request an introduction to ${n}`)) && (() => { const sorted = [...vend].sort((a, b) => a.localeCompare(b)); let at = t.indexOf("Platforms named for"); return sorted.every((n) => { const k = t.indexOf(`Request an introduction to ${n}`, at); if (k < 0) return false; at = k; return true; }); })());
  ok("the platform list says it carries no ranking or recommendation", t.includes("The list carries no ranking or recommendation"));
}

section("The shared component and the hub");
const IP = readFileSync("./src/lib/IndustryPage.jsx", "utf8");
ok("IndustryPage: tokens only, ClaimText and ClaimSources", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(IP) && /ClaimText/.test(IP) && /<ClaimSources ids=\{sources\.ids\}/.test(IP));
ok("IndustryPage: an empty stats strip does not render", /\{stats\.length > 0 && \(/.test(IP));
const HUB = readFileSync("./Industries.jsx", "utf8");
ok("hub: tokens only, no old helper", !/#[0-9a-fA-F]{3,8}\b|rgba?\(|fonts\.googleapis|function FadeIn|function Nav/.test(HUB));
ok("hub: no vendor recommendation or vetting claim", !/vendor recommendations|vetted/i.test(HUB));
const hub = await bundle("./Industries.jsx");
const hh = renderToString(React.createElement(hub.default)), ht = text(hh);
ok("hub: one h1", (hh.match(/<h1[\s>]/g) || []).length === 1);
ok("hub: ten industry cards and ten platform links", Object.values(FILES).every((s) => hh.includes(`href="/industries/${s}"`) && hh.includes(`href="/vendors/ccaas/${s}"`)));
ok("hub: card figures render through ClaimText with no raw token", !/\[\[/.test(ht));
ok("no dash in the new files", !/[\u2013\u2014]/.test(IP + HUB + Object.keys(FILES).map((f) => readFileSync(`./${f}.jsx`, "utf8")).join("")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
