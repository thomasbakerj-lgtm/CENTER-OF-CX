// categoryView.js
//
// The category page's view of the research snapshot (redesign Phase 7 part 3). Truth surface: Vendor Intelligence;
// presentation only. buildCategoryIndex reads the shared file (classes, vendors) and each vendor's file for one thing:
// the vendor's first published best-when statement, in Decision_ID order. It keeps the class definitions word for word
// and orders vendors A to Z inside each class. It reads no rating, score, Phase 1 field, Market Position record or count
// of states, and it orders nothing by merit. research-sync writes its output as category.json beside the snapshot, so
// the category page loads a few kilobytes instead of every vendor file; research.test.mjs proves the committed file
// equals this function run on the committed snapshot.
import { stableJson } from "./snapshot.js";

export const CATEGORY_INDEX_VERSION = "1.1.0";
/* Peer group states that read as settled. Schema 1.0 said LOCKED_CALIBRATED; Research Method v2 (schema 1.1) says ACTIVE. */
const SETTLED = new Set(["LOCKED_CALIBRATED", "ACTIVE"]);

const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id);

export function firstBestWhen(file) {
  const rows = (file.decision_intelligence || [])
    .filter((d) => d.Decision_Type === "BEST_WHEN" && d.Publishable === "YES" && d.Statement)
    .sort((a, b) => a.Decision_ID.localeCompare(b.Decision_ID));
  return rows.length ? { id: rows[0].Decision_ID, statement: rows[0].Statement, validated: rows[0].Validation_Date || null } : null;
}

export function buildCategoryIndex(shared, files) {
  const vendors = shared.vendors.map((v) => ({
    id: v.Vendor_ID,
    name: v.Supplier_Name,
    klass: v.Competitive_Class_ID,
    validated: v.Last_Validated_Date,
    also: v.Secondary_Class_ID || null,
    bestWhen: files[v.Vendor_ID] ? firstBestWhen(files[v.Vendor_ID]) : null,
  }));
  const classes = shared.competitive_classes
    .map((c) => ({
      id: c.Competitive_Class_ID,
      name: c.Class_Name,
      job: c.Primary_Job,
      definition: c.Definition,
      buyer: c.Typical_Buyer_Profile,
      boundary: c.Comparison_Boundary,
      excluded: c.Excluded_or_Adjacent_Patterns,
      status: c.Status,
      draft: !SETTLED.has(c.Status),
      vendors: vendors.filter((v) => v.klass === c.Competitive_Class_ID).map(({ klass, ...rest }) => rest).sort(byName),
    }))
    /* A retired group, or one that holds no vendor as its main group (a provisional group holds them only as a second
       group), lists nothing on the page; the vendor's second group is named on its own entry. */
    .filter((c) => c.status !== "RETIRED" && c.vendors.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  const dates = vendors.map((v) => v.validated).filter(Boolean).sort();
  return {
    version: CATEGORY_INDEX_VERSION,
    category: shared.category,
    classes,
    unclassed: vendors.filter((v) => !classes.some((c) => c.id === v.klass)).map((v) => v.id).sort(),
    validatedFrom: dates[0] || null,
    validatedTo: dates[dates.length - 1] || null,
  };
}

export const categoryIndexJson = (shared, files) => stableJson(buildCategoryIndex(shared, files));
