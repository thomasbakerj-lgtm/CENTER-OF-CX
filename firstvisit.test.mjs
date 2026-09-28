// firstvisit.test.mjs
//
// The first visit (TB, S24, 28 Sep: "ensure the first visit is one that builds trust, allows it to be shared, used and
// revisited"). Proves five things a first-time reader meets:
//   1. A tool that opens with no capacity action chosen shows an open choice, never a High warning or a red border.
//   2. No page hides its content until it is scrolled to (a served page, a print and a fast scroll showed empty bands).
//   3. Content pages carry a Share action that shares the page's own address and nothing typed.
//   4. About states facts a reader can check, each count derived from its registry, with no verdict or scoring claim.
//   5. Subscribe asks for an email address only and says what arrives, how often and how to stop.
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, extra); } };
const section = (t) => console.log("\n" + t);
const read = (f) => readFileSync("./" + f, "utf8");

globalThis.window = { location: { search: "", pathname: "/about", hash: "", origin: "https://www.contactcentercx.com" }, scrollTo() {}, addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }) };
globalThis.document = { title: "", head: { appendChild() {} }, createElement: () => ({ setAttribute() {}, style: {} }), querySelector: () => null, getElementById: () => null, addEventListener() {} };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;

async function render(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  const React = require("react"); const { renderToString } = require("react-dom/server");
  return { mod: mod.exports, html: renderToString(React.createElement(mod.exports.default)) };
}
const text = (html) => html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\s+/g, " ");

section("1. An unchosen capacity action is an open choice, not a warning");
{
  const { isNoActionFlag, MECH_INITIAL } = await import("./src/lib/mech.js");
  ok("tools open with no capacity action", MECH_INITIAL === "none");
  const RAISED = {
    "CostPerContactCalculator.jsx": /flags\.push\(\{ sev: "warn", t: "(No capacity action selected[^"]*)"/,
    "ChannelShiftModel.jsx": /flags\.push\(\{ sev: "warn", t: "(No capacity action selected[^"]*)"/,
    "FCRLeakageDiagnostic.jsx": /flags\.push\("(No mechanism and in-house sourcing[^"]*)"\)/,
    "AIDeflectionRealityCheck.jsx": /flags\.push\("(No capacity action is selected[^"]*)"\)/,
  };
  for (const [f, re] of Object.entries(RAISED)) {
    const src = read(f), m = src.match(re);
    ok(`${f}: the no-action flag the engine raises is recognised`, m && isNoActionFlag(m[1]) && isNoActionFlag({ t: m[1] }));
    ok(`${f}: the page shows it as not yet known with an open-choice title`, /isNoActionFlag\(f\)\s*\?\s*<Finding key=\{i\} level="unknown" title="Your choice is still open">/.test(src));
  }
  ok("a real warning is never mistaken for the open choice", !isNoActionFlag("Net negative (-$4K/mo).") && !isNoActionFlag("Bot cost is $0.00, near-free.") && !isNoActionFlag(null) && !isNoActionFlag({}));
  ok("Cost per Contact's capacity question is no longer outlined in red while unanswered", !/FINDINGS\.high/.test(read("CostPerContactCalculator.jsx")) && /mechKey === "none" \? HOUSE\.electric : hair/.test(read("CostPerContactCalculator.jsx")));
  const AID = read("AIDeflectionRealityCheck.jsx");
  ok("AI Deflection counts issues without the open choice, unless an input is invalid", /const issueCount = R\.flags\.filter\(\(f\) => R\.hardFlag \|\| !isNoActionFlag\(f\)\)\.length;/.test(AID) && /Integrity flags\{issueCount \?/.test(AID));
}

section("2. No page hides content until it is scrolled to");
{
  const files = [...readdirSync(".").filter((f) => f.endsWith(".jsx")), ...readdirSync("./src/lib").filter((f) => f.endsWith(".jsx")).map((f) => "src/lib/" + f)];
  const hidden = files.filter((f) => /IntersectionObserver/.test(read(f)) || /opacity:\s*v\s*\?\s*1\s*:\s*0/.test(read(f)));
  ok(`no page reveals on scroll (${files.length} files) [${hidden.join(", ")}]`, hidden.length === 0);
}

