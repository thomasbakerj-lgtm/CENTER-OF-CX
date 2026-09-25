/* copy.test.mjs
 *
 * The standing copy gate from the full site scan (S23). Two house rules, checked on every
 * tracked text file so they cannot drift back in:
 *   1. No em dash or en dash anywhere: prose, copy, data, comments, docs.
 *   2. No retired or superlative phrase in public copy (pages, data files, public HTML).
 *      A quoted vendor claim that the copy criticises is allowed by exact text.
 * Each rule is proven to fire on a planted sample before it is trusted.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter((f) => /\.(jsx?|mjs|html|md|json|xml|txt|css|ya?ml)$/.test(f) && !f.startsWith("dist/"));
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
const RETIRED = /most conservative|only independent|survives? (?:the|a) CFO|industry[- ]leading|best[- ]in[- ]class|world[- ]class|seamless(?:ly)?|cutting[- ]edge|game[- ]chang|revolutionar|state[- ]of[- ]the[- ]art|unparalleled|unmatched|industry[- ]standard (?!for FCR)/i;
const ALLOW = ["Vague 'seamless integration' claims hide real operational risk", "FCR has no industry standard"];
const isPublic = (f) => /\.(jsx|js|html)$/.test(f) && !/\.test\.|\.report\.|^scripts\/|^\.github\//.test(f);

console.log("\n1. Each rule fires on a planted sample");
ok("the dash rule fires on an em dash and an en dash", DASH.test("a " + String.fromCharCode(0x2014) + " b") && DASH.test("5" + String.fromCharCode(0x2013) + "10"));
ok("the phrase rule fires on each retired phrase", ["industry-leading", "Best-in-class", "world-class", "seamless", "survives the CFO", "Industry-standard LOS"].every((x) => RETIRED.test(x)));
ok("the phrase rule leaves plain copy alone", !RETIRED.test("Widely used for claims management. Deep Shopify integration."));

console.log("\n2. No dash in any tracked text file");
const dashed = files.filter((f) => DASH.test(readFileSync(f, "utf8")));
ok(`no em or en dash in ${files.length} tracked text files`, dashed.length === 0, dashed.slice(0, 5).join(", "));

console.log("\n3. No retired or superlative phrase in public copy");
const hits = [];
for (const f of files.filter(isPublic)) {
  let s = readFileSync(f, "utf8");
  for (const a of ALLOW) s = s.split(a).join("");
  const m = s.match(RETIRED);
  if (m) hits.push(`${f}: ${m[0]}`);
}
ok(`no retired phrase in ${files.filter(isPublic).length} public files`, hits.length === 0, hits.slice(0, 5).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
