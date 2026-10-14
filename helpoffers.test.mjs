// helpoffers.test.mjs
//
// Help offers at five moments (open item 11, TB 14 Oct 2026). Proves: each offer fires exactly on its tool's own
// result and never on an opening state; the five ids are one list in the rules, the tracker and the docs; the offer
// links carry only a known id; the contact form reads the offer, chooses its topic and sends its id; every tool places
// the offer after its own work and before the report; the copy names no vendor, carries no figure of its own and no
// dash; the events carry the tool and the offer id only. Run: node helpoffers.test.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { OFFERS, OFFER_IDS, HELP_TOPICS, HELP_SHARED, offerFor, helpHref, readHelp } from "./src/lib/helpOffers.js";

const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) passed++; else { failed++; console.log("FAIL " + name); } };
const section = (t) => console.log("\n--- " + t);
const DASH = [String.fromCharCode(0x2014), String.fromCharCode(0x2013)];

const TOOLS = {
  "contract-risk": "ContractRiskScanner.jsx", "platform-decision": "PlatformDecisionMatrix.jsx", "rfp-builder": "RFPRequirementBuilder.jsx",
  "ai-deflection": "AIDeflectionRealityCheck.jsx", "license-gap": "LicenseBundleGapChecker.jsx",
};

section("1. Each offer fires exactly on its own result");
ok("five offers, one per tool", OFFER_IDS.length === 5 && new Set(OFFER_IDS.map((i) => OFFERS[i].tool)).size === 5 && OFFER_IDS.every((i) => TOOLS[OFFERS[i].tool]));
ok("contract review on Do not sign as written", offerFor("contract-risk", { reading: "doNotSign" }) === "contract-review");
ok("contract review on Negotiate before signing", offerFor("contract-risk", { reading: "negotiate" }) === "contract-review");
ok("no contract offer on find, notes, clear or no reading", ["find", "notes", "clear", null, undefined].every((r) => offerFor("contract-risk", { reading: r }) === null));
ok("renewal evaluation only when the gate is Run an evaluation", offerFor("platform-decision", { gate: "evaluate" }) === "renewal-evaluation" && ["renew", "conditions", null].every((g) => offerFor("platform-decision", { gate: g }) === null));
ok("RFP evaluation from two vendors' responses", offerFor("rfp-builder", { vendors: 2 }) === "rfp-evaluation" && offerFor("rfp-builder", { vendors: 6 }) === "rfp-evaluation");
ok("no RFP offer with none or one vendor, or a non-count", [0, 1, 1.5, NaN, "3", null].every((v) => offerFor("rfp-builder", { vendors: v }) === null));
ok("AI pilot only on Run a bounded pilot", offerFor("ai-deflection", { verdict: "Run a bounded pilot" }) === "ai-pilot"
  && ["Proceed, with a contracted floor", "Buy nothing, as scoped", "Fix the foundation first", "Choose a capacity action first", "Fix the economics or renegotiate", null].every((v) => offerFor("ai-deflection", { verdict: v }) === null));
ok("license review on the reader's own entries above the quote", offerFor("license-gap", { real: true, voided: false, hiddenAnnual: 1 }) === "license-review");
ok("no license offer at the defaults, on a void, at zero or on a non-finite figure",
  [{ real: false, voided: false, hiddenAnnual: 5e4 }, { real: true, voided: true, hiddenAnnual: 5e4 }, { real: true, voided: false, hiddenAnnual: 0 },
    { real: true, voided: false, hiddenAnnual: Infinity }, { real: true, voided: false, hiddenAnnual: NaN }, { real: true, hiddenAnnual: 5e4 }].every((f) => offerFor("license-gap", f) === null));
