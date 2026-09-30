/* export.test.mjs
 *
 * The report renderer (ReportExport.jsx, reportHtml). The report opens as a same-origin
 * window built from HTML, and its sections carry text a user or a scenario link can set:
 * criterion names, roadmap items, RFP lines. Every one of those strings must render as
 * text. Each section type and every cover field is attacked with markup, and every
 * interpolation in the renderer must pass through the escape or be a fixed value.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { READER_BRIEFS, READ_NO_GRADE, briefFor } from "./src/lib/readerBriefs.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const r = await build({ entryPoints: ["./ReportExport.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { reportHtml } = mod.exports;

section("0. The renderer is a pure function");
ok("reportHtml is exported", typeof reportHtml === "function");

const X = `<img src=x onerror="alert(1)"><script>alert(2)</script>' & "`;
const sections = [
  { title: X, type: "table", rows: [[X, X]] },
  { title: X, type: "metrics", items: [{ label: X, value: X, sub: X, color: `red" onmouseover="alert(3)` }] },
  { title: X, type: "findings", items: [X] },
  { title: X, type: "actions", items: [{ action: X, detail: X, priority: "high" }] },
  { title: X, type: "next", items: [{ tool: X, reason: X, href: `/tools/x" onclick="alert(4)` }, { tool: X, reason: X }] },
  { title: X, type: "text", content: X },
];
const html = reportHtml({ toolName: X, subtitle: X, reportName: X, company: X, logo: `data:image/png;base64,AA" onerror="alert(5)`, today: X, sections, origin: "https://www.contactcentercx.com" });

section("1. Markup in any field renders as text");
ok("no script tag survives", !/<script>alert/i.test(html));
ok("no injected image survives", !/<img src=x/i.test(html));
ok("no injected event handler survives as an attribute", !/\son\w+="alert/i.test(html));
ok("the only image is the logo, with its source escaped", (html.match(/<img /g) || []).length === 1 && /<img src="data:image\/png;base64,AA&quot; onerror=&quot;alert\(5\)"/.test(html));
ok("the payload appears escaped in every field", (html.match(/&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/g) || []).length >= 20);
ok("an ampersand renders once escaped", html.includes("&#39; &amp; &quot;") && !html.includes("&amp;amp;"));
ok("a next-step link keeps its escaped href", /href="https:\/\/www\.contactcentercx\.com\/tools\/x&quot; onclick=&quot;alert\(4\)"/.test(html));

section("2. Ordinary text is unchanged");
const plain = reportHtml({ toolName: "QA Scorecard", subtitle: "General Inbound", today: "September 24, 2026", sections: [{ title: "Findings", type: "findings", items: ["Weights total 100%."] }, { title: "Next Steps", type: "next", items: [{ tool: "FCR Leakage", reason: "Test outcomes.", href: "/tools/fcr-leakage" }] }] });
ok("the title, a finding and a link render as written", plain.includes("<h1>QA Scorecard</h1>") && plain.includes("<span>Weights total 100%.</span>") && plain.includes('href="/tools/fcr-leakage"'));

section("3. Every interpolation is escaped or fixed");
const SRC = readFileSync("./ReportExport.jsx", "utf8");
const body = SRC.slice(SRC.indexOf("export function reportHtml"), SRC.indexOf("export default function ReportExport"));
/* Every ${...} at every depth. A hole that holds a nested template is composite: its own
   holes are collected and checked in turn. Any other hole must be e(...) or a fixed value:
   a palette constant, a number the renderer computes, or a block built in this file from
   escaped parts (whose own holes are checked here too). */
