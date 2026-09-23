/* researchStatus.js
 *
 * Which CCaaS vendors have passed the Phase 2 research completion gate, and nothing
 * more. Source: CCaaS Master Research Corpus v1.0, checkpoint
 * PRODUCTION_COHORT2_DIALPAD_COMPLETE (22 Sep 2026), vendors collection, every
 * record Completion_Status GATE_PASSED. The corpus itself is not in this public repo.
 *
 * Only three facts travel: the durable corpus Vendor_ID, the site slug it maps to,
 * and the vendor's Last_Validated_Date. No rating, class, claim or finding: Phase 2
 * numeric ratings are locked (phase2_ratings_locked: true), later competitive
 * classes are still draft, and findings reach the site only through the Stage 3
 * vendor-intelligence build.
 *
 * Integrity freeze, TB decision 23 Sep 2026 (S22). Phase 1 numeric scores, tiers and
 * rank order no longer render on public CCaaS surfaces. Every CCaaS profile still
 * shows Phase 1 narrative, labelled with its research status here.
 */

export const CCAAS_RESEARCH = {
  checkpoint: "PRODUCTION_COHORT2_DIALPAD_COMPLETE",
  schemaVersion: "1.0",
  asOf: "2026-09-22",
  phase2RatingsLocked: true,
  /* site slug -> corpus identity. Durable IDs are never renumbered. */
  complete: {
    "nice-cxone": { vendorId: "VEN-CC-0001", validated: "2026-09-19" },
    "amazon-connect": { vendorId: "VEN-CC-0002", validated: "2026-09-21" },
    "content-guru": { vendorId: "VEN-CC-0003", validated: "2026-09-21" },
    genesys: { vendorId: "VEN-CC-0004", validated: "2026-09-21" },
    five9: { vendorId: "VEN-CC-0005", validated: "2026-09-21" },
    talkdesk: { vendorId: "VEN-CC-0006", validated: "2026-09-21" },
    cisco: { vendorId: "VEN-CC-0007", validated: "2026-09-22" },
    ringcentral: { vendorId: "VEN-CC-0008", validated: "2026-09-22" },
    zoom: { vendorId: "VEN-CC-0009", validated: "2026-09-22" },
    "8x8": { vendorId: "VEN-CC-0010", validated: "2026-09-22" },
    odigo: { vendorId: "VEN-CC-0011", validated: "2026-09-22" },
    dialpad: { vendorId: "VEN-CC-0012", validated: "2026-09-22" },
  },
};

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/** "complete" when the vendor passed the Phase 2 gate, otherwise "phase1". */
export function ccaasResearchStatus(slug) {
  return own(CCAAS_RESEARCH.complete, String(slug)) ? "complete" : "phase1";
}

export const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
};

/** The one sentence every public CCaaS surface uses, so the label cannot drift. */
export function ccaasResearchLabel(slug) {
  if (ccaasResearchStatus(slug) === "complete") {
    const rec = CCAAS_RESEARCH.complete[String(slug)];
    return {
      status: "complete",
      short: "Current research complete",
      text: `Current research on this vendor passed its completion gate on ${fmtDate(rec.validated)}. This page still shows the earlier Phase 1 assessment and is being rebuilt from the new research. Numeric scores are withdrawn until class-specific ratings are validated.`,
    };
  }
  return {
    status: "phase1",
    short: "Phase 1 context",
    text: "Phase 1 context, not yet researched under the current methodology. Numeric scores are withdrawn until this vendor is researched and class-specific ratings are validated.",
  };
}

export const CCAAS_COMPLETE_COUNT = Object.keys(CCAAS_RESEARCH.complete).length;
