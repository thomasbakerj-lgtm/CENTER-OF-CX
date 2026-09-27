// research.test.mjs
//
// Research Stage 1 (redesign Phase 7, decision D1): the loader that turns a Master Research Corpus into the public
// snapshot, and the snapshot committed in src/data/research. Part 1 attacks the loader with a synthetic corpus built on
// the real schema's field names, so every rule is proven on data anyone can read. Part 2 checks the committed snapshot.
// Part 3, only when RESEARCH_CORPUS points at the real corpus, re-derives it and requires the committed files to match.
// Numbers in [brackets] are CLAUDE.md section 13's required acceptance tests.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { deriveSnapshot, splitByVendor, stableJson, WITHHELD_TABLES, WITHHELD_FIELDS, LINKED_TABLES } from "./src/lib/research/snapshot.js";
import { CCAAS_RESEARCH } from "./src/lib/researchStatus.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = /[\u2014\u2013]/;

/* ------------------------------------------------------------------ synthetic corpus */
const V = (id, gate = "GATE_PASSED") => ({ Vendor_ID: id, Supplier_Name: "Vendor " + id, Research_Status: "COMPLETE_PRODUCTION", Competitive_Class_ID: "CLS-CC-001",
  Completion_Status: gate, Last_Validated_Date: "2026-09-20", Schema_Version: "1.0", Notes: "SECRET-NOTE-MARKER" });
const E = (id, vendor, over = {}) => ({ Evidence_ID: id, Source_Title: "Doc " + id, Source_URL_or_Ref: "https://example.com/" + id, Source_Type: "Official product page",
  Evidence_Tier: "Tier 1 \u2014 Primary", Publisher_or_Owner: "Vendor", Retrieval_or_Session_Date: "2026-09-20", Confidentiality_State: "PUBLIC",
  Publication_Permission_State: "PUBLIC_CITABLE", Staleness_Date: "None", Source_Status: "CURRENT", _vendor: vendor, ...over });
const C = (id, vendor, over = {}) => ({ Claim_ID: id, Vendor_ID: vendor, Product_ID: "PRD-1", Claim_Text: "RAW-CLAIM-TEXT " + id, Criterion_ID: "CRI-CC-002",
  Applicability_State: "APPLICABLE", Capability_State: "MEETS", Evidence_State: "VERIFIED", Evidence_Confidence: "HIGH", Validation_Date: "2026-09-20",
  Publishable_Summary: "Summary " + id + " \u2014 scoped", Permitted_Consumers: "Vendor Intelligence; Vendor Match", Record_Status: "ACTIVE",
  Research_Note: "SECRET-NOTE-MARKER", Evidence_Confidence_Notes: "SECRET-NOTE-MARKER", ...over });
const L = (claim, ev, role = "PRIMARY_SUPPORT") => ({ Claim_Evidence_ID: "CEV-" + claim + ev, Claim_ID: claim, Evidence_ID: ev, Support_Role: role,
  Relevant_Excerpt_or_Paraphrase: "SECRET-EXCERPT-MARKER", Researcher: "SECRET-NOTE-MARKER" });

