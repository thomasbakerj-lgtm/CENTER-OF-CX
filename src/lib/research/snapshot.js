// src/lib/research/snapshot.js
//
// Research Stage 1 (redesign Phase 7): turns a category's Master Research Corpus into the public snapshot the site
// builds from. The raw corpus never enters this repository (it is public); only what this function returns does, as
// src/data/research/<category>.json, written by scripts/research-sync.mjs. Decision D1 in docs/PHASE0_DECISIONS.md.
//
// Truth surface: Vendor Intelligence (research truth). The snapshot feeds vendor profiles and category pages. It reads
// no Market Position data and writes nothing Vendor Match may read as a verdict.
//
// Rules, in order (CLAUDE.md section 13):
//   1. Refuse the wrong category or schema version, and a corpus that does not say it is the system of record.
//   2. Only vendors whose completion gate passed are published.
//   3. Evidence is published only when it is PUBLIC and carries a publishable permission state. Anything else,
//      including an unknown or missing state, is treated as confidential and dropped, with no trace of its existence.
//      Practitioner review aggregations (G2, Gartner Peer Insights) are dropped too: review content never reaches
//      public research.
//   4. A claim is published only when Vendor Intelligence may read it, it is active, it has a publishable summary, and
//      at least one link reaches published evidence. A claim resting only on dropped evidence is withheld. A source
//      that limits or gives context counts: an unverified claim cited by a limiting source still publishes, because
//      unknown is not weak, and the proof it asks the buyer for is the finding.
//   5. Every derived record (assessment, break, implementation, SOW, day 2, integration, AI governance, BPO, TCO, fit,
//      decision, proof, contract, open question) keeps only links to published claims, and is withheld if none remain.
//   6. Tables that are governance or hypothesis only never publish: Phase 1 baseline, claim migration, score deltas,
//      completion gates, normalization log, framework changes, calibration plan, refresh triggers, Market Position.
//   7. Internal fields never publish: research notes, researcher, raw claim text (the summary written for publication
//      is published instead), excerpts, confidence notes, lineage sources, internal owners.
//   8. Presentation only: the site writes no em or en dash, so dashes in text become commas or "to"; the count is in
//      the manifest. IDs, states and dates are never rewritten; "None" reads as null, never as zero.
// Numeric Phase 2 ratings stay locked: no rating or score field exists in the output while phase2_ratings_locked.

export const LOADER_VERSION = "1.0.0";

const CATEGORIES = { ccaas: "CCaaS" };
const SCHEMA_VERSION = "1.0";

const PUBLISHABLE_PERMISSIONS = new Set([
  "PUBLISHABLE", "PUBLIC_CITABLE", "PUBLIC_LINK_CITABLE", "PUBLIC_CITABLE_AS_VENDOR_STATED",
  "PUBLIC_CITABLE_AS_VENDOR_CUSTOMER_PROOF", "PUBLIC_CITABLE_AS_PARTNER_PROOF", "PUBLIC_CITABLE_AS_ATTRIBUTED",
]);
const REVIEW_SOURCE = /practitioner review|peer insights|\bG2\b|review aggregation|reviewer/i;

/* Tables that never publish, whatever they hold. */
export const WITHHELD_TABLES = ["phase1_baseline", "claim_migration", "score_deltas", "completion_gates", "normalization_log",
  "framework_changes", "calibration_plan", "refresh_triggers", "surface_permissions", "market_position_capture"];

/* Fields that never publish, in any table. */
export const WITHHELD_FIELDS = new Set(["Research_Note", "Notes", "Researcher", "Evidence_Confidence_Notes", "Relevant_Excerpt_or_Paraphrase",
  "Claim_Text", "Lineage_Source", "Resolution_Notes", "Refresh_Trigger_Summary", "Double_Counting_Check"]);
const WITHHELD_BY_TABLE = { unresolved_questions: new Set(["Owner"]) };

/* Derived tables and the field that links each record to claims. */
export const LINKED_TABLES = {
  criteria_assessments: "Claim_IDs", breaks: "Claim_IDs", implementation: "Claim_IDs", sow_exposure: "Claim_IDs",
  day2_change: "Claim_IDs", integrations: "Claim_IDs", ai_governance: "Claim_IDs", bpo_fit: "Claim_IDs", tco: "Claim_IDs",
  fit_sensitivity: "Claim_IDs", decision_intelligence: "Linked_Claim_IDs", proof_requirements: "Linked_Claim_ID",
  contract_requirements: "Linked_Claim_ID", unresolved_questions: "Linked_Claim_ID",
};

const isNone = (v) => v === null || v === undefined || v === "None" || v === "";
const ids = (v) => (isNone(v) ? [] : String(v).split(/[;,\s]+/).map((x) => x.trim()).filter(Boolean));