section("3. Content pages can be shared");
{
  const SH = read("src/lib/Shell.jsx");
  ok("Crumbs carries Share by default", /export function Crumbs\(\{ items = \[\], action = null, share = true \}\)/.test(SH) && /\{share && <ShareButton \/>\}/.test(SH));
  ok("Share opens the share sheet on touch devices and copies the link elsewhere", /navigator\.share\(\{ title: document\.title, url \}\)/.test(SH) && /navigator\.clipboard\.writeText\(url\)/.test(SH) && /pointer: coarse/.test(SH));
  ok("Share uses the path and view hash only", /const url = origin \+ pathname \+ hash;/.test(SH) && !/location\.search/.test(SH));
  ok("a cancelled share sheet records nothing", /if \(e && e\.name === "AbortError"\) return;/.test(SH));
  ok("the result is announced", /role="status"/.test(SH.slice(SH.indexOf("function ShareButton"), SH.indexOf("export function Crumbs"))));
  const users = ["CCaaSCategory.jsx", "CCaaSIndustry.jsx", "Industries.jsx", "MarketWatch.jsx", "Research.jsx", "ResearchedProfile.jsx", "RubricPage.jsx", "src/lib/IndustryPage.jsx", "src/lib/SubVerticalPage.jsx", "About.jsx"];
  ok("method, research, industry, Market Watch and About pages use Crumbs with Share on", users.every((f) => /<Crumbs /.test(read(f)) && !/<Crumbs[^>]*share=\{false\}/.test(read(f))));
}

section("4. About states facts a reader can check");
{
  const { mod, html } = await render("./About.jsx");
  const t = text(html);
  const SEO = await import("./src/lib/seo.js");
  const { CCAAS_COMPLETE_COUNT } = await import("./src/lib/researchStatus.js");
  const { METHOD_COUNT, INDUSTRY_COUNT } = await import("./src/lib/home.js");
  ok("one h1", (html.match(/<h1/g) || []).length === 1);
  ok("tool, method, profile, category, researched, industry and segment counts come from their registries",
    mod.OFFER[0].n === SEO.TOOL_COUNT && mod.OFFER[1].n === SEO.VENDOR_PROFILE_COUNT && mod.OFFER[2].n === INDUSTRY_COUNT
    && t.includes(`${METHOD_COUNT} in all`) && t.includes(`${SEO.CATEGORY_COUNT} technology categories`) && t.includes(`${CCAAS_COMPLETE_COUNT} contact center platforms`) && t.includes(`${SEO.SEGMENT_COUNT} segments`));
  const src = read("About.jsx");
  ok("no digit is typed into About's copy", !/(?:text|title|desc):\s*"[^"]*\d/.test(src) && !/>[^<{]*\d[^<{]*</.test(src.replace(/\/\/.*$/gm, "")));
  ok("no verdict, scoring or superlative claim", !/we'll say so|genuinely better|scor(e|ed|ing) (vendors|platforms)|best|leading|world-class|operator credibility|recommend/i.test(t), (t.match(/we'll say so|genuinely better|best|leading|recommend/i) || [""])[0]);
  ok("independence, method, corrections and privacy are each linked", ["/corrections", "/privacy", "/methodology/cost-per-contact", "/methodology/staffing-calculator", "/contact", "/subscribe"].every((h) => html.includes(`href="${h}"`)));
  const linked = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]).filter((h) => h !== "/");
  const sitemap = read("public/sitemap.xml");
  ok("every internal link on About is in the sitemap", linked.every((h) => sitemap.includes(`contactcentercx.com${h}</loc>`)), linked.filter((h) => !sitemap.includes(`contactcentercx.com${h}</loc>`)).join(", "));
  const fixed = read("src/lib/Shell.jsx").match(/const FIXED_EXACT = new Set\(\[([^\]]*)\]/)[1];
  ok("About and Subscribe have the header in the flow", !fixed.includes('"/about"') && !fixed.includes('"/subscribe"'));
  ok("the metadata describes the page", /"\/about": \{\s*title: `About \| \$\{SITE\}`/.test(read("src/lib/seo.js")));
  ok("no dash in About", !/[\u2013\u2014]/.test(src));
}

section("5. Subscribe asks for an address and says what arrives");
{
  const { mod, html } = await render("./Subscribe.jsx");
  const t = text(html);
  const inputs = [...html.matchAll(/<input[^>]*>/g)].map((m) => m[0]).filter((i) => !/type="hidden"/.test(i));
  ok("one visible field, the email address, labelled", inputs.length === 1 && /type="email"/.test(inputs[0]) && /id="sub-email"/.test(inputs[0]) && /for="sub-email"/.test(html));
  ok("says how often, at most", /At most one email a week/.test(t));
  ok("says how to stop", /Reply to any email to stop/.test(t));
  ok("lists what an email carries", mod.WHAT_ARRIVES.length >= 3 && mod.WHAT_ARRIVES.every(([k]) => t.includes(k)));
  ok("posts to the form the Privacy Policy names, whose field list says email only", /formspree\.io\/f\/xnjolywk/.test(read("Subscribe.jsx")) && /\{ what: "Newsletter sign-ups", fields: "email address", endpoint: "xnjolywk" \}/.test(read("PrivacyPolicy.jsx")));
  ok("no name or company is asked for", !/name="(first_name|last_name|company)"|>(First name|Last name|Company)</i.test(read("Subscribe.jsx")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