const FIXED_SET = new Set([
  'a.priority === "high" ? "high" : a.priority === "medium" ? "medium" : ""',
  `a.priority === "high" ? '<span class="priority high">High priority</span>' : a.priority === "medium" ? '<span class="priority medium">Medium priority</span>' : ""`,
  `url ? ' <span class="next-arrow">&rarr;</span>' : ""`,
  "INK", "LINK", "RULE", "QUIET", "PANEL", "LABEL", "HIGH", "SLATE", "NAVY",
  "cols", "fi + 1", "sizeOf(m.value)", "inner", "fontSrc", "fontFaces", "markSvg", "howBlock",
  "evidenceMark(how.axes || {})", "qi + 1", 'plan.lead.map((s) => renderSection(s)).join("\\n")', 'plan.appendix.map((s) => renderSection(s)).join("\\n")',
  "r", "color", "ARCS_PRINT.track", "ARCS_PRINT.na", "arc.toFixed(2)", "c.toFixed(2)", "(arc * f).toFixed(2)",
  "ring(56, axes.evidence, ARCS_PRINT.evidence)", "ring(42, axes.realization, ARCS_PRINT.realization)", "ring(28, axes.completeness, ARCS_PRINT.completeness)",
]);
const FIXED = { test: (h) => FIXED_SET.has(h) };
const holes = [], stack = [];
for (let i = 0; i < body.length; i++) {
  if (body[i] === "$" && body[i + 1] === "{") { stack.push({ start: i + 2, depth: 1 }); i++; continue; }
  if (!stack.length) continue;
  const top = stack[stack.length - 1];
  if (body[i] === "{") top.depth++;
  else if (body[i] === "}") { top.depth--; if (top.depth === 0) { holes.push(body.slice(top.start, i)); stack.pop(); } }
}
const leaf = holes.filter((h) => !/^e\(/.test(h) && !FIXED.test(h) && !h.includes("`"));
ok(`every one of ${holes.length} interpolations is escaped or fixed${leaf.length ? " (" + leaf.join(" | ") + ")" : ""}`, leaf.length === 0 && holes.length > 30);
ok("the popup builds its document from reportHtml only", /const html = reportHtml\(/.test(SRC) && (SRC.match(/document\.write\(/g) || []).length === 1);

section("4. The light report (redesign Phase 3)");
{
  const { AUDIENCES, orderSections } = mod.exports;
  const T = await import("./src/lib/tokens.js");
  const S = [
    { title: "Inputs", type: "table", rows: [["Agents", "40"]] },
    { title: "Confidence", type: "findings", items: ["Headline: Directional."] },
    { title: "Result", type: "metrics", items: [{ label: "Cost per contact", value: "$6.78", color: "#00AAFF" }] },
    { title: "Findings", type: "findings", items: ["People are 82% of cost."] },
    { title: "Actions", type: "actions", items: [{ action: "Attest the invoice", detail: "Lifts evidence.", priority: "high" }] },
    { title: "Method", type: "text", content: "Loaded wage times handle time." },
    { title: "Next step", type: "next", items: [{ tool: "FCR Leakage", reason: "What repeats add.", href: "/tools/fcr-leakage" }] },
  ];
  ok("five readers: finance, operations, IT, executive, advisor", AUDIENCES.map((a) => a.id).join() === "finance,operations,it,executive,advisor");
  for (const a of AUDIENCES) {
    const o = orderSections(S, a.id);
    ok(`${a.id}: every section kept once, none altered`, o.length === S.length && S.every((x) => o.filter((y) => y === x).length === 1));
    const h = reportHtml({ toolName: "Cost per Contact", today: "26 September 2026", sections: S, audience: a.id });
    ok(`${a.id}: the cover says who it is written for`, h.includes(`Written for<strong>${a.title}</strong>`) && h.includes(READ_NO_GRADE[a.id]));
    const hg = reportHtml({ toolName: "Cost per Contact", today: "26 September 2026", sections: S, audience: a.id, how: { grade: "Directional", axes: {} } });
    ok(`${a.id}: with grades, the cover keeps the graded reading line`, hg.includes(a.read));
    ok(`${a.id}: every figure prints exactly once`, (h.match(/\$6\.78/g) || []).length === 1 && (h.match(/>40</g) || []).length === 1);
  }
  ok("advisor keeps the tool's order", orderSections(S, "advisor").every((x, i) => x === S[i]));
  ok("finance reads the result, then how sure, then the inputs", orderSections(S, "finance").slice(0, 3).map((x) => x.title).join() === "Result,Confidence,Inputs");
  ok("executive puts the next step third", orderSections(S, "executive")[2].title === "Next step");
  ok("an unknown reader falls back to the tool's order", orderSections(S, "__proto__").every((x, i) => x === S[i]));
  const base = reportHtml({ toolName: "t", today: "d", sections: S, origin: "https://www.contactcentercx.com" });
  ok("no metric colour is printed: colour never marks a figure", !base.includes("#00AAFF") && !/metric-value[^>]*style=/.test(base));
  ok("fonts come from the site, not a font host", !/googleapis|gstatic/.test(base) && base.includes("url(https://www.contactcentercx.com/fonts/plex-sans-400.woff2)"));
  ok("the report policy allows only the site's fonts", /font-src 'self' https:\/\/www\.contactcentercx\.com;/.test(base) && /script-src 'none'/.test(base));
  const hostileOrigin = reportHtml({ toolName: "t", today: "d", sections: [], origin: `x" onload="alert(1)` });
  ok("a hostile origin cannot break out of the policy or a font rule", !/onload="alert/.test(hostileOrigin));
  ok("the paper palette comes from the tokens", base.includes(T.HOUSE.paperInk) && base.includes(T.PILLARS.diagnostics.onLight) && base.includes(T.FINDINGS.high.print));
  ok("a high priority action prints its word beside the colour", base.includes('<span class="priority high">High priority</span>'));
  ok("the footer states how figures are made", base.includes("Every figure is computed from the inputs listed, under the assumptions stated."));
  ok("no dash in the report", ![String.fromCharCode(0x2013), String.fromCharCode(0x2014)].some((d) => base.includes(d)));

  const mark = (axes) => reportHtml({ toolName: "t", today: "d", sections: [], how: { headline: "Directional", boundBy: "completeness", axes } });
  const arcs = (h) => [...h.matchAll(/<circle r="(\d+)" fill="none" stroke="(#[0-9A-F]{6})" stroke-width="7" stroke-dasharray="([\d.]+) ([\d.]+)"/g)].map((m) => [+m[1], m[2], +m[3], +m[4]]);
  const full = arcs(mark({ evidence: "Finance-grade", realization: "Planning-grade", completeness: "Directional" }));
  const lit = full.filter((a) => a[1] !== T.ARCS_PRINT.track);
  const len = (r, f) => +(2 * Math.PI * r * 240 / 360 * f).toFixed(2);
  ok("the mark draws three arcs over three tracks", full.length === 6 && lit.length === 3);
  ok("evidence at Finance-grade fills its whole arc", lit.some((a) => a[0] === 56 && a[1] === T.ARCS_PRINT.evidence && a[2] === len(56, 1)));
  ok("realization at Planning-grade fills two thirds", lit.some((a) => a[0] === 42 && a[1] === T.ARCS_PRINT.realization && a[2] === len(42, 2 / 3)));
  ok("completeness at Directional fills a third", lit.some((a) => a[0] === 28 && a[1] === T.ARCS_PRINT.completeness && a[2] === len(28, 1 / 3)));
  const na = mark({ evidence: "Planning-grade", realization: null, completeness: "Directional" });
  ok("a not applicable axis is a dotted ring", /<circle r="42" fill="none" stroke="#5B6B80" stroke-width="2" stroke-dasharray="2 5"/.test(na) && arcs(na).length === 4);
  ok("the cover names the grade and the axis that holds it", /How sure<\/div><div class="how-grade">Directional<\/div><div class="how-line">Held by completeness<\/div>/.test(mark({ evidence: "Directional", realization: null, completeness: "Directional" })));
  const v = reportHtml({ toolName: "t", today: "d", sections: [], how: { void: true, reason: "Agents must be above zero. Enter the agents you staff" } });
  ok("a void report draws no mark and claims no grade", !/class="arcs"/.test(v) && /No figure/.test(v) && !/Directional|Planning-grade|Finance-grade/.test(v) && v.includes("Agents must be above zero"));
  ok("a report with no grades draws no mark", !/class="arcs"/.test(reportHtml({ toolName: "t", today: "d", sections: [] })));
  for (const [k, c] of Object.entries(T.ARCS_PRINT)) if (k !== "track") ok(`print arc ${k} holds 3:1 against white`, T.contrast(c, "#FFFFFF") >= 3);
}

section("5. Reports written for each reader (TB, 30 Sep 2026)");
{
  const { planSections, orderSections: order, AUDIENCES: AUD } = mod.exports;
  const TOOL_FILE = { "rfp-builder": "RFPRequirementBuilder", "tco-calculator": "TCOCalculator", "business-case-builder": "BusinessCaseBuilder", "staffing-calculator": "StaffingCalculator", "cost-per-contact": "CostPerContactCalculator", "channel-shift": "ChannelShiftModel", "fcr-leakage": "FCRLeakageDiagnostic", "ai-deflection": "AIDeflectionRealityCheck", "license-gap": "LicenseBundleGapChecker", "attrition-cost": "AttritionCostCalculator" };
  ok("briefs cover RFP Builder and the nine rail tools", Object.keys(READER_BRIEFS).sort().join() === Object.keys(TOOL_FILE).sort().join());
  const DASHES = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
  for (const [tool, file] of Object.entries(TOOL_FILE)) {
    const src = readFileSync(`./${file}.jsx`, "utf8");
    ok(`${tool}: the tool passes this id to ReportActions`, src.includes(`TOOL_ID = "${tool}"`));
    /* The section titles the tool can emit: every literal title, and RFP's layer and vertical templates expanded. */
    const titles = [...src.matchAll(/title: ?["`]([^"`]{2,90})["`]/g)].map((m) => m[1]);
    if (tool === "rfp-builder") titles.push("Layer 1: Data", "Layer 2: Workflow", "Layer 3: Policy", "Layer 4: Reasoning", "Layer 5: Conversation", "Layer 6: Routing", "Layer 7: Analytics", "Retail specific Requirements");
    for (const a of AUD) {
      const b = briefFor(tool, a.id);
      ok(`${tool} / ${a.id}: a brief with three questions`, b && b.ask.length === 3 && b.ask.every((q) => typeof q === "string" && q.endsWith("?") && !DASHES.test(q) && q.length < 160));
      for (const re of b.lead) ok(`${tool} / ${a.id}: lead ${re} names a section the tool emits`, titles.some((t) => re.test(t)));
    }
    /* A report built from the tool's own titles: every reader keeps every section once, and the readers do not all
       lead with the same section. */
    const S = [...new Set(titles)].slice(0, 30).map((t, i) => ({ title: t, type: ["table", "metrics", "findings", "actions", "text"][i % 5], rows: [], items: [], content: "" })).concat([{ title: "Confidence", type: "table", rows: [] }, { title: "Next Step", type: "next", items: [] }]);
    const firsts = new Set();
    for (const a of AUD) {
      const o = order(S, a.id, tool);
      ok(`${tool} / ${a.id}: every section printed once`, o.length === S.length && S.every((x) => o.filter((y) => y === x).length === 1));
      firsts.add(o[0].title);
    }
    ok(`${tool}: at least three readers lead with different sections`, firsts.size >= 3);
    const ex = planSections(S, "executive", tool);
    ok(`${tool}: the executive report has a short front and the rest as an appendix`, ex.lead.length > 0 && ex.appendix.length > 0 && ex.lead.length <= ex.appendix.length && ex.lead.some((s) => s.title === "Confidence") && ex.lead.some((s) => s.type === "next"));
    const h = reportHtml({ toolName: "t", today: "d", sections: S, audience: "executive", toolId: tool });
    ok(`${tool}: the executive report prints the appendix heading and the reader's questions`, h.includes("Appendix: the detail") && h.includes("What to check first") && briefFor(tool, "executive").ask.every((q) => h.includes(q.replace(/'/g, "&#39;"))));
  }
  const plain = reportHtml({ toolName: "t", today: "d", sections: [{ title: "A", type: "text", content: "x" }], audience: "finance", toolId: "roadmap-builder" });
  ok("a tool without a brief prints no questions and no appendix", !plain.includes("What to check first") && !plain.includes("Appendix"));
  ok("the popup passes the tool id to the renderer", /reportHtml\(\{[^}]*toolId \}\)/.test(SRC));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
