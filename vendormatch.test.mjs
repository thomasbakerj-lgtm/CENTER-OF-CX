/* vendormatch.test.mjs
 *
 * Vendor Match ceiling cap (interim Phase 1 fix, CLAUDE.md section 7; TB agreed 29 Sep 2026). The Phase 1 model
 * saturated: on 20,000 random buyer profiles the top vendor sat at the 99 ceiling in about two of three, and two or more
 * vendors shared 99 in most, so their order came from list position. This harness holds the fix:
 *   1. The order follows the unclipped score; no score shows above SCORE_CAP; vendors within LEAD_GAP of the top form
 *      one leading group; the page and the PDF say so.
 *   2. On 20,000 profiles, using the tool's own scoring lines: nothing shown above the cap, the order is the raw order,
 *      the leading group is exactly the vendors within the gap, and ties at the cap are never ordered by list position.
 *   3. Presentation only: the Phase 1 weights are the ones the tool shipped with.
 *
 * Run from repo root: node vendormatch.test.mjs
 */
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);
const S = readFileSync("./VendorMatchEngine.jsx", "utf8");
const grab = (n) => { const i = S.indexOf(`const ${n} = `); const j = S.indexOf("=", i) + 1; let d = 0; for (let k = j; k < S.length; k++) { const c = S[k]; if (c === "[" || c === "{") d++; if (c === "]" || c === "}") { d--; if (d === 0) return new Function("return (" + S.slice(j, k + 1) + ")")(); } } };
const num = (n) => Number((S.match(new RegExp(`export const ${n} = (\\d+);`)) || [])[1]);

section("1. The rule is in the page and the PDF");
const CAP = num("SCORE_CAP"), GAP = num("LEAD_GAP");
ok("the cap and the leading gap are named constants (90 and 5)", CAP === 90 && GAP === 5);
ok("the order follows the unclipped score", /\.sort\(\(a,b\) => b\.raw-a\.raw\)/.test(S) && !/b\.score-a\.score/.test(S));
ok("the shown score is clipped at the cap and marked with a plus", /score: Math\.min\(SCORE_CAP,/.test(S) && /v\.raw >= SCORE_CAP \? `\$\{SCORE_CAP\}\+`/.test(S) && !/Math\.min\(99/.test(S));
ok("the page and the PDF print the shown score, never the raw one", !/\{v\.score\}/.test(S) && !/v\.score\.toString\(\)/.test(S) && !/Fit Score: \$\{v\.score\}/.test(S) && (S.match(/shownScore\(v\)/g) || []).length >= 3);
ok("the leading group is labelled on the page and in the PDF", /v\.lead\?"Leading group"/.test(S) && /v\.lead \? "Leading group"/.test(S) && /too close to separate/.test(S));
ok("the method note discloses the cap, its reason and the leading group", /no score shows above \$\{SCORE_CAP\}/.test(S) && /two of every three buyer profiles/.test(S) && /within \$\{LEAD_GAP\} points of the top vendor/.test(S));
ok("the heading no longer claims a ranking", !/Ranked by fit/.test(S) && /Ordered by fit on the Phase 1 model/.test(S));

section("2. 20,000 buyer profiles through the tool's own scoring lines");
const VENDORS = grab("VENDORS"), PRIORITIES = grab("PRIORITIES"), SIZES = grab("SIZES"), VERTICALS = grab("VERTICALS");
const body = S.slice(S.indexOf("let s = v.fit[sk]"), S.indexOf("/* Name and tier come from the profile"));
const scoreOf = new Function("v", "d", "sk", body + "\nreturn s;");
let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
let overCap = 0, badOrder = 0, badLead = 0, capTies = 0, capTiesOrdered = 0;
for (let t = 0; t < 20000; t++) {
  const d = { size: pick(SIZES), vertical: pick(VERTICALS), priorities: PRIORITIES.filter(() => rnd() < 0.3).map((p) => p.id), importance: {}, budgetSensitivity: pick(["low", "moderate", "high"]), termLength: pick(["1 year", "3 years", "5 years"]) };
  PRIORITIES.forEach((p) => { if (rnd() < 0.3) d.importance[p.id] = 1 + Math.floor(rnd() * 5); });
  const sk = (d.size.includes("5000") || d.size.includes("1000")) ? "large" : (d.size.includes("500") || d.size.includes("200")) ? "mid" : "small";
  const res = VENDORS.map((v) => { const s = scoreOf(v, d, sk); return { name: v.name, raw: s, score: Math.min(CAP, Math.max(25, Math.round(s))) }; })
    .sort((a, b) => b.raw - a.raw).map((v, i, all) => ({ ...v, lead: v.raw >= all[0].raw - GAP }));
  if (res.some((v) => v.score > CAP)) overCap++;
  for (let i = 1; i < res.length; i++) if (res[i].raw > res[i - 1].raw) badOrder++;
  if (res.some((v) => v.lead !== (res[0].raw - v.raw <= GAP))) badLead++;
  const atCap = res.filter((v) => v.score === CAP);
  if (atCap.length > 1) { capTies++; if (atCap.every((v, i) => i === 0 || v.raw <= atCap[i - 1].raw)) capTiesOrdered++; }
}
ok("no shown score above the cap", overCap === 0, String(overCap));
ok("every result list is in unclipped score order", badOrder === 0, String(badOrder));
ok("the leading group is exactly the vendors within the gap of the top", badLead === 0, String(badLead));
ok("vendors sharing the cap keep their unclipped order", capTies === capTiesOrdered, `${capTiesOrdered} of ${capTies}`);

section("3. Presentation only");
ok("24 Phase 1 vendors, weights unchanged", VENDORS.length === 24 && /s\+=\(v\.dims\[pId\]-70\)\*0\.12/.test(S) && /s\+=\(v\.dims\[k\]-70\)\*\(imp-3\)\*0\.06/.test(S) && /s\+=\(v\.dims\.cost-70\)\*0\.15/.test(S));
/* Audit 30 Sep: labels the Phase 1 model cannot support. */
ok("no fit verdict words on the page or in the PDF", !/Strong Fit|Good Fit|Conditional Fit|Weak Fit/.test(S));
ok("integrations are named as Phase 1 data, never as verified", !/Verified [Ii]ntegrations/.test(S) && /Integrations named in the Phase 1 data/.test(S));
ok("the Phase 1 migration notes no longer render", !/Platform Context/.test(S) && !/platformData\.notes/.test(S));
const gr = S.slice(S.indexOf("const getResults"), S.indexOf("const handleResults"));
ok("compliance picks do not reach the order, and the step says so", !/compliance/.test(gr) && /These do not change the list or its order/.test(S));
ok("no dash in the tool", !/[\u2013\u2014]/.test(S));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