ok("an unknown tool gets no offer", offerFor("staffing-calculator", { reading: "doNotSign", gate: "evaluate", vendors: 5 }) === null && offerFor("__proto__", {}) === null);
{
  /* The rules read the engines' own words: every reading, gate and verdict the rules name exists in the tool. */
  const CR = readFileSync("./src/lib/rubrics/contractRisk.js", "utf8"), PD = readFileSync("./src/lib/rubrics/platformDecision.js", "utf8"), AID = readFileSync("./AIDeflectionRealityCheck.jsx", "utf8");
  ok("the contract readings named are the model's", /id: "doNotSign"/.test(CR) && /id: "negotiate"/.test(CR));
  ok("the renewal gate named is the model's", /id: "evaluate", label: "Run an evaluation"/.test(PD));
  ok("the AI verdict named is the engine's", /verdict = "Run a bounded pilot";/.test(AID));
}

section("2. One list of ids, in the rules, the tracker and the docs");
const T = await import("./src/lib/track.js");
ok("the tracker's ids equal the rules' ids", JSON.stringify([...T.HELP_OFFER_IDS].sort()) === JSON.stringify([...OFFER_IDS].sort()));
const DOC = readFileSync("./docs/MEASUREMENT.md", "utf8");
ok("the docs name every id and both events", OFFER_IDS.every((i) => DOC.includes("`" + i + "`")) && DOC.includes("`help_offer_view`") && DOC.includes("`help_offer_click`"));
{
  const CTX = { key: "phc_harness", distinctId: "abc123def456", sessionId: "s0s0s0", path: "/tools/ai-deflection", now: "2026-10-14T00:00:00.000Z" };
  const p = T.buildPayload(T.EV.HELP_CLICK, { tool: "ai-deflection", offer: "ai-pilot", net: 13067, verdict: "Run a bounded pilot", email: "a@b.co" }, CTX).properties;
  ok("a help event carries the tool and the offer and nothing else from the page", p.tool === "ai-deflection" && p.offer === "ai-pilot" && !("net" in p) && !("verdict" in p) && !JSON.stringify(p).includes("a@b.co"));
  ok("an unknown offer id is dropped", !("offer" in T.buildPayload(T.EV.HELP_VIEW, { tool: "ai-deflection", offer: "free-money" }, CTX).properties));
  ok("offer never rides another event", !("offer" in T.buildPayload(T.EV.TOOL_COMPLETE, { tool: "ai-deflection", offer: "ai-pilot" }, CTX).properties));
}

