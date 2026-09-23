/* rubric.test.mjs
 *
 * The V3-Framework harness (doctrine v1.3 Section 10.1) for every published rubric.
 *
 * The engine is sliced live from src/lib/rubric.js between its engine markers and
 * run through new Function, the same discipline the calculator harnesses use, and
 * checked against the module export so the two cannot diverge. Every rubric in
 * src/lib/rubrics/ is then held to the four framework proofs:
 *
 *   determinism      the same answers always give the same output, in any key order
 *   traceability     every score, band and action names the criteria behind it, and
 *                    every criterion can change the output
 *   no dead branches every band, every action and every named next diagnostic is
 *                    reachable from some set of answers
 *   completeness     every criterion answered at or below the fail line yields exactly
 *                    one checklist action, and no other criterion does
 *
 * Section N checks the move into the engine changed nothing: scores and bands equal
 * the formulas the assessments carried before, read from their pre-rubric band tables, frozen below.
 *
 * Run from repo root: node rubric.test.mjs
 */
import { readFileSync } from "node:fs";
import * as MOD from "./src/lib/rubric.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");

/* A seeded generator, so a failure reproduces. */
let seed = 20260923;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pickInt = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

/* ------------------------------------------------------- 0. the engine */
section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/rubric.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const E = new Function(SRC.slice(a, b) + "\nreturn { scoreRubric, isAnswer, criterionKey, bandFor };")();
ok("the slice exports the engine", typeof E.scoreRubric === "function");
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(SRC.slice(a, b)));

const answersAll = (r, f) => Object.fromEntries(r.dims.flatMap((d, di) => d.criteria.map((_, ci) => [`${d.id}-${ci}`, f(d, di, ci)])));
const randomComplete = (r) => answersAll(r, () => pickInt(r.scale.min, r.scale.max));

