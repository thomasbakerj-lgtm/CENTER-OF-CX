/* occupancy.js
 *
 * The engine for the Occupancy Risk Simulator. Occupancy is workload over agents: the
 * offered load in Erlangs (calls per hour times handle time in hours) divided by the
 * agents staffed. That is arithmetic. Everything this engine adds on top of it is a
 * labelled planning model: the platform's shared occupancy bands (healthy, caution,
 * critical), and attrition multipliers for the caution and critical bands, applied to the
 * attrition the user enters, which is taken as the rate at or below the healthy band.
 *
 * Every constant is passed in (P), read by the caller from the registry, so the harness can
 * slice this region and run it with the same values the page shows.
 */

/* @engine-start */
function occBand(occ, B) {
  return occ > B.cautionMax ? "critical" : occ > B.healthyMax ? "caution" : "healthy";
}

function occMultiplier(occ, B, M) {
  return occ > B.cautionMax ? M.critical : occ > B.healthyMax ? M.caution : 1;
}

function runOccupancy(v, P) {
  const B = P.bands, M = P.mult;
  const intensity = (v.callsPerHour * v.aht) / 3600;
  const occ = v.agents > 0 ? intensity / v.agents : 0;
  const overloaded = occ >= 1;
  const band = overloaded ? "critical" : occBand(occ, B);
  const baseAttrition = v.attritionRate / 100;
  /* The cost of replacing one agent who leaves: the hiring cost, plus the loaded wages
     paid while the new hire ramps. */
  const rampWages = v.trainingWeeks * P.hoursWeek * v.hourlyRate * P.load;
  const replacementCost = v.hiringCost + rampWages;

  const ladder = [];
  for (let pct = 70; pct <= 98; pct += 2) {
    const o = pct / 100;
    const agents = intensity > 0 ? Math.ceil(intensity / o) : 0;
    const mult = occMultiplier(o, B, M);
    const attrition = baseAttrition * mult;
    ladder.push({ occ: pct, agents, idleMin: (1 - o) * 60, band: occBand(o, B), mult, attrition: attrition * 100, turnoverCost: attrition * agents * replacementCost });
  }

  /* Bringing occupancy to the target: the agents needed, what they cost for a year, and
     the attrition cost the model attaches to running at today's occupancy instead. */
  const target = v.target / 100;
  const agentsAtTarget = intensity > 0 ? Math.ceil(intensity / target) : 0;
  const extraAgents = Math.max(0, agentsAtTarget - v.agents);
  const staffingCost = extraAgents * v.hourlyRate * P.hoursYear * P.load;
  const curMult = overloaded ? M.critical : occMultiplier(occ, B, M);
  const targetMult = occMultiplier(target, B, M);
  const excessAttritionCost = Math.max(0, curMult - targetMult) * baseAttrition * v.agents * replacementCost;
  const aboveTarget = overloaded || occ > target;

  return {
    intensity, occ, overloaded, band, idleMin: overloaded ? 0 : (1 - occ) * 60,
    baseAttrition, rampWages, replacementCost, ladder,
    target, targetBand: occBand(target, B), agentsAtTarget, extraAgents, staffingCost,
    curMult, targetMult, excessAttritionCost, aboveTarget,
    staffingExceedsAttrition: staffingCost > excessAttritionCost,
  };
}
/* @engine-end */

export { occBand, occMultiplier, runOccupancy };
