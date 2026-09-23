/* Every published V3-Framework rubric. The methodology pages and the rubric harness
   read this registry, so a rubric added here is published and tested at once. */
import { CX_MATURITY } from "./cxMaturity.js";
import { AI_READINESS } from "./aiReadiness.js";

export const RUBRICS = { [CX_MATURITY.id]: CX_MATURITY, [AI_READINESS.id]: AI_READINESS };
export { CX_MATURITY, AI_READINESS };
