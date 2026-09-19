/**
 * confidence.test.mjs, the shared grading contract.
 *
 * This harness exists to prove one claim: the grading layer cannot see the
 * result, so no property of the answer can move a confidence axis. That is the
 * structural retirement of the 1-12 defect class, where payback landing at zero
 * capped a grade at Directional.
 *
 * What is pinned:
 *   1. Vocabulary and rank order.
 *   2. gradeConfidence rejects every forbidden input by construction.
 *   3. The headline is the minimum of the applicable axes, across the full grid.
 *   4. The binding axis is always named, and ties name both.
 *   5. Realization N/A is legal on declaration, illegal by silence.
 *   6. The emission object matches Section 5.6 exactly.
 *   7. Void claims no grade anywhere and never writes into an axis.
 *   8. Class C carries two graded results and averages nothing.
 *   9. Shared derivations: credit class, rail cap, weaker stream.
 *  10. Sign invariance at the module boundary: no result value reaches it.
 *
 * What is not pinned here: which bands each tool applies. Bands belong to each
 * tool's engine and its own harness, per doctrine.
 */
import { readFileSync } from "fs";
import {
  GRADES, GRADE_RANK, AXES, REQUIRED_AXES, OPTIONAL_AXES,
  gradeConfidence, nameAxes, emitGrades, voidResult, isVoid,
  emitDual, isDual, CRED_GRADE, realizationFromCred,
  RAIL_EVIDENCE_CAP, railEvidence, weakerStream, AXIS_EXPLAINER,
} from "./src/lib/confidence.js";

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const threw = (fn) => { try { fn(); return false; } catch { return true; } };
const threwWith = (fn, frag) => {
  try { fn(); return false; } catch (e) { return String(e.message).includes(frag); }
};
const D = "Directional", P = "Planning-grade", F = "Finance-grade";

/* ------------------------------------------------------- 1. vocabulary */
console.log("1. Vocabulary and rank");
A("three grades, in ascending order", GRADES.length === 3 && GRADES[0] === D && GRADES[1] === P && GRADES[2] === F);
A("rank is ascending and zero based", GRADE_RANK[D] === 0 && GRADE_RANK[P] === 1 && GRADE_RANK[F] === 2);
A("axes are in fixed display order", AXES.join(",") === "evidence,realization,completeness");
A("evidence and completeness are never N/A", REQUIRED_AXES.join(",") === "evidence,completeness");
A("realization is the only optional axis", OPTIONAL_AXES.join(",") === "realization");
A("void is not a grade", !GRADES.includes("Void") && !Object.prototype.hasOwnProperty.call(GRADE_RANK, "Void"));

/* ------------------------------ 2. the grading layer cannot see the result */
console.log("2. Forbidden inputs, rejected by construction");
const forbidden = [
  "payback", "paybackMonths", "breakeven", "roi", "npv", "netValue", "savings",
  "margin", "fragility", "recommendation", "verdict", "severity", "result", "r",
];
for (const k of forbidden) {
  A(`gradeConfidence rejects "${k}"`, threwWith(
    () => gradeConfidence({ evidence: F, realization: F, completeness: F, [k]: 0 }),
    "5.5"
  ));
}
A("an unknown key is rejected even when it is not a named verdict term", threwWith(
  () => gradeConfidence({ evidence: F, realization: F, completeness: F, vertical: "retail" }),
  "unknown key"
));
A("a zero payback is rejected exactly as a positive one is", threw(
  () => gradeConfidence({ evidence: F, realization: F, completeness: F, payback: 0 })
));
A("gradeConfidence needs an object", threw(() => gradeConfidence(null)));
A("a grade word outside the vocabulary throws", threw(() => gradeConfidence({ evidence: "High", realization: F, completeness: F })));
A("a missing evidence axis throws", threw(() => gradeConfidence({ realization: F, completeness: F })));
A("a missing completeness axis throws", threw(() => gradeConfidence({ evidence: F, realization: F })));
A("a null evidence axis throws, it is never N/A", threwWith(() => gradeConfidence({ evidence: null, realization: F, completeness: F }), "never N/A"));
A("a null completeness axis throws, it is never N/A", threwWith(() => gradeConfidence({ evidence: F, realization: F, completeness: null }), "never N/A"));
A("a bad realization word throws", threw(() => gradeConfidence({ evidence: F, realization: "Maybe", completeness: F })));
A("a numeric grade throws", threw(() => gradeConfidence({ evidence: 2, realization: F, completeness: F })));

