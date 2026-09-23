/* scripts/visual-audit.mjs
 *
 * The visual and usability audit: every tool, both rubric pages and the two entry
 * pages, on desktop (1366 x 900) and phone (390 x 844), against any origin.
 *
 *   node scripts/visual-audit.mjs https://www.contactcentercx.com ./audit-out
 *
 * For each page and viewport it saves a first-screen and a full-page screenshot and
 * measures what a reviewer would otherwise judge by eye: horizontal overflow on a
 * phone, text below 12px (11px for uppercase eyebrows), tap targets under 40px, inputs with no accessible name,
 * text below WCAG AA contrast on a solid background, emoji used as icons, heading
 * structure, images without alt text and the font families in use. Tools open on
 * their sample link, so the audit sees the result a user sees.
 *
 * Writes audit.json and prints one summary line per page. It judges nothing on its
 * own: the numbers feed the punch list in docs/VISUAL_AUDIT.md.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { chromium } from "playwright-core";
import { encodeScenario } from "../src/lib/scenarioUrl.js";

const ORIGIN = (process.argv[2] || "https://www.contactcentercx.com").replace(/\/$/, "");
const OUT = process.argv[3] || "./audit-out";
mkdirSync(OUT, { recursive: true });
const require = createRequire(import.meta.url);

const APP = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
const lazyFile = Object.fromEntries([...APP.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/(\w+)'\)\)/g)].map((m) => [m[1], m[2] + ".jsx"]));
const TOOLS = [...APP.matchAll(/<Route\s+path="(\/tools\/[a-z0-9-]+)"\s+element=\{<(\w+) \/>\}/g)]
  .map((m) => ({ route: m[1], file: lazyFile[m[2]] })).filter((t) => t.file);
const METHODOLOGY = [...APP.matchAll(/<Route\s+path="(\/methodology\/[a-z0-9-]+)"/g)].map((m) => m[1]);

globalThis.window = { location: { search: "" } };
async function sampleQuery(file) {
  const src = readFileSync(new URL("../" + file, import.meta.url), "utf8");
  const id = (src.match(/const TOOL_ID\s*=\s*"([^"]+)"/) || [])[1];
  if (!id) return "";
  const r = await build({ entryPoints: [new URL("../" + file, import.meta.url).pathname], bundle: true, write: false, format: "cjs",
    platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  if (!mod.exports.SCENARIO_DEFAULTS && !mod.exports.DEFAULTS) return "";
  const D = mod.exports.SCENARIO_DEFAULTS || mod.exports.DEFAULTS;
  return "?s=" + encodeScenario(id, mod.exports.SAMPLE || D, D);
}

/* Runs in the page. Every measure is a count plus a few examples, so a reviewer can
   find the element without re-running anything. */
