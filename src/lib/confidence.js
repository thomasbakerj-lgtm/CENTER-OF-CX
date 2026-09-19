/**
 * confidence.js. The single grading authority for every economic claim on the
 * platform. Doctrine Section 5, ratified 19 September 2026.
 *
 * THE STRUCTURAL POINT OF THIS FILE
 *
 * gradeConfidence accepts an axes object and nothing else. It cannot see the
 * result. A verdict it cannot see is a verdict it cannot use. This is the reason
 * the 1-12 defect class cannot recur: capping a grade because payback landed at
 * zero required the grading code to hold the result object, and no grading code
 * holds it after this module exists.
 *
 * Enforcement is by construction. An unknown key thrown at gradeConfidence is a
 * throw, not a warning, because every call site is static code. If a tool tries
 * to pass payback, severity, ROI or a verdict label, the suite fails before the
 * page renders. There is no soft path.
 *
 * TWO CLASSES OF FAILURE, HANDLED DIFFERENTLY
 *
 *   Structural violations throw. A grade word outside the vocabulary, a null on
 *   an axis that is never N/A, an unknown key. These are coding defects and they
 *   must stop the suite rather than degrade quietly into a wrong grade.
 *
 *   Content omissions do not throw. A missing reason, an N/A with no stated
 *   reason. These are recorded on `defects` so ReportActions can render the
 *   defect sentence, because a silent blank is indistinguishable from an
 *   oversight and the reader deserves to see which one it is. Every tool harness
 *   asserts `defects` is empty, so an omission is loud in test and honest in
 *   production.
 *
 * WHAT NEVER LIVES HERE
 *
 * Bands. This module grades nothing on its own. Each tool decides what its
 * inputs earn on each axis, per its own goal, and passes the three words in.
 * A shared band table would be one-size logic imposed across tools, which
 * doctrine forbids.
 */

/* ------------------------------------------------------------- vocabulary */

export const GRADES = ["Directional", "Planning-grade", "Finance-grade"];

export const GRADE_RANK = { "Directional": 0, "Planning-grade": 1, "Finance-grade": 2 };

/** Fixed display order. Evidence, then Realization, then Completeness. */
export const AXES = ["evidence", "realization", "completeness"];

/** Axes that may never be declared N/A. Section 5.1. */
export const REQUIRED_AXES = ["evidence", "completeness"];

/** The only axis that may carry null, and only with a stated reason. */
export const OPTIONAL_AXES = ["realization"];

const isGrade = (g) => Object.prototype.hasOwnProperty.call(GRADE_RANK, g);

/*
 * Named for the error message only. The allowlist below is what actually
 * enforces the rule, so a term absent from this list is still rejected. This
 * exists so a developer who reaches for the obvious wrong thing is told exactly
 * which doctrine line they hit rather than reading "unknown key".
 */
const VERDICT_TERMS = new Set([
  "payback", "paybackMonths", "breakeven", "breakevenMonth", "roi", "irr", "npv",
  "netValue", "net", "savings", "savingsTotal", "benefit", "margin", "fragility",
  "recommendation", "verdict", "severity", "severityBand", "confidence",
  "headline", "grade", "result", "r", "d",
]);

const AXIS_KEYS = new Set(AXES);

/** The complete accepted surface of emitGrades. Nothing else may be passed. */
const EMIT_KEYS = new Set([...AXES, "naReason", "reasons"]);

function rejectForeignKeys(axes, fn) {
  for (const k of Object.keys(axes)) {
    if (AXIS_KEYS.has(k)) continue;
    if (VERDICT_TERMS.has(k)) {
      throw new Error(
        `confidence: ${fn} was passed "${k}". Doctrine 5.5 forbids any property of the ` +
        `answer from reaching a confidence axis. Pass the three axis grades only.`
      );
    }
    throw new Error(`confidence: ${fn} was passed unknown key "${k}". Axis grades only.`);
  }
}

/* ------------------------------------------------------- headline and bound */