function corpus(over = {}) {
  return {
    metadata: { category: "CCaaS", schema_version: "1.0", system_of_record: true, checkpoint: "SYNTH", corpus_version: "1.0", generated_date: "2026-09-23", phase2_ratings_locked: true, ...over },
    vendors: [V("VEN-A"), V("VEN-B"), V("VEN-X", "GATE_OPEN")],
    products: [{ Product_ID: "PRD-1", Vendor_ID: "VEN-A", GA_Status: "PREVIEW", Lineage_Source: "Current product page" },
      { Product_ID: "PRD-2", Vendor_ID: "VEN-A", GA_Status: "EAP", Lineage_Source: "EVD-INT" },
      { Product_ID: "PRD-3", Vendor_ID: "VEN-B", GA_Status: "BETA", Lineage_Source: "EVD-A1;EVD-INT" }],
    competitive_classes: [{ Competitive_Class_ID: "CLS-CC-001", Class_Name: "Full-suite", Status: "LOCKED_CALIBRATED" }],
    criteria_registry: [{ Criterion_ID: "CRI-CC-002", Criterion_Name: "Scope", Rating_Layer: "Product Capability", Score_Eligible: "YES" }],
    claims: [
      C("CLM-OK", "VEN-A"),                                                    // public support: published
      C("CLM-MIX", "VEN-A", { Capability_State: "UNKNOWN", Evidence_State: "UNVERIFIED" }), // internal primary plus public corroboration
      C("CLM-INT", "VEN-A"),                                                   // internal evidence only: withheld
      C("CLM-CONF", "VEN-A"),                                                  // confidential only: withheld
      C("CLM-UNK", "VEN-A"),                                                   // unknown permission only: withheld
      C("CLM-REV", "VEN-A"),                                                   // review site only: withheld
      C("CLM-CTX", "VEN-A"),                                                   // context link only: withheld
      C("CLM-MI", "VEN-A", { Permitted_Consumers: "Market Position Index" }), // not a Vendor Intelligence consumer
      C("CLM-OLD", "VEN-A", { Record_Status: "RETIRED" }),
      C("CLM-NOSUM", "VEN-A", { Publishable_Summary: "None" }),
      C("CLM-X", "VEN-X"),                                                     // vendor past no gate
      C("CLM-STALE", "VEN-B", { Capability_State: "None" }),
    ],
    evidence: [E("EVD-A1", "VEN-A"), E("EVD-INT", "VEN-A", { Publication_Permission_State: "INTERNAL_RESEARCH_ONLY", Confidentiality_State: "PUBLICLY_ACCESSIBLE_VENDOR_CONFIDENTIAL_NOTICE", Source_Title: "INTERNAL-TITLE-MARKER" }),
      E("EVD-CONF", "VEN-A", { Confidentiality_State: "CONFIDENTIAL", Source_Title: "CONF-TITLE-MARKER" }), E("EVD-UNK", "VEN-A", { Publication_Permission_State: undefined, Source_Title: "UNK-TITLE-MARKER" }),
      E("EVD-REV", "VEN-A", { Source_Type: "Verified practitioner review aggregation", Publisher_or_Owner: "G2 / verified reviewers", Source_Title: "REVIEW-TITLE-MARKER" }),
      E("EVD-X", "VEN-X"), E("EVD-OLD", "VEN-B", { Staleness_Date: "2026-01-01" }), E("EVD-ORPHAN", "VEN-A", { Source_Title: "ORPHAN-TITLE-MARKER" })],
    claim_evidence: [L("CLM-OK", "EVD-A1"), L("CLM-MIX", "EVD-INT"), L("CLM-MIX", "EVD-A1", "CORROBORATING_SUPPORT"), L("CLM-INT", "EVD-INT"),
      L("CLM-CONF", "EVD-CONF"), L("CLM-UNK", "EVD-UNK"), L("CLM-REV", "EVD-REV"), L("CLM-CTX", "EVD-A1", "CONTEXT"), L("CLM-MI", "EVD-A1"),
      L("CLM-OLD", "EVD-A1"), L("CLM-NOSUM", "EVD-A1"), L("CLM-X", "EVD-X"), L("CLM-STALE", "EVD-OLD")],
    criteria_assessments: [{ Assessment_ID: "ASM-1", Vendor_ID: "VEN-A", Claim_IDs: "CLM-OK;CLM-INT", Capability_State: "UNKNOWN", Double_Counting_Check: "PASS" },
      { Assessment_ID: "ASM-2", Vendor_ID: "VEN-A", Claim_IDs: "CLM-INT", Capability_State: "MEETS" },
      { Assessment_ID: "ASM-3", Vendor_ID: "VEN-A", Claim_IDs: "None" }],
    breaks: [{ Break_ID: "BRK-1", Vendor_ID: "VEN-A", Claim_IDs: "CLM-OK CLM-CONF", Severity: "None" }],
    decision_intelligence: [{ Decision_ID: "DEC-1", Vendor_ID: "VEN-A", Linked_Claim_IDs: "CLM-OK", Publishable: "NO" }, { Decision_ID: "DEC-2", Vendor_ID: "VEN-A", Linked_Claim_IDs: "CLM-OK", Publishable: "YES" }],
    proof_requirements: [{ Proof_ID: "PRF-1", Vendor_ID: "VEN-A", Linked_Claim_ID: "CLM-INT" }, { Proof_ID: "PRF-2", Vendor_ID: "VEN-A", Linked_Claim_ID: "CLM-OK" }],
    unresolved_questions: [{ Question_ID: "Q-1", Vendor_ID: "VEN-A", Linked_Claim_ID: "CLM-OK", Owner: "SECRET-OWNER-MARKER", Status: "OPEN" }],
    phase1_baseline: [{ Vendor_ID: "VEN-A", Phase1_Score: 94, Text: "PHASE1-MARKER" }],
    score_deltas: [{ Vendor_ID: "VEN-A", Old_Score: 90, New_Score: 70, Text: "DELTA-MARKER" }],
    claim_migration: [{ Text: "MIGRATION-MARKER" }], completion_gates: [{ Text: "GATE-MARKER" }], refresh_triggers: [{ Text: "REFRESH-MARKER" }],
    surface_permissions: [{ Text: "PERMISSION-MARKER" }],
  };
}