function measure() {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"; };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const rgb = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const solidBg = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      const c = rgb(s.backgroundColor); if (c && c.a >= 0.99) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const label = (el) => (el.innerText || el.value || el.getAttribute("aria-label") || el.placeholder || el.tagName).trim().slice(0, 40);
  const all = [...document.querySelectorAll("body *")].filter(vis);

  const small = [], lowContrast = [], emoji = [];
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}]/u;
  const fonts = new Set();
  for (const el of all) {
    const t = ownText(el); if (!t) continue;
    if (el.closest(".infodot")) continue; /* the info glyph is an icon with an aria-label */
    const s = getComputedStyle(el); const fs = parseFloat(s.fontSize);
    fonts.add(s.fontFamily.split(",")[0].replace(/["']/g, "").trim());
    /* Uppercase eyebrow labels may sit at 11px (type.js TYPE.eyebrow); all other text at 12px or more. */
    if (fs < 12 && !(fs >= 11 && s.textTransform === "uppercase")) small.push(`${fs}px "${t.slice(0, 30)}"`);
    if (EMOJI.test(t)) emoji.push(t.slice(0, 20));
    const fg = rgb(s.color), bg = solidBg(el);
    if (fg && bg) {
      const a = fg.a; const mix = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
      const L1 = lum(mix), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const large = fs >= 24 || (fs >= 18.66 && parseInt(s.fontWeight) >= 700);
      if (ratio < (large ? 3 : 4.5)) lowContrast.push(`${ratio.toFixed(1)}:1 "${t.slice(0, 30)}"`);
    }
  }
  const targets = [...document.querySelectorAll("a[href], button, input, select, textarea, [role=button]")].filter(vis);
  const smallTargets = targets.filter((el) => { const r = el.getBoundingClientRect(); return r.height < 40 && !(el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio")); }).map(label);
  const fields = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter(vis);
  const unnamed = fields.filter((el) => {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.title) return false;
    if (el.id && document.querySelector(`label[for="${el.id}"]`)) return false;
    if (el.closest("label")) return false;
    return true;
  }).map((el) => (el.placeholder || el.type || el.tagName).slice(0, 30));
  const doc = document.documentElement;
  const overflow = doc.scrollWidth > window.innerWidth + 2;
  const wide = overflow ? all.filter((el) => el.getBoundingClientRect().right > window.innerWidth + 2).slice(-3).map((el) => `${el.tagName.toLowerCase()} ${Math.round(el.getBoundingClientRect().right)}px "${(el.innerText || "").trim().slice(0, 25)}"`) : [];
  return {
    height: doc.scrollHeight, overflow, overflowBy: doc.scrollWidth - window.innerWidth, wide,
    h1: document.querySelectorAll("h1").length,
    headings: [...document.querySelectorAll("h1,h2,h3")].filter(vis).length,
    fonts: [...fonts],
    small: { n: small.length, eg: small.slice(0, 4) },
    lowContrast: { n: lowContrast.length, eg: lowContrast.slice(0, 4) },
    smallTargets: { n: smallTargets.length, of: targets.length, eg: smallTargets.slice(0, 4) },
    unnamedFields: { n: unnamed.length, of: fields.length, eg: unnamed.slice(0, 4) },
    emoji: { n: emoji.length, eg: emoji.slice(0, 5) },
    imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.alt).length,
  };
}

const VIEWPORTS = { desktop: { width: 1366, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true } };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: (process.env.CHROMIUM_ARGS || "").split(" ").filter(Boolean) });
const pages = [{ route: "/", name: "home" }, { route: "/how-to-choose", name: "how-to-choose" }, ...METHODOLOGY.map((m) => ({ route: m, name: m.split("/").pop() + "-rubric" }))];
for (const t of TOOLS) pages.push({ route: t.route + (await sampleQuery(t.file)), name: t.route.split("/").pop(), tool: true });

const results = [];
for (const p of pages) for (const [vp, opts] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport: { width: opts.width, height: opts.height }, isMobile: !!opts.isMobile, hasTouch: !!opts.hasTouch, deviceScaleFactor: 1 });
  await ctx.route(/posthog\.com|_vercel\/insights|vitals\.vercel|formspree\.io/, (r) => r.abort());
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 100)));
  await page.goto(ORIGIN + p.route, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForFunction(() => document.body.innerText.length > 150, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(600);
  const m = await page.evaluate(measure).catch((e) => ({ error: e.message }));
  await page.screenshot({ path: `${OUT}/${p.name}-${vp}-first.png` });
  await page.screenshot({ path: `${OUT}/${p.name}-${vp}-full.png`, fullPage: true });
  results.push({ name: p.name, viewport: vp, tool: !!p.tool, errors, ...m });
  console.log(`${p.name.padEnd(26)} ${vp.padEnd(7)} h=${String(m.height).padStart(5)} overflow=${m.overflow ? "YES +" + m.overflowBy : "no"} small=${m.small?.n} contrast=${m.lowContrast?.n} targets<40=${m.smallTargets?.n}/${m.smallTargets?.of} unnamed=${m.unnamedFields?.n}/${m.unnamedFields?.of} emoji=${m.emoji?.n} h1=${m.h1} fonts=${(m.fonts || []).join("|")}${errors.length ? " ERR " + errors[0] : ""}`);
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/audit.json`, JSON.stringify(results, null, 1));