section("3. Links carry a known id only, and the form reads them");
for (const id of OFFER_IDS) {
  const h = helpHref(id, OFFERS[id].tool), r = readHelp(h.slice(h.indexOf("?")));
  ok(`${id} round-trips with its tool`, h === `/contact?help=${id}&from=${OFFERS[id].tool}` && r && r.id === id && r.from === OFFERS[id].tool && r.topic === OFFERS[id].topic);
}
ok("hostile ids open the plain form", ["__proto__", "constructor", "toString", "<script>", "", "contract-review%00"].every((x) => readHelp("?help=" + encodeURIComponent(x)) === null) && helpHref("__proto__") === "/contact");
ok("a hostile from is dropped", readHelp("?help=ai-pilot&from=" + encodeURIComponent("<b>x</b>")).from === null && !helpHref("ai-pilot", "a b").includes("from"));
{
  const C = readFileSync("./Contact.jsx", "utf8");
  ok("the contact form reads the offer after first paint", /useEffect\(\(\) => \{ try \{ setHelpReq\(readHelp\(window\.location\.search\)\)/.test(C));
  ok("an introduction wins over a help offer", /const help = intro \? null : helpReq;/.test(C));
  ok("the form chooses the offer's topic, and every topic is an option", /defaultValue=\{intro \? INTRO_TOPIC : help \? help\.topic : ""\}/.test(C)
    && HELP_TOPICS.every((t) => t === "Platform selection" ? C.includes('<option value="Platform selection">') : true) && /HELP_TOPICS\.filter\(\(t\) => t !== "Platform selection"\)\.map/.test(C));
  ok("the form sends the offer id and the tool, never anything the tool held", /name="help_offer" value=\{help\.id\}/.test(C) && /name="help_from" value=\{help\.from\}/.test(C));
  ok("the privacy policy names the offer fields", /which offer and which tool/.test(readFileSync("./PrivacyPolicy.jsx", "utf8")));
}

section("4. Each tool places its offer after its own work and before the report");
for (const [tool, file] of Object.entries(TOOLS)) {
  const s = readFileSync("./" + file, "utf8");
  ok(`${file} imports the offer and its rules`, s.includes('import HelpOffer from "./src/lib/HelpOffer.jsx";') && s.includes('import { offerFor } from "./src/lib/helpOffers.js";'));
  ok(`${file} asks the rules with its own id`, /const helpId = offerFor\(TOOL_ID, \{/.test(s) && new RegExp(`const TOOL_ID = "${tool}";`).test(s));
  const at = s.indexOf("<HelpOffer id={helpId} tool={TOOL_ID}"), rep = s.indexOf("<ReportActions");
  ok(`${file} renders one offer, before the report`, at > 0 && at < rep && s.split("<HelpOffer ").length === 2);
}

section("5. The copy: no vendor, no figure of its own, no dash, no sales words");
{
  const seo = await import("./src/lib/seo.js");
  const names = Object.keys(seo.VENDOR_FAMILIES).map((s) => seo.vendorDisplayName(s)).filter((n) => n && n.length > 3);
  const text = [HELP_SHARED, ...OFFER_IDS.flatMap((i) => [OFFERS[i].title, OFFERS[i].body, OFFERS[i].topic, OFFERS[i].prompt, OFFERS[i].when])].join(" \n ");
  const C = readFileSync("./src/lib/HelpOffer.jsx", "utf8");
  ok("no vendor name in any offer", !names.some((n) => new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(text)));
  ok("no figure in the offer copy (facts come from the tool's own result)", !/\d/.test(text));
  ok("no dash in the rules, the component or the doc section", DASH.every((d) => !text.includes(d) && !C.includes(d) && !readFileSync("./src/lib/helpOffers.js", "utf8").includes(d)));
  ok("no sales words", !/\b(guarantee|best|leading|expert(s)? will|free trial|limited|act now|don't miss)\b/i.test(text));
  ok("the cost of asking is stated: matching free, scope and price with the consultant, nothing sent until the form", /Matching is free/.test(HELP_SHARED) && /scope and price/.test(HELP_SHARED) && /until you send the form/.test(HELP_SHARED));
  ok("the button is secondary, so the tool's own next step stays the lead", /<Button kind="secondary"/.test(C));
  ok("one view event per offer per page view", /useEffect\(\(\) => \{ if \(o\) trackHelp\.view\(tool, id\); \}, \[id, tool\]\);/.test(C));
}

section("6. No offer on an opening state; offers on the samples that call for them");
{
  const loc = { search: "", pathname: "/", href: "https://www.contactcentercx.com/", hash: "", origin: "https://www.contactcentercx.com" };
  globalThis.window = { location: loc, scrollTo() {}, addEventListener() {}, removeEventListener() {}, history: { replaceState() {} }, matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }) };
  globalThis.document = { title: "", head: { appendChild() {} }, createElement: () => ({ setAttribute() {}, style: {} }), querySelector: () => null, getElementById: () => null, addEventListener() {} };
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.sessionStorage = globalThis.localStorage;
  const React = require("react");
  const { renderToString } = require("react-dom/server");
  const load = async (file) => {
    const r = await build({ entryPoints: ["./" + file], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
    const mod = { exports: {} };
    new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
    return mod.exports;
  };
  const html = (mod, route, search = "") => { loc.search = search; loc.pathname = route; loc.href = loc.origin + route + search; return renderToString(React.createElement(mod.default)); };
  for (const [tool, file] of Object.entries(TOOLS)) {
    const mod = await load(file);
    const route = "/tools/" + (readFileSync("./" + file, "utf8").match(/const ROUTE\s*=\s*"\/tools\/([^"]+)"/) || [])[1];
    ok(`${file} opens with no help offer`, !html(mod, route).includes("data-help-offer"));
    if (mod.SAMPLE && mod.DEFAULTS) {
      const h = html(mod, route, "?s=" + encodeScenario(tool, mod.SAMPLE, mod.DEFAULTS));
      const want = tool === "contract-risk" ? "contract-review" : null;
      if (want) ok(`${file} sample (a critical clause) shows ${want}`, h.includes(`data-help-offer="${want}"`));
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
