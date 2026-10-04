import { CATEGORIES } from "./verticals.js";
/* researchStatus.js
 *
 * Which CCaaS vendors have passed a research completion gate, and nothing more. Source:
 * CCaaS Master Research Corpus, schema 1.1 (Research Method v2), checkpoint
 * V1_1_MIGRATED_PRE_GOTO (generated 1 Oct 2026, private research repository). Every vendor
 * passed the 1.0 gate and awaits the 1.1 re-audit (GATE_PASSED_V1_0_REAUDIT_REQUIRED); TB
 * decided on 1 Oct 2026 that they publish meanwhile, with the method noted at the page foot.
 * The corpus itself is not in this public repo.
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
  checkpoint: "V1_1_MIGRATED_PRE_GOTO",
  schemaVersion: "1.1",
  asOf: "2026-10-01",
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
    puzzel: { vendorId: "VEN-CC-0013", validated: "2026-09-22" },
    avaya: { vendorId: "VEN-CC-0014", validated: "2026-09-23" },
    enghouse: { vendorId: "VEN-CC-0015", validated: "2026-09-23" },
    ujet: { vendorId: "VEN-CC-0016", validated: "2026-09-23" },
    "bright-pattern": { vendorId: "VEN-CC-0017", validated: "2026-09-23" },
    vonage: { vendorId: "VEN-CC-0018", validated: "2026-09-23" },
    "anywhere-now": { vendorId: "VEN-CC-0019", validated: "2026-09-24" },
    aircall: { vendorId: "VEN-CC-0020", validated: "2026-09-24" },
    luware: { vendorId: "VEN-CC-0021", validated: "2026-09-24" },
    alvaria: { vendorId: "VEN-CC-0022", validated: "2026-09-24" },
  },
  /* The next vendor in the research queue (one at a time under Research Method v2). A plan, not a finding. */
  next: "goto",
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

/* Integrity freeze, extended to the seven other categories (TB, S23). No category beyond
   CCaaS has current research yet, so every vendor there is Phase 1 context and carries the
   same label. Names come from CATEGORIES, the one name per category (TB, 1 Oct 2026). */
export const PHASE1_CATEGORIES = Object.fromEntries(
  Object.entries(CATEGORIES).filter(([k]) => k !== "ccaas").map(([k, c]) => [k, c.name]));

/** Research status for any vendor: CCaaS reads the registry; every other category is Phase 1. */
export function researchStatus(category, slug) {
  return category === "ccaas" ? ccaasResearchStatus(slug) : "phase1";
}

/** The one label for a non-CCaaS vendor, so no page words it differently. */
export function phase1Label() {
  return {
    status: "phase1",
    short: "Phase 1 context",
    text: "Phase 1 context, not yet researched under the current methodology. Numeric scores, tiers and rankings are withdrawn until this category is researched and class-specific ratings are validated.",
  };
}

/** Name order, the only order a list of unresearched vendors carries. */
export const byName = (a, b) => String(a.name).localeCompare(String(b.name));
