/* frameworkHtml.js
 *
 * The 7-Layer CX Orchestration Framework as one printable HTML page, from frameworkGuide.js. Pure: no clock, no random,
 * no environment, so the same content always gives the same page and framework.test.mjs can prove the committed PDF was
 * printed from the current content (its hash is recorded when scripts/framework-pdf.mjs prints it). Paper palette from
 * tokens; a layer's colour is a rule beside its number and name, never the only thing that marks it. Fonts are the
 * self-hosted Plex files, requested from /fonts/.
 */
import { HOUSE, ARCS_PRINT } from "./tokens.js";
import { GUIDE, INTRO, LAYER_GUIDE, DEPENDENCIES, SCALE, CHECKLIST, ABOUT, layerFigures, layerMeta } from "./frameworkGuide.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const SITE = "https://www.contactcentercx.com";
const link = (path, label) => `<a href="${SITE}${path}">${esc(label)}</a>`;
const MUTED = "#4A5A70";

const face = (w, file, style = "normal") => `@font-face{font-family:"IBM Plex Sans";font-weight:${w};font-style:${style};src:url(/fonts/${file}) format("woff2")}`;
const CSS = `${face(400, "plex-sans-400.woff2")}${face(400, "plex-sans-400-italic.woff2", "italic")}${face(500, "plex-sans-500.woff2")}${face(600, "plex-sans-600.woff2")}${face(700, "plex-sans-700.woff2")}
@page{size:Letter;margin:0.7in 0.75in 0.8in}
*{box-sizing:border-box}
body{margin:0;font-family:"IBM Plex Sans",sans-serif;font-size:10.5pt;line-height:1.55;color:${HOUSE.paperInk};background:${HOUSE.paper}}
h1{font-size:30pt;line-height:1.1;margin:0 0 12pt;font-weight:700}
h2{font-size:17pt;line-height:1.25;margin:0 0 10pt;font-weight:700}
h3{font-size:12.5pt;margin:0 0 4pt;font-weight:600}
p{margin:0 0 8pt}
a{color:${HOUSE.action};text-decoration:underline}
.kicker{font-size:8.5pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${MUTED};margin-bottom:6pt}
.cover{height:9.3in;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always}
.stack{display:flex;flex-direction:column;gap:5pt;margin:18pt 0}
.stack div{border-left:6pt solid;padding:4pt 10pt;background:${HOUSE.paper2};font-weight:600}
.stack span{font-weight:400;color:${MUTED}}
section{page-break-before:always}
.layer{page-break-inside:avoid;border-left:5pt solid;padding:2pt 0 2pt 14pt;margin:0 0 16pt}
.label{font-size:8.5pt;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};margin:9pt 0 3pt}
ul,ol{margin:0 0 8pt;padding-left:16pt}
li{margin:0 0 3pt}
table{width:100%;border-collapse:collapse;margin:6pt 0 12pt;font-size:9.5pt}
th,td{text-align:left;vertical-align:top;padding:5pt 6pt;border-bottom:.75pt solid ${ARCS_PRINT.track}}
th{font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};font-weight:600}
.box{background:${HOUSE.paper2};padding:8pt 10pt;margin:6pt 0 10pt}
.figs td:first-child{white-space:nowrap;font-weight:700;width:1%}
.src{font-size:8.5pt;color:${MUTED}}
.rate td:last-child{width:1.4in;color:${MUTED};font-size:8.5pt}`;

function cover() {
  const stack = [...LAYER_GUIDE].reverse().map((l) => { const m = layerMeta(l.n); return `<div style="border-left-color:${m.color}">Layer ${l.n}: ${esc(m.name)} <span>(${esc(m.technical)})</span></div>`; }).join("");
  return `<div class="cover"><div><div class="kicker">The Center of CX</div><h1>${esc(GUIDE.title)}</h1><p style="font-size:13pt">${esc(GUIDE.subtitle)}</p><div class="stack">${stack}</div></div>
  <div><p><b>${esc(GUIDE.edition)}</b>, updated ${esc(GUIDE.updated)}. Replaces ${esc(GUIDE.replaces)}.</p><p class="src">Independent. No vendor sponsorship. contactcentercx.com</p></div></div>`;
}

function intro() {
  const rows = LAYER_GUIDE.map((l) => { const m = layerMeta(l.n); return `<tr><td style="border-left:4pt solid ${m.color};font-weight:600;white-space:nowrap">${l.n}. ${esc(m.name)}</td><td>${esc(l.what)}</td><td>${esc(l.owners)}</td></tr>`; }).join("");
  return `<div class="kicker">Section 1</div><h2>Why a stack needs layers</h2>${INTRO.map((p) => `<p>${esc(p)}</p>`).join("")}
  <h3 style="margin-top:14pt">The seven layers at a glance</h3><table><tr><th>Layer</th><th>What it does</th><th>Who usually owns it</th></tr>${rows}</table>`;
}

