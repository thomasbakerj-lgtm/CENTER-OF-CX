/* Every published V3-Framework rubric. The methodology pages and the rubric harness
   read this registry, so a rubric added here is published and tested at once. A rubric
   with kind "paired" is scored by scorePaired, a model with kind "ownership" by
   scoreOwnership (src/lib/ownership.js), a model with kind "qa" by reviewQA
   (src/lib/qa.js), a model with kind "renewal" by scoreRenewal (src/lib/renewal.js), a
   model with kind "terms" by scoreTerms (src/lib/terms.js), a model with kind "rfp" by
   scoreRfp (src/lib/rfp.js); every other rubric by scoreRubric. */
import { CX_MATURITY } from "./cxMaturity.js";
import { AI_READINESS } from "./aiReadiness.js";
import { TRANSFORMATION_READINESS } from "./transformationReadiness.js";
import { CX_IT_ALIGNMENT } from "./cxItAlignment.js";
import { GOVERNANCE } from "./governance.js";
import { QA_SCORECARD } from "./qaScorecard.js";
import { PLATFORM_DECISION } from "./platformDecision.js";
import { CONTRACT_RISK } from "./contractRisk.js";
import { RFP_BUILDER } from "./rfpBuilder.js";
import { OCCUPANCY_MODEL } from "./occupancyModel.js";
import { SHRINKAGE_MODEL } from "./shrinkageModel.js";
import { AHT_MODEL } from "./ahtModel.js";
import { FORECAST_MODEL } from "./forecastModel.js";
import { ADHERENCE_MODEL } from "./adherenceModel.js";
import { BCB_MODEL } from "./bcbModel.js";
import { ATTRITION_MODEL } from "./attritionModel.js";
import { LICENSE_MODEL } from "./licenseGapModel.js";
import { TCO_MODEL } from "./tcoModel.js";
import { AID_MODEL } from "./aidModel.js";
import { FCR_MODEL } from "./fcrModel.js";
import { CHANNEL_MODEL } from "./channelModel.js";
import { CPC_MODEL } from "./cpcModel.js";
import { STAFFING_MODEL } from "./staffingModel.js";

export const RUBRICS = {
  [CX_MATURITY.id]: CX_MATURITY,
  [AI_READINESS.id]: AI_READINESS,
  [TRANSFORMATION_READINESS.id]: TRANSFORMATION_READINESS,
  [CX_IT_ALIGNMENT.id]: CX_IT_ALIGNMENT,
  [GOVERNANCE.id]: GOVERNANCE,
  [QA_SCORECARD.id]: QA_SCORECARD,
  [PLATFORM_DECISION.id]: PLATFORM_DECISION,
  [CONTRACT_RISK.id]: CONTRACT_RISK,
  [RFP_BUILDER.id]: RFP_BUILDER,
  [OCCUPANCY_MODEL.id]: OCCUPANCY_MODEL,
  [SHRINKAGE_MODEL.id]: SHRINKAGE_MODEL,
  [AHT_MODEL.id]: AHT_MODEL,
  [FORECAST_MODEL.id]: FORECAST_MODEL,
  [ADHERENCE_MODEL.id]: ADHERENCE_MODEL,
  [BCB_MODEL.id]: BCB_MODEL,
  [ATTRITION_MODEL.id]: ATTRITION_MODEL,
  [LICENSE_MODEL.id]: LICENSE_MODEL,
  [TCO_MODEL.id]: TCO_MODEL,
  [AID_MODEL.id]: AID_MODEL,
  [FCR_MODEL.id]: FCR_MODEL,
  [CHANNEL_MODEL.id]: CHANNEL_MODEL,
  [CPC_MODEL.id]: CPC_MODEL,
  [STAFFING_MODEL.id]: STAFFING_MODEL,
};
export { CX_MATURITY, AI_READINESS, TRANSFORMATION_READINESS, CX_IT_ALIGNMENT, GOVERNANCE, QA_SCORECARD, PLATFORM_DECISION, CONTRACT_RISK, RFP_BUILDER, OCCUPANCY_MODEL, SHRINKAGE_MODEL, AHT_MODEL, FORECAST_MODEL, ADHERENCE_MODEL, STAFFING_MODEL };