/* ----------------------------------- 3. headline is the minimum, full grid */
console.log("3. Headline across the full grid");
let gridOk = true, gridCount = 0;
for (const e of GRADES) for (const rz of [...GRADES, null]) for (const c of GRADES) {
  const g = gradeConfidence({ evidence: e, realization: rz, completeness: c });
  const ranks = [GRADE_RANK[e], GRADE_RANK[c]].concat(rz === null ? [] : [GRADE_RANK[rz]]);
  if (g.headline !== GRADES[Math.min(...ranks)]) gridOk = false;
  gridCount++;
}
A(`all ${gridCount} axis combinations headline on the weakest applicable axis`, gridOk && gridCount === 36);
A("three Finance-grade axes headline Finance-grade", gradeConfidence({ evidence: F, realization: F, completeness: F }).headline === F);
A("one Directional axis drags the headline down", gradeConfidence({ evidence: F, realization: F, completeness: D }).headline === D);
A("a dropped realization axis does not drag the headline", gradeConfidence({ evidence: F, realization: null, completeness: F }).headline === F);
A("applicable lists all three when realization is graded", gradeConfidence({ evidence: F, realization: P, completeness: F }).applicable.join(",") === "evidence,realization,completeness");
A("applicable drops realization when it is N/A", gradeConfidence({ evidence: F, realization: null, completeness: F }).applicable.join(",") === "evidence,completeness");
A("an undefined realization is read as N/A", gradeConfidence({ evidence: P, completeness: P }).applicable.length === 2);

/* --------------------------------------------- 4. the binding axis is named */
console.log("4. Binding axis");
A("a single binding axis is named alone", gradeConfidence({ evidence: D, realization: F, completeness: F }).boundBy === "evidence");
A("realization can bind alone", gradeConfidence({ evidence: F, realization: D, completeness: F }).boundBy === "realization");
A("completeness can bind alone", gradeConfidence({ evidence: F, realization: F, completeness: D }).boundBy === "completeness");
A("a two way tie names both", gradeConfidence({ evidence: D, realization: F, completeness: D }).boundBy === "evidence and completeness");
A("a three way tie names all three", gradeConfidence({ evidence: P, realization: P, completeness: P }).boundBy === "evidence, realization and completeness");
A("a tie at the top still names the binding axes", gradeConfidence({ evidence: F, realization: F, completeness: F }).boundBy === "evidence, realization and completeness");
A("nameAxes renders one", nameAxes(["evidence"]) === "evidence");
A("nameAxes renders two", nameAxes(["evidence", "completeness"]) === "evidence and completeness");
A("nameAxes renders three", nameAxes(AXES) === "evidence, realization and completeness");
A("nameAxes renders none", nameAxes([]) === "");
A("boundBy is never empty on a graded result", gradeConfidence({ evidence: D, realization: null, completeness: F }).boundBy.length > 0);
A("boundAxes is the machine readable form of the same answer", gradeConfidence({ evidence: D, realization: F, completeness: D }).boundAxes.join(",") === "evidence,completeness");
A("a single binding axis returns a one element array", gradeConfidence({ evidence: D, realization: F, completeness: F }).boundAxes.join(",") === "evidence");
A("boundAxes and boundBy never disagree", (() => {
  for (const e of GRADES) for (const rz of [...GRADES, null]) for (const c of GRADES) {
    const g = gradeConfidence({ evidence: e, realization: rz, completeness: c });
    if (g.boundBy !== nameAxes(g.boundAxes)) return false;
    if (!g.boundAxes.every((a) => g.applicable.includes(a))) return false;
  }
  return true;
})());
A("boundAxes is carried into the emission object", emitGrades({ evidence: D, realization: F, completeness: F, reasons: { evidence: "x", realization: "y", completeness: "z" } }).boundAxes.join(",") === "evidence");
A("a void result claims no binding axes", voidResult({ invariant: "x", remedy: "y" }).boundAxes.length === 0);

