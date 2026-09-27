// src/lib/research/profileView.js
//
// The researched vendor profile's view model (redesign Phase 7 part 2; design approved 26 Sep 2026, redesign session 3).
// Pure: it reads one vendor file and the shared file from the snapshot (src/data/research) and returns what the page
// shows, in plain words. It computes no score, rank, tier or count of states, and it never turns an unknown into a
// weakness: "Not yet proven" is its own answer. Findings are grouped by the corpus's own rating layer, so the five
// decision layers (capability, evidence, fit, operating risk, implementation) stay separate on the page.

/* Plain words for the corpus's states. A state the page does not know is shown as written, never guessed. */
export const CAPABILITY = { EXCEEDS: "Exceeds the need", MEETS: "Meets the need", PARTIAL: "Partly", UNKNOWN: "Not yet proven", ABSENT: "Not offered" };
export const EVIDENCE = { VERIFIED: "Verified in public sources", "STRONGLY SUPPORTED": "Strongly supported", INFERRED: "Inferred from sources", UNVERIFIED: "Not yet verified" };
export const DECISION = { BEST_WHEN: "Best when", CAUTION_WHEN: "Take care when", ELIMINATE_WHEN: "Rule it out when", EVIDENCE_CONFIDENCE: "What the evidence can show" };
export const FIT = { IMPROVES: "Fit improves when", DECLINES: "Fit declines when" };
export const CLASS_STATUS = { LOCKED_CALIBRATED: "Calibrated", DRAFT: "Draft class, still being normalized" };

/* The state filter on findings. Each filter names what it shows; none shows how many. */
export const FILTERS = [
  { id: "all", label: "All findings", test: () => true },
  { id: "meets", label: "Meets or exceeds", test: (c) => c.Capability_State === "MEETS" || c.Capability_State === "EXCEEDS" },
  { id: "partly", label: "Partly", test: (c) => c.Capability_State === "PARTIAL" },
  { id: "unproven", label: "Not yet proven", test: (c) => c.Capability_State === "UNKNOWN" || c.Capability_State === null },
  { id: "absent", label: "Not offered", test: (c) => c.Capability_State === "ABSENT" },
];

/* The six questions that switch the view. */
export const VIEWS = [
  { id: "fit", label: "Is it a fit?" },
  { id: "findings", label: "What does it do?" },
  { id: "breaks", label: "Where does it break?" },
  { id: "effort", label: "What will it take?" },
  { id: "ask", label: "What should I ask for?" },
  { id: "sources", label: "Where does this come from?" },
];

/* The order the rating layers read in: what it is, what it does, who it fits, what can go wrong, what it takes. */
const LAYER_ORDER = ["Qualification", "Product Capability", "Buyer Fit", "Production / Operating Risk", "Strategic Risk", "Implementation / Change", "Evidence Confidence"];

/** "LOW_TO_HIGH" reads "Low to high"; a value that is already words is left alone. */
export function words(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v);
  if (!/^[A-Z0-9_\-]+$/.test(s)) return s;
  const t = s.replace(/[_]+/g, " ").replace(/-/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
export const capability = (s) => (s === null || s === undefined ? "Not rated" : CAPABILITY[s] || words(s));
export const evidence = (s) => (s === null || s === undefined ? null : EVIDENCE[s] || words(s));
const safeUrl = (u) => (typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : null);

export function buildProfile(file, shared) {
  const v = file.vendor;
  const klass = shared.competitive_classes.find((c) => c.Competitive_Class_ID === v.Competitive_Class_ID) || null;
  const criteria = new Map(shared.criteria.map((c) => [c.Criterion_ID, c]));
  const evidenceById = new Map(file.evidence.map((e) => [e.Evidence_ID, e]));
  const source = (e) => ({ id: e.Evidence_ID, title: e.Source_Title, url: safeUrl(e.Source_URL_or_Ref), publisher: e.Publisher_or_Owner, type: e.Source_Type,
    tier: e.Tier, published: e.Publication_Date, retrieved: e.Retrieval_or_Session_Date, limits: e.Known_Limitations, stale: e.Staleness_Date });
  const sourcesOf = new Map();
  for (const l of file.claim_evidence) {
    const e = evidenceById.get(l.Evidence_ID);
    if (!e) continue;
    if (!sourcesOf.has(l.Claim_ID)) sourcesOf.set(l.Claim_ID, []);
    sourcesOf.get(l.Claim_ID).push({ ...source(e), role: words(l.Support_Role) });
  }
  const claims = file.claims.map((c) => ({ ...c, sources: sourcesOf.get(c.Claim_ID) || [] }));
  const claimById = new Map(claims.map((c) => [c.Claim_ID, c]));

  const layers = [];
  for (const layer of [...LAYER_ORDER, ...new Set(shared.criteria.map((c) => c.Rating_Layer))]) {
    if (layers.some((l) => l.layer === layer)) continue;
    const crit = shared.criteria.filter((c) => c.Rating_Layer === layer)
      .map((c) => ({ id: c.Criterion_ID, name: c.Criterion_Name, domain: c.Domain, test: c.Buyer_Relevance_Test, claims: claims.filter((x) => x.Criterion_ID === c.Criterion_ID) }))
      .filter((c) => c.claims.length > 0);
    if (crit.length) layers.push({ layer, criteria: crit });
  }
  const unplaced = claims.filter((c) => !criteria.has(c.Criterion_ID));
  if (unplaced.length) layers.push({ layer: "Other findings", criteria: [{ id: "other", name: "Other findings", claims: unplaced }] });

  const byType = (rows, key, map) => Object.entries(map).map(([k, label]) => ({ id: k, label, rows: rows.filter((r) => r[key] === k) })).filter((g) => g.rows.length);
  const publishers = new Map();
  for (const e of file.evidence) publishers.set(e.Publisher_or_Owner || "Not stated", (publishers.get(e.Publisher_or_Owner || "Not stated") || 0) + 1);

  return {
    vendor: v,
    klass: klass && { id: klass.Competitive_Class_ID, name: klass.Class_Name, job: klass.Primary_Job, buyer: klass.Typical_Buyer_Profile, boundary: klass.Comparison_Boundary, status: CLASS_STATUS[klass.Status] || words(klass.Status), draft: klass.Status !== "LOCKED_CALIBRATED" },
    products: file.products.map((p) => ({ id: p.Product_ID, name: p.Product_or_SKU, family: p.Product_Family, type: p.Product_Type, role: p.Architecture_Role, state: p.GA_Status, segment: p.Primary_Target_Segment, scope: p.Geographic_Scope })),
    decisions: byType(file.decision_intelligence, "Decision_Type", DECISION),
    fit: byType(file.fit_sensitivity, "Direction", FIT),
    layers,
    breaks: file.breaks,
    effort: { implementation: file.implementation[0] || null, sow: file.sow_exposure, day2: file.day2_change, tco: file.tco, integrations: file.integrations },
    ask: { proof: file.proof_requirements, contract: file.contract_requirements, questions: file.unresolved_questions, ai: file.ai_governance },
    sources: file.evidence.map(source),
    publishers: [...publishers].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    claimById,
  };
}
