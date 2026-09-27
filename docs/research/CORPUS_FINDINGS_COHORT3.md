# Corpus findings from the Stage 1 loader: CCaaS, PRODUCTION_COHORT3_NORMALIZED

Written 27 September 2026 while building the public snapshot (research Stage 1, decision D1). For the research program.
The site never edits the corpus; these are withheld from the public snapshot until the corpus answers them. Counts are in
`src/data/research/ccaas/manifest.json` under `withheld`.

## 1. Findings that rest only on internal-only sources (Avaya)

Fourteen Avaya claims cite only `EVD-CC-000485` and `EVD-CC-000486`, both `INTERNAL_RESEARCH_ONLY` with a vendor
confidential notice: CLM-CC-000867, 877, 878, 882, 886, 887, 892, 903, 904, 905, 906, 907, 908, 915. They are withheld.
Six Avaya products take their lineage from `EVD-CC-000485` alone and are withheld too: PRD-CC-0081 Essentials Voice,
0082 Essentials Digital, 0083 Advanced, 0084 Ultra, 0085 Voice Orchestration, 0086 Infinity Hybrid. A public source for
each would let them publish. Claims that cite these sources and a public one publish, linked to the public source only.

## 2. Practitioner review sources

Four evidence objects are practitioner review aggregations: EVD-CC-000029 (G2), 000088 (G2), 000128 (G2), 000129
(Gartner Peer Insights). They are marked publishable in the corpus, but the operating law keeps review content out of
public research, so the snapshot drops them. Three claims rest on them alone and are withheld: CLM-CC-000037 (NICE),
000106 (Amazon Connect), 000155 (Content Guru). A decision for the research program: keep reviews as internal signals
only, or add a primary source to each.

## 3. Cross-vendor claim links (lineage error)

Six Genesys (VEN-CC-0004) records cite Content Guru (VEN-CC-0003) claims: SOW-CC-000042, CHG-CC-000054, INT-CC-000020,
INT-CC-000022, FIT-CC-000042, PRF-CC-000057, linking CLM-CC-000152 or 000153. The loader drops each foreign link and
keeps the record only through its own vendor's claims. The IDs look offset; the corpus should correct the links.

## 4. Records with no linked claim

Some derived records link no claim (for example 43 criteria assessments, 5 Odigo breaks with most fields empty, 36
contract requirements). Nothing is inferred for them, so they are withheld. Linking each to the claim it rests on lets it
publish.

## 5. Normalizations the snapshot applies (presentation only)

- Em and en dashes in text become commas, or "to" between numbers (the site writes no dash). IDs, states and dates are
  never rewritten.
- The string "None" reads as null, never zero.
- The evidence tier's several spellings (TIER_1, Tier 1, Tier 1 with Primary) are read into a number beside the original
  value.
