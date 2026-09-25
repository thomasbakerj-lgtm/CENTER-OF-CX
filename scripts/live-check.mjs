/* scripts/live-check.mjs
 *
 * The live check: every tool and published rubric, in a real browser, against any
 * origin. Run nightly against production by .github/workflows/nightly.yml, and by
 * hand against a local build before a release.
 *
 *   node scripts/live-check.mjs https://www.contactcentercx.com
 *   node scripts/live-check.mjs http://localhost:4173
 *
 * For every tool route in App.jsx it loads the page and fails on any page error or a
 * blank page. For every tool that exports DEFAULTS it also opens its SAMPLE and a
 * hostile scenario link, generates the PDF, and fails on NaN, Infinity, undefined or float noise
 * in the page or the PDF. Methodology pages must render their bands and limits.
 *
 * No test traffic reaches production data: PostHog, Vercel Analytics and Formspree
 * are intercepted in the browser, and nothing is submitted.
 *
 * Needs playwright-core (installed with --no-save in CI) and a Chromium. Set
 * CHROMIUM_PATH to use a specific binary and CHROMIUM_ARGS for extra flags.
 * Exits 1 on any failure. Writes a summary to stdout, one line per check.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { chromium } from "playwright-core";
import { encodeScenario } from "../src/lib/scenarioUrl.js";

const ORIGIN = (process.argv[2] || "https://www.contactcentercx.com").replace(/\/$/, "");
const require = createRequire(import.meta.url);
/* Float noise (28.000000000000004) counts as bad text: a figure printed as if it were a value. */
const BAD = /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]|\d\.\d*0000000\d|\d\.\d*9999999\d/;
const badAt = (t) => { const m = t.match(new RegExp(".{0,50}(" + BAD.source + ").{0,30}")); return m ? m[0].replace(/\s+/g, " ") : ""; };

