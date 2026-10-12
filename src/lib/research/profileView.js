// src/lib/research/profileView.js
//
// The researched vendor profile's view model (redesign Phase 7 part 2; design approved 26 Sep 2026, redesign session 3).
// Pure: it reads one vendor file and the shared file from the snapshot (src/data/research) and returns what the page
// shows, in plain words. It computes no score, rank, tier or count of states, and it never turns an unknown into a
// weakness: "Not yet proven" is its own answer. Findings are grouped by the corpus's own rating layer, so the five
// decision layers (capability, evidence, fit, operating risk, implementation) stay separate on the page.

import { readableIds } from "./classWords.js";

/* Plain words for the corpus's states. A state the page does not know is shown as written, never guessed. */
export const CAPABILITY = { EXCEEDS: "Exceeds the need", MEETS: "Meets the need", PARTIAL: "Partly", UNKNOWN: "Not yet proven", ABSENT: "Not offered" };
/* Evidence states. Schema 1.1 (Research Method v2) states read in the research's own public words (its public_glossary,
   which the shared file carries and buildProfile prefers); the 1.0 states stay readable for older snapshots. */
export const EVIDENCE = {
  CORROBORATED: "Independently confirmed", DOCUMENTED: "Vendor-documented", CLAIMED: "Vendor claim", INFERRED: "Our analysis", UNVERIFIED: "Not yet confirmed",
  VERIFIED: "Verified in public sources", "STRONGLY SUPPORTED": "Strongly supported",
};
export const DECISION = { BEST_WHEN: "Strong fit when", CAUTION_WHEN: "Be careful if", ELIMINATE_WHEN: "Rule it out if", CONTEXT: "Context", EVIDENCE_CONFIDENCE: "What the evidence can show" };
export const FIT = { IMPROVES: "Fit improves when", DECLINES: "Fit declines when" };
export const CLASS_STATUS = { LOCKED_CALIBRATED: "Calibrated", DRAFT: "Draft class, still being normalized", ACTIVE: "Active peer group", PROVISIONAL: "Provisional peer group" };
const SETTLED_CLASS = new Set(["LOCKED_CALIBRATED", "ACTIVE"]);
/* The five cost layers, in the research's public words, in the order a buyer meets them. */
export const COST_LAYERS = { PLATFORM: "Subscription and usage cost", TRANSFORMATION: "Setup and switching cost", RUN_STATE: "Year-two running cost",
  FAILURE_ERROR: "Cost when things go wrong", CHANGE_EXIT: "Cost to change or leave" };
const GLOSSARY_KEYS = { CORROBORATED: "EVIDENCE", DOCUMENTED: "EVIDENCE", INFERRED: "EVIDENCE", UNVERIFIED: "EVIDENCE",
  "Best When": ["DECISION", "BEST_WHEN"], "Caution When": ["DECISION", "CAUTION_WHEN"], "Eliminate When": ["DECISION", "ELIMINATE_WHEN"],
  "Platform TCO": ["COST", "PLATFORM"], "Transformation TCO": ["COST", "TRANSFORMATION"], "Run-state TCO": ["COST", "RUN_STATE"],
  "Failure / error economics": ["COST", "FAILURE_ERROR"], "Change / exit economics": ["COST", "CHANGE_EXIT"] };
/** The research's own public terms override the defaults above, so the page says what the research publishes. */
export function glossary(rows = []) {
  const out = { EVIDENCE: { ...EVIDENCE }, DECISION: { ...DECISION }, COST: { ...COST_LAYERS } };
  for (const r of rows) {
    const k = GLOSSARY_KEYS[r.Internal_Term];
    if (!k || !r.Public_Term) continue;
    if (k === "EVIDENCE") out.EVIDENCE[r.Internal_Term] = r.Public_Term; else out[k[0]][k[1]] = r.Public_Term;
  }
  return out;
}

/* The method a vendor's research was done under, said once at the foot of the page (TB, 1 Oct 2026: careful, and not
   prominent). Method 1 vendors passed the 1.0 gate and await the Method 2 re-audit. */
export const METHOD_PAGE = "/research/vendor-method";
export function methodNote(vendor) {
  const v = vendor && vendor.Method_Version;
  if (v === "2") return { version: "2", text: "Researched under Research Method 2." };
  if (v === "1") return { version: "1", text: "Researched under Research Method 1. A re-audit under Research Method 2 is in progress." };
  return null;
}

/* The state filter on findings. Each filter names what it shows; none shows how many. */
export const FILTERS = [
  { id: "all", label: "All findings", test: () => true },
  { id: "meets", label: "Meets or exceeds", test: (c) => c.Capability_State === "MEETS" || c.Capability_State === "EXCEEDS" },
  { id: "partly", label: "Partly", test: (c) => c.Capability_State === "PARTIAL" },
  { id: "unproven", label: "Not yet proven", test: (c) => c.Capability_State === "UNKNOWN" || c.Capability_State === null },
  { id: "absent", label: "Not offered", test: (c) => c.Capability_State === "ABSENT" },
];

/* The questions that switch the view: the Ownership Report's four (where it breaks, who runs it, what it really costs,
   how to prove it) between fit, findings and sources. */