section("1. The loader refuses what it cannot vouch for [12]");
{
  const bad = (over) => { try { deriveSnapshot(corpus(over)); return false; } catch { return true; } };
  ok("a different schema version is refused", bad({ schema_version: "1.1" }));
  ok("a different category is refused", bad({ category: "IVA" }));
  ok("a corpus not marked as the system of record is refused", bad({ system_of_record: false }));
  ok("a corpus with no metadata is refused", (() => { try { deriveSnapshot({}); return false; } catch { return true; } })());
}

const snap = deriveSnapshot(corpus(), { source: { name: "synthetic", sha256: "0".repeat(64) } });
const text = JSON.stringify(snap);
const claimIds = snap.data.claims.map((c) => c.Claim_ID);

section("2. Nothing restricted publishes, not even its existence [9]");
{
  for (const m of ["INTERNAL-TITLE-MARKER", "CONF-TITLE-MARKER", "UNK-TITLE-MARKER", "REVIEW-TITLE-MARKER", "EVD-INT", "EVD-CONF", "EVD-UNK", "EVD-REV", "INTERNAL_RESEARCH_ONLY", "CONFIDENTIAL"])
    ok(`${m} appears nowhere in the output`, !text.includes(m));
  ok("a claim resting only on restricted evidence is withheld, id and all", ["CLM-INT", "CLM-CONF", "CLM-UNK", "CLM-REV"].every((id) => !text.includes(id)));
  ok("a claim with public corroboration publishes, linked only to the public source", claimIds.includes("CLM-MIX") && snap.data.claim_evidence.filter((l) => l.Claim_ID === "CLM-MIX").map((l) => l.Evidence_ID).join() === "EVD-A1");
  ok("a claim cited only by a context or limiting public source still publishes, with that role", claimIds.includes("CLM-CTX") && snap.data.claim_evidence.find((l) => l.Claim_ID === "CLM-CTX").Support_Role === "CONTEXT");
  ok("a source no published claim cites does not publish", !text.includes("ORPHAN-TITLE-MARKER"));
  ok("a product whose lineage rests only on restricted evidence is withheld; mixed lineage publishes", !text.includes("PRD-2") && text.includes("PRD-3"));
  ok("a claim Vendor Intelligence may not read, a retired claim and one with no publishable summary are withheld", !["CLM-MI", "CLM-OLD", "CLM-NOSUM"].some((id) => claimIds.includes(id)));
}

section("3. Only vendors past the completion gate publish [13]");
ok("a vendor whose gate is open publishes nothing", !text.includes("VEN-X") && !text.includes("CLM-X") && !text.includes("EVD-X"));
ok("the gated count is recorded", snap.manifest.withheld.vendors_gate_not_passed === 1);