/* The tool set comes from App.jsx, the same source floor.test.mjs reads. */
const APP = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
const lazyFile = Object.fromEntries([...APP.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/(\w+)'\)\)/g)].map((m) => [m[1], m[2] + ".jsx"]));
const TOOLS = [...APP.matchAll(/<Route\s+path="(\/tools\/[a-z0-9-]+)"\s+element=\{<(\w+) \/>\}/g)]
  .map((m) => ({ route: m[1], file: lazyFile[m[2]] })).filter((t) => t.file);
const METHODOLOGY = [...APP.matchAll(/<Route\s+path="(\/methodology\/[a-z0-9-]+)"/g)].map((m) => m[1]);

/* Sample and hostile links, built from the tool's own exports. */
globalThis.window = { location: { search: "" } };
async function linksFor(file) {
  const src = readFileSync(new URL("../" + file, import.meta.url), "utf8");
  const id = (src.match(/const TOOL_ID\s*=\s*"([^"]+)"/) || [])[1];
  if (!id) return null;
  const r = await build({ entryPoints: [new URL("../" + file, import.meta.url).pathname], bundle: true, write: false, format: "cjs",
    platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  if (!mod.exports.SCENARIO_DEFAULTS && !mod.exports.DEFAULTS) return null;
  /* A tool that keeps its form defaults apart from its link defaults exports the
     link set as SCENARIO_DEFAULTS; that is the set its scenario links encode against. */
  const D = mod.exports.SCENARIO_DEFAULTS || mod.exports.DEFAULTS, S = mod.exports.SAMPLE || D;
  const hostile = JSON.parse(JSON.stringify(S, (k, v) => (typeof v === "number" ? -5 : v)));
  return { sample: "?s=" + encodeScenario(id, S, D), hostile: "?s=" + encodeScenario(id, hostile, D) };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: (process.env.CHROMIUM_ARGS || "").split(" ").filter(Boolean),
});
let failures = 0, checks = 0;
/* Every Content Security Policy violation, on any page or report window, fails the run.
   INJECT_HEADERS=1 applies the headers in vercel.json to each document, so a local
   preview is checked under the same policy production serves. */
const cspViolations = [];
let docHeaders = null;
const INJECT = process.env.INJECT_HEADERS === "1"
  ? Object.fromEntries(JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")).headers[0].headers.map((h) => [h.key.toLowerCase(), h.value]))
  : null;
const report = (ok, what, detail = "") => { checks++; if (!ok) failures++; console.log(`${ok ? "ok  " : "FAIL"} ${what}${detail ? "  " + detail : ""}`); };

async function open(path, expect) {
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
  await ctx.route(/posthog\.com|_vercel\/insights|vitals\.vercel|formspree\.io|va\.vercel-scripts/, (r) => r.abort());
  if (INJECT) await ctx.route((u) => u.href.startsWith(ORIGIN), async (route) => {
    if (route.request().resourceType() !== "document") return route.continue();
    const resp = await route.fetch(); return route.fulfill({ response: resp, headers: { ...resp.headers(), ...INJECT } });
  });
  const watch = (p) => p.on("console", (m) => { if (/Content Security Policy|Refused to (load|execute|apply|connect|frame)/i.test(m.text())) cspViolations.push(path + ": " + m.text().slice(0, 140)); });
  ctx.on("page", watch);
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  let text = "", status = 0;
  /* A transient network failure gets two more tries before it counts. A failed
     load or an error status reads as a blank page: the browser's own error page
     has text of its own and must never pass as a rendered tool. */
  for (let i = 0; i < 3; i++) {
    const res = await page.goto(ORIGIN + path, { waitUntil: "networkidle", timeout: 45000 }).catch(() => null);
    status = res ? res.status() : 0;
    if (res && !docHeaders && status >= 200 && status < 400) docHeaders = await res.allHeaders().catch(() => null);
    /* Wait for the content itself, not a fixed pause: a route chunk can arrive
       after the network first goes idle. A sample link waits for its result. */
    if (status >= 200 && status < 400) await page.waitForFunction((re) => new RegExp(re, "i").test(document.body.innerText) && document.body.innerText.length > 150,
      expect ? expect.source : ".", { timeout: 20000 }).catch(() => {});
    text = status >= 200 && status < 400 ? await page.innerText("body").catch(() => "") : "";
    /* A page that loaded its header but not yet its result gets the same retries as
       a blank one: the first request after a deploy can outlast one wait. */
    if (text.length > 150 && (!expect || expect.test(text))) break;
  }
  if (!text) errors.push(`no page (HTTP ${status || "no response"})`);
  return { ctx, page, errors, text };
}

async function pdfText(ctx, page) {
  await page.getByRole("button", { name: /Download Report/ }).first().click();
  await page.waitForTimeout(300);
  const [pop] = await Promise.all([ctx.waitForEvent("page", { timeout: 15000 }), page.getByRole("button", { name: /Generate/ }).first().click()]);
  await pop.waitForLoadState("load"); await pop.waitForTimeout(500);
  const t = await pop.innerText("body"); await pop.close(); return t;
}

console.log(`Live check against ${ORIGIN}: ${TOOLS.length} tools, ${METHODOLOGY.length} methodology pages\n`);
for (const t of TOOLS) {
  const base = await open(t.route);
  report(base.errors.length === 0 && base.text.length > 150, `${t.route} renders`, base.errors[0] || (base.text.length <= 150 ? "blank page" : ""));
  report(base.text.length > 150 && !BAD.test(base.text), `${t.route} prints no NaN, Infinity or undefined`, base.text.length > 150 ? badAt(base.text) : "blank page");
  await base.ctx.close();
  const links = await linksFor(t.file);
  if (!links) continue;
  for (const [kind, q] of [["sample", links.sample], ["hostile", links.hostile]]) {
    /* A sample link must reach its result. A hostile link settles on its result, on its start
       screen (an assessment whose answers were dropped as off the scale) or on a blocked or
       void notice (a calculator that refuses impossible inputs). Any of these is fine, but the
       report always says which, so a skipped PDF check is never silent. */
    const NO_RESULT = /Start [A-Z][a-z]+|result blocked|export void/i;
    const v = await open(t.route + q, kind === "sample" ? /request a review/ : new RegExp("request a review|" + NO_RESULT.source, "i"));
    const shown = v.text.length > 150;
    report(v.errors.length === 0 && shown, `${t.route} ${kind} link renders`, v.errors[0] || (shown ? "" : "blank page"));
    report(shown && !BAD.test(v.text), `${t.route} ${kind} page is clean`, shown ? badAt(v.text) : "blank page");
    if (/request a review/i.test(v.text)) {
      try {
        const p = await pdfText(v.ctx, v.page);
        report(p.length > 300 && !BAD.test(p), `${t.route} ${kind} PDF is clean`, badAt(p) || (p.length <= 300 ? "PDF nearly empty" : ""));
      } catch (e) { report(false, `${t.route} ${kind} PDF generates`, e.message.slice(0, 100)); }
    } else if (kind === "sample") report(false, `${t.route} sample link shows the result`);
    else {
      const state = !shown ? "" : /result blocked|export void/i.test(v.text) ? "a blocked-result notice" : /Start [A-Z][a-z]+/.test(v.text) ? "its start screen" : "";
      report(!!state, `${t.route} hostile link shows ${state || "no result and no start screen"}, so it claims no result`, state ? "" : shown ? "neither a result, a start screen nor a blocked notice" : "blank page");
    }
    await v.ctx.close();
  }
}
for (const m of METHODOLOGY) {
  const v = await open(m);
  report(v.errors.length === 0 && /bands/i.test(v.text) && /cannot tell you/i.test(v.text) && !BAD.test(v.text), `${m} renders its rubric`, v.errors[0] || badAt(v.text));
  await v.ctx.close();
}
/* The public method changelog: renders, lists at least one dated change, links methods. */
{
  const v = await open("/changelog");
  report(v.errors.length === 0 && /What changed in how the tools calculate/.test(v.text) && /\d{1,2} [A-Z][a-z]+ 20\d\d/.test(v.text) && !BAD.test(v.text), "/changelog renders the method changes", v.errors[0] || badAt(v.text));
  await v.ctx.close();
}
/* Full-page prerender (P1 task 3): the served HTML carries the page body before any script runs, and the page then
   hydrates with no error (a hydration mismatch surfaces as a page error). One of each page type. */
for (const path of ["/", "/about", "/industries", "/industries/healthcare", "/industries/healthcare/health-insurance", "/vendors/ccaas", "/vendors/genesys", "/methodology/staffing-calculator", "/tools/staffing-calculator"]) {
  const v = await open(path);
  const raw = await v.ctx.request.get(ORIGIN + path).then((r) => r.text()).catch(() => "");
  const body = (raw.match(/<div id="root">([\s\S]*)<\/div>/) || [])[1] || "";
  report(/<h1[\s>]/.test(body) && body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").length > 250, `${path} is served with its body in the HTML`, body ? "" : "empty root");
  report(v.errors.length === 0 && v.text.length > 150, `${path} hydrates with no error`, v.errors[0] || "");
  await v.ctx.close();
}

/* The security headers production must serve, and no policy violation anywhere. */
if (INJECT || !/localhost|127\.0\.0\.1/.test(ORIGIN)) {
  const csp = (docHeaders && docHeaders["content-security-policy"]) || "";
  report(/script-src 'self'/.test(csp) && !/unsafe-inline[^;]*;|unsafe-eval/.test(csp.split(";").find((d) => /script-src/.test(d)) + ";") && /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp), "the site serves its Content Security Policy", csp ? "" : "no policy header");
  report(!!docHeaders && docHeaders["x-content-type-options"] === "nosniff" && docHeaders["x-frame-options"] === "DENY" && !!docHeaders["referrer-policy"] && !!docHeaders["permissions-policy"], "the site serves its security headers");
}
report(cspViolations.length === 0, "no Content Security Policy violation on any page or report window", cspViolations.slice(0, 3).join(" | "));
await browser.close();
console.log(`\n${checks - failures} of ${checks} checks passed.`);
process.exit(failures ? 1 : 0);