export const VIEWS = [
  { id: "fit", label: "Is it a fit?" },
  { id: "findings", label: "What does it do?" },
  { id: "breaks", label: "Where does it break?" },
  { id: "effort", label: "Who runs it?" },
  { id: "cost", label: "What does it really cost?" },
  { id: "ask", label: "How do I prove it?" },
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
  const out = t.charAt(0).toUpperCase() + t.slice(1);
  /* Keep the research's acronyms as acronyms ("GA", not "Ga"; "EAP", not "Eap"). */
  return out.replace(/\b(ga|eap|ai|wfm|wem|qm|iva|oem|smb|cx|ucaas|ccaas|q[1-4]|[12]h)\b/gi, (m) => ACRONYM[m.toLowerCase()] || m.toUpperCase())
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g, (m) => m.charAt(0).toUpperCase() + m.slice(1));
}
const ACRONYM = { ucaas: "UCaaS", ccaas: "CCaaS" };
export const capability = (s) => (s === null || s === undefined ? "Not rated" : CAPABILITY[s] || words(s));
export const evidence = (s, terms = EVIDENCE) => (s === null || s === undefined ? null : terms[s] || words(s));
const safeUrl = (u) => (typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : null);

/* The research's note on a vendor the v1.1 re-cut moved ("v1.1 class re-cut: moved from X to Y by buyer starting point.
   Prior rationale: ...") reads in plain words. Presentation only. */
export function movedNote(t) {
  if (typeof t !== "string") return t;
  const m = /^v1\.1 class re-cut: moved from (CLS-CC-\d{3}) to (CLS-CC-\d{3}) by buyer starting point\.\s*Prior rationale:\s*/.exec(t);
  return m ? `Moved from ${m[1]} to ${m[2]} when the peer groups were re-cut on 1 October 2026, by the buyer's starting point. ${t.slice(m[0].length)}` : t;
}

export function buildProfile(file, shared) {
  const terms = glossary(shared.public_glossary);
  /* A class named by its id in research text reads as the class's name (presentation only; the file is unchanged). */
  const classes = shared.competitive_classes.map((c) => ({ id: c.Competitive_Class_ID, name: c.Class_Name }));
  const ids = (t) => readableIds(t, classes);
  const v = { ...file.vendor, Class_Rationale: ids(movedNote(file.vendor.Class_Rationale)) };
  /* Every research text field a view prints passes through the same class-name rewrite. */
  const readRows = (rows, fields) => rows.map((r) => { const o = { ...r }; for (const k of fields) if (typeof o[k] === "string") o[k] = ids(o[k]); return o; });
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
  const claims = file.claims.map((c) => ({ ...c, evidenceWords: evidence(c.Evidence_State, terms.EVIDENCE), Publishable_Summary: ids(c.Publishable_Summary), Buyer_Implication: ids(c.Buyer_Implication), sources: sourcesOf.get(c.Claim_ID) || [] }));
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
    klass: klass && { id: klass.Competitive_Class_ID, name: klass.Class_Name, job: klass.Primary_Job, buyer: klass.Typical_Buyer_Profile, boundary: klass.Comparison_Boundary, status: CLASS_STATUS[klass.Status] || words(klass.Status), draft: !SETTLED_CLASS.has(klass.Status) },
    alsoIn: (() => { const s = v.Secondary_Class_ID && shared.competitive_classes.find((c) => c.Competitive_Class_ID === v.Secondary_Class_ID); return s ? { id: s.Competitive_Class_ID, name: s.Class_Name, status: CLASS_STATUS[s.Status] || words(s.Status) } : null; })(),
    method: methodNote(v),
    terms,
    products: file.products.map((p) => ({ id: p.Product_ID, name: p.Product_or_SKU, family: p.Product_Family, type: p.Product_Type, role: p.Architecture_Role, state: p.GA_Status, segment: p.Primary_Target_Segment, scope: p.Geographic_Scope })),
    decisions: byType(readRows(file.decision_intelligence, ["Statement", "Causal_Rationale", "Buyer_or_Operating_Context"]), "Decision_Type", terms.DECISION),
    strengths: file.strengths || [],
    fit: byType(readRows(file.fit_sensitivity, ["Buyer_Condition", "Why_Fit_Changes"]), "Direction", FIT),
    layers,
    breaks: readRows(file.breaks, ["Break_Summary", "Trigger_Condition", "Affected_Buyer_or_Use_Case", "Mitigation_Method", "Build_or_Config_Implication", "Cost_Consequence", "Buyer_Question", "Exit_Point"]),
    effort: { implementation: file.implementation[0] || null, sow: file.sow_exposure, day2: file.day2_change, integrations: file.integrations, admin: file.admin_change_tests || [] },
    /* Cost by layer. A published price point shows only when the research marks it verified; the layer list never adds
       up to a total, because a license price is not the cost of owning the platform. */
    cost: Object.entries(terms.COST).map(([id, label]) => ({ id, label, rows: file.tco.filter((r) => r.Cost_Layer === id)
      .map((r) => ({ ...r, prices: r.Price_Points_Verified === "YES" && Array.isArray(r.Public_Price_Points) ? r.Public_Price_Points : [] })) }))
      .concat([{ id: "OTHER", label: "Other cost drivers", rows: file.tco.filter((r) => !(r.Cost_Layer in terms.COST)).map((r) => ({ ...r, prices: [] })) }])
      .filter((g) => g.rows.length),
    ask: { proof: readRows(file.proof_requirements, ["Buyer_Controlled_Scenario", "Risk_or_Hypothesis", "Success_Criterion", "Failure_Criterion", "Reference_Call_Question"]), contract: file.contract_requirements, questions: file.unresolved_questions, ai: file.ai_governance },
    sources: file.evidence.map(source),
    publishers: [...publishers].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    claimById,
  };
}
