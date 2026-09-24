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
   holes are collected and checked in turn. Any other hole must be e(...) or a fixed value. */
const FIXED = /^(a\.priority === "high" \? '<span class="priority high">High Priority<\/span>' : a\.priority === "medium" \? '<span class="priority medium">Medium<\/span>' : ""|url \? ' <span class="next-arrow">&rarr;<\/span>' : ""|NAVY|ELECTRIC|LIGHT|MUTED|BORDER|SLATE|GREEN|cols|fi \+ 1|sizeOf\(m\.value\)|inner|sections\.map\(\(s, i\) => renderSection\(s, i\)\)\.join\("\\n"\))$/;
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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
