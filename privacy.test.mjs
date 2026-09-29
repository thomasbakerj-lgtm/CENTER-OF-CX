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
ok("says tools are designed to process inputs in the browser and analytics are built not to receive them (TB legal notes, 29 Sep: no absolute promise)", /designed to process the values you enter in your browser/.test(t) && /designed never to include the values you enter/.test(t) && !/are not sent to us/.test(t));
ok("warns that scenario links carry inputs in the address, reach the host when opened and may be logged", /carries the inputs of a tool in the web address itself/.test(t) && /request logs may record it/.test(t) && /Do not put confidential information/.test(t));
ok("asks readers not to send sensitive information", /Please do not send sensitive information/.test(t) && /passwords, medical or health information/.test(t));
ok("describes the practice, not a contract: no 'By using the Site'", !/By using the Site/.test(t) && /our Terms of Use govern/.test(t));
ok("names the operator form and every processor, Google Workspace included", /sole proprietorship/.test(t) && ["Vercel", "PostHog", "Formspree", "Google Workspace", "GitHub"].every((n) => t.includes(n)));
ok("states PostHog discards IP addresses and runs without its browser library", /set to discard IP addresses/.test(t) && /without PostHog's browser library/.test(t) && !/may use your IP address to estimate/.test(t));
ok("keeps marketing apart from requests: no bundled 'related updates'", !/occasional related updates/.test(t) && /does not subscribe you/.test(t));
ok("says vendor reviews are not published and names the email as never public", /not published on the Site today/.test(t) && /Your email address is never published/.test(t));
ok("gives retention criteria by category, EEA and UK legal bases, and the appeal and agent route", /Newsletter subscriptions are kept while you are subscribed/.test(t) && /legitimate interests/.test(t) && /right to appeal/.test(t) && /authorised agent/.test(t));
ok("describes reasonable safeguards without promising specific controls", !/strict content security policy|no user accounts or passwords to protect/i.test(t) && /cannot guarantee/.test(t));
ok("introductions: the vendor handles what it receives under its own practices", /under their own privacy practices and legal responsibilities/.test(t));
ok("claims no vendor scores and no absence of third-party scripts", !/scores are independently|Vendor scores are|no third-party tracking scripts|do not use third-party/i.test(t));
ok("states no sale of personal information", /We do not sell, rent or trade your personal information/.test(t));
ok("carries a real update date", /Last updated: \d{1,2} [A-Z][a-z]+ 20\d\d/.test(t));
const TERMS = readFileSync("./TermsOfService.jsx", "utf8");
ok("the Terms claim no current vendor scores", !/Vendor scores, tier classifications|receive a higher score|published methodologies/.test(TERMS) && /scores and tiers have been withdrawn/.test(TERMS));
ok("no dash", !/[\u2013\u2014]/.test(readFileSync("./PrivacyPolicy.jsx", "utf8")));

/* Terms of Use (TB, 29 Sep 2026, from TB's legal review notes). */
{
  const src = readFileSync("./TermsOfService.jsx", "utf8");
  const heads = [...src.matchAll(/h: "(\d+)\. ([^"]+)"/g)].map((m) => m[2]);
  ok("Terms carry the clauses the notes rank strongest: research, tools, no guaranteed outcomes, IP, warranties, liability",
    ["Research, ratings and analysis", "Calculators, assessments and decision-support tools", "No guarantee of outcomes", "Intellectual property", "Disclaimer of warranties", "Limitation of liability"].every((h) => heads.includes(h)));
  ok("Terms also cover vendor information, introductions, submissions, reviews, acceptable use, indemnity and eligibility",
    ["Vendor information", "Vendor introductions", "User submissions", "Vendor reviews", "Acceptable use", "Indemnification", "Eligibility"].every((h) => heads.includes(h)));
  ok("Terms name the operator as the Privacy Policy does, and publish no placeholder", /sole proprietorship based in the United States/.test(src) && !/\[(LEGAL|STATE|COUNTY|BUSINESS)/.test(src));
  ok("no governing-law or venue clause until TB and counsel decide, and no arbitration clause", !/Governing law|governed by the laws of|arbitrat/i.test(src.replace(/\/\/.*$/gm, "")));
  ok("Terms say the site gives no legal, financial or procurement advice and separate engagements take their own agreement", /does not constitute legal, financial/.test(src) && /separate written/.test(src));
  ok("Terms carry a real date and the page is titled Terms of Use", /TERMS_UPDATED = "\d{1,2} [A-Z][a-z]+ 20\d\d"/.test(src) && /Terms of Use<\/h1>/.test(src) && /"\/terms": \{\s*title: `Terms of Use/.test(readFileSync("./src/lib/seo.js", "utf8")));
  ok("no dash in the Terms", !/[\u2013\u2014]/.test(src));
  const forms = { "VendorProfile.jsx": "vendor review", "Contribute.jsx": "contributor proposal", "Contact.jsx": "consultation request", "Corrections.jsx": "correction report", "src/lib/DemoRequest.jsx": "demo request", "ReportActions.jsx": "review request" };
  for (const [f, what] of Object.entries(forms)) ok(`the ${what} form shows the assent notice beside its button`, /<Assent[ />]/.test(readFileSync("./" + f, "utf8")));
  ok("the notice links both documents", /href="\/terms"/.test(readFileSync("./src/lib/Assent.jsx", "utf8")) && /href="\/privacy"/.test(readFileSync("./src/lib/Assent.jsx", "utf8")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
