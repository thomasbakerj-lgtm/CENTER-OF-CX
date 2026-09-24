/* security.test.mjs
 *
 * The site's security floor, gated on every run. The headers production serves, every
 * external host the shipped code contacts against the policy that allows it, every
 * HTML sink in the shipped code, the report window's own policy, new-tab links and
 * committed secrets. SECURITY.md is the protocol these gates enforce.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

/* The shipped source: every .js and .jsx at the root and under src, minus harnesses. */
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = dir === "." ? f : dir + "/" + f;
  if (/^(node_modules|dist|\.git|scripts|docs|public)$/.test(f)) return [];
  if (statSync(p).isDirectory()) return dir === "." && f !== "src" ? [] : walk(p);
  return /\.(jsx?|mjs)$/.test(f) && !/\.(test|report)\.mjs$|^run-all\.mjs$|^rail-audit\.mjs$|^\./.test(f) ? [p] : [];
});
const FILES = walk(".").filter((f) => !/\.mjs$/.test(f));
const SRC = Object.fromEntries(FILES.map((f) => [f, readFileSync(f, "utf8")]));
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

/* ------------------------------------------------------------ 1. headers */
section("1. Production serves a strict policy and the security headers");
const V = JSON.parse(readFileSync("./vercel.json", "utf8"));
const H = Object.fromEntries(((V.headers || [])[0] || { headers: [] }).headers.map((h) => [h.key.toLowerCase(), h.value]));
ok("headers apply to every path", V.headers && V.headers[0] && V.headers[0].source === "/(.*)");
const CSP = Object.fromEntries((H["content-security-policy"] || "").split(";").map((d) => d.trim()).filter(Boolean).map((d) => { const [k, ...v] = d.split(/\s+/); return [k, v]; }));
ok("default-src is 'self'", (CSP["default-src"] || []).join(" ") === "'self'");
ok("script-src allows the site and nothing inline or evaluated", (CSP["script-src"] || [])[0] === "'self'" && !(CSP["script-src"] || []).some((x) => /unsafe|data:|\*/.test(x)));
ok("object-src is 'none'", (CSP["object-src"] || []).join(" ") === "'none'");
ok("the site cannot be framed", (CSP["frame-ancestors"] || []).join(" ") === "'none'" && H["x-frame-options"] === "DENY");
ok("base-uri and form-action are pinned", !!CSP["base-uri"] && !!CSP["form-action"]);
ok("no wildcard host anywhere in the policy", !Object.values(CSP).flat().some((x) => x === "*" || /^https?:\/\/\*/.test(x) || x === "https:"));
ok("nosniff, a referrer policy and a permissions policy", H["x-content-type-options"] === "nosniff" && !!H["referrer-policy"] && /camera=\(\)/.test(H["permissions-policy"] || ""));

/* ------------------------------------------------------------ 2. hosts */
section("2. Every external host the shipped code contacts is allowed, and only those");
const fetched = new Set(), styled = new Set();
for (const [f, s] of Object.entries(SRC)) {
  const c = strip(s);
  for (const m of c.matchAll(/fetch\(\s*[`"'](https:\/\/[^/`"']+)/g)) fetched.add(m[1]);
  for (const m of c.matchAll(/host:\s*[^\n]*?"(https:\/\/[^/"]+)"/g)) fetched.add(m[1]);
  for (const m of c.matchAll(/@import url\(['"]?(https:\/\/[^/'")]+)/g)) styled.add(m[1]);
  for (const m of c.matchAll(/(?:const|let)\s+\w*(?:ENDPOINT|URL|Url)\w*\s*=\s*[`"'](https:\/\/[^/`"']+)/g)) fetched.add(m[1]);
}
ok(`found the hosts the code contacts (${[...fetched].join(", ")})`, fetched.size >= 2);
for (const h of fetched) ok(`connect-src allows ${h}`, (CSP["connect-src"] || []).includes(h));
for (const h of styled) ok(`style-src allows ${h}`, (CSP["style-src"] || []).includes(h));
for (const h of (CSP["connect-src"] || []).filter((x) => x.startsWith("https://"))) ok(`connect-src ${h} is still used`, fetched.has(h));
ok("Formspree posts are allowed as form actions too", (CSP["form-action"] || []).includes("https://formspree.io"));

/* ------------------------------------------------------------ 3. sinks */
section("3. HTML sinks in the shipped code");
const hits = (re) => Object.entries(SRC).filter(([, s]) => re.test(strip(s))).map(([f]) => f);
ok("no dangerouslySetInnerHTML", hits(/dangerouslySetInnerHTML/).length === 0);
ok("no innerHTML, outerHTML or insertAdjacentHTML", hits(/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML/).length === 0);
ok("no eval or Function constructor in shipped code", hits(/\beval\(|new Function\(/).length === 0);
ok("document.write only in the report renderer", JSON.stringify(hits(/document\.write\(/)) === JSON.stringify(["ReportExport.jsx"]));
ok("window.open only in the report renderer", JSON.stringify(hits(/window\.open\(/)) === JSON.stringify(["ReportExport.jsx"]));
ok("no javascript: URL", hits(/["'`]javascript:/i).length === 0);

/* ------------------------------------------------------------ 4. report window */
section("4. The report window runs no script and keeps no handle to the site");
const r = await build({ entryPoints: ["./ReportExport.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const html = mod.exports.reportHtml({ toolName: "t", today: "d", sections: [{ title: "n", type: "next", items: [{ tool: "x", reason: "y", href: "/tools/x" }] }] });
const meta = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/) || [])[1] || "";
ok("the report carries its own policy with script-src 'none'", /script-src 'none'/.test(meta) && /default-src 'none'/.test(meta) && /form-action 'none'/.test(meta));
ok("the report has no inline event handler", !/\son[a-z]+=/i.test(html));
const RE = SRC["ReportExport.jsx"];
ok("the print button is wired from the site, and the window's opener is cut", /getElementById\("print-report"\)/.test(RE) && /win\.opener = null/.test(RE));

/* ------------------------------------------------------------ 5. links */
section("5. New-tab links cannot reach back to the site");
const blank = Object.entries(SRC).flatMap(([f, s]) => [...s.matchAll(/<a\b[^>]*target=["{]["']?_blank[^>]*>/g)].map((m) => [f, m[0]]));
const bare = blank.filter(([, tag]) => !/rel=["{][^>]*noopener/.test(tag));
ok(`every target _blank link carries rel noopener (${blank.length} links${bare.length ? "; missing: " + bare.slice(0, 3).map(([f]) => f).join(", ") : ""})`, bare.length === 0);
ok("report next-step links carry rel noopener", /target="_blank" rel="noopener"/.test(html));

/* ------------------------------------------------------------ 6. secrets */
section("6. No secret is committed");
const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
ok("no .env file is tracked", !tracked.some((f) => /(^|\/)\.env(\.|$)/.test(f) && !/\.example$/.test(f)));
const secretHits = tracked.filter((f) => /\.(jsx?|mjs|json|md|html|ya?ml)$/.test(f) && !/package-lock/.test(f)).filter((f) => {
  const s = readFileSync(f, "utf8");
  return /-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|\bsk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}/.test(s);
});
ok(`no private key or known token shape in tracked files${secretHits.length ? " (" + secretHits.join(", ") + ")" : ""}`, secretHits.length === 0);
ok("the raw research corpus is not committed", !tracked.some((f) => /Master_Research_Corpus/i.test(f)));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
