/* methodVersions.js
 *
 * The published method version of each tool, stamped on the tool page and the PDF cover by
 * ReportActions. Kept as a small table so no tool chunk loads the method models themselves;
 * methods.test.mjs fails if any entry differs from the model's own version and date. Tools
 * without a published method (Roadmap, Vendor Match) carry no stamp.
 */
const V = (version, published) => ({ version, published });
export const METHOD_VERSIONS = {
  "cx-maturity": V("1.0", "2026-09-23"),
  "ai-readiness": V("1.0", "2026-09-23"),
  "transformation-readiness": V("1.0", "2026-09-23"),
  "cx-it-alignment": V("1.0", "2026-09-23"),
  "governance-model": V("1.0", "2026-09-23"),
  "qa-scorecard": V("1.0", "2026-09-24"),
  "platform-decision": V("1.0", "2026-09-24"),
  "contract-risk": V("1.0", "2026-09-24"),
  "rfp-builder": V("1.0", "2026-09-24"),
  "occupancy-risk": V("1.0", "2026-09-24"),
  "shrinkage-planner": V("1.0", "2026-09-24"),
  "aht-decomposition": V("1.0", "2026-09-24"),
  "forecast-accuracy": V("1.0", "2026-09-24"),
  "schedule-adherence": V("1.0", "2026-09-24"),
  "staffing-calculator": V("1.0", "2026-09-25"),
  "cost-per-contact": V("1.0", "2026-09-25"),
  "channel-shift": V("1.0", "2026-09-25"),
  "fcr-leakage": V("1.0", "2026-09-25"),
  "ai-deflection": V("1.0", "2026-09-25"),
  "tco-calculator": V("1.0", "2026-09-25"),
  "license-gap": V("1.0", "2026-09-25"),
  "attrition-cost": V("1.0", "2026-09-25"),
  "business-case-builder": V("1.1", "2026-09-25"),
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

/* { text, href } for a tool, or null. The text is plain, for the page and the PDF alike. */
export function methodStamp(toolId) {
  const m = Object.prototype.hasOwnProperty.call(METHOD_VERSIONS, toolId) ? METHOD_VERSIONS[toolId] : null;
  if (!m) return null;
  return { version: m.version, published: m.published, text: `Method ${m.version}, published ${longDate(m.published)}`, href: `/methodology/${toolId}` };
}
