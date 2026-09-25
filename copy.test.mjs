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
import { CLAIMS } from "./src/lib/claims.js";
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

console.log("\n4. Industry-page statistics name a primary publisher (scan part 3)");
const BAD_SRC = /zipdo|gitnux|wifi ?talents|industry composite|industry research|sprinklr|nextiva|liveagent|tidio|hubspot|dialoghealth|plivo|ttec|liferay|talkdesk|ecsi|insignia|bizzycar|customergauge|24\/7\.ai|language i\/o|shopify/i;
ok("the source rule fires on an aggregator and a vendor blog", BAD_SRC.test("Zipdo, 2024") && BAD_SRC.test("CustomerGauge") && !BAD_SRC.test("J.D. Power 2025 U.S. Property Claims Satisfaction Study"));
const verticals = files.filter((f) => /^[A-Za-z]+Vertical\.jsx$/.test(f));
ok("ten industry pages checked", verticals.length === 10, String(verticals.length));
for (const f of verticals) {
  const s = readFileSync(f, "utf8");
  const block = (s.match(/const stats = \[([\s\S]*?)\n  \];/) || [])[1];
  ok(`${f}: stats block found`, block !== undefined);
  const entries = (block || "").split("\n").filter((l) => l.includes("{ n:") || l.includes("{ id:"));
  for (const e of entries) {
    /* A stat that is one claim token takes its source from the registry; the claim must be a fact with a publisher and
     * an https url (claims.test.mjs checks the rest). */
    const tok = (e.match(/n: "\[\[([a-z0-9.\-]+)\]\]"/) || e.match(/\{ id: "([a-z0-9.\-]+)"/) || [])[1];
    if (tok && !/source: "/.test(e)) {
      const c = CLAIMS[tok];
      ok(`${f}: a tokenized stat is a sourced fact`, !!c && c.kind === "fact" && !!c.source && /^https:\/\//.test(c.source.url || ""), tok);
      ok(`${f}: no aggregator or vendor-blog source`, !!c && !BAD_SRC.test(`${c.source?.publisher} ${c.source?.title}`), tok);
      continue;
    }
    const src = (e.match(/source: "([^"]*)"/) || [])[1] || "";
    ok(`${f}: every stat names a source`, src.length > 8, e.slice(0, 80));
    ok(`${f}: no aggregator or vendor-blog source`, !BAD_SRC.test(src), src);
    const u = (e.match(/url: "([^"]*)"/) || [])[1];
    ok(`${f}: a linked source is https`, u === undefined || /^https:\/\//.test(u), u);
  }
  ok(`${f}: an empty strip does not render`, /\{stats\.length > 0 && \(/.test(s));
}

console.log("\n5. Industry sub-pages are open (TB, S23): no email gate, nothing sent unless the visitor asks");
const subPages = files.filter((f) => /^[A-Za-z]+SubVerticalPage\.jsx$/.test(f));
ok("ten sub-page files checked", subPages.length === 10, String(subPages.length));
ok("the gate rule fires on the old page shape", /useState\("gate"\)/.test('const [phase, setPhase] = useState("gate");'));
for (const f of subPages) {
  const w = readFileSync(f, "utf8");
  ok(`${f}: renders the shared sub-page and sends nothing itself`, /from "\.\/src\/lib\/SubVerticalPage\.jsx"/.test(w) && !/fetch\(/.test(w));
}
{
  const f = "src/lib/SubVerticalPage.jsx";
  const s = readFileSync(f, "utf8");
  ok(`${f}: opens on the framework`, /useState\("framework"\)/.test(s) && !/useState\("gate"\)/.test(s) && !/handleGate/.test(s));
  const fetches = s.match(/fetch\(/g) || [];
  ok(`${f}: one send, inside the review request`, fetches.length === 1 && /const requestReview = async[\s\S]*?fetch\(/.test(s), String(fetches.length));
  ok(`${f}: no false "saved" or "emailed" promise`, !/has been saved|sent to your email|emailed to you/i.test(s));
  ok(`${f}: every review field has a label`, ["sv-review-email", "sv-review-name", "sv-review-company"].every((id) => s.includes(`htmlFor="${id}"`) && s.includes(`id="${id}"`)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
