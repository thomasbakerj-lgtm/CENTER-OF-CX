/* Every published V3-Framework rubric. The methodology pages and the rubric harness
   read this registry, so a rubric added here is published and tested at once. A rubric
   with kind "paired" is scored by scorePaired; every other rubric by scoreRubric. */
import { CX_MATURITY } from "./cxMaturity.js";
import { AI_READINESS } from "./aiReadiness.js";
import { TRANSFORMATION_READINESS } from "./transformationReadiness.js";
import { CX_IT_ALIGNMENT } from "./cxItAlignment.js";

export const RUBRICS = {
  [CX_MATURITY.id]: CX_MATURITY,
  [AI_READINESS.id]: AI_READINESS,
  [TRANSFORMATION_READINESS.id]: TRANSFORMATION_READINESS,
  [CX_IT_ALIGNMENT.id]: CX_IT_ALIGNMENT,
};
export { CX_MATURITY, AI_READINESS, TRANSFORMATION_READINESS, CX_IT_ALIGNMENT };
