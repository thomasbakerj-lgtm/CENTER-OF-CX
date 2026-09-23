/* rubric.js
 *
 * The one scoring engine for V3-Framework assessments (doctrine v1.3 Section 10.1).
 *
 * An assessment is a published rubric (src/lib/rubrics/) plus this engine. The rubric
 * is data: dimensions, criteria, weights, the answer scale, the bands and the action
 * each criterion calls for. The engine turns answers into a position on that rubric
 * and nothing more. It never ranks the respondent against other organizations,
 * because no sourced distribution exists, and it never recommends a vendor.
 *
 * Every output line carries the ids of the criteria that produced it, so a reader,
 * a reviewer or the harness can trace any score, band or checklist action back to
 * the answers behind it. The methodology page renders from the same rubric object
 * the engine scores, so the published rubric and the scoring cannot drift apart.
 *
 * Answer keys are `${dimensionId}-${criterionIndex}`, the keys the assessments have
 * always used, so a scenario link shared before the rubric moved here still opens.
 */

/* @engine-start */
function isAnswer(rubric, v) {
  return Number.isInteger(v) && v >= rubric.scale.min && v <= rubric.scale.max;
}

function criterionKey(dim, i) {
  return `${dim.id}-${i}`;
}

function bandFor(rubric, score) {
  for (const b of rubric.bands) if (score >= b.min && score < b.max) return b;
  return rubric.bands[rubric.bands.length - 1];
}

/* Scores answers against a rubric.
   An answer outside the scale, or not a whole number, is treated as unanswered.
   A dimension scores the mean of its answered criteria. The overall score is the
   weighted mean of dimension scores and is reported only when every criterion is
   answered: a partial assessment claims no position and no band. */
function scoreRubric(rubric, answers) {
  const a = answers && typeof answers === "object" ? answers : {};
  const dims = rubric.dims.map((dim) => {
    const criteria = dim.criteria.map((c, i) => {
      const key = criterionKey(dim, i);
      const v = Object.prototype.hasOwnProperty.call(a, key) && isAnswer(rubric, a[key]) ? a[key] : null;
      return { id: key, text: c.text, action: c.action, score: v };
    });
    const answered = criteria.filter((c) => c.score !== null);
    const score = answered.length ? answered.reduce((s, c) => s + c.score, 0) / answered.length : null;
    return {
      id: dim.id, name: dim.name, weight: dim.weight, next: dim.next,
      score, complete: answered.length === criteria.length,
      criteria, trace: answered.map((c) => c.id),
    };
  });

  const complete = dims.every((d) => d.complete);
  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
  const overall = complete ? dims.reduce((s, d) => s + d.weight * d.score, 0) / totalWeight : null;
  const band = complete ? bandFor(rubric, overall) : null;
  const secondary = complete && rubric.secondaryBands ? bandFor({ bands: rubric.secondaryBands.bands }, overall) : null;

  /* Every criterion answered at or below the fail line becomes one checklist action.
     Weakest dimension first, then lowest answer, then rubric order, so the list is
     deterministic and the first item is the most urgent on the rubric's own terms. */
  const checklist = [];
  const byWeakest = dims.map((d, di) => ({ d, di })).filter((x) => x.d.score !== null)
    .sort((x, y) => x.d.score - y.d.score || x.di - y.di);
  for (const { d } of byWeakest) {
    d.criteria
      .map((c, ci) => ({ c, ci }))
      .filter((x) => x.c.score !== null && x.c.score <= rubric.failAt)
      .sort((x, y) => x.c.score - y.c.score || x.ci - y.ci)
      .forEach(({ c }) => checklist.push({ criterion: c.id, dimension: d.id, dimensionName: d.name, score: c.score, text: c.text, action: c.action }));
  }

  /* The next diagnostic is named by the weakest dimension, ties broken by rubric
     order. It is a tool on the journey graph, never a vendor. */
  const weakest = complete ? byWeakest[0].d : null;
  const nextDiagnostic = weakest ? { tool: weakest.next, because: weakest.id, trace: weakest.trace } : null;

  return {
    rubric: rubric.id, version: rubric.version, complete,
    dims, overall, band, secondary, checklist, nextDiagnostic,
    trace: dims.flatMap((d) => d.trace),
  };
}
/* @engine-end */

export { scoreRubric, isAnswer, criterionKey, bandFor };
