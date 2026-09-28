/* components.test.mjs
 *
 * Redesign Phase 3, the shared components (src/lib/ui.jsx; Brand Guide 1.0, section 12).
 * Every component is server-rendered and checked for its accessible name, the contrast of
 * the text it sets, and the rule the guide gives it: one primary button, a source on every
 * field, hold to speed up, the evidence mark filled by grade and absent on a void, grades
 * without colour, no readout score until every part is answered, a word and an icon on every
 * finding with unknown never red, an exit beside every next step, no more than three route steps.
 *
 * Run from repo root: node components.test.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const T = await import("./src/lib/tokens.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);

const r = await build({ entryPoints: ["./src/lib/ui.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const U = mod.exports;
const h = (C, p) => renderToStaticMarkup(React.createElement(C, p));
const AA = 4.5, c = T.contrast;

section("1. Button");
{
  const prim = h(U.Button, { children: "Start" });
  ok("a primary button is a real button, typed, at least 44 pixels", /^<button type="button"/.test(prim) && /min-height:44px/.test(prim));
  ok("primary: white on the action blue passes AA", c(T.HOUSE.paper, T.HOUSE.action) >= AA && prim.includes("background:" + T.HOUSE.action));
  ok("with an href it is a link", /^<a href="\/tools\/x"/.test(h(U.Button, { href: "/tools/x", children: "Go" })));
  for (const k of Object.keys(T.PILLARS)) {
    const b = h(U.Button, { kind: "pillar", pillar: k, children: "Go" });
    const text = T.onFill(T.PILLARS[k].fill);
    ok(`pillar button ${k}: its text reads on its fill`, b.includes("background:" + T.PILLARS[k].fill) && b.includes("color:" + text) && c(text, T.PILLARS[k].fill) >= AA);
  }
  ok("secondary and text buttons read on the house", c(T.HOUSE.mist, T.HOUSE.ink) >= AA && c(T.HOUSE.sky2, T.HOUSE.ink) >= AA);
}

section("2. Input with source");
{
  const yours = h(U.SourceInput, { id: "wage", label: "Hourly wage", value: "22.50", source: { kind: "yours" } });
  ok("the label names the field", /<label for="wage"[^>]*>Hourly wage<\/label>/.test(yours) && /<input id="wage"/.test(yours));
  ok("the source line describes the field", /aria-describedby="wage-src"/.test(yours) && /id="wage-src"[^>]*>Yours</.test(yours));
  ok("yours draws a solid line", /1\.5px solid/.test(yours));
  const def = h(U.SourceInput, { id: "w", label: "Wage", value: "21.53", source: { kind: "default", text: "BLS, May 2025" } });
  ok("a default draws a dashed line and names its source", /1\.5px dashed/.test(def) && def.includes("Our default: BLS, May 2025"));
  const pulled = h(U.SourceInput, { id: "a", label: "Handle time", value: "380", source: { kind: "pulled", text: "AHT Decomposition" } });
  ok("a pulled value carries the PULLED tag and its origin", pulled.includes(">PULLED<") && pulled.includes("From AHT Decomposition"));
  const corr = h(U.SourceInput, { id: "k", label: "Concurrency", value: "1", source: { kind: "corrected", entered: "0.4", text: "Below 1 is corrected to 1." } });
  ok("a corrected value says what was entered", corr.includes("You entered 0.4; corrected to 1. Below 1 is corrected to 1."));
  ok("field text reads on navy", c(T.HOUSE.mist, T.HOUSE.navy) >= AA && c(T.HOUSE.muted, T.HOUSE.navy) >= AA);
}

section("3. Stepper");
{
  const H = U.holdCurve;
  ok("the first repeat waits 400 ms", H(0).delay === 400);
  ok("the pause never grows and never drops below 60 ms", Array.from({ length: 80 }, (_, n) => H(n).delay).every((d, i, a) => d >= 60 && (i === 0 || d <= a[i - 1])) && H(79).delay === 60);
  ok("steps count one until the twentieth repeat, then ten", H(0).multiplier === 1 && H(19).multiplier === 1 && H(20).multiplier === 10);
  const s = h(U.Stepper, { label: "agents", value: 40 });
  ok("each control is a named button", s.includes('aria-label="Less agents"') && s.includes('aria-label="More agents"') && (s.match(/<button type="button"/g) || []).length === 2);
  ok("the group is named and the value is announced", /role="group" aria-label="agents"/.test(s) && /<output aria-live="polite"/.test(s) && s.includes(">40<"));
  ok("controls are 48 pixels", (s.match(/width:48px;height:48px/g) || []).length === 2);
}

section("4. Evidence mark and grade badge");
{
  const len = (rr, f) => (2 * Math.PI * rr * 240 / 360 * f).toFixed(2);
  const m = h(U.EvidenceMark, { axes: { evidence: "Finance-grade", realization: "Planning-grade", completeness: "Directional" } });
  ok("evidence at Finance-grade fills its arc", m.includes(`stroke="${T.ARCS.evidence}" stroke-width="7" stroke-dasharray="${len(56, 1)} `));
  ok("realization at Planning-grade fills two thirds", m.includes(`stroke="${T.ARCS.realization}" stroke-width="7" stroke-dasharray="${len(42, 2 / 3)} `));
  ok("completeness at Directional fills a third", m.includes(`stroke="${T.ARCS.completeness}" stroke-width="7" stroke-dasharray="${len(28, 1 / 3)} `));
  ok("the mark is an image with every axis in words", /role="img" aria-label="How sure: evidence Finance-grade, realization Planning-grade, completeness Directional"/.test(m));
  const na = h(U.EvidenceMark, { axes: { evidence: "Planning-grade", realization: null, completeness: "Directional" } });
  ok("a not applicable axis is a dotted ring and said in words", /r="42" fill="none"[^>]*stroke-dasharray="2 5"/.test(na) && na.includes("realization not applicable"));
  ok("a void shows no mark", h(U.EvidenceMark, { isVoid: true, axes: { evidence: "Directional" } }) === "");
  for (const g of U.GRADES) {
    const b = h(U.GradeBadge, { grade: g, heldBy: "completeness", lift: "attest the invoice" });
    const colours = (b.match(/#[0-9A-F]{6}/g) || []).filter((x) => x !== T.HOUSE.mist && x !== T.HOUSE.ink && x !== T.HOUSE.muted && x !== T.HOUSE.body);
    ok(`${g}: weight and fill only, no colour`, colours.length === 0, colours.join());
    ok(`${g}: names the axis that holds it and the lift`, b.includes("Held by completeness") && b.includes("To raise it: attest the invoice"));
  }
  const weights = U.GRADES.map((g) => (h(U.GradeBadge, { grade: g }).match(/font-weight:(\d+)/) || [])[1]);
  ok("the three grades differ by weight", new Set(weights).size === 3);
  ok("no grade, no badge", h(U.GradeBadge, {}) === "");
}

section("5. Result");
{
  const r1 = h(U.Result, { label: "Cost per contact", value: 6.78, format: (v) => "$" + v.toFixed(2), change: "Up $0.06 with your wage", how: { axes: { evidence: "Planning-grade", realization: null, completeness: "Directional" }, headline: "Directional", heldBy: "completeness" } });
  ok("the figure, its label and the change line render", r1.includes("$6.78") && r1.includes("Cost per contact") && r1.includes("Up $0.06 with your wage"));
  ok("the result is a named region with a live figure", /<section aria-label="Cost per contact"/.test(r1) && /aria-live="polite"/.test(r1));
  ok("the animated figure is hidden from screen readers; one live region announces the settled value", /<div aria-hidden="true"[^>]*>\$6\.78<\/div>/.test(r1) && (r1.match(/aria-live="polite"/g) || []).length === 1 && /<span aria-live="polite"[^>]*>\$6\.78<\/span>/.test(r1));
  const USRC = readFileSync("./src/lib/ui.jsx", "utf8");
  ok("the count-up rounds to the figure's own places (no float noise mid-animation)", /setShown\(k < 1 \? \+\(a \+ \(b - a\) \* ez\)\.toFixed\(dp\) : b\)/.test(USRC));
  ok("the evidence mark and grade sit beside it", /aria-label="How sure: /.test(r1) && r1.includes(">Directional<") && r1.includes("Held by completeness"));
  const v = h(U.Result, { label: "Cost per contact", value: Infinity, voidReason: "Agents must be above zero." });
  ok("a void result shows no figure and says why", v.includes("No figure") && v.includes("Agents must be above zero.") && !/Infinity|\$|aria-label="How sure/.test(v));
}

section("6. Readout");
{
  const parts = [{ name: "Strategy", layer: "l7", score: 0.5 }, { name: "Routing", layer: "l6", score: null }];
  const half = h(U.Readout, { parts, score: 62 });
  ok("no score until every part is answered", !half.includes(">62<") && half.includes("appears when all 2 parts are answered"));
  const done = h(U.Readout, { parts: parts.map((p) => ({ ...p, score: 0.8 })), score: 80 });
  ok("the score shows once every part is answered", done.includes(">80<") && done.includes("Your result: 80 of 100"));
  ok("each part's arc takes its layer's colour", done.includes(`stroke="${T.LAYERS[0].color}"`) && done.includes(`stroke="${T.LAYERS[1].color}"`));
  ok("it is labelled Your result", done.includes(">Your result<"));
}

section("7. Stack");
{
  const s = h(U.Stack, { active: "l4" });
  ok("seven named layers, top first", T.LAYERS.every((l) => s.includes(`aria-label="L${l.n} ${l.name}"`)) && s.indexOf("L7 ") < s.indexOf("L1 "));
  ok("the chosen layer is pressed, the rest are not", (s.match(/aria-pressed="true"/g) || []).length === 1 && (s.match(/aria-pressed="false"/g) || []).length === 6);
  ok("the stack group is named", /role="group" aria-label="The seven layer stack"/.test(s));
}

section("8. Claim marker");
{
  ok("published: a solid outline and the source link", /href="https:\/\/sqm\.example"[^>]*solid[^>]*>SQM Group 2026/.test(h(U.ClaimMarker, { kind: "published", source: "SQM Group 2026", href: "https://sqm.example" })));
  ok("assumption: dashed, Test yours", /dashed[^>]*>Planning assumption\. Test yours/.test(h(U.ClaimMarker, { kind: "assumption", testHref: "/tools/x" })));
  ok("example: a filled tag", h(U.ClaimMarker, { kind: "example" }).includes(">Worked example<"));
  ok("none: no public benchmark, measure yours", h(U.ClaimMarker, { kind: "none", testHref: "/tools/x" }).includes("No public benchmark. Measure yours"));
}

section("9. Finding");
{
  const words = { critical: "Critical", high: "High", unknown: "Unknown", clear: "Clear" };
  for (const [lv, w] of Object.entries(words)) {
    const f = h(U.Finding, { level: lv, title: "Two agents short at peak" });
    ok(`${lv}: a word and an icon`, f.includes(`</svg>${w}</span>`) && /<svg[^>]*aria-hidden="true"/.test(f));
    ok(`${lv}: named for screen readers with its word`, f.includes(`aria-label="${w}: Two agents short at peak"`));
  }
  const unk = h(U.Finding, { level: "unknown", title: "x" });
  ok("unknown is never red", !unk.includes(T.FINDINGS.critical.dark) && !unk.includes(T.FINDINGS.high.dark) && /dashed/.test(unk));
  ok("fills carry ink text that reads", c(T.HOUSE.ink, T.FINDINGS.critical.dark) >= AA && c(T.HOUSE.ink, T.FINDINGS.clear.dark) >= AA && c(T.FINDINGS.high.dark, T.HOUSE.navy) >= AA);
  ok("an unknown pillar falls back to Diagnostics", h(U.Door, { pillar: "bogus" }).includes(">Diagnostics<"));
  ok("an unknown level renders as unknown", h(U.Finding, { level: "bogus", title: "x" }).includes("Unknown: x"));
}

section("10. Next step, byline, door, route card, states");
{
  const n = h(U.NextStep, { tool: "FCR Leakage", reason: "What repeats add.", minutes: 5, href: "/tools/fcr-leakage" });
  ok("next step: one test, the time, the figures carry", n.includes("FCR Leakage") && n.includes("about 5 minutes") && n.includes("Your figures carry over."));
  ok("next step always carries the exit", n.includes("Stop here and keep the report"));
  const b = h(U.Byline, { name: "Dana Ortiz", role: "WFM lead", org: "Acme", since: 2026 });
  ok("byline: initials, role, the perspective tag, and the tie stated", b.includes(">DO<") && b.includes("WFM lead, Acme") && b.includes("CONTRIBUTOR PERSPECTIVE") && b.includes("No vendor tie declared"));
  ok("byline: a vendor tie is disclosed", h(U.Byline, { name: "A B", tie: "employed by a CCaaS vendor" }).includes("Vendor tie: employed by a CCaaS vendor"));
  for (const k of Object.keys(T.PILLARS)) {
    const d = h(U.Door, { pillar: k, number: "01", line: "l", meta: "m", selected: true });
    ok(`door ${k}: a radio, checked when chosen, readable on its fill`, /role="radio" aria-checked="true"/.test(d) && c(T.onFill(T.PILLARS[k].fill), T.PILLARS[k].fill) >= AA);
    ok(`door ${k}: soon only on Research and Market Watch`, T.PILLARS[k].soon === d.includes(">Coming soon<"));
  }
  const rc = h(U.RouteCard, { kicker: "Your route", time: "17 minutes", title: "Where the cost comes from", steps: [1, 2, 3, 4, 5].map((i) => ({ name: "Step " + i })), ending: "Fix, build a case, or stop.", cta: "Start", href: "/tools/cost-per-contact" });
  ok("a route shows no more than three steps", rc.includes("Step 3") && !rc.includes("Step 4"));
  ok("a route names its ending and one start link", rc.includes("Possible endings.") && (rc.match(/<a href=/g) || []).length === 1);
  ok("loading keeps a shape and is announced", /role="status" aria-label="Loading"/.test(h(U.Loading, {})));
  ok("a failure is an alert with one way on", /role="alert"/.test(h(U.Failure, { message: "It did not load.", action: "Reload", href: "/" })) && (h(U.Failure, { message: "m", action: "Reload", href: "/" }).match(/<a /g) || []).length === 1);
  ok("empty suggests where to go", h(U.Empty, { message: "No vendor matches.", suggestions: [{ label: "CCaaS", href: "/vendors/ccaas" }] }).includes(">CCaaS<"));
  ok("a shared scenario says whose numbers they are", h(U.SharedScenario, { from: "Sam" }).includes("These are Sam&#x27;s numbers"));
}

section("11. Text contrast across the components");
{
  for (const [fg, fgName] of [[T.HOUSE.mist, "mist"], [T.HOUSE.body, "body"], [T.HOUSE.muted, "muted"], [T.HOUSE.sky2, "link"]]) {
    for (const [bg, bgName] of [[T.HOUSE.ink, "ink"], [T.HOUSE.navy, "navy"]]) ok(`${fgName} on ${bgName}`, c(fg, bg) >= AA, c(fg, bg).toFixed(2));
  }
  for (const p of Object.values(T.PILLARS)) ok(`${p.name} label on ink`, c(p.onDark, T.HOUSE.ink) >= AA);
}

section("12. Source rules");
{
  const src = readFileSync("./src/lib/ui.jsx", "utf8");
  const code = src.split("\n").filter((l) => !/^\s*\/\//.test(l) && !/^\s*\*/.test(l)).join("\n");
  ok("no colour literal: every colour is a token", !/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(code));
  ok("no dash in the source", ![String.fromCharCode(0x2013), String.fromCharCode(0x2014)].some((d) => src.includes(d)));
  ok("every exported component renders without props", Object.entries(U).filter(([k, v]) => typeof v === "function" && /^[A-Z]/.test(k)).every(([k, C]) => { try { h(C, {}); return true; } catch (e) { console.log("   " + k + ": " + e.message); return false; } }));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