for (const r of Object.values(RUBRICS)) {
  const T = `[${r.id}]`;
  const nCrit = r.dims.reduce((s, d) => s + d.criteria.length, 0);

  /* --------------------------------------------------- 1. the rubric */
  section(`1. ${r.id}: the published rubric is well formed`);
  ok(`${T} has a title, version, publication date and methodology route`, !!r.title && /^\d+\.\d+$/.test(r.version) && /^\d{4}-\d{2}-\d{2}$/.test(r.published) && r.methodology === `/methodology/${r.id}`);
  ok(`${T} tool route is a journey node route`, !!JOURNEY[r.id] && JOURNEY[r.id].route === r.route);
  ok(`${T} scale is whole numbers, fail line inside it`, Number.isInteger(r.scale.min) && Number.isInteger(r.scale.max) && r.failAt >= r.scale.min && r.failAt < r.scale.max);
  ok(`${T} dimension ids are unique`, new Set(r.dims.map((d) => d.id)).size === r.dims.length);
  ok(`${T} at least three limits are disclosed`, Array.isArray(r.limits) && r.limits.length >= 3);
  ok(`${T} a limit says it is a self-assessment`, r.limits.some((l) => /respondent/i.test(l)));
  ok(`${T} a limit says the score is no percentile`, r.limits.some((l) => /percentile/i.test(l)));
  ok(`${T} a limit says it never recommends a vendor`, r.limits.some((l) => /never recommends a vendor/i.test(l)));
  for (const d of r.dims) {
    ok(`${T} ${d.id}: positive weight`, d.weight > 0);
    ok(`${T} ${d.id}: next diagnostic is a journey tool other than itself`, !!JOURNEY[d.next] && d.next !== r.id);
    ok(`${T} ${d.id}: has criteria`, d.criteria.length > 0);
    d.criteria.forEach((c, i) => {
      ok(`${T} ${d.id}-${i}: statement and action present`, typeof c.text === "string" && c.text.length > 20 && typeof c.action === "string" && c.action.length > 20);
      ok(`${T} ${d.id}-${i}: action differs from the statement`, c.action !== c.text);
    });
  }
  for (const set of [r.bands, ...(r.secondaryBands ? [r.secondaryBands.bands] : [])]) {
    ok(`${T} bands start at the scale floor`, set[0].min === r.scale.min);
    ok(`${T} bands are contiguous`, set.every((x, i) => i === 0 || x.min === set[i - 1].max));
    ok(`${T} last band covers the scale top`, set[set.length - 1].max > r.scale.max);
    ok(`${T} band ids unique`, new Set(set.map((x) => x.id)).size === set.length);
  }
  const text = JSON.stringify(r);
  ok(`${T} carries no em-dash or en-dash`, !DASH.test(text));
  ok(`${T} makes no percentile or benchmark claim in a band`, !/percentile|top quartile|industry average|peers/i.test(JSON.stringify(r.bands)));
  ok(`${T} names no vendor in an action`, !/Genesys|NICE|Five9|Talkdesk|Amazon Connect|Salesforce|Zendesk|Microsoft|Google|Cisco|Avaya/.test(JSON.stringify(r.dims)));

  /* ----------------------------------------------- 2. determinism */
  section(`2. ${r.id}: determinism`);
  for (let k = 0; k < 300; k++) {
    const ans = randomComplete(r);
    const shuffled = Object.fromEntries(Object.entries(ans).sort(() => rnd() - 0.5));
    const x = JSON.stringify(E.scoreRubric(r, ans)), y = JSON.stringify(E.scoreRubric(r, shuffled));
    if (x !== y || x !== JSON.stringify(MOD.scoreRubric(r, ans))) { ok(`${T} identical output for identical answers (case ${k})`, false); break; }
    if (k === 299) ok(`${T} 300 answer sets: same output twice, in any key order, sliced and module`, true);
  }

  /* ------------------------------------ 3. completeness of the checklist */
  section(`3. ${r.id}: every failing criterion yields exactly one action`);
  let checklistOk = true, orderOk = true;
  for (let k = 0; k < 500; k++) {
    const ans = randomComplete(r); const out = E.scoreRubric(r, ans);
    const failing = Object.entries(ans).filter(([, v]) => v <= r.failAt).map(([key]) => key).sort();
    const listed = out.checklist.map((c) => c.criterion).slice().sort();
    if (JSON.stringify(failing) !== JSON.stringify(listed)) checklistOk = false;
    for (const c of out.checklist) {
      const d = r.dims.find((x) => x.id === c.dimension); const ci = +c.criterion.split("-").pop();
      if (c.action !== d.criteria[ci].action || c.score !== ans[c.criterion]) checklistOk = false;
    }
    const dimOrder = out.checklist.map((c) => out.dims.find((d) => d.id === c.dimension).score);
    if (dimOrder.some((s, i) => i > 0 && s < dimOrder[i - 1])) orderOk = false;
  }
  ok(`${T} 500 answer sets: checklist equals the set of criteria at or below ${r.failAt}`, checklistOk);
  ok(`${T} checklist runs weakest dimension first`, orderOk);
  const allHigh = E.scoreRubric(r, answersAll(r, () => r.scale.max));
  ok(`${T} all answers at the top: empty checklist`, allHigh.checklist.length === 0);
  const allLow = E.scoreRubric(r, answersAll(r, () => r.scale.min));
  ok(`${T} all answers at the bottom: one action per criterion (${nCrit})`, allLow.checklist.length === nCrit);

  /* ------------------------------------------------ 4. traceability */
  section(`4. ${r.id}: every output traces to criteria, every criterion moves the output`);
  const base = answersAll(r, () => 3);
  const out3 = E.scoreRubric(r, base);
  ok(`${T} overall trace names every criterion`, out3.trace.length === nCrit);
  ok(`${T} each dimension trace names exactly its own criteria`, out3.dims.every((d) => d.trace.length === r.dims.find((x) => x.id === d.id).criteria.length && d.trace.every((t) => t.startsWith(d.id + "-"))));
  ok(`${T} next diagnostic carries the weakest dimension's trace`, JSON.stringify(out3.nextDiagnostic.trace) === JSON.stringify(out3.dims.find((d) => d.id === out3.nextDiagnostic.because).trace));
  let moves = true, clears = true;
  for (const d of r.dims) d.criteria.forEach((_, ci) => {
    const key = `${d.id}-${ci}`;
    const lo = E.scoreRubric(r, { ...base, [key]: r.scale.min }), hi = E.scoreRubric(r, { ...base, [key]: r.scale.max });
    const dl = lo.dims.find((x) => x.id === d.id).score, dh = hi.dims.find((x) => x.id === d.id).score;
    if (!(dh > dl) || !(hi.overall > lo.overall)) moves = false;
    if (!lo.checklist.some((c) => c.criterion === key) || hi.checklist.some((c) => c.criterion === key)) clears = false;
  });
  ok(`${T} raising any single criterion raises its dimension and the overall score`, moves);
  ok(`${T} raising any single criterion clears its action`, clears);

  /* ------------------------------------------------ 5. no dead branches */
  section(`5. ${r.id}: every band, action and next diagnostic is reachable`);
  const seenBands = new Set(), seenSecondary = new Set(), seenNext = new Set(), seenActions = new Set();
  for (let v = r.scale.min; v <= r.scale.max; v++) for (let w = v; w <= Math.min(v + 1, r.scale.max); w++)
    for (let k = 0; k <= nCrit; k++) {
      let n = 0; const ans = answersAll(r, () => (n++ < k ? w : v));
      const out = E.scoreRubric(r, ans); seenBands.add(out.band.id); if (out.secondary) seenSecondary.add(out.secondary.id);
    }
  for (const x of r.bands) ok(`${T} band ${x.id} is reachable`, seenBands.has(x.id));
  if (r.secondaryBands) for (const x of r.secondaryBands.bands) ok(`${T} pattern ${x.id} is reachable`, seenSecondary.has(x.id));
  for (const d of r.dims) {
    const out = E.scoreRubric(r, answersAll(r, (dd) => (dd.id === d.id ? r.scale.min : 4)));
    seenNext.add(out.nextDiagnostic.tool);
    ok(`${T} ${d.id} weakest names its diagnostic ${d.next}`, out.nextDiagnostic.tool === d.next && out.nextDiagnostic.because === d.id);
  }
  allLow.checklist.forEach((c) => seenActions.add(c.action));
  ok(`${T} every action appears in some output`, r.dims.every((d) => d.criteria.every((c) => seenActions.has(c.action))));
  ok(`${T} every named diagnostic appears in some output`, r.dims.every((d) => seenNext.has(d.next)));

  /* ------------------------------------ 6. partial and invalid answers */
  section(`6. ${r.id}: a partial or invalid assessment claims nothing`);
  const partial = E.scoreRubric(r, { [`${r.dims[0].id}-0`]: 1 });
  ok(`${T} partial: not complete, no overall, no band, no next diagnostic`, !partial.complete && partial.overall === null && partial.band === null && partial.nextDiagnostic === null);
  ok(`${T} partial: the one failing answer still lists its action`, partial.checklist.length === 1);
  for (const bad of [0, -5, 6, 1e12, 2.5, "3", null, NaN, true]) {
    const out = E.scoreRubric(r, answersAll(r, () => bad));
    ok(`${T} answers of ${JSON.stringify(bad)} are unanswered: no band, no action`, !out.complete && out.band === null && out.checklist.length === 0);
  }
  ok(`${T} empty and hostile inputs do not throw`, [undefined, null, {}, [], "x", { __proto__: { a: 1 } }].every((x) => { try { E.scoreRubric(r, x); return true; } catch { return false; } }));
}

