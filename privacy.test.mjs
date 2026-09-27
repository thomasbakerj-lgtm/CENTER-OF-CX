// privacy.test.mjs
//
// The Privacy Policy states what the code does (TB, 27 Sep 2026: update for accuracy, name every tool and plug-in).
// Every Formspree endpoint in the site's code is named in the policy's form list; every third-party host the security
// policy allows is named as a service; the policy makes no claim the site has retired (vendor scores, cookie-free
// "no third-party scripts"); the user-initiated contact-details clause is present; the Terms carry no score claim.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
globalThis.window = { scrollTo() {}, location: { search: "" } };
const r = await build({ entryPoints: ["./PrivacyPolicy.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} }; new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const React = require("react"); const { renderToString } = require("react-dom/server");
const t = renderToString(React.createElement(mod.exports.default)).replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");

const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter((f) => /\.(jsx?|mjs)$/.test(f) && !/\.test\.mjs$/.test(f));
const endpoints = new Set(tracked.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/formspree\.io\/f\/([a-z0-9]+)/g)].map((m) => m[1])));
const named = new Set(mod.exports.FORMS.flatMap((f) => f.endpoint.split(/,\s*/)));
ok(`every form endpoint in the code is in the policy's list (${endpoints.size})`, [...endpoints].every((e) => named.has(e)));
ok("no form in the list that the code no longer has", [...named].every((e) => endpoints.has(e)));
ok("every listed form renders", mod.exports.FORMS.every((f) => t.includes(f.what)));

const csp = (() => { const v = JSON.parse(readFileSync("./vercel.json", "utf8")); for (const h of v.headers || []) for (const x of h.headers) if (x.key === "Content-Security-Policy") return x.value; return ""; })();
const hosts = [...new Set([...csp.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map((m) => m[1]))];
const SERVICE = { "va.vercel-scripts.com": "Vercel", "fonts.googleapis.com": "Google Fonts", "fonts.gstatic.com": "Google Fonts", "us.i.posthog.com": "PostHog", "formspree.io": "Formspree" };
ok(`every third-party host the security policy allows is known here (${hosts.join(", ")})`, hosts.every((h) => SERVICE[h]));
ok("and each is named in the policy", hosts.every((h) => SERVICE[h] && t.includes(SERVICE[h])));

ok("says most of the site needs no email", /most of the Site never asks for your email/.test(t) && /Most tools and pages do not require an email address/.test(t));
ok("states the user-initiated contact-details clause, phone included, and that declining may prevent fulfilment", /For specific purposes that you start/.test(t) && /may require before we fulfil the request, a valid email address/.test(t) && /telephone number/.test(t) && /may not be able to complete that request/.test(t));
ok("says tool inputs stay in the browser and analytics never receive them", /numbers and answers you enter are not sent to us/.test(t) && /never receives the values you enter/.test(t));
ok("claims no vendor scores and no absence of third-party scripts", !/scores are independently|Vendor scores are|no third-party tracking scripts|do not use third-party/i.test(t));
ok("states no sale of personal information", /We do not sell, rent or trade your personal information/.test(t));
ok("carries a real update date", /Last updated: \d{1,2} [A-Z][a-z]+ 20\d\d/.test(t));
const TERMS = readFileSync("./TermsOfService.jsx", "utf8");
ok("the Terms claim no current vendor scores", !/Vendor scores, tier classifications|receive a higher score|published methodologies/.test(TERMS) && /scores and tiers have been withdrawn/.test(TERMS));
ok("no dash", !/[\u2013\u2014]/.test(readFileSync("./PrivacyPolicy.jsx", "utf8")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