/* ------------------------------------------------- 5 and 6. emission object */
console.log("5. Emission contract");
const reasons = { evidence: "Seat counts came from the signed order form.", realization: "Headcount reduction is committed.", completeness: "No input was corrected or held." };
const full = emitGrades({ evidence: F, realization: F, completeness: F, reasons });
A("the object carries all three axes", full.evidence === F && full.realization === F && full.completeness === F);
A("the headline is computed, not supplied", full.headline === F);
A("boundBy is computed, not hand written", full.boundBy === "evidence, realization and completeness");
A("one reason per axis is carried", full.reasons.evidence && full.reasons.realization && full.reasons.completeness);
A("a clean emission carries no defects", full.defects.length === 0);
A("a graded emission is not void", full.void === false && isVoid(full) === false);
A("naReason is empty when every axis is graded", full.naReason === "");

const na = emitGrades({
  evidence: P, realization: null, completeness: F,
  naReason: "This tool prices cash out the door and converts no freed capacity, so no benefit is modelled.",
  reasons: { evidence: "Rates came from a vendor quote, not yet confirmed in writing.", completeness: "Every driver is present and no guard tripped." },
});
A("a declared N/A is legal", na.realization === null && na.defects.length === 0);
A("a declared N/A carries its reason", na.naReason.includes("cash out the door"));
A("a declared N/A does not bind the headline", na.headline === P && na.boundBy === "evidence");
A("a dropped axis carries no reason", na.reasons.realization === "");

const silentNA = emitGrades({ evidence: F, realization: null, completeness: F, reasons: { evidence: "x", completeness: "y" } });
A("a silent N/A is recorded as a defect, not thrown", silentNA.defects.length === 1 && !isVoid(silentNA));
A("the defect sentence names the oversight problem", silentNA.defects[0].includes("indistinguishable from an oversight"));
A("a silent N/A still produces a usable headline", silentNA.headline === F);

const strayReason = emitGrades({ evidence: F, realization: F, completeness: F, naReason: "not applicable", reasons });
A("an N/A reason on a fully graded result is a defect", strayReason.defects.length === 1 && strayReason.naReason === "");

const noReasons = emitGrades({ evidence: D, realization: D, completeness: D });
A("a grade with no reason on any axis raises three defects", noReasons.defects.length === 3);
A("a missing reason defect names the axis", noReasons.defects.some((s) => s.startsWith("The evidence axis")));
A("a missing reason does not block the headline", noReasons.headline === D);
A("a blank reason counts as missing", emitGrades({ evidence: F, realization: F, completeness: F, reasons: { ...reasons, evidence: "   " } }).defects.length === 1);

A("emitGrades rejects a result property exactly as gradeConfidence does", threwWith(
  () => emitGrades({ evidence: F, realization: F, completeness: F, payback: 4, reasons }), "5.5"
));
A("emitGrades rejects an unknown key rather than dropping it in the destructure", threwWith(
  () => emitGrades({ evidence: F, realization: F, completeness: F, reasons, notes: "x" }), "unknown key"
));
A("emitGrades needs an object", threw(() => emitGrades(null)));
A("a zero payback cannot reach the emission either", threw(
  () => emitGrades({ evidence: F, realization: F, completeness: F, payback: 0, reasons })
));

/* ------------------------------------------------------------------ 7. void */
console.log("6. Void");
const v = voidResult({ invariant: "Monetized capacity exceeds the capacity the model freed.", remedy: "Lower the realization factor or correct the freed hours." });
A("void claims no headline", v.headline === null);
A("void claims no axis", v.evidence === null && v.realization === null && v.completeness === null);
A("void never writes a grade word into an axis", !GRADES.includes(v.evidence) && !GRADES.includes(v.completeness));
A("void names the failed invariant", v.invariant.includes("exceeds the capacity"));
A("void carries the remedy that would lift it", v.remedy.includes("Lower the realization factor"));
A("void is identified by one helper", isVoid(v) === true);
A("void claims no binding axis", v.boundBy === "" && v.applicable.length === 0);
A("void supersedes rather than grades down", v.headline !== D);
A("a void with no invariant throws", threw(() => voidResult({ remedy: "fix it" })));
A("a void with no remedy throws", threw(() => voidResult({ invariant: "broken" })));
A("a graded object is not read as void", isVoid(full) === false && isVoid(null) === false);

