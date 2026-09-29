// scripts/framework-pdf.mjs
//
// Prints the 7-Layer CX Orchestration Framework (src/lib/frameworkGuide.js via frameworkHtml.js) to
// public/CX-Orchestration-Framework-2026.pdf with Chromium, serving the self-hosted Plex fonts from public/fonts, and
// records the page's hash and the PDF's hash in src/data/frameworkGuide.manifest.json. framework.test.mjs recomputes
// the page hash, so a content change without a reprint fails the suite.
//
// Run from repo root after changing the guide: CHROMIUM_PATH=/path/to/chromium node scripts/framework-pdf.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "playwright-core";
import { buildFrameworkHtml } from "../src/lib/frameworkHtml.js";
import { GUIDE } from "../src/lib/frameworkGuide.js";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const html = buildFrameworkHtml();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
await page.route("https://framework.local/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path.startsWith("/fonts/")) return route.fulfill({ body: readFileSync("public" + path), contentType: "font/woff2" });
  return route.fulfill({ body: html, contentType: "text/html; charset=utf-8" });
});
await page.goto("https://framework.local/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const pdf = await page.pdf({ format: "Letter", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
  footerTemplate: `<div style="width:100%;font-size:8px;color:#4A5A70;padding:0 0.75in;display:flex;justify-content:space-between;font-family:sans-serif"><span>${GUIDE.title}, ${GUIDE.edition}</span><span>contactcentercx.com · page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  margin: { top: "0.7in", bottom: "0.8in", left: "0.75in", right: "0.75in" } });
await browser.close();
const out = "public" + GUIDE.file;
writeFileSync(out, pdf);
const manifest = { file: GUIDE.file, edition: GUIDE.edition, updated: GUIDE.updated, htmlSha256: sha(html), pdfSha256: sha(pdf), bytes: pdf.length };
writeFileSync("src/data/frameworkGuide.manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${out} (${pdf.length} bytes)`);
