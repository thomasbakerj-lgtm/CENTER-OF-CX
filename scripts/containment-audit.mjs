// scripts/containment-audit.mjs
//
// Finds text and elements that spill past the edge of the box that holds them: a card, a chip, a button, a bordered or
// filled panel. The page-level sweeps only asked whether the page scrolled sideways, which misses a chip that crosses its
// card's border while the page still fits (TB, 30 Sep, from a phone: "text runs out of the border boxes").
//
//   node scripts/containment-audit.mjs <origin> [widths=390,360] [paths...]
//
// With no paths it reads every URL in public/sitemap.xml. A box is any element with a visible border or a background;
// inside it, every text run (measured with a Range, so a long word that will not wrap counts) and every image, svg,
// input and button must stay within the box, give or take one pixel. A clipping or scrolling ancestor between them ends
// the check (the overflow is intended and reachable). Prints each finding and exits 1 when any is found.
// Needs playwright-core (installed with --no-save in CI, as for the live checker) and a Chromium; set CHROMIUM_PATH to
// use a local one. Runs nightly on production after the live check.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const ORIGIN = (process.argv[2] || "http://localhost:4173").replace(/\/$/, "");
const WIDTHS = (process.argv[3] || "390,360").split(",").map(Number);
const PATHS = process.argv.slice(4).length ? process.argv.slice(4)
  : [...readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8").matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

function audit() {
  const TOL = 1;
  const visible = (cs) => cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0;
  const hasAlpha = (c) => c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c);
  const isBox = (el) => {
    if (el === document.body || el === document.documentElement) return false;
    const cs = getComputedStyle(el);
    const border = ["Top", "Right", "Bottom", "Left"].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none" && hasAlpha(cs[`border${s}Color`]));
    return border || hasAlpha(cs.backgroundColor);
  };
  const clips = (el) => { const cs = getComputedStyle(el); return cs.overflowX !== "visible" || cs.overflow !== "visible"; };
  const label = (el) => {
    const t = el.tagName.toLowerCase(), c = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean)[0];
    return t + (el.id ? "#" + el.id : "") + (c ? "." + c : "");
  };
  // The nearest box around a node, unless a clipping or scrolling ancestor comes first.
  const boxOf = (node) => {
    for (let el = node.nodeType === 1 ? node.parentElement : node.parentElement; el && el !== document.body; el = el.parentElement) {
      if (clips(el)) return null; // a clipping or scrolling box: overflow there is intended and reachable
      if (isBox(el)) return el;
    }
    return null;
  };
  const out = [];
  // Content of a closed <details> is not shown; only its summary counts.
  const hidden = (node) => { const d = node.closest && node.closest("details:not([open])"); return !!d && !node.closest("summary"); };
  const check = (node, rect, what) => {
    if (!rect || rect.width === 0 || rect.height === 0 || hidden(node)) return;
    if (node.closest && node.closest("legend")) return; // a legend sits on its fieldset's border by design
    const box = boxOf(node);
    if (!box) return;
    const b = box.getBoundingClientRect();
    const over = Math.max(rect.right - b.right, b.left - rect.left, rect.bottom - b.bottom, b.top - rect.top);
    if (over > TOL) out.push({ box: label(box), boxText: (box.innerText || "").trim().slice(0, 60).replace(/\s+/g, " "), what, by: Math.round(over) });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.trim();
    if (!text || !n.parentElement || !visible(getComputedStyle(n.parentElement))) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) check(n.parentElement, r, text.slice(0, 50));
  }
  for (const el of document.body.querySelectorAll("img,svg,input,button,select,textarea")) {
    if (!visible(getComputedStyle(el))) continue;
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    check(el, el.getBoundingClientRect(), "<" + el.tagName.toLowerCase() + ">");
  }
  const seen = new Set();
  return out.filter((f) => { const k = f.box + f.what; if (seen.has(k)) return false; seen.add(k); return true; });
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let total = 0;
const pages = {};
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 1 });
  await ctx.route(/posthog|_vercel\/insights|formspree/, (r) => r.abort());
  const page = await ctx.newPage();
  for (const p of PATHS) {
    try {
      await page.goto(ORIGIN + p, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(150);
      const found = await page.evaluate(audit);
      for (const f of found) { (pages[p] ||= []).push({ w, ...f }); total++; }
    } catch (e) { (pages[p] ||= []).push({ w, error: e.message.split("\n")[0] }); total++; }
  }
  await ctx.close();
}
await browser.close();
for (const [p, list] of Object.entries(pages)) {
  console.log(p);
  for (const f of list) console.log(f.error ? `  ${f.w}px ERROR ${f.error}` : `  ${f.w}px ${f.box} [${f.boxText}] <- "${f.what}" by ${f.by}px`);
}
console.log(`\n${PATHS.length} pages at ${WIDTHS.join(" and ")} px: ${total} findings on ${Object.keys(pages).length} pages`);
process.exit(total ? 1 : 0);