/**
 * The one function that computes a headline. No tool computes one locally.
 *
 * `boundAxes` is the machine-readable form of `boundBy`. Instrumentation and any
 * other consumer takes the array rather than parsing the prose, and nothing
 * recomputes the minimum locally.
 *
 * @param {{evidence:string, realization?:string|null, completeness:string}} axes
 * @returns {{headline:string, boundBy:string, boundAxes:string[], applicable:string[]}}
 */
export function gradeConfidence(axes) {
  if (!axes || typeof axes !== "object") {
    throw new Error("confidence: gradeConfidence requires an axes object.");
  }
  rejectForeignKeys(axes, "gradeConfidence");

  for (const a of REQUIRED_AXES) {
    if (!isGrade(axes[a])) {
      throw new Error(
        `confidence: axis "${a}" is never N/A and must be one of ${GRADES.join(", ")}. ` +
        `Received ${JSON.stringify(axes[a])}.`
      );
    }
  }
  for (const a of OPTIONAL_AXES) {
    const v = axes[a];
    const declaredNull = v === null || v === undefined;
    if (!declaredNull && !isGrade(v)) {
      throw new Error(
        `confidence: axis "${a}" must be null or one of ${GRADES.join(", ")}. ` +
        `Received ${JSON.stringify(v)}.`
      );
    }
  }

  const applicable = AXES.filter((a) => isGrade(axes[a]));
  const minRank = Math.min(...applicable.map((a) => GRADE_RANK[axes[a]]));
  const headline = GRADES[minRank];
  const binding = applicable.filter((a) => GRADE_RANK[axes[a]] === minRank);

  return { headline, boundBy: nameAxes(binding), boundAxes: binding, applicable };
}

/** "evidence", "evidence and completeness", "evidence, realization and completeness". */
export function nameAxes(list) {
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join(", ") + " and " + list[list.length - 1];
}

/* ---------------------------------------------------------- emission object */

/**
 * Build the object every graded tool emits. Section 5.6.
 *
 * `headline` and `boundBy` are computed here and never hand-written. `defects`
 * carries content omissions for ReportActions to render.
 */
export function emitGrades(input) {
  /*
   * Destructuring alone would drop a foreign key silently, which is the same
   * soft path this module exists to remove. The harness caught exactly that on
   * first run. Both entry points reject, or neither enforcement holds.
   */
  if (!input || typeof input !== "object") {
    throw new Error("confidence: emitGrades requires an object.");
  }
  for (const k of Object.keys(input)) {
    if (EMIT_KEYS.has(k)) continue;
    if (VERDICT_TERMS.has(k)) {
      throw new Error(
        `confidence: emitGrades was passed "${k}". Doctrine 5.5 forbids any property of the ` +
        `answer from reaching a confidence axis. Pass the three axis grades only.`
      );
    }
    throw new Error(`confidence: emitGrades was passed unknown key "${k}". Axis grades, naReason and reasons only.`);
  }

  const { evidence, realization = null, completeness, naReason = "", reasons = {} } = input;
  const { headline, boundBy, boundAxes, applicable } = gradeConfidence({ evidence, realization, completeness });

  const defects = [];
  const naDeclared = !isGrade(realization);

  if (naDeclared && !String(naReason).trim()) {
    defects.push(
      "Realization is marked not applicable and no reason was stated. A silent N/A is " +
      "indistinguishable from an oversight, so this artifact cannot show why the axis was dropped."
    );
  }
  if (!naDeclared && String(naReason).trim()) {
    defects.push(
      "A not-applicable reason was supplied while all three axes carry a grade. " +
      "The reason describes an axis that is not missing."
    );
  }
  for (const a of applicable) {
    if (!String(reasons[a] || "").trim()) {
      defects.push(`The ${a} axis carries a grade with no stated reason. The headline is citable and the breakdown is not defensible.`);
    }
  }

  return {
    evidence,
    realization: naDeclared ? null : realization,
    completeness,
    naReason: naDeclared ? String(naReason || "") : "",
    headline,
    boundBy,
    boundAxes,
    applicable,
    reasons: {
      evidence: reasons.evidence || "",
      realization: naDeclared ? "" : (reasons.realization || ""),
      completeness: reasons.completeness || "",
    },
    defects,
    void: false,
  };
}

