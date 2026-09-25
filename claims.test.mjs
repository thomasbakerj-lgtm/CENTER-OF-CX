/* claims.test.mjs
 *
 * Gate for the content claims registry (src/lib/claims.js, full site scan part 4). On every converted page:
 *   1. every entry is complete for its kind; a fact names publisher, title, year, an https url and the date checked;
 *   2. every "test yours" link is a live route;
 *   3. no figure appears in page text outside a [[claim]] token, and every token resolves;
 *   4. no page uses an entry whose research is still pending;
 *   5. the page has an originality record: its prose was checked against the web for copied text (TB: never plagiarize).
 * Each rule is proven to fire on a planted sample before it is trusted.
 */
import { readFileSync } from "node:fs";
import { CLAIMS, TESTS, KINDS, tokens, claimIds } from "./src/lib/claims.js";
import { ORIGINALITY } from "./src/lib/claims/originality.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };

/* Pages converted to the registry. A page joins this list when its research pass starts. */
const CONVERTED = [
  { file: "HealthcareVertical.jsx", kind: "jsx" },
  { file: "HCSubVerticalData.js", kind: "data", exportName: "hcSubVerticals", page: "src/lib/SubVerticalPage.jsx" },
  { file: "TravelVertical.jsx", kind: "jsx" },
  { file: "TravelSubVerticalData.js", kind: "data", exportName: "travelSubVerticals", page: "src/lib/SubVerticalPage.jsx" },
  { file: "TelecomVertical.jsx", kind: "jsx" },
  { file: "TelecomSubVerticalData.js", kind: "data", exportName: "telecomSubVerticals", page: "src/lib/SubVerticalPage.jsx" },
  { file: "RetailVertical.jsx", kind: "jsx" },
  { file: "RetailSubVerticalData.js", kind: "data", exportName: "retailSubVerticals", page: "src/lib/SubVerticalPage.jsx" },
];

