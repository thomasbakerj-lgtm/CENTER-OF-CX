// corrections.test.mjs
//
// The vendor correction policy (decision D2, TB 27 Sep 2026: points 1 to 5, no vendor response block; accepted
// corrections logged on the vendor page). Proves: the page publishes exactly the approved policy; the report form asks
// for the statement, what the source shows, a public https link and an email, with every field named for a screen
// reader; a profile link carries only a known vendor; every researched profile's "Report an error" reaches the form;
// the corrections note shows an accepted correction with its date, what changed and a safe source link, and says so
// when there is none; a malformed log entry is refused; the report goes only to the allowed form host. Tokens only.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const React = require("react");
const { renderToString } = require("react-dom/server");
const bundle = async (entry) => {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom"], logLevel: "silent" });
  const m = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
  return m.exports;
};
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
const C = await import("./src/lib/research/corrections.js");
const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
const ids = Object.values(CCAAS_RESEARCH.complete).map((v) => v.vendorId);

section("1. The published policy");
const Page = (await bundle("./Corrections.jsx")).default;
const html = renderToString(React.createElement(Page)), t = text(html);
ok("one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
ok("the five approved points, in order", C.POLICY.length === 5 && C.POLICY.every((p, i) => t.indexOf(p.title) > (i ? t.indexOf(C.POLICY[i - 1].title) : -1)));
ok("five working days to acknowledge, twenty to decide", /within five working days and decide within twenty/.test(t) && C.RESPONSE_DAYS.acknowledge === 5 && C.RESPONSE_DAYS.decide === 20);
ok("no vendor response block (point 6 removed)", !/vendor response/i.test(t));
ok("only public, citable evidence changes a finding", /public, citable evidence/.test(t));

section("2. The report form");
for (const [id, name] of [["c-vendor", "correction_vendor"], ["c-statement", "statement"], ["c-why", "correction"], ["c-source", "source_url"], ["c-email", "email"]])
  ok(`${name}: named and labelled`, html.includes(`for="${id}"`) && new RegExp(`id="${id}"[^>]*name="${name}"|name="${name}"[^>]*id="${id}"`).test(html));
ok("the source must be an https link", /name="source_url" type="url" required="" pattern="https:\/\/\.\+"/.test(html));
ok("asks whether the reporter represents the vendor", /name="represents_vendor"/.test(html) && /<legend/.test(html));
ok("the report is subject-tagged as a research correction", html.includes('value="Research correction"'));
const SRC = readFileSync("./Corrections.jsx", "utf8");
ok("the report goes only to the allowed form host", [...SRC.matchAll(/fetch\("([^"]+)"/g)].length === 1 && [...SRC.matchAll(/fetch\("([^"]+)"/g)].every(([, u]) => u.startsWith("https://formspree.io/")));
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(SRC));

section("3. Links from profiles");
ok("a known profile slug travels", JSON.stringify(C.readCorrection("?vendor=zoom")) === JSON.stringify({ slug: "zoom", name: C.readCorrection("?vendor=zoom").name }) && !!C.readCorrection("?vendor=zoom").name);
ok("an unknown or hostile vendor is dropped", C.readCorrection("?vendor=<script>") === null && C.readCorrection("?vendor=not-a-vendor") === null && C.readCorrection("") === null);
ok("the link format", C.correctionHref("zoom") === "/corrections?vendor=zoom#report" && C.correctionHref("<x>") === "/corrections#report");
const RP = await bundle("./ResearchedProfile.jsx");
const shared = JSON.parse(readFileSync("./src/data/research/ccaas/shared.json", "utf8"));
const bad = [];
for (const [slug, { vendorId }] of Object.entries(CCAAS_RESEARCH.complete)) {
  const file = JSON.parse(readFileSync(`./src/data/research/ccaas/vendors/${vendorId}.json`, "utf8"));
  const h = renderToString(React.createElement(RP.default, { slug, file, shared, manifestDate: "2026-09-23" }));
  if (!h.includes(`href="/corrections?vendor=${slug}#report"`) || !h.includes('href="/corrections"') || /href="\/contact">Report an error/.test(h)) bad.push(slug);
}
ok(`every researched profile links its report and the policy [${bad.join(", ")}]`, bad.length === 0);

section("4. The corrections note and the log");
const entry = { vendorId: "VEN-CC-0009", date: "2026-10-02", record: "CLM-CC-000472", changed: "Zoom Contact Center's buyer segments restated from the current product page.", source: "https://example.com/zoom-contact-center" };
const note = text(renderToString(React.createElement(RP.CorrectionsNote, { vendorId: "VEN-CC-0009", slug: "zoom", log: [entry] })));
ok("an accepted correction shows its date, what changed and a source", note.includes("Corrections to this page") && note.includes("2 October 2026") && note.includes(entry.changed));
ok("its source opens safely", /href="https:\/\/example\.com\/zoom-contact-center" target="_blank" rel="noopener noreferrer"/.test(renderToString(React.createElement(RP.CorrectionsNote, { vendorId: "VEN-CC-0009", slug: "zoom", log: [entry] }))));
ok("with none, the note says so", text(renderToString(React.createElement(RP.CorrectionsNote, { vendorId: "VEN-CC-0009", slug: "zoom", log: [] }))).includes("No correction has been made to this page"));
ok("another vendor's correction does not show", !text(renderToString(React.createElement(RP.CorrectionsNote, { vendorId: "VEN-CC-0001", slug: "nice-cxone", log: [entry] }))).includes(entry.changed));
ok("a well formed entry is accepted", C.validCorrection(entry, ids));
for (const [why, e] of [["http source", { ...entry, source: "http://example.com" }], ["markup in the source", { ...entry, source: 'https://x.com/"><script>' }], ["bad date", { ...entry, date: "2 Oct" }], ["unknown vendor", { ...entry, vendorId: "VEN-CC-9999" }], ["bad record id", { ...entry, record: "anything" }], ["empty change", { ...entry, changed: "" }]])
  ok(`a malformed entry is refused: ${why}`, !C.validCorrection(e, ids));

section("5. Route and discovery");
const APP = readFileSync("./App.jsx", "utf8");
ok("route mounted", /<Route path="\/corrections" element=\{<Corrections \/>\} \/>/.test(APP));
const { resolveSeo } = await import("./src/lib/seo.js");
ok("indexable with its own title", resolveSeo("/corrections").known === true && /How Corrections Work/.test(resolveSeo("/corrections").title));
ok("in the sitemap", readFileSync("./public/sitemap.xml", "utf8").includes("https://www.contactcentercx.com/corrections<"));
ok("linked from the site footer", /\["Corrections", "\/corrections"\]/.test(readFileSync("./src/lib/Shell.jsx", "utf8")));
ok("no dash", !/[\u2013\u2014]/.test(SRC + readFileSync("./src/lib/research/corrections.js", "utf8")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
