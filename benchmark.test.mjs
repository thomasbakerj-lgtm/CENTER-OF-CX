// benchmark.test.mjs
//
// The reader benchmark (open item 10, TB 14 Oct 2026: build it; PostHog; publish from 5; recommended figures). Proves:
// figures are rounded and bounded before they leave; the closed sets agree across the rules, the tracker and the site;
// pooling publishes nothing under 5, the median from 5 and the middle half from 10, never a single extreme; the event
// carries only what the reader saw and cannot be joined to the browser's other events; nothing is sent without the
// consent box and the button; the four tools place it and say so; the panel labels reader figures apart from sources;
// no tool's arithmetic reads it; the pooling script keeps the raw export out of the repository.
// Run: node benchmark.test.mjs
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "esbuild";
import * as B from "./src/lib/benchmarkExchange.js";
import * as T from "./src/lib/track.js";
import { VERTICALS } from "./src/lib/verticals.js";
import { parseExport, render } from "./scripts/benchmark-pool.mjs";

const require = createRequire(import.meta.url);
let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) passed++; else { failed++; console.log("FAIL " + name); } };
const section = (t) => console.log("\n--- " + t);
const DASH = [String.fromCharCode(0x2014), String.fromCharCode(0x2013)];

section("1. Rounded and bounded before anything leaves");
ok("four figures, one per tool", B.METRIC_IDS.join() === "fcr,aht,cpc,attrition" && B.METRIC_IDS.every((m) => B.metricForTool(B.METRICS[m].tool) === m) && B.metricForTool("staffing-calculator") === null);
ok("rounding: FCR and attrition whole percents, handle time 10 s, cost per contact $0.10",
  B.roundValue("fcr", 72.6) === 73 && B.roundValue("attrition", 41.4) === 41 && B.roundValue("aht", 427) === 430 && B.roundValue("aht", 424.9) === 420 && B.roundValue("cpc", 7.234) === 7.2 && B.roundValue("cpc", 7.25) === 7.3 && B.roundValue("cpc", 8.35) === 8.4 && B.roundValue("cpc", 1.15) === 1.2);
ok("out of range or not a number is not sent", [["fcr", 0.2], ["fcr", 100], ["aht", 12], ["aht", 4000], ["cpc", 0.02], ["cpc", 900], ["attrition", 0], ["fcr", NaN], ["cpc", Infinity], ["cpc", "7.2x"]].every(([m, v]) => B.contribution(m, v, "retail", "s2") === null));
ok("an unknown figure, industry or size sends nothing", [["x", 50, "retail", "s2"], ["fcr", 70, "pharma", "s2"], ["fcr", 70, "retail", "s9"], ["__proto__", 70, "retail", "s2"], ["fcr", 70, "constructor", "s2"], ["fcr", 70, "retail", "toString"]].every((a) => B.contribution(...a) === null));
{
  const c = B.contribution("cpc", 7.234, "retail", "s3");
  ok("a contribution is exactly the five fields", JSON.stringify(c) === JSON.stringify({ tool: "cost-per-contact", metric: "cpc", value: 7.2, industry: "retail", size_band: "s3" }));
}
ok("figures read as the tools print them", B.show("fcr", 73) === "73%" && B.show("cpc", 7.2) === "$7.20" && B.show("aht", 430) === "7m 10s" && B.show("aht", 50) === "50s");
ok("the 90 day limit", B.mayContribute(null, 1e12) && !B.mayContribute(1e12, 1e12 + 89 * 86400000) && B.mayContribute(1e12, 1e12 + 90 * 86400000));

section("2. One set of figures, industries and sizes everywhere");
ok("the tracker's sets equal the rules'", JSON.stringify([...T.BX_METRICS]) === JSON.stringify(B.METRIC_IDS) && JSON.stringify([...T.BX_INDUSTRIES]) === JSON.stringify(B.INDUSTRIES.map(([k]) => k)) && JSON.stringify([...T.BX_SIZES]) === JSON.stringify(B.SIZE_BANDS.map(([k]) => k)));
ok("industries are the site's ten plus other", JSON.stringify(B.INDUSTRIES.map(([k]) => k).filter((k) => k !== "other").sort()) === JSON.stringify(Object.keys(VERTICALS).sort()) && B.INDUSTRIES.at(-1)[0] === "other");
ok("the minimum is 5 and quartiles start at 10 (TB)", B.MIN_GROUP === 5 && B.QUARTILES_FROM === 10);

