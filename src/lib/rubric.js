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
/* Scores a paired rubric (kind "paired"), such as CX + IT Alignment.
   Each criterion is a pair answered from two sides on the same scale, keyed
   `${dimensionId}-${pairIndex}-${side}`. A pair scores the gap between its two answers
   and is scored only when both are answered. A dimension scores the mean gap of its
   scored pairs; the overall score is the weighted mean of dimension gaps, reported
   only when every pair is answered. Lower is closer agreement.
   A gap cannot see two sides that agree a capability is missing, so the checklist
   carries two kinds of action: "misaligned" for a pair whose gap reaches gapAt, and
   "shared" for a pair answered at failAt or below on both sides. The two cannot both
   apply to one pair. Order: largest dimension gap first, then misaligned pairs by gap,
   then shared weaknesses, then rubric order. */
function scorePaired(rubric, answers) {
  const a = answers && typeof answers === "object" ? answers : {};
  const [s1, s2] = rubric.sides.map((x) => x.id);
  const read = (key) => (Object.prototype.hasOwnProperty.call(a, key) && isAnswer(rubric, a[key]) ? a[key] : null);
  const mean = (v) => (v.length ? v.reduce((x, y) => x + y, 0) / v.length : null);
  const dims = rubric.dims.map((dim) => {
    const pairs = dim.pairs.map((p, i) => {
      const id = `${dim.id}-${i}`;
      const v1 = read(`${id}-${s1}`), v2 = read(`${id}-${s2}`);
      const both = v1 !== null && v2 !== null;
      const gap = both ? Math.abs(v1 - v2) : null;
      const kind = !both ? null : gap >= rubric.gapAt ? "misaligned" : Math.max(v1, v2) <= rubric.failAt ? "shared" : null;
      return { id, [s1]: v1, [s2]: v2, gap, kind, texts: { [s1]: p[s1], [s2]: p[s2] }, action: kind === "misaligned" ? p.align : kind === "shared" ? p.build : null };
    });
    const scored = pairs.filter((p) => p.gap !== null);
    return {
      id: dim.id, name: dim.name, weight: dim.weight, next: dim.next,
      gap: mean(scored.map((p) => p.gap)),
      [s1]: mean(pairs.filter((p) => p[s1] !== null).map((p) => p[s1])),
      [s2]: mean(pairs.filter((p) => p[s2] !== null).map((p) => p[s2])),
      complete: scored.length === pairs.length, pairs,
      trace: pairs.flatMap((p) => [p[s1] !== null ? `${p.id}-${s1}` : null, p[s2] !== null ? `${p.id}-${s2}` : null]).filter(Boolean),
    };
  });

  const complete = dims.every((d) => d.complete);
  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
  const overall = complete ? dims.reduce((s, d) => s + d.weight * d.gap, 0) / totalWeight : null;
  const band = complete ? bandFor(rubric, overall) : null;

  const order = dims.map((d, di) => ({ d, di })).filter((x) => x.d.gap !== null)
    .sort((x, y) => y.d.gap - x.d.gap || x.di - y.di);
  const checklist = [];
  for (const { d } of order) {
    d.pairs.map((p, pi) => ({ p, pi })).filter((x) => x.p.kind)
      .sort((x, y) => (x.p.kind === y.p.kind ? (y.p.gap - x.p.gap) || (x.pi - y.pi) : x.p.kind === "misaligned" ? -1 : 1))
      .forEach(({ p }) => checklist.push({ criterion: p.id, dimension: d.id, dimensionName: d.name, kind: p.kind, gap: p.gap, [s1]: p[s1], [s2]: p[s2], texts: p.texts, action: p.action }));
  }

  /* The next diagnostic is named by the dimension with the largest gap; where gaps tie,
     the one with more shared weaknesses, then rubric order. A tool, never a vendor. */
  const shared = (d) => d.pairs.filter((p) => p.kind === "shared").length;
  const worst = complete ? dims.map((d, di) => ({ d, di })).sort((x, y) => y.d.gap - x.d.gap || shared(y.d) - shared(x.d) || x.di - y.di)[0].d : null;
  const nextDiagnostic = worst ? { tool: worst.next, because: worst.id, trace: worst.trace } : null;

  return {
    rubric: rubric.id, version: rubric.version, kind: "paired", complete,
    dims, overall, band, checklist, nextDiagnostic,
    trace: dims.flatMap((d) => d.trace),
  };
}
/* @engine-end */

export { scoreRubric, scorePaired, isAnswer, criterionKey, bandFor };