/* -------------------------------------------------------------------- void */

/**
 * Void is a state, not a grade. Section 5.4. It supersedes every axis, claims no
 * grade anywhere, and carries the remedy that would lift it.
 */
export function voidResult({ invariant, remedy }) {
  if (!String(invariant || "").trim()) {
    throw new Error("confidence: voidResult requires the failed invariant, stated.");
  }
  if (!String(remedy || "").trim()) {
    throw new Error("confidence: voidResult requires the remedy that would lift the void.");
  }
  return {
    evidence: null,
    realization: null,
    completeness: null,
    naReason: "",
    headline: null,
    boundBy: "",
    boundAxes: [],
    applicable: [],
    reasons: { evidence: "", realization: "", completeness: "" },
    defects: [],
    void: true,
    invariant: String(invariant),
    remedy: String(remedy),
  };
}

export const isVoid = (g) => !!(g && g.void === true);

/* ----------------------------------------------------------- Class C, dual */

/**
 * A Class C tool prices a cost as its headline and publishes a monetized benefit
 * as a secondary graded block. Section 5.3. The two are never averaged and
 * neither is described in the other's language, so this returns both objects
 * side by side and computes nothing across them.
 */
export function emitDual({ cost, benefit, costLabel = "Cost", benefitLabel = "Benefit" }) {
  if (!cost || !benefit) {
    throw new Error("confidence: emitDual requires both a cost result and a benefit result.");
  }
  if (!isVoid(benefit) && benefit.realization === null) {
    throw new Error(
      "confidence: a Class C benefit result carries a modelled benefit, so realization " +
      "may not be N/A. Grade it from the committed credit class."
    );
  }
  return { dual: true, cost, benefit, costLabel, benefitLabel };
}

export const isDual = (g) => !!(g && g.dual === true);

/* ------------------------------------------------- shared axis derivations */

/**
 * Realization is read from mech.js credit class and from nothing else.
 * Section 5.2. Pass the cred string; this module stays dependency free.
 */
export const CRED_GRADE = {
  none: "Directional",
  capacity: "Directional",
  finance: "Planning-grade",
  cash: "Finance-grade",
};

export function realizationFromCred(cred) {
  if (!Object.prototype.hasOwnProperty.call(CRED_GRADE, cred)) {
    throw new Error(
      `confidence: credit class "${cred}" is not one of ${Object.keys(CRED_GRADE).join(", ")}. ` +
      `Realization is read from mech.js and from nothing else.`
    );
  }
  return CRED_GRADE[cred];
}

/** A second tool restating a figure is agreement, never attestation. Section 5.2. */
export const RAIL_EVIDENCE_CAP = "Planning-grade";

/**
 * Grade a value that arrived over the rail, from the origin grade its publisher
 * recorded. No recorded origin grades Directional.
 */
export function railEvidence(originGrade) {
  if (!isGrade(originGrade)) return "Directional";
  return GRADE_RANK[originGrade] > GRADE_RANK[RAIL_EVIDENCE_CAP] ? RAIL_EVIDENCE_CAP : originGrade;
}

/** The weaker of two evidence streams. The rationale names which one bound it. */
export function weakerStream(a, b) {
  if (!isGrade(a)) return isGrade(b) ? b : "Directional";
  if (!isGrade(b)) return a;
  return GRADE_RANK[a] <= GRADE_RANK[b] ? a : b;
}

/** The standing sentence. Rendered once, by ReportActions, never by a tool. */
export const AXIS_EXPLAINER =
  "Evidence rates where the inputs came from and how bookable that origin is. " +
  "Realization rates whether a modelled benefit converts to cash, read from the " +
  "action committed. Completeness rates whether the model is whole and internally " +
  "consistent. The headline is the weakest applicable axis. Each axis has a " +
  "different remedy: get a better source, commit a harder lever, or finish the model.";
