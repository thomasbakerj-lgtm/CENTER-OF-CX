/* toolframe.test.mjs
 *
 * Redesign Phase 4, the tool frame (src/lib/ToolFrame.jsx). The route rail, the breadcrumb row with the method
 * stamp, the question as the one h1, the result column and the phone's pinned headline. Checks the rail against the
 * journey graph for every tool and every step an engine can choose, that the privacy line stays true against the
 * analytics allowlist, and that the frame computes nothing and carries no colour literal. journey.test.mjs F checks
 * routeFrom itself.
 *
 * Run from repo root: node toolframe.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const J = await import("./src/lib/journey.js");
const TR = await import("./src/lib/track.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);

const r = await build({ entryPoints: ["./src/lib/ToolFrame.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const F = mod.exports;
const h = (C, p) => renderToStaticMarkup(React.createElement(C, p));
const APP = readFileSync("./App.jsx", "utf8");
const live = new Set([...APP.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));
const SRC = readFileSync("./src/lib/ToolFrame.jsx", "utf8");

const base = { toolId: "cost-per-contact", section: "Cost and staffing", name: "Cost per Contact", title: "What does one contact cost you?",
  lede: "Four answers, about five minutes.", method: { version: "1.0", date: "25 Sep 2026", href: "/methodology/cost-per-contact" },
  actions: React.createElement("button", { type: "button" }, "Download report"),
  result: React.createElement("p", null, "RESULT-NODE"), pinned: { label: "Cost per contact", value: "$7.00" } };

section("1. The page");
{
  const p = h(F.ToolFrame, { ...base, children: React.createElement("div", null, "INPUTS-NODE") });
  ok("exactly one h1, and it is the question", (p.match(/<h1/g) || []).length === 1 && /<h1[^>]*>What does one contact cost you\?<\/h1>/.test(p));
  ok("the tool's inputs and result render where the tool put them", p.includes("INPUTS-NODE") && p.includes("RESULT-NODE") && p.indexOf("INPUTS-NODE") < p.indexOf("RESULT-NODE"));
  ok("the result is a named region the phone bar can jump to", new RegExp(`<section id="${F.RESULT_ID}" aria-label="Result"`).test(p) && p.includes(`href="#${F.RESULT_ID}"`));
  ok("the breadcrumb starts at Diagnostics and names the section", /aria-label="Breadcrumb"[\s\S]*href="\/how-to-choose"[^>]*>Diagnostics[\s\S]*Cost and staffing/.test(p));
  ok("the method stamp links the published method with its version and date", /href="\/methodology\/cost-per-contact"[^>]*>Method 1.0, 25 Sep 2026/.test(p) && live.has("/methodology/cost-per-contact"));
  ok("the report action sits in the breadcrumb row", p.indexOf("Download report") < p.indexOf("<h1"));
  const bare = h(F.ToolFrame, { ...base, method: null, pinned: null, lede: null, name: null });
  ok("no method, no stamp; no pinned value, no phone bar", !/Method 1\.0/.test(bare) && !/cx-tf-pin"/.test(bare) && !/See the result/.test(bare));
  ok("an empty pinned value draws no bar", !/See the result/.test(h(F.ToolFrame, { ...base, pinned: { label: "x", value: "" } })));
  ok("the phone bar shows the label and the value", /Cost per contact<\/span><span[^>]*>\$7\.00</.test(p));
  const unk = h(F.ToolFrame, { ...base, toolId: "not-a-tool" });
  ok("an unknown tool renders the frame with no rail", !/aria-label="Your route"/.test(unk) && /<h1/.test(unk));
}

section("2. The route rail");
{
  const ids = Object.keys(J.JOURNEY);
  const bad = [];
  for (const id of ids) {
    const html = h(F.RouteRail, { toolId: id });
    const steps = J.routeFrom(id);
    const hrefs = [...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]).filter((x) => x.startsWith("/tools/"));
    if (!/<aside aria-label="Your route"/.test(html)) bad.push(`${id} no aside`);
    if ((html.match(/aria-current="step"/g) || []).length !== 1) bad.push(`${id} current`);
    if (!new RegExp(`aria-current="step"[\\s\\S]*?${J.JOURNEY[id].name.replace(/[+]/g, "\\+")}`).test(html)) bad.push(`${id} current is not this tool`);
    if (hrefs.includes(J.JOURNEY[id].route)) bad.push(`${id} links to itself`);
    if (hrefs.join() !== steps.slice(1).map((s) => s.href).join()) bad.push(`${id} links differ from the route`);
    if (!hrefs.every((x) => live.has(x))) bad.push(`${id} dead link`);
    if (!html.includes(F.privacyFor(id)) || !/href="\/how-to-choose"[^>]*>Change route/.test(html)) bad.push(`${id} privacy or change route`);
  }
  ok(`every tool's rail: one current step (this tool, not a link), the rest link the route's live steps, change route and the privacy line (${ids.length} tools) [${bad.slice(0, 4).join("; ")}]`, bad.length === 0);
  let n = 0; const off = [];
  for (const id of ids) for (const e of J.nextFor(id)) {
    n++;
    const html = h(F.RouteRail, { toolId: id, choice: e.to });
    const first = [...html.matchAll(/<a href="(\/tools\/[^"]+)"/g)].map((m) => m[1])[0];
    if (first !== e.href) off.push(`${id}>${e.to}`);
  }
  ok(`the rail's next step is the step the engine chose, for every edge (${n}) [${off.slice(0, 4).join(", ")}]`, off.length === 0 && n > 40);
  ok("steps are numbered as a list, the numbers hidden from screen readers", /<ol/.test(h(F.RouteRail, { toolId: "cost-per-contact" })) && /aria-hidden="true"[^>]*>1</.test(h(F.RouteRail, { toolId: "cost-per-contact" })));
}

section("3. The privacy line stays true");
{
  // The rail says the reader's numbers stay in the tab. That holds while analytics can carry no input: the allowlist
  // is ids, grades, bands, flags, counts, landing tags and closed 1.1 vocabularies scoped to their own events.
  // A new key here must be read against the line first.
  const keys = [...TR.ALLOWED_PROP_KEYS].sort().join();
  ok("the analytics allowlist is the reviewed set (1.1 adds pillar, route, layer, surface, vendor, category, status, action, audience; 1.4 adds milestones; 1.5 adds via)", keys === "action,audience,bound_axis,category,depth,from,grade,layer,milestones,page_type,pillar,real,ref,repeat,route,severity,status,surface,to,tool,utm_campaign,utm_medium,utm_source,vendor,via,via_rail", keys);
  ok("how a page was shared rides page_shared only", !("via" in TR.scopeProps("tool_complete", { via: "copy" })) && "via" in TR.scopeProps("page_shared", { via: "copy" }));
  ok("none of the 1.1 keys can ride a tool event", ["tool_view", "tool_complete", "next_step_click"].every((e) => Object.keys(TR.scopeProps(e, { pillar: "vendors", route: "cost", layer: "l4", surface: "home", vendor: "x", category: "ccaas", status: "complete", action: "request", audience: "finance" })).length === 0));
  /* 1.4: the one entered value analytics carries is Roadmap's milestone code. It rides roadmap_snapshot only, and that
     tool's rail says exactly what is recorded; every other tool keeps the shared line. */
  ok("the milestone code rides roadmap_snapshot only", !("milestones" in TR.scopeProps("tool_complete", { milestones: "n".repeat(18) })) && "milestones" in TR.scopeProps("roadmap_snapshot", { milestones: "n".repeat(18) }));
  ok("the milestone code carries no text: only 18 letters from n, p, r, b and c pass", TR.sanitizeProps({ milestones: "npbrc".repeat(3) + "nnn" }).milestones === "npbrcnpbrcnpbrcnnn" && !("milestones" in TR.sanitizeProps({ milestones: "n".repeat(17) })) && !("milestones" in TR.sanitizeProps({ milestones: "hello world 123456" })) && !("milestones" in TR.sanitizeProps({ milestones: "n".repeat(19) })));
  ok("only Roadmap changes the privacy line, and its line names what is recorded", Object.keys(F.PRIVACY_BY_TOOL).join() === "roadmap-builder" && /status you set for each of the 18 milestones, with no text/.test(F.privacyFor("roadmap-builder")) && F.privacyFor("cost-per-contact") === F.PRIVACY);
  ok("a number passed to analytics is dropped", Object.keys(TR.sanitizeProps({ tool: "cost-per-contact", agents: 120, wage: 20.59, cpc: 7 })).join() === "tool");
}