function layer(l) {
  const m = layerMeta(l.n);
  const figs = layerFigures(l).map((g) => `<div class="label">Published figures: ${esc(g.title)}</div><table class="figs">${g.rows.map((r) => `<tr><td>${esc(r.value)}</td><td>${esc(r.label)}<br><span class="src">${esc(r.source.publisher)}${r.source.host ? `, read on ${esc(r.source.host)}` : ""}, ${esc(r.source.published)}. <a href="${esc(r.source.url)}">Source</a></span></td></tr>`).join("")}</table>`).join("");
  return `<div class="layer" style="border-left-color:${m.color}"><div class="kicker">Layer ${l.n} · ${esc(m.technical)}</div><h3>${esc(m.name)}</h3>
  <p>${esc(l.what)}</p><div class="label">Who usually owns it</div><p>${esc(l.owners)}</p>
  <div class="label">Questions to answer</div><ul>${l.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
  <div class="label">What to check first</div><p>${esc(l.check)}</p>
  <div class="label">When it fails</div><p>${esc(l.breaks)}</p>${figs}
  <div class="label">Test it with your own numbers</div><p>${l.tools.map(([p, t]) => link(p, t)).join(", ")}</p></div>`;
}

function dependencies() {
  const rows = DEPENDENCIES.map(([n, affected, felt]) => `<tr><td style="border-left:4pt solid ${layerMeta(n).color};font-weight:600;white-space:nowrap">${n}. ${esc(layerMeta(n).name)}</td><td>${esc(affected)}</td><td>${esc(felt)}</td></tr>`).join("");
  return `<div class="kicker">Section 3</div><h2>What depends on what</h2><p>No layer works alone. Most failed projects trace back to a dependency nobody mapped before the work began. This is our reading of how a failure travels up and across the stack.</p>
  <table><tr><th>If this layer fails</th><th>These feel it</th><th>What the customer notices</th></tr>${rows}</table>
  <div class="box"><b>Start at the bottom.</b> Automated reasoning built on incomplete or stale data gives confident answers that are wrong. Fixing the data layer first makes every change above it safer.</div>`;
}

function checklist() {
  const rows = CHECKLIST.map(([n, s]) => `<tr><td style="border-left:4pt solid ${layerMeta(n).color};white-space:nowrap;font-weight:600">${n}. ${esc(layerMeta(n).name)}</td><td>${esc(s)}</td><td>1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5</td></tr>`).join("");
  return `<div class="kicker">Section 4</div><h2>Readiness checklist</h2><p>Rate each statement from 1 to 5: ${SCALE.map((s, i) => `${i + 1} ${esc(s.toLowerCase())}`).join(", ")}.</p>
  <p>Every statement you rate 2 or below is an action. Start with the layer that has the most of them, lowest layer first when two are level. There is no total and no band: a strong layer does not make up for a weak one.</p>
  <table class="rate"><tr><th>Layer</th><th>Statement</th><th>Your rating</th></tr>${rows}</table>
  <p class="src">For a scored assessment with a published rubric, try ${link("/tools/cx-it-alignment", "CX IT Alignment")} or ${link("/tools/cx-maturity", "CX Maturity")}.</p>`;
}

function about() {
  return `<div class="kicker">Section 5</div><h2>About this framework</h2><p><b>What it is.</b> ${esc(ABOUT.is)}</p><p><b>What it is not.</b> ${esc(ABOUT.isnt)}</p><p><b>Figures.</b> ${esc(ABOUT.figures)}</p>
  <h3 style="margin-top:12pt">What changed from ${esc(GUIDE.replaces)}</h3><ul>${ABOUT.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
  <p style="margin-top:14pt">Related: ${link("/platforms-and-tech", "Platforms and Tech")}, ${link("/tools/platform-decision", "Platform Decision")}, ${link("/tools/tco-calculator", "TCO Calculator")}, ${link("/vendors", "Vendor profiles")}, ${link("/advisory", "Advisory")}.</p>
  <p class="src">Published by The Center of CX, ${esc(GUIDE.updated)}. Report an error at ${link("/corrections", "contactcentercx.com/corrections")}.</p>`;
}

export function buildFrameworkHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(GUIDE.title)}, ${esc(GUIDE.edition)}</title><style>${CSS}</style></head><body>
${cover()}<section>${intro()}</section><section><div class="kicker">Section 2</div><h2>The layers one by one</h2>${LAYER_GUIDE.map(layer).join("")}</section>
<section>${dependencies()}</section><section>${checklist()}</section><section>${about()}</section></body></html>`;
}

/* Every site path the guide links, for the test. */
export function frameworkLinks() {
  return [...buildFrameworkHtml().matchAll(/href="https:\/\/www\.contactcentercx\.com(\/[^"]*)"/g)].map((m) => m[1]);
}
