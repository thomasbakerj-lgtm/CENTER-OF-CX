// ccaasIndustry.js
//
// The CCaaS by industry pages (redesign Phase 7 part 4, research Stage 3). Truth surface: Vendor Intelligence;
// presentation only. The research has no industry field, so an industry page shows the findings that match a published
// rule: each theme names what it looks for (for example "names Epic or an EHR") and the page shows every published
// record, in every researched vendor's file, whose text matches it. Nothing is picked by hand, so nothing is left out
// by hand; research.test.mjs proves the committed index equals a fresh build and that every theme's list is complete.
// Records keep their own words, evidence state and validation date. Vendors are A to Z; no record is ranked or scored.
// Where the research has no finding for an industry, the page says so.
import { stableJson } from "./snapshot.js";

export const INDUSTRY_INDEX_VERSION = "1.0.0";

/* Each theme: a plain title, what it means for a buyer in our words, and the rule, shown on the page as `rule`. */
export const THEMES = {
  healthcare: [
    { id: "ehr", title: "Electronic health record integration", rule: "names Epic or an EHR", test: /\bEpic\b|\bEHR\b/,
      why: "Agents in healthcare work inside the patient record. What the research says about each platform's EHR path." },
    { id: "hipaa", title: "HIPAA and business associate agreements", rule: "names HIPAA or a BAA", test: /\bHIPAA\b|\bBAA\b/,
      why: "Protected health information needs HIPAA controls and a signed BAA for the exact service you buy." },
    { id: "health-offers", title: "Healthcare products and packages", rule: "names healthcare or a health product", test: /\bhealth ?care\b|Connect Health/i,
      why: "Products and packages the research found built or sold for healthcare." },
  ],
  government: [
    { id: "authorization", title: "Government authorization", rule: "names FedRAMP, StateRAMP, an impact level or a government environment", test: /FedRAMP|StateRAMP|\bIL[245]\b|government authorization|Government Edition|Government Cloud|for Government/i,
      why: "An authorization belongs to one service boundary. What the research found authorized, where, and where it was not established." },
    { id: "public-sector", title: "Public sector offers and fit", rule: "names public sector or government buyers", test: /public[ -]sector|\bgovernment (buyers?|requirements)\b|and government\b/i,
      why: "Offers the research says are sold to public sector buyers, and when fit rises or falls for them." },
  ],
  "financial-services": [
    { id: "collections", title: "Collections and outbound", rule: "names collections", test: /\bcollections\b/i,
      why: "Collections run on outbound dialing under consent and contact rules. What each platform offers and where it breaks." },
    { id: "fin-compliance", title: "FINRA and payment card evidence", rule: "names FINRA or PCI", test: /\bFINRA\b|\bPCI\b/,
      why: "Recordkeeping and payment card controls, as each vendor documents them. Scope must be proven for the service you buy." },
    { id: "banks", title: "Deployments at banks", rule: "names a bank", test: /\bbank\b/i,
      why: "Production proof the research recorded at banks, with its source and its limits." },
    { id: "fin-offers", title: "Financial services packages", rule: "names financial services", test: /financial services/i,
      why: "Products and packages the research found built or sold for financial services." },
  ],
  retail: [
    { id: "retail-offers", title: "Retail packages", rule: "names retail", test: /\bretail\b/i,
      why: "Products and packages the research found built or sold for retail." },
    { id: "retail-pci", title: "Payment card evidence", rule: "names PCI", test: /\bPCI\b/,
      why: "Taking card payments in the contact center needs PCI controls for the exact service you buy." },
    { id: "orders", title: "Order and booking actions by AI agents", rule: "names order status or booking", test: /order status|\bbooking\b/i,
      why: "Self-service that acts on orders and appointments, and what the research could not yet establish about it." },
  ],
  insurance: [
    { id: "insurance-offers", title: "Insurance packages", rule: "names insurance", test: /\binsurance\b/i,
      why: "Products and packages the research found built or sold for insurance." },
  ],
  travel: [
    { id: "travel-offers", title: "Travel and hospitality packages", rule: "names travel or hospitality", test: /\btravel\b|hospitality/i,
      why: "Products and packages the research found built or sold for travel and hospitality." },
  ],
  utilities: [
    { id: "utilities-offers", title: "Utilities packages", rule: "names utilities", test: /\butilities\b/i,
      why: "Products and packages the research found built or sold for utilities." },
  ],
  telecom: [],
  manufacturing: [],
  education: [],
};

export const KIND = { claim: "Finding", decision: "Decision guidance", fit: "When fit changes", product: "Product", break: "Where it breaks" };

/* Every published record a theme can match, in one shape, with the words the page shows. */
export function recordsOf(file) {
  const v = file.vendor;
  const row = (kind, id, text, extra = {}) => ({ vendorId: v.Vendor_ID, vendor: v.Supplier_Name, kind, id, text, ...extra });
  return [
    ...file.claims.map((c) => row("claim", c.Claim_ID, c.Publishable_Summary, { state: c.Evidence_State || null, validated: c.Validation_Date || null })),
    ...file.decision_intelligence.map((d) => row("decision", d.Decision_ID, d.Statement, { state: d.Evidence_State || null, validated: d.Validation_Date || null })),
    ...file.fit_sensitivity.map((f) => row("fit", f.Fit_ID, f.Buyer_Condition, { validated: f.Validation_Date || null })),
    ...file.products.map((p) => row("product", p.Product_ID, `${p.Product_or_SKU}: ${p.Primary_Target_Segment}`, { validated: p.Last_Validated_Date || null })),
    ...file.breaks.map((b) => row("break", b.Break_ID, b.Trigger_Condition || b.Break_Summary, { detail: b.Trigger_Condition && b.Break_Summary ? b.Break_Summary : null, state: b.Evidence_State || null, validated: b.Validation_Date || null })),
  ].filter((r) => typeof r.text === "string" && r.text.length > 0);
}

/** A record matches a theme when its shown words, or a break's summary beside its trigger, meet the rule. */
export const matches = (theme, r) => theme.test.test(r.text) || (!!r.detail && theme.test.test(r.detail));

export function buildIndustryIndex(shared, files) {
  const records = shared.vendors.map((v) => v.Vendor_ID).sort().flatMap((id) => (files[id] ? recordsOf(files[id]) : []));
  const byVendor = (a, b) => a.vendor.localeCompare(b.vendor, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id);
  const industries = Object.entries(THEMES).map(([industry, themes]) => ({
    industry,
    themes: themes.map((t) => ({ id: t.id, title: t.title, rule: t.rule, why: t.why, rows: records.filter((r) => matches(t, r)).sort(byVendor) })),
  }));
  return { version: INDUSTRY_INDEX_VERSION, category: shared.category, industries };
}

export const industryIndexJson = (shared, files) => stableJson(buildIndustryIndex(shared, files));