section("4. Derived records keep only published claims");
{
  const asm = snap.data.criteria_assessments;
  ok("a record keeps its published links and drops the rest", asm.length === 1 && asm[0].Assessment_ID === "ASM-1" && asm[0].Claim_IDs === "CLM-OK");
  ok("a record whose only claim was withheld is withheld", !text.includes("ASM-2") && !text.includes("PRF-1"));
  ok("a record with no linked claim is withheld (nothing is inferred)", !text.includes("ASM-3"));
  ok("space separated links are read too", snap.data.breaks.length === 1 && snap.data.breaks[0].Claim_IDs === "CLM-OK");
  ok("a decision marked not publishable is withheld", !text.includes("DEC-1") && text.includes("DEC-2"));
}

section("5. Governance and hypothesis tables never publish [3] [4]");
for (const m of ["PHASE1-MARKER", "DELTA-MARKER", "MIGRATION-MARKER", "GATE-MARKER", "REFRESH-MARKER", "PERMISSION-MARKER", "Phase1_Score", "Old_Score", "New_Score"])
  ok(`${m} appears nowhere in the output`, !text.includes(m));
ok("no withheld table is a key of the output", WITHHELD_TABLES.every((t) => !(t in snap.data)));

section("6. Internal fields never publish");
for (const m of ["SECRET-NOTE-MARKER", "SECRET-EXCERPT-MARKER", "SECRET-OWNER-MARKER", "RAW-CLAIM-TEXT", "Double_Counting_Check"]) ok(`${m} appears nowhere`, !text.includes(m));

section("7. States are preserved, never coerced [6] [10] [5]");
{
  const mix = snap.data.claims.find((c) => c.Claim_ID === "CLM-MIX");
  ok("UNKNOWN capability stays UNKNOWN and UNVERIFIED stays UNVERIFIED", mix.Capability_State === "UNKNOWN" && mix.Evidence_State === "UNVERIFIED");
  ok("a None state reads as null, never as zero or weak", snap.data.claims.find((c) => c.Claim_ID === "CLM-STALE").Capability_State === null);
  ok("an unknown assessment stays unknown", snap.data.criteria_assessments[0].Capability_State === "UNKNOWN");
  ok("PREVIEW and BETA product states are preserved as written", snap.data.products.find((p) => p.Product_ID === "PRD-1").GA_Status === "PREVIEW" && snap.data.products.find((p) => p.Product_ID === "PRD-3").GA_Status === "BETA");
  ok("capability, evidence state and evidence confidence stay separate fields", ["Capability_State", "Evidence_State", "Evidence_Confidence"].every((k) => k in mix));
}

section("8. Stale material claims are flagged, not removed [8]");
ok("a claim whose every source is past its staleness date is kept and flagged", snap.data.claims.find((c) => c.Claim_ID === "CLM-STALE").Stale === true && snap.data.claims.find((c) => c.Claim_ID === "CLM-OK").Stale === false);

section("9. Ids are durable and the output is deterministic [11]");
{
  const src = corpus();
  const inIds = new Set([...src.claims.map((c) => c.Claim_ID), ...src.evidence.map((e) => e.Evidence_ID), ...src.vendors.map((v) => v.Vendor_ID)]);
  ok("every published id is an id from the corpus, unchanged", [...claimIds, ...snap.data.evidence.map((e) => e.Evidence_ID), ...snap.data.vendors.map((v) => v.Vendor_ID)].every((id) => inIds.has(id)));
  const again = deriveSnapshot(corpus(), { source: { name: "synthetic", sha256: "0".repeat(64) } });
  ok("the same corpus gives byte-identical files", JSON.stringify(splitByVendor(again)) === JSON.stringify(splitByVendor(snap)) && stableJson(again.data) === stableJson(snap.data));
  ok("the tier is read into a number and the source text kept", snap.data.evidence.find((e) => e.Evidence_ID === "EVD-A1").Tier === 1);
}

section("10. No rating publishes while ratings are locked [14]; every claim carries its validation date [16]");
{
  const keys = new Set(); const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { keys.add(k); walk(v); } };
  walk(snap.data);
  ok("no score or rating field exists (Rating_Layer and Score_Eligible describe criteria)", [...keys].filter((k) => /score|rating/i.test(k)).every((k) => k === "Rating_Layer" || k === "Score_Eligible"));
  ok("the manifest carries the lock", snap.manifest.phase2_ratings_locked === true);
  ok("every claim and vendor carries its validation date", snap.data.claims.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.Validation_Date)) && snap.data.vendors.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(v.Last_Validated_Date)));
  ok("no em or en dash survives (presentation only; ids untouched)", !DASH.test(text) && snap.manifest.dashes_replaced > 0);
}