/* Presentation only. Returns [text, replacements]. */
export function undash(s) {
  if (typeof s !== "string") return [s, 0];
  let n = 0;
  const out = s
    .replace(/(\d)\s*\u2013\s*(\d)/g, (_, a, b) => { n++; return `${a} to ${b}`; })
    .replace(/\s*[\u2014\u2013]\s*/g, () => { n++; return ", "; })
    .replace(/,\s*,/g, ",").replace(/^,\s*/, "").replace(/\s+,/g, ",");
  return [out, n];
}

function clean(row, table, counter) {
  const out = {};
  for (const k of Object.keys(row).sort()) {
    if (WITHHELD_FIELDS.has(k) || (WITHHELD_BY_TABLE[table] && WITHHELD_BY_TABLE[table].has(k))) continue;
    let v = row[k];
    if (isNone(v)) { out[k] = null; continue; }
    if (typeof v === "string") { const [t, n] = undash(v); counter.dashes += n; v = t; }
    out[k] = v;
  }
  return out;
}

const tierOf = (t) => { const m = /(?:TIER[_ ]|Tier )(\d)/i.exec(String(t || "")); return m ? Number(m[1]) : null; };

export function publishableEvidence(e) {
  return !!e && e.Confidentiality_State === "PUBLIC" && PUBLISHABLE_PERMISSIONS.has(e.Publication_Permission_State)
    && !REVIEW_SOURCE.test(`${e.Source_Type || ""} ${e.Publisher_or_Owner || ""}`);
}

/**
 * The public snapshot of one category corpus. Pure: same corpus and options, same output, byte for byte.
 * @param corpus the parsed Master Research Corpus JSON
 * @param opts { category, source: { name, sha256 }, asOf } asOf is the date staleness is judged against
 */
export function deriveSnapshot(corpus, opts = {}) {
  const category = opts.category || "ccaas";
  const m = corpus && corpus.metadata;
  if (!m) throw new Error("research: corpus has no metadata");
  if (m.category !== CATEGORIES[category]) throw new Error(`research: corpus category ${m.category} is not ${CATEGORIES[category] || category}`);
  if (m.schema_version !== SCHEMA_VERSION) throw new Error(`research: schema ${m.schema_version} is not the locked ${SCHEMA_VERSION}`);
  if (m.system_of_record !== true) throw new Error("research: corpus is not marked as the system of record");
  const asOf = opts.asOf || m.generated_date;
  const counter = { dashes: 0 };
  const withheld = {};
  const note = (t, n = 1) => { withheld[t] = (withheld[t] || 0) + n; };

  // 2. vendors past the gate
  const vendors = (corpus.vendors || []).filter((v) => v.Completion_Status === "GATE_PASSED");
  note("vendors_gate_not_passed", (corpus.vendors || []).length - vendors.length);
  const vendorIds = new Set(vendors.map((v) => v.Vendor_ID));

  // 3. evidence
  const evidenceOk = new Map((corpus.evidence || []).filter(publishableEvidence).map((e) => [e.Evidence_ID, e]));

  // 4. claims
  const links = corpus.claim_evidence || [];
  const supportOf = new Map();
  for (const l of links) {
    if (!evidenceOk.has(l.Evidence_ID)) continue;
    supportOf.set(l.Claim_ID, (supportOf.get(l.Claim_ID) || 0) + 1);
  }
  const claims = (corpus.claims || []).filter((c) => {
    const ok = vendorIds.has(c.Vendor_ID) && c.Record_Status === "ACTIVE" && /Vendor Intelligence/.test(String(c.Permitted_Consumers))
      && !isNone(c.Publishable_Summary) && supportOf.has(c.Claim_ID);
    if (!ok) note("claims");
    return ok;
  });
  const claimIds = new Set(claims.map((c) => c.Claim_ID));
  const claimVendor = new Map((corpus.claims || []).map((c) => [c.Claim_ID, c.Vendor_ID]));
  const keptLinks = links.filter((l) => claimIds.has(l.Claim_ID) && evidenceOk.has(l.Evidence_ID));
  const citedEvidence = new Set(keptLinks.map((l) => l.Evidence_ID));
  note("evidence", (corpus.evidence || []).length - citedEvidence.size);

  // Staleness: a claim whose every cited source is past its staleness date is flagged, never removed.
  const staleEvidence = new Set([...citedEvidence].filter((id) => { const d = evidenceOk.get(id).Staleness_Date; return !isNone(d) && d < asOf; }));
  const claimSources = new Map();
  for (const l of keptLinks) { if (!claimSources.has(l.Claim_ID)) claimSources.set(l.Claim_ID, []); claimSources.get(l.Claim_ID).push(l.Evidence_ID); }

  const out = { category, vendors: [], products: [], competitive_classes: [], criteria: [], claims: [], evidence: [], claim_evidence: [] };
  out.vendors = vendors.map((v) => clean(v, "vendors", counter));
  /* A product publishes when its vendor passed the gate and its lineage does not rest only on dropped evidence. The
     lineage field itself never publishes (rule 7): it can name a restricted source. */
  const allEvidenceIds = (corpus.evidence || []).map((e) => e.Evidence_ID);
  const lineageOk = (p) => { const cited = ids(p.Lineage_Source).filter((id) => allEvidenceIds.includes(id)); return cited.length === 0 || cited.some((id) => evidenceOk.has(id)); };
  out.products = (corpus.products || []).filter((p) => vendorIds.has(p.Vendor_ID) && lineageOk(p)).map((p) => clean(p, "products", counter));
  note("products", (corpus.products || []).length - out.products.length);
  out.competitive_classes = (corpus.competitive_classes || []).map((c) => clean(c, "competitive_classes", counter));
  out.criteria = (corpus.criteria_registry || []).map((c) => clean(c, "criteria_registry", counter));
  out.claims = claims.map((c) => ({
    ...clean(c, "claims", counter),
    Permitted_Consumers: String(c.Permitted_Consumers).split(";").map((s) => s.trim()).filter(Boolean),
    Stale: (claimSources.get(c.Claim_ID) || []).every((id) => staleEvidence.has(id)),
  }));
  out.evidence = [...citedEvidence].sort().map((id) => ({ ...clean(evidenceOk.get(id), "evidence", counter), Tier: tierOf(evidenceOk.get(id).Evidence_Tier) }));
  out.claim_evidence = keptLinks.map((l) => clean(l, "claim_evidence", counter));

  // 5. derived tables
  for (const [table, field] of Object.entries(LINKED_TABLES)) {
    const rows = corpus[table] || [];
    out[table] = [];
    for (const r of rows) {
      const linked = ids(r[field]);
      /* A record is evidence for its own vendor only. A link to another vendor's claim is a lineage error in the
         corpus: it is dropped here, counted in the manifest, and reported to the research program (the corpus itself
         is never edited by the site). */
      const foreign = linked.filter((id) => claimVendor.has(id) && claimVendor.get(id) !== r.Vendor_ID);
      if (foreign.length) note("cross_vendor_links_dropped", foreign.length);
      const keep = linked.filter((id) => claimIds.has(id) && claimVendor.get(id) === r.Vendor_ID);
      if (!vendorIds.has(r.Vendor_ID) || keep.length === 0 || (table === "decision_intelligence" && r.Publishable !== "YES")) { note(table); continue; }
      const row = clean(r, table, counter);
      row[field] = field === "Linked_Claim_ID" ? keep[0] : keep.join(";");
      out[table].push(row);
    }
  }

  const manifest = {
    category, checkpoint: m.checkpoint, corpus_version: m.corpus_version, schema_version: m.schema_version,
    generated_date: m.generated_date, last_vendor_validated_date: m.last_vendor_validated_date,
    phase2_ratings_locked: m.phase2_ratings_locked === true, loader_version: LOADER_VERSION, as_of: asOf,
    source: opts.source || null,
    counts: Object.fromEntries(Object.entries(out).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length])),
    withheld, dashes_replaced: counter.dashes,
    withheld_tables: WITHHELD_TABLES.filter((t) => t in corpus || t === "market_position_capture"),
  };
  return { manifest, data: out };
}