/* ------------------------------- N. neutral against the pre-rubric formulas */
section("N. Scores and bands are unchanged by the move into the engine");
/* The band tables the assessments carried before the rubric engine, copied verbatim
   from their LEVELS arrays at main 84d8125 (23 Sep 2026). Frozen here rather than
   read from git, so the check survives a shallow clone. */
const LEGACY = {
  "cx-maturity": [{ min: 1, max: 1.8, tier: "Foundational" }, { min: 1.8, max: 2.6, tier: "Developing" }, { min: 2.6, max: 3.4, tier: "Operational" }, { min: 3.4, max: 4.2, tier: "Advanced" }, { min: 4.2, max: 5.1, tier: "Leading" }],
  /* Transformation Readiness, from TransformationReadiness.jsx at main 4dde784. Its first band
     began at 0, below the scale floor of 1; no answer set can score there, so the rubric
     starts it at 1 and the check below compares the upper edges. */
  "transformation-readiness": [{ min: 0, max: 1.5, tier: "Not Ready" }, { min: 1.5, max: 2.5, tier: "Early Stage" }, { min: 2.5, max: 3.5, tier: "Developing" }, { min: 3.5, max: 4.2, tier: "Ready" }, { min: 4.2, max: 5.1, tier: "Strong" }],
  "ai-readiness": [{ min: 1, max: 1.8, tier: "Not Ready" }, { min: 1.8, max: 2.6, tier: "Early Stage" }, { min: 2.6, max: 3.4, tier: "Foundation Set" }, { min: 3.4, max: 4.2, tier: "AI Capable" }, { min: 4.2, max: 5.1, tier: "AI Advanced" }],
};
for (const id of ["cx-maturity", "ai-readiness", "transformation-readiness"]) {
  const r = RUBRICS[id]; const L = LEGACY[id];
  ok(`[${id}] legacy band table read (${L.length} bands)`, L.length === r.bands.length);
  ok(`[${id}] cut points and labels match the legacy table`, L.every((l, i) => (i === 0 ? l.min <= r.bands[0].min && r.bands[0].min === r.scale.min : l.min === r.bands[i].min) && l.max === r.bands[i].max && l.tier === r.bands[i].label));
  let same = true;
  for (let k = 0; k < 20000; k++) {
    const ans = randomComplete(r);
    const legacyDim = (d) => { const v = d.criteria.map((_, i) => ans[`${d.id}-${i}`]); return v.reduce((x, y) => x + y, 0) / v.length; };
    const legacyOverall = r.dims.reduce((s, d) => s + legacyDim(d), 0) / r.dims.length;
    const legacyTier = (L.find((l) => legacyOverall >= l.min && legacyOverall < l.max) || L[L.length - 1]).tier;
    const out = E.scoreRubric(r, ans);
    if (Math.abs(out.overall - legacyOverall) > 1e-12 || out.band.label !== legacyTier) { same = false; break; }
    if (id === "ai-readiness") {
      const era = legacyOverall >= 4 ? "Era 4" : legacyOverall >= 3 ? "Era 3" : legacyOverall >= 2 ? "Era 2" : "Era 1";
      if (!out.secondary.label.startsWith(era)) { same = false; break; }
    }
    if (id === "transformation-readiness") {
      /* The per-dimension flags the results page always showed: below 2.5 close the gap,
         2.5 to below 3.5 monitor. They must equal the flag the dimension's band states. */
      for (const d of out.dims) {
        const legacyFlag = d.score < 2.5 ? "Close this gap" : d.score < 3.5 ? "Monitor" : undefined;
        if (E.bandFor(r, d.score).dimFlag !== legacyFlag) { same = false; break; }
      }
      if (!same) break;
    }
  }
  ok(`[${id}] 20,000 complete answer sets: overall, band${id === "ai-readiness" ? " and automation pattern" : id === "transformation-readiness" ? " and every dimension flag" : ""} equal the legacy formulas`, same);
}