/* ------------------------------------------------------------------ committed snapshot */
section("11. The committed CCaaS snapshot");
const DIR = "./src/data/research/ccaas";
{
  const manifest = JSON.parse(readFileSync(DIR + "/manifest.json", "utf8"));
  const shared = JSON.parse(readFileSync(DIR + "/shared.json", "utf8"));
  const files = readdirSync(DIR + "/vendors");
  ok("manifest names the checkpoint, locked schema, source hash and loader", manifest.checkpoint === "PRODUCTION_COHORT3_NORMALIZED" && manifest.schema_version === "1.0" && /^[0-9a-f]{64}$/.test(manifest.source.sha256) && manifest.phase2_ratings_locked === true && !!manifest.loader_version);
  const registry = Object.values(CCAAS_RESEARCH.complete).map((v) => v.vendorId).sort();
  ok(`the vendors equal the research status registry (${files.length})`, JSON.stringify(files.map((f) => f.replace(".json", "")).sort()) === JSON.stringify(registry) && JSON.stringify(shared.vendors.map((v) => v.Vendor_ID).sort()) === JSON.stringify(registry));
  let all = JSON.stringify(shared);
  let dangling = [], big = [];
  for (const f of files) {
    const raw = readFileSync(DIR + "/vendors/" + f, "utf8"); all += raw;
    if (statSync(DIR + "/vendors/" + f).size > 900000) big.push(f);
    const v = JSON.parse(raw);
    const ev = new Set(v.evidence.map((e) => e.Evidence_ID)), cl = new Set(v.claims.map((c) => c.Claim_ID));
    for (const l of v.claim_evidence) if (!ev.has(l.Evidence_ID) || !cl.has(l.Claim_ID)) dangling.push(f + ":" + l.Claim_Evidence_ID);
    for (const [t, field] of Object.entries(LINKED_TABLES)) for (const r of v[t] || []) for (const id of String(r[field]).split(";")) if (!cl.has(id)) dangling.push(f + ":" + t + ":" + id);
    if (v.claims.some((c) => c.Vendor_ID !== v.vendor.Vendor_ID)) dangling.push(f + ": foreign claim");
  }
  ok(`every link resolves inside its own vendor file [${dangling.slice(0, 3).join(", ")}]`, dangling.length === 0);
  ok(`each vendor file stays under 900 KB [${big.join(", ")}]`, big.length === 0);
  for (const m of ["INTERNAL_RESEARCH_ONLY", "CONFIDENTIAL", "Peer Insights", "G2 /", "Research_Note", "Researcher", "Claim_Text", "Lineage_Source", "Relevant_Excerpt"]) ok(`the snapshot never carries ${m}`, !all.includes(m));
  ok("no withheld table and no dash in the snapshot", WITHHELD_TABLES.every((t) => !all.includes(`"${t}"`)) && !DASH.test(all));
  const { categoryIndexJson } = await import("./src/lib/research/categoryView.js");
  const vf = Object.fromEntries(files.map((f) => [f.replace(".json", ""), JSON.parse(readFileSync(DIR + "/vendors/" + f, "utf8"))]));
  ok("the category index equals a fresh build from the committed snapshot", readFileSync(DIR + "/category.json", "utf8") === categoryIndexJson(shared, vf));
  all += readFileSync(DIR + "/category.json", "utf8");
  ok("no score or rating field in the snapshot [14]", !/"(?!Rating_Layer|Score_Eligible)[A-Za-z_]*(Score|Rating)[A-Za-z_]*":/.test(all));
}