/* Per-vendor files, so a profile page loads its own research and nothing else. `shared` holds what every page needs. */
export function splitByVendor({ manifest, data }) {
  const shared = { category: data.category, competitive_classes: data.competitive_classes, criteria: data.criteria, vendors: data.vendors };
  const tables = ["products", "claims", ...Object.keys(LINKED_TABLES)];
  const vendors = {};
  for (const v of data.vendors) {
    const id = v.Vendor_ID;
    const f = { vendor: v };
    for (const t of tables) f[t] = data[t].filter((r) => r.Vendor_ID === id);
    const claimSet = new Set(f.claims.map((c) => c.Claim_ID));
    f.claim_evidence = data.claim_evidence.filter((l) => claimSet.has(l.Claim_ID));
    const evSet = new Set(f.claim_evidence.map((l) => l.Evidence_ID));
    f.evidence = data.evidence.filter((e) => evSet.has(e.Evidence_ID));
    vendors[id] = f;
  }
  return { manifest, shared, vendors };
}

/* Stable JSON: one record per line, so a new checkpoint shows as a readable diff of the records that changed. */
export function stableJson(obj) {
  const one = (v) => JSON.stringify(v);
  const lines = ["{"];
  const keys = Object.keys(obj);
  keys.forEach((k, i) => {
    const v = obj[k]; const end = i < keys.length - 1 ? "," : "";
    if (Array.isArray(v)) {
      if (v.length === 0) { lines.push(` ${one(k)}: []${end}`); return; }
      lines.push(` ${one(k)}: [`);
      v.forEach((r, j) => lines.push(`  ${one(r)}${j < v.length - 1 ? "," : ""}`));
      lines.push(` ]${end}`);
    } else lines.push(` ${one(k)}: ${one(v)}${end}`);
  });
  lines.push("}");
  return lines.join("\n") + "\n";
}