/* --------------------------------------- M. the tools read the rubric */
section("M. Each assessment scores through the engine and publishes its rubric");
const APP = readFileSync("./App.jsx", "utf8");
for (const [id, file] of [["cx-maturity", "CXMaturity.jsx"], ["ai-readiness", "AIReadiness.jsx"], ["transformation-readiness", "TransformationReadiness.jsx"]]) {
  const src = readFileSync("./" + file, "utf8");
  ok(`${file}: imports the engine and its rubric`, /import \{ scoreRubric[^}]*\} from "\.\/src\/lib\/rubric"/.test(src) && src.includes(`/src/lib/rubrics/`));
  ok(`${file}: no local band table or score formula`, !/const LEVELS = \[|const getTier|\.reduce\(\(a, d\) => a \+ dimScore/.test(src));
  ok(`${file}: renders the checklist and the next diagnostic`, /R\.checklist\.map/.test(src) && /Next diagnostic:/.test(src));
  ok(`${file}: links the published rubric`, /href=\{RUBRIC\.methodology\}/.test(src));
  ok(`${file}: the PDF carries the checklist, the limits and the method`, /title: "Action Checklist"/.test(src) && /title: "What This Assessment Cannot Tell You"/.test(src) && /title: "Method"/.test(src));
  ok(`/methodology/${id}: route mounted`, APP.includes(`<Route path="/methodology/${id}" element={<RubricPage id="${id}" />} />`));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
