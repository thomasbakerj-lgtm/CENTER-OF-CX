// compareView.js
//
// Peer group comparison and "alternatives to" pages (TB, 13 Oct 2026, open item 9: class comparison and alternatives
// pages from the research, A to Z, no order). Truth surface: Vendor Intelligence; presentation only.
// buildCompareIndex reads the shared file (vendors and their peer groups) and each vendor's published decision
// statements (strong fit when, be careful if, rule it out if), word for word, in Decision_ID order. It reads no rating,
// score, Phase 1 field, Market Position record or count of states, and it orders vendors A to Z only. research-sync
// writes it as compare.json beside the snapshot; research.test.mjs proves the committed file equals this function run on
// the committed snapshot.
import { stableJson } from "./snapshot.js";
import { PLAIN } from "./classWords.js";

export const COMPARE_INDEX_VERSION = "1.0.0";
export const DECISION_KINDS = [["best", "BEST_WHEN"], ["caution", "CAUTION_WHEN"], ["eliminate", "ELIMINATE_WHEN"]];

const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id);

function decisions(file, type) {
  return (file.decision_intelligence || [])
    .filter((d) => d.Decision_Type === type && d.Publishable === "YES" && d.Statement)
    .sort((a, b) => a.Decision_ID.localeCompare(b.Decision_ID))
    .map((d) => ({ id: d.Decision_ID, statement: d.Statement, validated: d.Validation_Date || null }));
}

export function buildCompareIndex(shared, files) {
  const vendors = shared.vendors.filter((v) => files[v.Vendor_ID]).map((v) => ({
    id: v.Vendor_ID,
    name: v.Supplier_Name,
    klass: v.Competitive_Class_ID,
    also: v.Secondary_Class_ID || null,
    validated: v.Last_Validated_Date,
    decisions: Object.fromEntries(DECISION_KINDS.map(([k, type]) => [k, decisions(files[v.Vendor_ID], type)])),
  })).sort(byName);
  return { version: COMPARE_INDEX_VERSION, category: shared.category, vendors };
}

export const compareIndexJson = (shared, files) => stableJson(buildCompareIndex(shared, files));

/* A peer group's address, from its plain name ("Full enterprise suites" reads full-enterprise-suites). */
export const classSlug = (id) => (PLAIN[id] ? PLAIN[id].name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null);
export const classBySlug = (slug) => Object.keys(PLAIN).find((id) => classSlug(id) === slug) || null;
export const comparePath = (id) => `/vendors/ccaas/compare/${classSlug(id)}`;
export const alternativesPath = (slug) => `/vendors/${slug}/alternatives`;