section("3. Pooling: nothing under 5, median from 5, middle half from 10, never a single extreme");
{
  const row = (value, industry = "retail", size_band = "s2", metric = "fcr") => ({ metric, value, industry, size_band });
  ok("4 contributions publish nothing", B.pool([60, 61, 62, 63].map((v) => row(v))).metrics.fcr.groups.length === 0);
  const five = B.pool([50, 60, 70, 80, 90].map((v) => row(v)), "2026-10-14");
  const g5 = five.metrics.fcr.groups.find((g) => g.id === "all");
  ok("5 publish the median and the count only", g5 && g5.n === 5 && g5.median === 70 && !("p25" in g5) && !("p75" in g5) && five.pooled === "2026-10-14");
  ok("no published field equals the lowest or highest contribution at 5", !Object.values(g5).includes(50) && !Object.values(g5).includes(90));
  const ten = B.pool([50, 52, 55, 60, 61, 63, 70, 75, 80, 95].map((v) => row(v))).metrics.fcr.groups.find((g) => g.id === "all");
  const srt = [50, 52, 55, 60, 61, 63, 70, 75, 80, 95];
  const oracle = (p) => { const i = 9 * p, lo = Math.floor(i); return srt[lo] + (srt[Math.ceil(i)] - srt[lo]) * (i - lo); };
  ok("10 add the 25th to 75th percentile, equal to an independent oracle", ten.p25 === Math.round(oracle(0.25)) && ten.p75 === Math.round(oracle(0.75)) && ten.median === Math.round(oracle(0.5)));
  ok("never the minimum or maximum at 10", !Object.values(ten).includes(50) && !Object.values(ten).includes(95));
  const mixed = B.pool([...[60, 61, 62, 63, 64].map((v) => row(v, "retail")), ...[70, 71, 72].map((v) => row(v, "healthcare")), ...[80, 81, 82, 83, 84].map((v) => row(v, "other", "s5"))]);
  const ids = mixed.metrics.fcr.groups.map((g) => g.id);
  ok("an industry shows only at 5; other never shows alone; sizes group too", ids.includes("all") && ids.includes("ind-retail") && !ids.includes("ind-healthcare") && !ids.some((i) => i === "ind-other") && ids.includes("size-s5") && ids.includes("size-s2"));
  const bad = B.pool([row(60), row(61), row(62), row(63), row(64), row(150), row(70.4), { metric: "fcr", value: 65, industry: "pharma", size_band: "s2" }, null]);
  ok("rows that fail the browser's checks are dropped and counted", bad.dropped.invalid === 4 && bad.metrics.fcr.contributions === 5);
  ok("figures stay apart: an FCR row never reaches cost per contact", B.pool([60, 61, 62, 63, 64].map((v) => row(v))).metrics.cpc.groups.length === 0);
}

section("4. The event: what the reader saw, consented, not joinable");
{
  const CTX = { key: "phc_harness", distinctId: "abc123def456", sessionId: "s0s0s0", path: "/tools/cost-per-contact", now: "2026-10-14T00:00:00.000Z" };
  const p = T.buildPayload(T.EV.BENCHMARK_CONTRIBUTE, { ...B.contribution("cpc", 7.2, "retail", "s3"), email: "a@b.co", company: "Acme", repeat: true, note: "hi" }, CTX).properties;
  ok("the event carries the five fields and nothing else from the page", p.tool === "cost-per-contact" && p.metric === "cpc" && p.value === 7.2 && p.industry === "retail" && p.size_band === "s3" && !("email" in p) && !("company" in p) && !("note" in p) && !JSON.stringify(p).includes("Acme"));
  ok("an unrounded or out-of-range value is refused on the wire too", !("value" in T.buildPayload(T.EV.BENCHMARK_CONTRIBUTE, { value: 7.234 }, CTX).properties) && !("value" in T.buildPayload(T.EV.BENCHMARK_CONTRIBUTE, { value: -1 }, CTX).properties));
  ok("the four keys never ride another event", Object.values(T.EV).filter((e) => e !== T.EV.BENCHMARK_CONTRIBUTE).every((e) => { const q = T.buildPayload(e, { metric: "cpc", value: 7.2, industry: "retail", size_band: "s3" }, CTX); return !q || !["metric", "value", "industry", "size_band"].some((k) => k in q.properties); }));
  const TR = readFileSync("./src/lib/track.js", "utf8");
  const fn = TR.slice(TR.indexOf("export function trackContribution"), TR.indexOf("/* Taxonomy 1.6"));
  ok("a contribution uses a fresh random id and visit id, never the browser's stored ones, and no repeat flag", /distinctId: rand\(\), sessionId: rand\(\)/.test(fn) && !/identity\(\)/.test(fn) && !/repeat/.test(fn.replace(/no repeat flag/g, "")));
  ok("blocked browsers and unconfigured builds send nothing", /captureBlocked\(globalThis\.navigator, window\)\) return false/.test(fn) && /if \(!isConfigured\(\)\) return false/.test(fn));
}

