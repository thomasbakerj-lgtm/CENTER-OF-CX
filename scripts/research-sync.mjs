// scripts/research-sync.mjs
//
// Writes the public research snapshot for one category from a Master Research Corpus that lives outside this
// repository (decision D1). Usage:
//   node scripts/research-sync.mjs --corpus /path/to/CCaaS_Master_Research_Corpus_....json [--category ccaas]
// Output, replaced as a whole: src/data/research/<category>/manifest.json, shared.json, category.json,
// vendors/<Vendor_ID>.json.
// The source file's name and SHA-256 go into the manifest, so each snapshot names the exact checkpoint it came from.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";
import { deriveSnapshot, splitByVendor, stableJson } from "../src/lib/research/snapshot.js";
import { categoryIndexJson } from "../src/lib/research/categoryView.js";
import { industryIndexJson } from "../src/lib/research/ccaasIndustry.js";

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const path = arg("--corpus") || process.env.RESEARCH_CORPUS;
const category = arg("--category") || "ccaas";
if (!path) { console.error("research-sync: pass --corpus <file> or set RESEARCH_CORPUS"); process.exit(2); }

const raw = readFileSync(path);
const sha256 = createHash("sha256").update(raw).digest("hex");
/* The upload tool prefixes files with a random id; the manifest records the corpus's own name. */
const name = basename(path).replace(/^[0-9a-f]{8}-/, "");
const snap = splitByVendor(deriveSnapshot(JSON.parse(raw.toString("utf8")), { category, source: { name, sha256 } }));

const dir = join("src/data/research", category);
rmSync(dir, { recursive: true, force: true });
mkdirSync(join(dir, "vendors"), { recursive: true });
writeFileSync(join(dir, "manifest.json"), JSON.stringify(snap.manifest, null, 1) + "\n");
writeFileSync(join(dir, "shared.json"), stableJson(snap.shared));
for (const [id, f] of Object.entries(snap.vendors)) writeFileSync(join(dir, "vendors", id + ".json"), stableJson(f));
/* The category page's index: classes and each vendor's first best-when statement (categoryView.js). */
writeFileSync(join(dir, "category.json"), categoryIndexJson(snap.shared, snap.vendors));
/* The CCaaS by industry pages' index: every record each industry theme matches (ccaasIndustry.js). */
if (category === "ccaas") writeFileSync(join(dir, "industry.json"), industryIndexJson(snap.shared, snap.vendors));
console.log(`research-sync: ${category} ${snap.manifest.checkpoint}, ${Object.keys(snap.vendors).length} vendors, ${snap.manifest.counts.claims} claims, ${snap.manifest.counts.evidence} sources, withheld ${JSON.stringify(snap.manifest.withheld)}`);
