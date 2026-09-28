// scripts/perf-check.mjs
//
// The performance budget (redesign Phase 11). Loads one page of each kind on a throttled phone (390 wide, 4x slower CPU,
// 1.6 Mbps down, 150 ms latency) and holds each to the budget: Largest Contentful Paint and First Contentful Paint within
// Google's "good" Core Web Vitals line (2.5 s), layout shift under 0.1, and the script a page downloads (compressed, as it
// crosses the wire) within 300 KB. Analytics and form hosts are blocked so no test event reaches production data.
//
//   node scripts/perf-check.mjs https://www.contactcentercx.com      (production)
//   node scripts/perf-check.mjs http://localhost:4173                  (a local build served with the Vercel rules)
//
// Exits 1 when a page is over budget. Chromium: CHROMIUM_PATH, else Playwright's own.
import { chromium } from "playwright-core";

const ORIGIN = (process.argv[2] || "https://www.contactcentercx.com").replace(/\/$/, "");
export const BUDGET = { lcp: 2500, fcp: 2500, cls: 0.1, jsKB: 300 };
export const PAGES = ["/", "/tools/cost-per-contact", "/tools/tco-calculator", "/tools/staffing-calculator", "/vendors/ccaas",
  "/vendors/genesys", "/industries/healthcare", "/market-watch", "/methodology/staffing-calculator", "/vendors"];

const b = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ["--ignore-certificate-errors"] });
let over = 0;
console.log(`Performance budget against ${ORIGIN}: LCP and FCP within ${BUDGET.lcp} ms, CLS under ${BUDGET.cls}, script within ${BUDGET.jsKB} KB compressed\n`);
for (const path of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let js = 0;
  const types = new Map();
  cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));
  cdp.on("Network.loadingFinished", (e) => { if (types.get(e.requestId) === "Script") js += e.encodedDataLength; });
  await p.route(/posthog|_vercel\/insights|va\.vercel-scripts|formspree/, (r) => r.abort());
  await p.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  try {
    await p.goto(ORIGIN + path, { waitUntil: "load", timeout: 90000 });
    await p.waitForTimeout(3000);
    const m = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), fcp: Math.round((performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime || 0) }));
    const kb = Math.round(js / 1024);
    const bad = [m.lcp > BUDGET.lcp && "LCP", m.fcp > BUDGET.fcp && "FCP", m.cls >= BUDGET.cls && "CLS", kb > BUDGET.jsKB && "script"].filter(Boolean);
    if (bad.length) over++;
    console.log(`${bad.length ? "OVER" : "ok  "} ${path.padEnd(34)} FCP ${m.fcp} ms  LCP ${m.lcp} ms  CLS ${m.cls}  script ${kb} KB${bad.length ? "  (" + bad.join(", ") + ")" : ""}`);
  } catch (e) {
    over++; console.log(`FAIL ${path.padEnd(34)} ${e.message.slice(0, 80)}`);
  }
  await ctx.close();
}
await b.close();
console.log(`\n${PAGES.length - over} of ${PAGES.length} pages within budget.`);
if (over) process.exit(1);