section("4. Layout and house rules");
{
  ok("the result sticks below the site header", SRC.includes("top:${HEADER_HEIGHT + 16}px"));
  ok("three columns on a desktop, two on a laptop, one on a phone", /grid-template-columns:232px minmax\(0,1fr\) 360px/.test(SRC) && /max-width:1180px\)\{\.cx-tf\{grid-template-columns:minmax\(0,1fr\) 340px/.test(SRC) && /max-width:760px\)\{\.cx-tf\{grid-template-columns:minmax\(0,1fr\)/.test(SRC));
  ok("on a phone the question comes first and the rail follows the result", /760px[\s\S]*\.cx-tf-rail\{order:3\}/.test(SRC));
  ok("the phone bar shows only on a phone, and the page leaves room for it", /\.cx-tf-pin\{display:none\}/.test(SRC) && /760px[\s\S]*\.cx-tf-pin\{display:flex\}[\s\S]*\.cx-tf-pad\{height/.test(SRC));
  const imports = [...SRC.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]).sort().join();
  ok("the frame computes nothing: it imports only react, tokens, the shell, the journey graph, icons and the event sender", imports === "./Icon.jsx,./Shell.jsx,./journey.js,./tokens.js,./track.js,react", imports);
  /* 11-04 (29 Sep): the rail's step links are journey links, so a click on one is a next_step_click from this tool to
     that step, the same event ReportActions' next step sends. Without it the first-to-second funnel undercounted. */
  ok("every route rail link sends next_step_click from this tool to its step", /<a href=\{s\.href\} style=\{box\} onClick=\{\(\) => trackTool\.nextStep\(toolId, s\.to\)\}>/.test(SRC));
  const code = SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  ok("no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(code));
  ok("no dash characters", !new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]").test(SRC));
}

section("5. Tools on the frame (Phase 6, batches 1 to 6)");
{
  // Each migrated tool renders inside the frame: the frame owns the one h1, the route rail and the result column.
  // The engine, grading and report payload stay where the tool's harnesses slice them.
  const MOVED = { "cost-per-contact": "CostPerContactCalculator.jsx", "fcr-leakage": "FCRLeakageDiagnostic.jsx", "ai-deflection": "AIDeflectionRealityCheck.jsx", "business-case-builder": "BusinessCaseBuilder.jsx",
    "tco-calculator": "TCOCalculator.jsx", "license-gap": "LicenseBundleGapChecker.jsx", "staffing-calculator": "StaffingCalculator.jsx", "attrition-cost": "AttritionCostCalculator.jsx", "channel-shift": "ChannelShiftModel.jsx",
    "occupancy-risk": "OccupancyRiskSimulator.jsx", "shrinkage-planner": "ShrinkagePlanner.jsx", "aht-decomposition": "AHTDecomposition.jsx", "forecast-accuracy": "ForecastAccuracyTracker.jsx", "schedule-adherence": "ScheduleAdherenceCalculator.jsx",
    "cx-maturity": "CXMaturity.jsx", "ai-readiness": "AIReadiness.jsx", "transformation-readiness": "TransformationReadiness.jsx", "cx-it-alignment": "CXITAlignment.jsx", "governance-model": "GovernanceModel.jsx",
    "qa-scorecard": "QAScorecardBuilder.jsx", "platform-decision": "PlatformDecisionMatrix.jsx", "rfp-builder": "RFPRequirementBuilder.jsx", "contract-risk": "ContractRiskScanner.jsx",
    "vendor-match": "VendorMatchEngine.jsx", "roadmap-builder": "RoadmapBuilder.jsx" };
  for (const [id, file] of Object.entries(MOVED)) {
    const T = readFileSync("./" + file, "utf8");
    ok(`${id}: renders in the frame with its own id, a result and no h1 of its own`, /import \{ ToolFrame \} from "\.\/src\/lib\/ToolFrame\.jsx";/.test(T) && /<ToolFrame toolId=\{TOOL_ID\}/.test(T) && /result=\{result\}/.test(T) && !/<h1/.test(T) && J.JOURNEY[id] != null);
    ok(`${id}: the report stays on paper inside the frame`, /(background: HOUSE\.paper, color: HOUSE\.paperInk|<Paper>)[\s\S]*<ReportActions[\s\S]*<\/ToolFrame>/.test(T));
    ok(`${id}: no scored vendor claim`, !/scored IVA vendors|\d+ scored/.test(T));
  }
}

{
  // Phase 6 is complete: every tool route renders in the frame and the old shell is gone.
  const routes = [...readFileSync("./App.jsx", "utf8").matchAll(/<Route\s+path="\/tools\/([a-z0-9-]+)"\s+element=\{<(\w+) \/>\}/g)];
  const files = readdirSync(".").filter((f) => f.endsWith(".jsx"));
  const onFrame = routes.filter(([, , comp]) => files.some((f) => f === comp + ".jsx" && /<ToolFrame toolId=\{TOOL_ID\}/.test(readFileSync("./" + f, "utf8"))));
  ok(`every tool route renders in the frame (${onFrame.length} of ${routes.length})`, routes.length >= 25 && onFrame.length === routes.length);
  ok("ToolShell is retired: the file is gone and nothing imports it", !existsSync("./src/lib/ToolShell.jsx") && !files.some((f) => /ToolShell/.test(readFileSync("./" + f, "utf8"))));
}

section("6. The frame kit");
{
  const KIT = readFileSync("./src/lib/frameKit.jsx", "utf8");
  const code = KIT.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  ok("the kit is tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(code));
  ok("the kit computes nothing: it imports only tokens, type, the components and the guard sentence", [...KIT.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]).sort().join() === "./guards.js,./tokens.js,./type.js,./ui.jsx");
  ok("a kit field hands the tool Number(value), the contract the tools' own inputs had", /onChange\(Number\(e\.target\.value\)\)/.test(KIT));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
