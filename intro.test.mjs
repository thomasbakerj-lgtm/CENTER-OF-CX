// intro.test.mjs
//
// Vendor introductions (TB, S24: wherever a vendor appears, the reader can ask for an introduction; lead generation).
// Proves the link carries only a known profile slug or a plain short name, every vendor surface offers one, the
// contact form receives it, the event carries only closed values, and no introduction changes an order or a score.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/", href: "https://www.contactcentercx.com/", hash: "", origin: "https://www.contactcentercx.com" };
globalThis.window = { location: loc, scrollTo() {}, addEventListener() {}, removeEventListener() {}, history: { replaceState() {} },
  matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }) };
globalThis.document = { title: "", head: { appendChild() {} }, createElement: () => ({ setAttribute() {}, style: {} }),
  querySelector: () => null, getElementById: () => null, addEventListener() {} };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "node" }, configurable: true });

const { introHref, readIntro, INTRO_TOPIC } = await import("./src/lib/intro.js");
const SEO = await import("./src/lib/seo.js");
const read = (f) => readFileSync("./" + f, "utf8");

section("1. The link carries a known profile or a plain short name, nothing else");
{
  const sitemap = read("public/sitemap.xml");
  const slugs = [...sitemap.matchAll(/\/vendors\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]).filter((s) => SEO.isVendorSlug(s));
  ok(`every vendor profile in the sitemap is a known slug (${slugs.length})`, slugs.length >= 280);
  const bad = slugs.filter((s) => { const r = readIntro(introHref({ slug: s, from: "vendor" }).slice("/contact".length)); return !r || r.slug !== s || r.name !== SEO.vendorDisplayName(s) || r.from !== "vendor"; });
  ok(`every profile slug round-trips with its display name [${bad.slice(0, 3).join(", ")}]`, bad.length === 0);
  ok("an unknown slug opens a plain contact form", introHref({ slug: "not-a-vendor" }) === "/contact" && readIntro("?intro=not-a-vendor") === null);
  const hostile = ["<script>alert(1)</script>", "Acme\" onmouseover=\"x", "x".repeat(61), "Acme\nCC: someone", "Acme " + String.fromCharCode(0x2014) + " CX", "", "   "];
  ok("a hostile or oversized name is dropped both ways", hostile.every((n) => introHref({ name: n }) === "/contact" && readIntro("?vendor=" + encodeURIComponent(n)) === null));
  const typed = readIntro("?vendor=" + encodeURIComponent("Acme CX & Co.") + "&from=rfp-builder");
  ok("a typed vendor name travels as text with no slug", typed && typed.slug === null && typed.name === "Acme CX & Co." && typed.from === "rfp-builder");
  ok("a bad from is dropped, the introduction kept", readIntro("?intro=five9&from=" + encodeURIComponent("../x")).from === null);
  ok("a profile slug wins over a name in the same link", readIntro("?intro=five9&vendor=Other").slug === "five9");
}

section("2. Every vendor surface offers an introduction");
{
  const VP = read("VendorProfile.jsx");
  const heads = (VP.match(/<h1 [^\n]*>\{\w+\.\w+\}<\/h1>/g) || []).length;
  const intros = (VP.match(/<VendorIntro slug=\{slug\} name=\{\w+\.\w+\} from="vendor" surface="vendor" \/>/g) || []).length;
  ok(`every profile variant carries the button under its name (${intros} of ${heads})`, heads === 8 && intros === heads);
  const VM = read("VendorMatchEngine.jsx");
  ok("Vendor Match: top matches and the rest of the list each carry one", /isTop&&\(<>[\s\S]*<VendorIntro slug=\{v\.slug\}/.test(VM) && /!isTop&&\(<div[^\n]*<VendorIntro slug=\{v\.slug\}/.test(VM));
  ok("Vendor Match: the introduction card names the top match", /href=\{introHref\(\{slug:results\[0\]\.slug,from:TOOL_ID\}\)\}/.test(VM));
  ok("RFP Builder: each named vendor carries one", /<VendorIntro name=\{v\.name\} from=\{TOOL_ID\}/.test(read("RFPRequirementBuilder.jsx")));
  ok("CCaaS category: all three vendor lists carry one", (read("CCaaSCategory.jsx").match(/<VendorIntroLink slug=\{v\.slug\}/g) || []).length === 3);
  ok("the other categories' directory carries one", /<VendorIntroLink slug=\{v\.slug\}/.test(read("src/lib/Phase1Directory.jsx")));
  ok("category by industry pages carry one", /<VendorIntroLink slug=\{v\.slug\}/.test(read("CategoryVerticalPage.jsx")));
}

section("3. The contact form receives it");
{
  const C = read("Contact.jsx");
  ok("the form reads the introduction after first paint", /useEffect\(\(\) => \{ try \{ setIntro\(readIntro\(window\.location\.search\)\)/.test(C));
  ok("the vendor, profile and origin travel as named fields", /name="intro_vendor"/.test(C) && /name="intro_profile"/.test(C) && /name="intro_from"/.test(C));
  ok("the topic list offers the introduction and preselects it", C.includes("<option value={INTRO_TOPIC}>") && /defaultValue=\{intro \? INTRO_TOPIC : ""\}/.test(C) && INTRO_TOPIC === "Vendor introduction");
  ok("the email subject names the introduction", /name="_subject" value=\{intro \? `Vendor introduction request: \$\{intro\.name\}`/.test(C));
  ok("a sent introduction fires intro_submit", /if \(intro\) trackVendor\.introSent\(intro\.slug \|\| undefined\)/.test(C));
  ok("no introduction value reaches an HTML sink", !/dangerouslySetInnerHTML/.test(C + read("src/lib/VendorIntro.jsx") + read("src/lib/intro.js")));
}

section("4. An introduction never moves a vendor");
{
  const VM = read("VendorMatchEngine.jsx");
  const engine = VM.slice(VM.indexOf("const getResults"), VM.indexOf("const handleResults"));
  ok("Vendor Match's ranking reads no introduction", engine.length > 200 && !/intro/i.test(engine));
  ok("the introduction helpers read no score, rank or research", !/score|rank|tier|research/i.test(read("src/lib/intro.js").replace(/^\/\/.*$/gm, "")));
}

section("5. Rendered: Vendor Match offers every listed vendor an introduction");
{
  const r = await build({ entryPoints: ["./VendorMatchEngine.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
    jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
    plugins: [{ name: "report-stub", setup(b) {
      b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "stub", namespace: "stub" }));
      b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export default function R() { return null; }", loader: "jsx" }));
    } }] });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  const { encodeScenario } = await import("./src/lib/scenarioUrl.js");
  loc.search = "?s=" + encodeScenario("vendor-match", mod.exports.SAMPLE, mod.exports.DEFAULTS);
  const React = require("react"); const { renderToString } = require("react-dom/server");
  const html = renderToString(React.createElement(mod.exports.default));
  const links = (html.match(/href="\/contact\?intro=[a-z0-9-]+&amp;from=vendor-match"/g) || []).length;
  ok(`each of the 24 listed vendors links an introduction, plus the card (${links})`, links === 25);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