/* --------------------------------------------------------------- 8. Class C */
console.log("7. Class C dual result");
const cost = emitGrades({ evidence: F, realization: null, completeness: F, naReason: "The cost stream prices invoiced spend and converts no capacity.", reasons: { evidence: "Invoiced.", completeness: "Whole." } });
const benefit = emitGrades({ evidence: P, realization: D, completeness: P, reasons: { evidence: "Quoted.", realization: "No capacity action is committed.", completeness: "One driver is unconfirmed." } });
const dual = emitDual({ cost, benefit });
A("a dual result is identified", isDual(dual) === true && isDual(full) === false);
A("the cost result is the headline block", dual.cost.headline === F);
A("the benefit result keeps its own grade", dual.benefit.headline === D);
A("the two grades are not averaged", dual.cost.headline !== dual.benefit.headline);
A("no combined headline is produced", dual.headline === undefined);
A("each block keeps its own binding axis", dual.cost.boundBy === "evidence and completeness" && dual.benefit.boundBy === "realization");
A("a cost stream may declare realization N/A", dual.cost.realization === null);
A("a benefit stream may not declare realization N/A", threwWith(() => emitDual({ cost, benefit: cost }), "may not be N/A"));
A("a dual result needs both blocks", threw(() => emitDual({ cost })) && threw(() => emitDual({ benefit })));
A("the blocks carry labels so neither is described in the other's language", dual.costLabel === "Cost" && dual.benefitLabel === "Benefit");

/* --------------------------------------------------- 9. shared derivations */
console.log("8. Shared derivations");
A("capacity only earns Directional", realizationFromCred("capacity") === D);
A("no action selected earns Directional", realizationFromCred("none") === D);
A("finance creditable earns Planning-grade", realizationFromCred("finance") === P);
A("cash out the door earns Finance-grade", realizationFromCred("cash") === F);
A("the credit map carries exactly four classes", Object.keys(CRED_GRADE).length === 4);
A("an unknown credit class throws rather than defaulting", threwWith(() => realizationFromCred("hiring"), "mech.js"));
A("an undefined credit class throws", threw(() => realizationFromCred(undefined)));
A("rail arrival caps at Planning-grade", RAIL_EVIDENCE_CAP === P && railEvidence(F) === P);
A("rail arrival does not upgrade a weaker origin", railEvidence(D) === D);
A("rail arrival preserves Planning-grade", railEvidence(P) === P);
A("no recorded origin grades Directional", railEvidence(undefined) === D && railEvidence("") === D);
A("the weaker stream binds", weakerStream(F, D) === D && weakerStream(D, F) === D);
A("two equal streams return the grade", weakerStream(P, P) === P);
A("a missing stream does not invent a grade", weakerStream(F, undefined) === F && weakerStream(undefined, undefined) === D);

/* ----------------------------------------- 10. sign invariance at the module */
console.log("9. Sign invariance at the module boundary");
const axesOnly = { evidence: P, realization: P, completeness: F };
const base = gradeConfidence(axesOnly);
let invariant = true;
for (const bogus of [-1, 0, 1, 999999, -0.0001, Infinity, NaN]) {
  const g = gradeConfidence({ ...axesOnly });
  if (g.headline !== base.headline || g.boundBy !== base.boundBy) invariant = false;
  if (!threw(() => gradeConfidence({ ...axesOnly, payback: bogus }))) invariant = false;
}
A("the headline is unchanged across every forced outcome, and the outcome cannot be passed at all", invariant);
A("a negative case and a zero case grade identically", gradeConfidence(axesOnly).headline === gradeConfidence({ ...axesOnly }).headline);

/* ----------------------------------------------------- 11. file hygiene */
console.log("10. File hygiene");
const SRC = readFileSync("./src/lib/confidence.js", "utf8");
A("confidence.js carries no em or en dash", SRC.indexOf("\u2014") < 0 && SRC.indexOf("\u2013") < 0);
A("the module imports nothing, so no result object can reach it sideways", !/^\s*import\s/m.test(SRC));
A("the standing axis explainer names all three axes", ["Evidence", "Realization", "Completeness"].every((w) => AXIS_EXPLAINER.includes(w)));
A("the explainer states the headline rule", AXIS_EXPLAINER.includes("weakest applicable axis"));
A("the explainer gives each axis a distinct remedy", AXIS_EXPLAINER.includes("better source") && AXIS_EXPLAINER.includes("harder lever") && AXIS_EXPLAINER.includes("finish the model"));
A("no band table lives in the shared module", !/healthyMax|typicalLow|defaultTarget/.test(SRC));

console.log("\n" + "=".repeat(78));
console.log("  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