section("11b. Vendor tags (size served, UCaaS + CCaaS) rest on published records and say what they say");
{
  const { CCAAS_TAGS, SIZES, SIZE_TEST, SELECTED_TEST, UC_TEST, tagsFor } = await import("./src/lib/research/ccaasTags.js");
  const ids = Object.values(CCAAS_RESEARCH.complete).map((v) => v.vendorId).sort();
  ok("every researched vendor has tags, and only they do", JSON.stringify(Object.keys(CCAAS_TAGS).sort()) === JSON.stringify(ids));
  for (const [id, t] of Object.entries(CCAAS_TAGS)) {
    const f = JSON.parse(readFileSync(`${DIR}/vendors/${id}.json`, "utf8"));
    const rec = (x) => { const p = f.products.find((y) => y.Product_ID === x); if (p) return `${p.Primary_Target_Segment} ; ${p.Product_Type} ; ${p.Product_or_SKU}`; const c = f.claims.find((y) => y.Claim_ID === x); return c ? c.Publishable_Summary : null; };
    const cited = [...t.from, ...(t.uc || [])];
    ok(`${id}: every cited record is published in its own file`, cited.every((x) => rec(x) !== null));
    const txt = t.from.map(rec).join(" ; ");
    ok(`${id}: each size is tagged exactly when its records state it`, SIZES.every((z) => !!t.segments[z] === SIZE_TEST[z].test(txt)) && Object.keys(t.segments).every((z) => SIZES.includes(z)));
    ok(`${id}: enterprise is marked selected exactly when the research says so`, (t.segments.Enterprise === "selected") === SELECTED_TEST.test(txt));
    ok(`${id}: a UCaaS + CCaaS tag rests on records that show it`, !t.uc || (t.uc.length > 0 && t.uc.every((x) => UC_TEST.test(rec(x) || ""))));
    ok(`${id}: a CCaaS-only tag has no UCaaS product in the research`, !!t.uc || !f.products.some((p) => /UCaaS|UC\/contact-center/i.test(p.Product_Type)));
    ok(`${id}: tags carry no grade`, !/score|rank|tier|grade|best/i.test(JSON.stringify(tagsFor(id))));
  }
}

section("12. Separation: nothing reads the snapshot outside the research layer yet [1] [3] [18]");
{
  const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter((f) => /\.(jsx?|mjs)$/.test(f));
  const PAGES = ["VendorProfile.jsx", "ResearchedProfile.jsx", "profile.test.mjs", "CCaaSCategory.jsx", "category.test.mjs"];
  const readers = tracked.filter((f) => !f.startsWith("src/lib/research/") && f !== "scripts/research-sync.mjs" && f !== "research.test.mjs" && !PAGES.includes(f) && /data\/research|lib\/research\//.test(readFileSync(f, "utf8")));
  ok(`only the research layer and the Vendor Intelligence pages (profile, category) read research data [${readers.join(", ")}]`, readers.length === 0);
  ok("Vendor Match reads no research snapshot, Market Position value or Phase 1 baseline file", !/data\/research|market.?position|phase1_baseline/i.test(readFileSync("./VendorMatchEngine.jsx", "utf8")));
  console.log("  note: [2] [7] [15] [17] apply when Vendor Match V3 (Stage 4) and the Market Position Index (Stage 5) exist.");
}

section("13. Drift: the committed snapshot equals a fresh derivation of the real corpus");
if (process.env.RESEARCH_CORPUS && existsSync(process.env.RESEARCH_CORPUS)) {
  const { createHash } = await import("node:crypto");
  const raw = readFileSync(process.env.RESEARCH_CORPUS);
  const manifest = JSON.parse(readFileSync(DIR + "/manifest.json", "utf8"));
  const sha = createHash("sha256").update(raw).digest("hex");
  ok("the corpus is the one the manifest names", sha === manifest.source.sha256);
  const fresh = splitByVendor(deriveSnapshot(JSON.parse(raw.toString("utf8")), { category: "ccaas", source: manifest.source }));
  ok("every vendor file equals a fresh derivation", Object.entries(fresh.vendors).every(([id, f]) => stableJson(f) === readFileSync(`${DIR}/vendors/${id}.json`, "utf8")) && stableJson(fresh.shared) === readFileSync(DIR + "/shared.json", "utf8"));
  ok("the category index equals a fresh derivation", (await import("./src/lib/research/categoryView.js")).categoryIndexJson(fresh.shared, fresh.vendors) === readFileSync(DIR + "/category.json", "utf8"));
} else console.log("  skipped: RESEARCH_CORPUS is not set (the private corpus is not in this repository)");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