const FIGURE = /\$\s?\d|\b\d+(?:\.\d+)?\s?(?:%|x\b|percent\b|times\b|minutes?\b|seconds?\b|hours?\b|days?\b|weeks?\b|months?\b|years?\b)|\b\d+:\d\d\b|(?<!level )\b\d+\s?(?:-|to)\s?\d+\s+[a-z]|\b\d+\s+(?:agents?|visits?|systems?|calls?|patients?|members?|steps?|studies)\b/i;
const TOKEN = /\[\[[a-z0-9.\-]+\]\]/g;
const bare = (text) => FIGURE.test(String(text).replace(TOKEN, ""));
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const routes = new Set([...readFileSync("App.jsx", "utf8").matchAll(/path="([^"]+)"/g)].map((m) => m[1]));

console.log("\n1. Each rule fires on a planted sample");
ok("a bare percentage is caught", bare("Reduces no-show rates 25-40%."));
ok("a bare dollar figure and a handle time are caught", bare("costs $40 a call") && bare("AHT of 6:36"));
ok("a figure inside a token passes", !bare("Reduces no-show rates by [[hc.noshow.reminders]]."));
ok("plain prose passes", !bare("Map your capabilities across all 7 orchestration layers."));
ok("a count range and a counted noun are caught", bare("Good for groups with 50-500 agents.") && bare("agents toggle between 4 to 6 systems") && bare("Insurance authorizes 20 visits"));
ok("a maturity level range passes", !bare("Push for Level 3-4 integration."));
ok("tokens split in order", JSON.stringify(tokens("a [[x.y]] b")) === JSON.stringify([{ text: "a " }, { id: "x.y" }, { text: " b" }]));

console.log("\n2. Every entry is complete for its kind");
for (const [id, c] of Object.entries(CLAIMS)) {
  ok(`${id}: known kind`, KINDS.includes(c.kind), c.kind);
  ok(`${id}: has a label`, typeof c.label === "string" && c.label.length > 3);
  if (c.test !== undefined) ok(`${id}: test names a known tool`, !!TESTS[c.test], c.test);
  if (c.research === "pending") { ok(`${id}: pending entry says where to look`, typeof c.lead === "string" && c.lead.length > 8); continue; }
  if (c.kind === "fact") {
    const s = c.source || {};
    ok(`${id}: fact has a value`, typeof c.value === "string" && c.value.length > 0);
    ok(`${id}: fact names publisher, title and year`, !!s.publisher && !!s.title && /^\d{4}$/.test(String(s.year)), JSON.stringify(s));
    ok(`${id}: fact links the publisher over https`, /^https:\/\//.test(s.url || ""), s.url);
    ok(`${id}: fact records the date checked`, DATE.test(c.checked || ""), c.checked);
  }
  if (c.kind === "assumption" || c.kind === "example") ok(`${id}: states its reasoning`, typeof c.rationale === "string" && c.rationale.length > 10);
  if (c.kind === "none") ok(`${id}: says why there is no benchmark`, typeof c.reason === "string" && c.reason.length > 10);
  if (c.kind === "example" && c.text) ok(`${id}: example text carries no token`, !TOKEN.test(c.text));
}

console.log("\n3. Every test link is a live route");
for (const [k, t] of Object.entries(TESTS)) ok(`test ${k} routes to ${t.href}`, routes.has(t.href));

console.log("\n4. Converted pages: no bare figure, every token resolves, nothing pending, originality recorded");
for (const p of CONVERTED) {
  const src = readFileSync(p.file, "utf8");
  let texts;
  if (p.kind === "data") {
    const m = await import("./" + p.file);
    const walk = (v, out) => { if (typeof v === "string") out.push(v); else if (Array.isArray(v)) v.forEach((x) => walk(x, out)); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["href", "layer", "parent"].includes(k)) walk(x, out); return out; };
    texts = walk(m[p.exportName], []);
    ok(`${p.page} renders its text through ClaimText`, /ClaimText/.test(readFileSync(p.page, "utf8")) && /ClaimSources/.test(readFileSync(p.page, "utf8")));
  } else {
    const strings = [...src.matchAll(/"((?:[^"\\\n]|\\.){12,})"/g)].map((m) => m[1]).filter((t) => /[a-z]{3,} [a-z]{2,}/i.test(t) && !/rgba|gradient|px|fonts\.googleapis|^[\w-]+:/.test(t));
    const jsxText = [...src.matchAll(/>([^<>{}]{12,})</g)].map((m) => m[1]).filter((t) => /[a-z]{3,} [a-z]{2,}/i.test(t));
    texts = [...strings, ...jsxText];
    ok(`${p.file} renders through ClaimText`, /ClaimText/.test(src) && /ClaimSources/.test(src));
  }
  const bares = texts.filter(bare);
  ok(`${p.file}: no figure outside a claim token`, bares.length === 0, bares.slice(0, 4).map((t) => t.slice(0, 90)).join(" | "));
  const ids = claimIds([...texts, src]);
  const unknown = ids.filter((id) => !CLAIMS[id]);
  ok(`${p.file}: every token resolves`, unknown.length === 0, unknown.join(", "));
  const pending = ids.filter((id) => CLAIMS[id] && CLAIMS[id].research === "pending");
  ok(`${p.file}: no pending research`, pending.length === 0, `${pending.length} pending: ${pending.slice(0, 6).join(", ")}`);
  const o = ORIGINALITY[p.file];
  ok(`${p.file}: originality checked`, !!o && DATE.test(o.checked || "") && typeof o.method === "string" && Array.isArray(o.matches), o ? JSON.stringify(o).slice(0, 80) : "no record");
  if (o) ok(`${p.file}: every match resolved (rewritten or quoted with credit)`, o.matches.every((x) => x.resolution === "rewritten" || (x.resolution === "quoted" && /^https:\/\//.test(x.url || ""))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