section("5. Nothing sent without the consent box and the button");
{
  const C = readFileSync("./src/lib/BenchmarkContribute.jsx", "utf8");
  ok("only the button's handler sends", (C.match(/trackContribution\(c\)/g) || []).length === 1 && /const send = \(\) => \{\n\s+if \(!c \|\| !agree\) return;/.test(C) && /onClick=\{send\}/.test(C));
  ok("the button stays disabled until industry, size and the box", /disabled=\{!c \|\| !agree\}/.test(C) && /useState\(false\)/.test(C));
  ok("never on the opening figure, a void or an out-of-range figure", /if \(!m \|\| voided \|\| !inRange\(metric, rounded\) \|\| rounded === first\.current\) return null;/.test(C));
  ok("the reader sees exactly what would be sent", /What would be sent: <strong style=\{K\.strong\}>\{m\.label\}, \{show\(metric, rounded\)\}<\/strong> \(rounded\)/.test(C));
  ok("it says where it goes, how it is published and links the policy", /PostHog/.test(C) && /random id used only for this/.test(C) && /never a single reader's figure/.test(C) && /href="\/privacy"/.test(C));
  ok("a refused send says nothing was sent; a sent one records the 90 day limit", /Nothing was sent/.test(C) && /setItem\(limitKey\(metric\)/.test(C));
  ok("labels are bound", /htmlFor=\{ids\.ind\}/.test(C) && /htmlFor=\{ids\.size\}/.test(C) && /htmlFor=\{ids\.ok\}/.test(C));
}

section("6. The four tools place it, say so, and nothing reads it back");
{
  const PLACE = { "FCRLeakageDiagnostic.jsx": '<BenchmarkContribute metric="fcr" value={N.fcrPct} voided={G.voided} />', "AHTDecomposition.jsx": '<BenchmarkContribute metric="aht" value={R.total} />',
    "CostPerContactCalculator.jsx": '<BenchmarkContribute metric="cpc" value={r.loaded} voided={graded.voided} />', "AttritionCostCalculator.jsx": '<BenchmarkContribute metric="attrition" value={r.attritionRate} voided={r.voided} />' };
  for (const [f, tag] of Object.entries(PLACE)) {
    const s = readFileSync("./" + f, "utf8");
    ok(`${f} renders it once, before How others report it`, s.split("<BenchmarkContribute ").length === 2 && s.includes(tag) && s.indexOf(tag) < s.indexOf("<HowOthersReport"));
  }
  const F = await import("./src/lib/ToolFrame.jsx").catch(() => null);
  const TF = readFileSync("./src/lib/ToolFrame.jsx", "utf8");
  ok("each of the four says so in its privacy line", ["fcr-leakage", "aht-decomposition", "cost-per-contact", "attrition-cost"].every((t) => TF.includes(`"${t}": BENCHMARK_LINE`)) && /add one rounded figure to the reader benchmark/.test(TF));
  const PP = readFileSync("./PrivacyPolicy.jsx", "utf8");
  ok("the Privacy Policy names the exception, the consent, the random id and the pooling", /reader benchmark/.test(PP) && /tick the consent box/.test(PP) && /random identifier made for that one event/.test(PP) && /pooled groups of five or more/.test(PP) && /PRIVACY_UPDATED = "14 October 2026"/.test(PP));
  const files = [...readdirSync(".").filter((f) => f.endsWith(".jsx")), ...readdirSync("./src/lib").filter((f) => /\.(js|jsx)$/.test(f)).map((f) => "src/lib/" + f)];
  const readers = files.filter((f) => /benchmarks\/readers\.json|benchmarkExchange/.test(readFileSync("./" + f, "utf8")));
  ok(`only the panel, the box and the tracker read it; no engine, default, flag or grade does [${readers.join(", ")}]`, JSON.stringify(readers.sort()) === JSON.stringify(["src/lib/BenchmarkContribute.jsx", "src/lib/HowOthersReport.jsx", "src/lib/benchmarkExchange.js", "src/lib/track.js"].filter((f) => /benchmark|HowOthers/.test(readFileSync("./" + f, "utf8"))).sort()) && !readers.some((f) => /^[A-Z].*\.jsx$/.test(f)));
  ok("no dash in any new file", ["src/lib/benchmarkExchange.js", "src/lib/BenchmarkContribute.jsx", "scripts/benchmark-pool.mjs"].every((f) => DASH.every((d) => !readFileSync("./" + f, "utf8").includes(d))));
}

section("7. The panel labels reader figures apart from published ones");
{
  const loc = { search: "", pathname: "/", href: "http://x/", hash: "" };
  globalThis.window = globalThis.window || { location: loc, addEventListener() {}, matchMedia: () => ({ matches: false }) };
  const React = require("react");
  const { renderToString } = require("react-dom/server");
  const html = async (readersJson) => {
    const r = await build({ stdin: { contents: 'import { HowOthersReport } from "./src/lib/HowOthersReport.jsx"; export default HowOthersReport;', resolveDir: process.cwd(), loader: "jsx" }, bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
      plugins: readersJson ? [{ name: "readers", setup(b) { b.onLoad({ filter: /readers\.json$/ }, () => ({ contents: readersJson, loader: "json" })); } }] : [] });
    const m = { exports: {} }; new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
    return (t) => renderToString(React.createElement(m.exports.default, { toolId: t })).replace(/<!-- -->/g, "");
  };
  const empty = await html(null);
  ok("with no pooled figure, the four tools say none yet and show no figure", ["fcr-leakage", "aht-decomposition", "cost-per-contact", "attrition-cost"].every((t) => { const h = empty(t); return /Center of CX readers/.test(h) && /No reader figures yet/.test(h) && /Reported by readers/.test(h); }));
  ok("tools outside the four show no reader block", !/Center of CX readers/.test(empty("staffing-calculator")) && !/Center of CX readers/.test(empty("tco-calculator")));
  const rows = (n, base) => Array.from({ length: n }, (_, i) => ({ metric: "cpc", value: Number((base + i * 0.5).toFixed(1)), industry: i < 8 ? "retail" : "telecom", size_band: "s3" }));
  const full = await html(render(rows(12, 5), "2026-11-02"));
  const h = full("cost-per-contact").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  ok("pooled groups show the median, the count, the middle half from 10, the label and the pooled date", /All industries, all sizes, median/.test(h) && /12 contributions; middle half \$/.test(h) && /Retail and ecommerce, median/.test(h) && /8 contributions\./.test(h) && /not verified/.test(h) && /Last pooled 2026-11-02/.test(h) && !/Telecom, median/.test(h));
  ok("another tool's block stays empty", /No group has reached 5 contributions yet \(pooled 2026-11-02\)/.test(full("fcr-leakage")));
}

section("8. The pooling script keeps the raw export out of the repository");
{
  const json = JSON.stringify([{ event: "benchmark_contribute", properties: { metric: "fcr", value: 70, industry: "retail", size_band: "s2", $session_id: "x" } }]);
  const csv = 'event,properties.metric,properties.value,properties.industry,properties.size_band\nbenchmark_contribute,aht,430,"healthcare",s4\n';
  ok("reads a PostHog JSON export", JSON.stringify(parseExport(json)) === JSON.stringify([{ metric: "fcr", value: 70, industry: "retail", size_band: "s2" }]));
  ok("reads a CSV export with the properties prefix", JSON.stringify(parseExport(csv)) === JSON.stringify([{ metric: "aht", value: 430, industry: "healthcare", size_band: "s4" }]));
  ok("the output is deterministic and carries no raw row", render(parseExport(json), "2026-11-02") === render(parseExport(json), "2026-11-02") && !render(parseExport(json), "2026-11-02").includes("$session_id"));
  writeFileSync("./.bx-export.json", json);
  let refused = false;
  try { execFileSync("node", ["scripts/benchmark-pool.mjs", ".bx-export.json"], { stdio: "pipe" }); } catch (e) { refused = e.status === 2 && /outside the repository/.test(String(e.stderr)); }
  execFileSync("rm", ["-f", ".bx-export.json"]);
  ok("an export inside the repository is refused", refused);
  const dir = mkdtempSync(join(tmpdir(), "bx-"));
  writeFileSync(join(dir, "e.json"), json);
  const before = readFileSync("./src/data/benchmarks/readers.json", "utf8");
  const outside = (() => { try { execFileSync("node", ["scripts/benchmark-pool.mjs", join(dir, "e.json"), "--date", "2026-11-02"], { stdio: "pipe" }); return JSON.parse(readFileSync("./src/data/benchmarks/readers.json", "utf8")); } finally { writeFileSync("./src/data/benchmarks/readers.json", before); } })();
  ok("an export outside it pools", outside.metrics.fcr.contributions === 1 && outside.pooled === "2026-11-02");
  const committed = JSON.parse(before);
  ok("the committed file is pooled output: groups only, every group at 5 or more", committed.minGroup === 5 && Object.keys(committed.metrics).join() === B.METRIC_IDS.join() && Object.values(committed.metrics).every((m) => m.groups.every((g) => g.n >= 5 && Object.keys(g).every((k) => ["id", "label", "n", "median", "p25", "p75"].includes(k)))));
  const doc = readFileSync("./docs/MEASUREMENT.md", "utf8");
  ok("the docs name the event, its properties and the pooling command", ["benchmark_contribute", "metric", "value", "industry", "size_band"].every((k) => doc.includes("`" + k + "`")) && doc.includes("node scripts/benchmark-pool.mjs"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
