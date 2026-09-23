# CONTACTCENTERCX MASTER TRACKER

**Version 1.0. Baseline verified 25 August 2026 against `refs/heads/main`.**

This is the single backlog. One chat, one item. Every item has an ID, a blocker,
an effort estimate, and a definition of done. Nothing is "in progress" in more
than one chat at a time.

---

## 0. HOW TO USE THIS

**At the start of a chat:** paste the item ID and its detail block. Nothing else.
The item block is the session brief.

**At the end of a chat:** update the item status in section 3, add a line to the
change log in section 9, and name the next item ID. Do not start a second item.

**Status codes**

| Code | Meaning |
|---|---|
| `DONE` | Verified against deployed source, not against a local copy |
| `NOW` | The single item currently in flight |
| `NEXT` | Cleared to start, no blockers |
| `BLOCKED` | Named blocker must clear first |
| `GATED` | Deliberately deferred behind an evidence threshold |
| `DECIDE` | Needs a decision from TB, not build work |

**Effort scale**

| Code | Meaning |
|---|---|
| S | Under an hour, can ride along with another item |
| M | One chat |
| L | Two to three chats |
| XL | Four or more chats, needs its own sub-plan |

**Cost:** every item in this document is zero incremental spend unless it says
otherwise. Items with a dollar cost are marked and sit in section 8 behind a
trigger.

---

## 1. VERIFIED BASELINE

Everything below was measured against live source on 25 August 2026. Treat these
as the facts the plan is built on, and re-measure before assuming they still hold.

### 1.1 Repository

| Fact | Value |
|---|---|
| Routes in `App.jsx` | 78 |
| Tool routes | 30 |
| `.jsx` files at repo root | 81 |
| Test harnesses at repo root | 4 tool harnesses plus `rail.test.mjs` and `rail-audit.mjs` |
| Vendor data files | 8 |
| Vendors across all files | 283 |
| Sitemap URLs | 354 (300 vendor, 30 tool, 11 industry, 13 other) |
| Build | `vite build && node prerender.mjs` |
| Dependencies | React 18, React Router 6, Vercel Analytics. Nothing else |

### 1.2 The nine rail tools

These nine, and only these nine, publish to the rail, pull from the rail, use
`ReportActions`, and carry `scenarioUrl`. The other 21 tools are outside the
system entirely.

| Tool | Harness | Archivo | Rail | V3 status |
|---|---|---|---|---|
| Business Case Builder | `bcb.test.mjs` 528 green | yes | yes | **Locked, verified** |
| TCO Calculator | `tco.test.mjs` 173 green | yes | yes | **Locked, verified** |
| Staffing Calculator | `staffing.test.mjs` 140 green | yes | yes | **Locked, verified** |
| AI Deflection Reality Check | `aid.test.mjs` 127 green | **no**, 17 refs | yes | Locked, typeface open |
| FCR Leakage Diagnostic | **none** | **no**, 7 refs | yes | **Lock unproven** |
| Cost per Contact | **none** | **no**, 7 refs | yes | **Lock unproven** |
| Channel Shift Model | **none** | **no**, 5 refs | yes | **Lock unproven** |
| License Bundle Gap Checker | **none** | **no**, 6 refs | yes | **Lock unproven, no extractable engine** |
| Attrition Cost Calculator | **none** | **no**, 9 refs | yes | **Lock unproven, no extractable engine** |

`rail.test.mjs` returns 48 green but **cannot run as deployed**: its imports read
`../src/lib/` while the file sits at repo root.

### 1.3 Suite-wide adoption

| Shared asset | Files using it | Of |
|---|---|---|
| `src/lib/type.js` | 4 | 81 |
| `src/lib/track.js` | 2 | 81 |
| `src/lib/mech.js` | 5 | 81 |
| `ReportActions` | 9 | 81 |
| `publishToolResult` | 9 | 81 |
| Instrument Serif still present | **75** | 81 |
| Em-dashes | **361 across 61 files** | 81 |

### 1.4 Vendor data

| File | Vendors | Scored | `verticalFit` | `integrations` |
|---|---|---|---|---|
| `VendorData.js` (CCaaS) | 28 | 28 | 24 | 8 |
| `IVAData.js` | 50 | **0** | 0 | 0 |
| `ACDRoutingData.js` | 44 | 44 | 0 | 0 |
| `DigitalEngagementData.js` | 46 | 46 | 0 | 0 |
| `AnalyticsData.js` | 41 | 41 | 0 | 0 |
| `PaymentData.js` | 33 | 33 | 0 | 0 |
| `WEMData.js` | 26 | 21 | 0 | 0 |
| `AgentAssistData.js` | 15 | 15 | 0 | 0 |
| **Total** | **283** | **228** | **24** | **8** |

`sprinklr` is duplicated across `VendorData.js` and `IVAData.js`, making the IVA
profile unreachable.

The homepage claims "283 vendors scored across 8 categories with published
methodologies." 55 are unscored, one category has no scores at all, and the
methodologies are not published as pages.

### 1.5 Vendor Match Engine

`VendorMatchEngine.jsx` contains **24 hardcoded vendor entries**. It does not
import `VendorData.js`. It is a fork that can silently disagree with the vendor
profile pages it links to. It covers CCaaS only, so 255 of 283 vendors are
invisible to it. It is not on the rail, uses `ReportExport` directly rather than
`ReportActions`, and gates results behind a Formspree email.

---

## 2. THE HONEST DIAGNOSIS

You are not jumping around at random. You are hitting the real problem, which is
that the platform has **three half-built layers and each one blocks the other two.**

1. **The engine layer** claims a standard (V3) that five of nine tools cannot
   demonstrate. Until that is true, every public claim about rigour is a claim
   you cannot defend if challenged.
2. **The data layer** has 283 vendors of which 28 are genuinely deep. The vendor
   match engine, the vertical connectors, the stack analysis engine and most of
   the SEO surface all depend on data that does not exist yet.
3. **The distribution layer** cannot be measured because 2 of 81 files are
   instrumented, so every growth decision would be a guess.

Fixing any one in isolation does not compound. That is why work feels scattered.
The sequence below is ordered so each layer unblocks the next rather than
competing with it.

**Critical path, in order:**

```
WS0 hygiene  ->  WS1 engine integrity  ->  WS11 instrumentation
                        |                        |
                        v                        v
                 WS3 journey wiring        WS8 + WS9 search
                        |
                        v
        WS4 vendor data  ->  WS5 match engine v2  ->  WS7 vertical connectors
                                     |
                                     v
                            WS6 stack analysis engine
```

WS2, WS10, WS12, WS13 run alongside. WS14 stays gated. WS15 is a decision
register, not build work.

---

## 3. THE BACKLOG

**Status note, 23 September 2026.** The status columns below are the 25 August
baseline and were not updated through sessions 1 to 20. Closures since then are
recorded in `CCCX_Resequence_Under_Doctrine_Amendment_11.md`, the change log in
section 9, and `CLAUDE.md` at repo root. Re-baseline the columns in one pass rather
than trusting them.

### WS0. HYGIENE AND BLOCKERS

Small, cheap, and each one removes a piece of friction that keeps recurring.

| ID | Item | Status | Effort |
|---|---|---|---|
| 0-01 | Fix `rail.test.mjs` import paths, `../src/lib/` to `./src/lib/` | NEXT | S |
| 0-02 | Append `__railReport` browser console hook to `toolData.js` | NEXT | S |
| 0-03 | Resolve `sprinklr` duplicate slug across CCaaS and IVA data | NEXT | S |
| 0-04 | Confirm `favicon.svg` resolves in production (file exists in `public/`) | NEXT | S |
| 0-05 | Build `run-all.mjs` suite runner so every harness runs in one command | NEXT | S |
| 0-06 | Add a pre-upload checklist file to the repo: clear Downloads, in-place edit, md5 verify | DONE 23 Sep: replaced by `docs/SHIPPING.md` (git workflow), approved by TB | S |

**0-05 definition of done:** `node run-all.mjs` prints a per-harness pass/fail
table and exits non-zero if any harness fails or is missing.

**Run 0-01 through 0-06 in a single chat.** They are all one-line or one-file
changes and batching them costs nothing because none of them touch tool engines.

---

### WS1. V3 ENGINE INTEGRITY, THE NINE RAIL TOOLS

The central credibility workstream. Nothing public should get sharper while five
tools claim a lock they cannot show.

**Ordering principle, corrected:** the previous plan sequenced the Archivo sweep
smallest file first, which put the only harness-protected file last. Confidence
built on unverified changes is not confidence. Do the protected file first, then
build protection into each unprotected file in the same pass that changes it.
Open each file once.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 1-01 | AI Deflection: Archivo migration, 19 hand-written stacks, under `aid.test.mjs` | NEXT | M | none |
| 1-02 | FCR Leakage: engine markers, harness, Archivo, PDF reconciliation | BLOCKED | L | 1-01 |
| 1-03 | Cost per Contact: engine markers, harness, Archivo, PDF reconciliation | BLOCKED | L | 1-02 |
| 1-04 | Channel Shift: engine markers, harness, Archivo, PDF reconciliation, plus `realisticDeflectionRate` to `botResolutionRate` rename | BLOCKED | L | 1-03 |
| 1-05 | License Bundle Gap: lift engine out of component body, then harness, Archivo, reconciliation | BLOCKED | XL | 1-04 |
| 1-06 | Attrition Cost: lift engine out of component body, then harness, Archivo, reconciliation | BLOCKED | XL | 1-05 |
| 1-07 | Benchmark constant audit: every hardcoded rate in the nine locked tools gets a source or a visible "unvalidated" label | BLOCKED | L | 1-06 |
| 1-08 | `MECH_DEFAULT` conflict: BCB defaults to "Not selected", `mech.js` and Channel Shift default to `hiring` | DECIDE | S | none |
| 1-09 | Confidence taxonomy: split into cost evidence, benefit evidence, case readiness across all locked tools plus `ReportActions`, or do not | DECIDE | M | none |
| 1-10 | Planned-hires cap: cap monetized capacity against a stated hiring plan rather than a percentage | GATED | L | 1-06 |
| 1-11 | Growth escalation in BCB: BAU volume and wage trajectory | GATED | XL | 1-06 |
| 1-12 | `r.payback === 0` capped BCB confidence at Directional (verdict strength as an axis) | DONE in code, guarded by `bcb.test.mjs` 12f; confirmed 23 Sep | M | none |
| 1-17 | `billingStartMonth` in BCB (was 1-12 in v1.0 of this tracker; renumbered 23 Sep) | GATED | L | 1-11 |

**Definition of done for 1-02 through 1-06, per tool:**

1. `@engine-start` and `@engine-end` markers present in the JSX.
2. A `.mjs` harness that slices the live engine at runtime, imports real shared
   modules rather than reconstructing them, and fails loudly if the slice breaks.
3. Assertions covering: internal reconciliation, boundary and category stress,
   single-driver dominance, impossible-output blocking, unit normalization.
4. A regression fixture block recorded in this document, with exact inputs and
   exact expected outputs.
5. **A live PDF generated and reconciled to the dollar against UI and engine**,
   with the prose read as a buyer would read it. This gate is not optional. It
   found four real defects in BCB while 478 assertions were green.
6. `railReport().orphanPulls` empty.
7. Zero em-dashes, zero hand-written font stacks.
8. An assertion proving headline figures are unchanged by the typography edit.

**Regression fixtures already recorded**

*Business Case Builder, reference set:* 235 agents, $20.50 hourly, 28% burden,
151,000 monthly contacts, 360s AHT, 60s ACW, 78% FCR, 2% measured repeat share,
33% attrition, $10.00 loaded CPC, $3,700 recruiting, 18 training days. Targets
15 / 33 / 10 / 25 / 19. Investment $1,500,000, $155 per agent per month, 12-month
migration, 7-month ramp, signed proposal, phasing on, Expected stance, Avoid
hiring. Expect `tco3` 2,811,300, `net` 1,147,191, `trueBreakevenMonth` 50. On
mech `none`: `net` 46,627, `trueBreakevenMonth` 0.

*Business Case Builder, live PDF set:* tool defaults with `currentAHT` 360, mech
none, Expected stance, phasing on, BAU eliminated 30,000, overlap 3 months, share
100%, exit 40,000, backfill 45,000, absorbed 100 hrs, evidence estimated. Expect
net 31,850, tco3 1,807,000, roi3 -92, displacement3 82,500, savings3 65,027,
benefit3 147,527, breakEvenImpl -909,473, overlapWithheld 7,500, year1 2,654,
preGoLiveCredit 15,000.

*Fixtures for the other eight tools: to be recorded as each harness is built.*

**Architecture the work must not break**

- Two adjustments, never conflated. Attribution (stance) asks how much of the
  improvement the intervention causes. Realization (`mech.js`) asks what action
  converts freed capacity to money. They apply in that order, to freed labor
  only. Costs are never scaled by either.
- Displacement is a third benefit class. Avoided cash, never weighted by stance,
  never scaled by the capacity action, never phased over the savings ramp. It
  steps at the dual-run boundary and caps the cost grade above a 25% benefit share.
- Gross transformation cash is the ROI denominator and stays that way.
- Scenario links carry composite state `{ d, stance, rampOn, mech }`, and
  `SCENARIO_DEFAULTS` sets `mech: "none"`.
- Rail keys ending in `Share` are fractions, not percentages.
- Rail arrival confers consistency, never evidence grade.

---

### WS2. THE OTHER 21 TOOLS

21 of 30 tools have no rail connection, no harness, no `ReportActions`, no
scenario link, and no typography migration. They are a separate platform sitting
inside the same site.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 2-01 | Triage all 21 into Promote, Keep light, Consolidate, Retire. Write the verdict and reasoning per tool | NEXT | M | none |
| 2-02 | AHT Decomposition: promote to rail and V3. Feeds Staffing and Cost per Contact directly | BLOCKED | L | 2-01, 1-06 |
| 2-03 | Shrinkage Planner: promote to rail. Feeds Staffing | BLOCKED | L | 2-02 |
| 2-04 | Occupancy Risk Simulator: promote to rail. Feeds Staffing | BLOCKED | L | 2-03 |
| 2-05 | Forecast Accuracy Tracker: promote to rail | BLOCKED | L | 2-04 |
| 2-06 | Schedule Adherence Calculator: promote to rail | BLOCKED | L | 2-05 |
| 2-07 | Agent Experience Diagnostic: promote or consolidate into Attrition Cost | BLOCKED | M | 2-01 |
| 2-08 | QA Scorecard Builder and Calibration Drift Checker: consolidate decision | DECIDE | M | 2-01 |
| 2-09 | The six framework and assessment tools (CX Maturity, AI Readiness, Experience Scorecard, CX IT Alignment, Governance Model, Service Design): decide whether they are diagnostics or lead magnets, and treat them consistently | DECIDE | M | 2-01 |
| 2-10 | Roadmap Builder, Integration Planner, Transformation Readiness: same decision | DECIDE | M | 2-01 |

**2-01 is the highest-leverage item in this workstream and it is cheap.** Six
email-gated assessments currently sit behind a shared Formspree endpoint with a
50 submission per month ceiling and 30-day retention. If they are lead magnets,
they need a conversion path. If they are diagnostics, the gate contradicts
"download stays ungated forever." Right now they are neither, and that
inconsistency is visible to any careful visitor.

**The WFM cluster (2-02 through 2-06) is the strongest promotion case.** Staffing
Calculator is already V3-locked and on the rail. Five WFM tools sit next to it
publishing nothing. Shrinkage, occupancy, adherence and forecast accuracy are all
inputs to a staffing model. Wiring them turns five orphan calculators into one
coherent workforce diagnostic.

---

### WS3. JOURNEY ARCHITECTURE AND INTERLINKING

Nine tools share a data rail and share almost no navigation. A user who finishes
the FCR Leakage Diagnostic is not told what to run next.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 3-01 | Write the canonical journey graph: for every tool, the upstream tool that feeds it and the downstream tool it feeds. One page, checked into the repo | NEXT | M | none |
| 3-02 | Build `NextDiagnostic.jsx`: a shared component that reads rail state and names the single most useful next tool, with the reason | BLOCKED | M | 3-01 |
| 3-03 | Wire `NextDiagnostic` into all nine rail tools | BLOCKED | M | 3-02, 1-06 |
| 3-04 | Rebuild the tool index page around the journey rather than the category list | BLOCKED | M | 3-01 |
| 3-05 | Category pages to tools: every one of the 7 category pages links to the tools that diagnose problems in that category | BLOCKED | M | 3-01 |
| 3-06 | Vertical pages to tools: same, with vertical-specific framing | BLOCKED | M | 3-01, 7-02 |
| 3-07 | Vendor profile pages to tools: from a vendor page, offer TCO and License Gap | BLOCKED | S | 3-01 |
| 3-08 | Research and buyer guide pages to tools | BLOCKED | S | 3-01 |

**The journey to prove first**, from your own operating model:

```
Cost per Contact  ->  FCR Leakage  ->  Attrition Cost  ->  Business Case Builder
     what it costs      why it repeats     what it costs      is it justified
```

All four tools exist. All four are on the rail. None of them tell the user about
the next one. This is the single cheapest compounding improvement on the list and
it requires no new tool.

---

### WS4. VENDOR DATA DEPTH

The data moat is currently 28 vendors deep and 283 wide. The width is a liability
without the depth: it inflates a public claim the data cannot support.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 4-01 | Define one vendor schema and write it down. `VendorData.js` is the reference; the other seven files are thin | NEXT | M | none |
| 4-02 | Score the 50 IVA vendors. Currently zero of 50 carry a score while the homepage claims all 283 are scored | BLOCKED | L | 4-01 |
| 4-03 | Backfill the 5 unscored WEM vendors | BLOCKED | S | 4-01 |
| 4-04 | Add `verticalFit` to all 283 vendors. Currently 24 | BLOCKED | XL | 4-01 |
| 4-05 | Add `integrations` to all vendors where a real integration exists. Currently 8 | BLOCKED | XL | 4-01 |
| 4-06 | Add `lastReviewed` and `sourceBasis` per vendor, so freshness is visible and claims are traceable | BLOCKED | M | 4-01 |
| 4-07 | Publish a scoring methodology page per category. The homepage claims published methodologies and there are none | BLOCKED | L | 4-01 |
| 4-08 | Reconcile the homepage claim to the data, or the data to the claim. Do not leave it as it is | NEXT | S | none |

**4-08 is a two-hour job and it is an integrity item, not a copy item.** A
platform whose promise is "scored, weighted, honest" cannot carry an unscored
category behind a claim that everything is scored.

**Source material already in the project** that should feed WS4: the CCaaS
matrices workbook, the Top 50 ACD Routing matrices, the Advanced Analytics
matrix, the Agent Assist matrix and rubric, the IVA research workbooks, the
Digital Engagement matrices, the Payment Technology matrix, the Outsourced
Staffing matrix, and the Workforce and Quality Management workbook. The scoring
work is largely transcription and normalization, not original research.

---

### WS5. VENDOR MATCH ENGINE V2

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 5-01 | Delete the 24-vendor hardcoded fork; import `VendorData.js` | NEXT | M | none |
| 5-02 | Extend beyond CCaaS to all 8 categories | BLOCKED | L | 5-01, 4-02 |
| 5-03 | Separate knockout gates from weighted scoring. A FedRAMP requirement is a gate, not a weight | BLOCKED | M | 5-01 |
| 5-04 | Explainability: show why each vendor scored what it did, dimension by dimension | BLOCKED | M | 5-03 |
| 5-05 | Rail integration: consume seat count, vertical, volume and cost facts already published by other tools rather than asking again | BLOCKED | M | 5-01, 3-01 |
| 5-06 | Engine harness and V3 lock | BLOCKED | L | 5-05 |
| 5-07 | Move from `ReportExport` and the Formspree gate to `ReportActions` with ungated download | BLOCKED | M | 5-01 |
| 5-08 | Scenario links so a shortlist can be shared and revisited | BLOCKED | S | 5-07 |
| 5-09 | Negative recommendation: the engine must be able to say "no vendor change is justified yet" and route to a diagnostic instead | BLOCKED | M | 5-05 |

**5-01 is urgent and small.** Two independent copies of vendor scores that link
to each other is a defect waiting to be found by a visitor, not by you.

**5-09 is the independence item.** A match engine that always produces a
shortlist is a lead generation form. A match engine that sometimes says the
problem is not a vendor problem is intelligence. That distinction is the entire
commercial thesis.

---

### WS6. STACK ANALYSIS ENGINE (NEW BUILD)

The single highest-value new tool on the list, and correctly gated behind
everything above it. It is the tool that makes the "digital twin" framing
defensible rather than aspirational.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 6-01 | Define the stack model. The seven-layer orchestration framework already exists in the project and should be the spine | BLOCKED | M | 1-06 |
| 6-02 | Current-state capture: what the user owns today, by layer, by vendor | BLOCKED | L | 6-01, 4-01 |
| 6-03 | Overlap detection: which owned products duplicate capability across layers | BLOCKED | L | 6-02 |
| 6-04 | Gap detection: which layers are unserved, and whether that gap is causing a measured operational symptom | BLOCKED | L | 6-03 |
| 6-05 | Rail integration with License Gap and TCO: consolidation candidates priced, not just named | BLOCKED | L | 6-04 |
| 6-06 | Engine harness and V3 lock | BLOCKED | L | 6-05 |

**Do not start WS6 before WS1 closes.** It consumes `mech.js`, the rail, and the
confidence architecture. Building it against an engine layer that is still moving
means building it twice.

---

### WS7. VERTICAL TO VENDOR CONNECTORS

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 7-01 | Compliance requirement map per vertical, extracted from `VendorMatchEngine.jsx` into shared data so every page can use it | NEXT | S | none |
| 7-02 | Category-by-vertical content: roughly 10 of 80 pages have substantive content. Write real content for the next 10, verticals first by search demand | BLOCKED | XL | 4-04 |
| 7-03 | Vertical fit surfaced on vendor profiles: "strong in healthcare, weak in government," with the reason | BLOCKED | M | 4-04 |
| 7-04 | Vertical page to vendor shortlist connector | BLOCKED | M | 4-04, 5-02 |
| 7-05 | Vertical page to tool connector, with vertical-specific default assumptions | BLOCKED | M | 3-01 |
| 7-06 | Integration-based connectors: Epic for healthcare, Guidewire for insurance, and so on. Currently 8 vendors carry integration data | BLOCKED | L | 4-05 |

**7-02 is where the largest volume of thin content risk sits.** 80 pages of
templated category-by-vertical content with no substance is the fastest way to
earn a sitewide quality problem. Keep the 70 unwritten pages off the sitemap
until they are real. See 8-01.

---

### WS8. SEO

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 8-01 | Sitemap discipline: audit all 354 URLs, remove every thin page, submit only substantive ones | NEXT | M | none |
| 8-02 | Thin content audit on the 300 vendor URLs. 255 of 283 vendors have shallow profiles | BLOCKED | L | 4-01 |
| 8-03 | Search Console analysis: separate vendor-lookup demand from tool demand and size each | NEXT | M | none |
| 8-04 | Title and meta description uniqueness audit across every prerendered route | NEXT | M | none |
| 8-05 | Internal link architecture: link depth from homepage to every tool and vendor should be 3 or fewer | BLOCKED | M | 3-01 |
| 8-06 | Confirm www consolidation is complete and the naked domain 308 is stable | NEXT | S | none |
| 8-07 | Per-tool search surface map: for each of the 30 tools, list the legitimate query set it can serve without duplication | BLOCKED | L | 2-01 |
| 8-08 | Problem-first landing pages for the highest-intent operational queries, each terminating in a tool | BLOCKED | L | 8-07 |
| 8-09 | `sameAs` on the Organization schema is an empty array. Populate it | NEXT | S | none |

**Known from Search Console:** the large majority of current demand is vendor and
category lookup, not tool usage. That is the market telling you what it wants
from you today. The tools are the differentiator, but vendor intelligence is the
front door. WS4 and WS8 therefore matter more to traffic than WS6 does, even
though WS6 matters more to the thesis.

---

### WS9. AEO AND ANSWER ENGINES

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 9-01 | `SoftwareApplication` structured data on vendor profiles | BLOCKED | M | 4-01 |
| 9-02 | `HowTo` or `FAQPage` structured data on tools, where genuinely applicable | BLOCKED | M | 8-07 |
| 9-03 | `Dataset` structured data on the scoring matrices, once methodologies are published | BLOCKED | M | 4-07 |
| 9-04 | Methodology pages written to be citable: explicit, dated, versioned, with the weighting shown | BLOCKED | L | 4-07 |
| 9-05 | Answer-shaped opening blocks: every intelligence page leads with a direct, extractable answer before the analysis | BLOCKED | L | none |
| 9-06 | `llms.txt` at the root describing the platform, its methodologies, and what is safe to cite | NEXT | S | none |
| 9-07 | Entity consistency: one canonical name, one description, one URL pattern across schema, Open Graph, and prose | NEXT | M | 8-09 |

**The AEO advantage here is real and specific.** Answer engines reward
independently scored, methodology-backed, non-vendor sources. That is exactly
what this platform is trying to be. The blocker is 9-04: methodologies must
actually be published before anything can cite them. Right now the homepage
claims published methodologies that do not exist as pages, which is the worst of
both positions.

---

### WS10. WEB PERFORMANCE

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 10-01 | Bundle audit. `VendorProfile.jsx` is 117KB of source, `VendorData.js` 78KB, `BusinessCaseBuilder.jsx` 113KB. Measure what actually ships | NEXT | M | none |
| 10-02 | Route-level code splitting via `React.lazy`. 30 tools should not be in one bundle | BLOCKED | M | 10-01 |
| 10-03 | Lazy-load the vertical sub-vertical data files. Nine of them, 64KB each, over 570KB total | BLOCKED | M | 10-01 |
| 10-04 | Font loading: `@import` inside a style block is render-blocking and serial. Move to `<link rel="preconnect">` plus `<link rel="preload">` in `index.html` | BLOCKED | S | 1-06 |
| 10-05 | Core Web Vitals baseline via PageSpeed Insights on the five most-trafficked routes. Record the numbers here | NEXT | S | none |
| 10-06 | Confirm `favicon.svg` is not 404 in production | NEXT | S | none |

**10-05 first.** Do not optimize before measuring. Record the baseline in this
document so improvements are provable.

---

### WS11. BEHAVIORAL INSTRUMENTATION

The gate on everything in WS14. 2 of 81 files are instrumented.

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 11-01 | Verify custom events reach the Vercel dashboard on Hobby tier. Fire `tool_complete` on live TCO and check | NEXT | S | none |
| 11-02 | If gated, swap `track.js` to PostHog. Single endpoint change, free tier | BLOCKED | S | 11-01 |
| 11-03 | Freeze the event taxonomy before rollout. Renaming events after the fact destroys the history | NEXT | M | 11-01 |
| 11-04 | Roll `track.js` into the nine rail tools | BLOCKED | M | 11-03 |
| 11-05 | Roll `track.js` into the remaining tools per the WS2 triage verdict | BLOCKED | M | 11-04, 2-01 |
| 11-06 | Instrument vendor pages and category pages, not just tools. Vendor lookup is the dominant demand | BLOCKED | M | 11-04 |

**Events worth defining in 11-03**, distinguishing vanity from commercial signal:

| Signal | Class |
|---|---|
| Page view | Vanity |
| Tool opened | Curiosity |
| Default values only, then exit | Curiosity |
| Company-specific values entered | **Operational pain** |
| Result reaching a severity threshold | **Economic pain** |
| Second tool used in one session | **Active investigation** |
| Scenario link generated | **Active investigation** |
| Report downloaded | **Active investigation** |
| Return visit that changes an assumption | **Technology evaluation** |
| Vendor profile viewed after a diagnostic | **Technology evaluation** |
| RFP builder or match engine used after a business case | **Procurement** |
| Review requested | **Procurement** |

---

### WS12. CONVERSION AND COMMERCIAL

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 12-01 | Audit the `ReportActions` review path end to end, including the reply address, on all nine tools | NEXT | S | none |
| 12-02 | Formspree ceiling plan. 50 submissions per month, 30-day retention, shared endpoint across six gated tools. Define what happens at 40 | NEXT | S | none |
| 12-03 | Write the manual advisory intake process: what TB does when a high-intent report arrives, in what order, within what time | NEXT | M | none |
| 12-04 | Map each conversion tier to the behavior that should trigger it, and where it appears | BLOCKED | M | 11-03 |
| 12-05 | Decide the position on the six email-gated assessments. Gate or ungate, but be consistent | DECIDE | S | 2-01 |
| 12-06 | Write the independence disclosure page: what is never for sale, what commission exists, how rankings are separated | NEXT | M | none |

**12-06 is a credibility asset, not a compliance chore.** Publishing exactly how
independence is protected, before there is any revenue to protect it from, is
cheap now and expensive later.

---

### WS13. BRAND AND DESIGN SYSTEM

| ID | Item | Status | Effort | Blocked by |
|---|---|---|---|---|
| 13-01 | Complete the visual identity beyond the typeface: colour system, spacing scale, component vocabulary, chart style | DECIDE | L | none |
| 13-02 | Sitewide Archivo rollout to the remaining files. 75 of 81 still carry Instrument Serif | BLOCKED | XL | 13-01, 1-06 |
| 13-03 | Em-dash sweep: 361 across 61 files. Scripted, verified with `s.count(chr(0x2014))` | NEXT | M | none |
| 13-04 | Extract the repeated component patterns into `src/lib/`. `LogoMark` is redefined in nearly every file | BLOCKED | L | 13-01 |
| 13-05 | Colour constants are redeclared per file (`NAVY`, `ELECTRIC`, and so on). Move to one token file, as `type.js` did for type | BLOCKED | M | 13-01 |

**13-01 is a decision, and it is currently blocking 13-02, 13-04 and 13-05.**
Until it is made, every UI change is provisional. It is the cheapest unblock on
this list because it costs thinking, not building.

**13-03 can run immediately and independently.** It touches no engine code.

---

### WS14. GROWTH AND DISTRIBUTION

**GATED.** Does not run until 11-04 completes and 8-01 closes. Running the
12-phase program against 2 of 81 instrumented files would produce inference
dressed as measurement, which is the exact failure the epistemic doctrine names.

| ID | Item | Status | Effort |
|---|---|---|---|
| 14-01 | Asset audit with real behavioral data, not assumptions | GATED | L |
| 14-02 | Intent architecture from observed sequences | GATED | L |
| 14-03 | Question-to-tool distribution map across Reddit, LinkedIn, industry communities | GATED | L |
| 14-04 | Legitimate contribution program, not link dumping | GATED | XL |
| 14-05 | Zero-cost save and return experience: localStorage scenario history, export and re-import | GATED | L |
| 14-06 | 90-day execution plan built on measured behavior | GATED | M |

**14-05 is worth noting now** because `scenarioUrl` already does most of the job.
A scenario link is a save-and-return mechanism with no storage, no account, and
no cost. Before building localStorage history, measure whether anyone generates
a scenario link at all. That measurement is 11-04.

---

### WS15. DATA MOAT AND INVESTMENT TRIGGERS

Not build work. A decision register, reviewed when the trigger data exists.

| Investment | Trigger, to be met before any spend |
|---|---|
| User accounts | A meaningful share of tool users generate a scenario link **and return to it**, repeatedly, within 30 days. Until people demonstrably want their work back, an account solves nothing |
| Database | Manual handling of qualified opportunities exceeds several hours per week, or anonymous benchmark aggregation becomes a product users ask for by name |
| Dashboard | The same user runs three or more tools in a session, repeatedly, and asks for a combined view. One user asking is an anecdote |
| Cross-device saved reports | Measured mobile-to-desktop handoff attempts, visible as the same scenario link opened on two device classes |
| Personalization | Vertical-specific default assumptions are being manually overridden in a consistent direction, proving the defaults are wrong in a knowable way |
| CRM automation | Qualified inbound exceeds what a spreadsheet and a calendar can hold |
| Paid data | A specific decision is repeatedly blocked by missing data that cannot be sourced from public filings, vendor documentation, or the existing matrices |
| Paid analytics tier | Free-tier event limits are actually hit, not projected to be hit |

**The standing principle:** prove behavior first, manually learn second, invest
third, automate last.

---

## 4. WHAT TO RUN, CHAT BY CHAT

The next ten sessions, in order. Each is one chat.

| # | Item | Why now |
|---|---|---|
| 1 | WS0 batch, 0-01 through 0-06 | Removes six recurring frictions in one pass. Nothing touches an engine |
| 2 | 1-01 AI Deflection Archivo | Proves the migration pattern against 127 live assertions before touching anything unprotected |
| 3 | 1-02 FCR Leakage harness plus Archivo | First of the five unproven locks. Extractable engine, so it is the easiest of the five |
| 4 | 1-03 Cost per Contact harness plus Archivo | Same pattern, now proven twice |
| 5 | 1-04 Channel Shift harness plus Archivo plus rename | Same pattern plus a known one-line semantic fix |
| 6 | 11-01 through 11-03 instrumentation verify and taxonomy freeze | Runs in parallel with the harness work. Unblocks WS14 and costs one session |
| 7 | 1-05 License Bundle Gap engine extraction | The first refactor. Harder, and worth doing after four clean passes |
| 8 | 1-06 Attrition Cost engine extraction | Closes WS1. All nine rail tools genuinely V3 |
| 9 | 3-01 plus 3-02 journey graph and NextDiagnostic | The compounding item. Nine connected tools instead of nine isolated ones |
| 10 | 2-01 triage of the 21 orphan tools | Decides the shape of everything after |

Items that can ride along at any point because they touch nothing else: 4-08,
8-06, 8-09, 9-06, 10-05, 12-01, 12-02, 13-03.

---

## 5. THE FIVE THINGS NOT TO BUILD YET

1. **The stack analysis engine.** It consumes an engine layer that is still moving.
2. **The remaining 70 category-by-vertical pages.** Thin content at scale is a
   sitewide quality risk, and they are blocked on vendor data that does not exist.
3. **Any localStorage save-and-return system.** `scenarioUrl` already does it.
   Measure whether anyone uses it first.
4. **User accounts, a database, or a dashboard.** No trigger in WS15 has been met.
5. **The 12-phase growth program.** Gated on instrumentation, correctly.

---

## 6. THE THREE ASSETS WITH THE GREATEST ORGANIC POTENTIAL

1. **Vendor and category intelligence.** Search Console already says this is where
   demand is. It is also the thinnest layer relative to its claim. Highest ratio
   of demand to current quality.
2. **The cost and economics tool cluster** (Cost per Contact, TCO, Attrition Cost,
   Business Case Builder). Genuine utility, weak competition, high commercial
   intent, and four of them are already rail-connected.
3. **Published scoring methodologies.** They do not exist yet, they are claimed on
   the homepage, and they are the single most citable artifact type for answer
   engines. Building them fixes an integrity problem and opens an AEO surface at
   the same time.

---

## 7. THE ONE THING TO PROVE FIRST

**That a user who finishes one diagnostic runs a second one.**

Everything in the thesis depends on it. If users run one tool and leave, the
platform is a collection of calculators and the intelligence layer is a story.
If they chain, the flywheel is real and every subsequent investment argument
follows from it.

Proving it costs two items: 3-02 to make the next step visible, and 11-04 to
measure whether anyone takes it. Neither costs money.

---

## 8. ITEMS WITH A REAL COST

Nothing above requires spend. For the record, the only foreseeable costs:

| Item | Cost | Trigger |
|---|---|---|
| Vercel Pro | Monthly | Only if Hobby blocks custom events and PostHog does not solve it |
| Formspree paid tier | Monthly | Only at sustained volume above the 50 per month ceiling |
| PostHog paid tier | Monthly | Only when free-tier event volume is actually exceeded |

All three are contingent, none are current.

---

## 9. CHANGE LOG

| Date | Item | Result |
|---|---|---|
| 2026-08-25 | Baseline audit | Document created. Nine rail tools identified, five with unproven V3 locks. 283 vendors, 228 scored, 24 with vertical fit. Vendor match engine confirmed as a 24-vendor hardcoded fork |
| 2026-09 (S13) | 11B Staffing | gradeStaffing via emitGrades and voidResult. 60 registry entries. Decision A (headline stays Directional until TCO publishes origin grades), Decision B (BLS May 2024 wage). New defect classes: 2 (rail value with no origin grades Directional) and 3 (validity failure holds completeness Directional). Suite 16,862 |
| 2026-09 (S14) | 11B Cost per Contact | 44 registry entries. Decisions C (BLS wage), D (FCR and M lift evidence only when entered and attested), E (concurrency below 1 corrected and disclosed). Suite 17,053 |
| 2026-09 (S15) | 11B Channel Shift | 39 registry entries. Decisions G (validation checkbox caps at Planning-grade), H (BLS wage entry), F1 (MECH_INITIAL replaces literal). F2 (flip MECH_INITIAL to "none") deferred: breaks 14 assertions across four tools pending unselected-state rendering. Suite 17,195 |
| 2026-09 (S16) | 11B AI Deflection | gradeAID, 38 registry entries. I5 (cost checkbox required for Planning-grade on cost basis), I6 (near-free bot threshold $0.01 per attempted conversation). Suite count not recorded |
| 2026-09 (S17) | 3-01 Journey graph | `src/lib/journey.js` canonical graph for nine V3 tools, `journey.test.mjs`. Fixed: FCR edge pointed back to CPC, AID never linked to BCB, BCB ROUTE `/tools/business-case-builder` vs live `/tools/business-case` (every shared BCB link 404'd). Suite 17,531 |
| 2026-09 (S18) | 11B FCR Leakage | gradeFCR, 36 registry entries, J1 to J9 implemented, D9 and D10 fixed. 20,000-case A/B neutral. Suite 17,748 |
| 2026-09 (S19) | 11B TCO part 1 | gradeTCO, engine region, D11 (invoiced self-declaration capped Planning-grade), D13 (getExternalWithSource), rail-audit regression fixed, pins L7 L8 L9 M6b. D14 downgraded. Suite 17,944 |
| 2026-09-22 (S20) | 11B TCO part 2, steps 1 to 5 | Origin grades on the rail, provenance non-overwrite on unchanged restatement, per-field rail grading in five consumers. J10 load concepts, J11 shared wage, TCO registry (16 entries), generated sources paragraph, false vendor and BLS claims retired, nextFor next steps, missing TCO to AID edge added. TB rulings J9, J12 and the provenance rule. Engineering moves to Claude Code. Suite 18,018 |
| 2026-09-23 | Governance into repo, 0-06 | Tracker, doctrine v1.1, Section 5 v1.2, Resequence, manifest, bundle README and Market Position Index Addendum 1 landed in `docs/`. Sessions 13 to 20 appended from `TRACKER_CHANGELOG_S13_S20.md`; sessions 1 to 12 are summarized only in the Resequence. `SHIPPING.md` drafted for TB approval, closing 0-06 on the Claude Code workflow. `CLAUDE.md` and `.gitignore` at repo root. Suite 18,018 green, build and prerender green (429 routes). Next: 11B step 6, live TCO PDF check |
| 2026-09-23 (S21) | 11B TCO step 6, live PDF check | Production TCO chunk byte-identical to `main` except import hashes; PostHog key confirmed in the production build. Three live PDFs and review payloads captured from contactcentercx.com with analytics and Formspree intercepted. Normal: every figure reconciles to the dollar against the engine. Brief premise corrected: a negative agent count does not void, the guard floors it at 1, discloses it and holds completeness Directional (correct). A reachable void needs a non-finite output, for example agents 1e308 by link. Void defects found: D15 tool-built Confidence and Open Issues section writes Void into the evidence and completeness axes and keeps grade language, and `tco.report.mjs` 614 and 616 assert that text; D16 two confidence sections in every TCO PDF, violating Section 5.6 item 2; D17 a void still renders Infinity and NaN figures in UI, PDF and review summary, and the analyst read and signals draw false conclusions from NaN comparisons. 11B TCO not closed. Next: fix D15 to D17 in TCO, then re-run the live check |
| 2026-09-23 (S22) | 11B TCO void fix; CCaaS research readiness | D15 to D17 fixed on the branch: one confidence section (ReportActions), TCO section renamed Open Issues with no axis rows, a void renders and publishes no figure or figure-derived signal in page, PDF, review summary or wire. `tco.report.mjs` section 7 rewritten, section 8 added for the reachable void; old TCO fails 48, fix passes 951. Suite 18,031 green, build and prerender green, local live PDFs verified. Not yet on `main`. CCaaS Phase 2 corpus reviewed (12 vendors, 765 claims, 440 evidence, clean integrity); readiness report delivered. TB decisions: research Stages 1 and 2 before BCB, remove Phase 1 scores from public CCaaS surfaces, keep and label the 16 unresearched vendors, merge `CLAUDE.md`. Repo verified public: raw corpus stays out of git. Next: merge to `main`, production live check, then research Stage 1 |
| 2026-09-23 (S22) | Decisions | `SHIPPING.md` approved, 0-06 closed. ID conflict resolved: 1-12 is the payback cap, already removed in code and guarded by `bcb.test.mjs` 12f; `billingStartMonth` renumbered to 1-17. Doctrine v1.2: promise restated as verified and traceable, no rule changed. Research Stage 1 waits for the full CCaaS corpus; Stage 2 (score freeze) runs before BCB |
| 2026-09-23 (S22) | 11B TCO closed | PR #1 merged to `main` (73a1e96). Production live check re-run: normal PDF identical to the verified build (37 dollar figures unchanged), void PDF 2 pages with no figure, NaN, Infinity or grade claim, void review payload VOID with no figure-derived signal. Production TCO chunk byte-identical to `main` |
| 2026-09-23 (S22) | Research Stage 2, CCaaS integrity freeze | Phase 1 scores, tiers, vertical fit numbers and rank order removed from the CCaaS category page, 28 profiles and 10 CCaaS-by-industry pages. `src/lib/researchStatus.js` labels 12 vendors current research complete and 16 Phase 1 context. Scoring and methodology claims corrected on homepage, vendor hub, How to Choose, `index.html` and `seo.js`. New `freeze.test.mjs` (252; pre-freeze files fail 27). Suite 18,285 green. Vendor Match (Stage 4) and seven other categories remain Phase 1 |
| 2026-09-23 (S22) | 11B Business Case Builder, last tool in the 1-09 walk | Three-axis emission through `confidence.js` (evidence as weaker of cost and benefit streams, realization from credit class, completeness from substituted, held or corrected inputs); local grade tables retired. Void on non-finite outputs, reachable by link; a void renders and publishes no figure. New domain guard: the boundary probe found negative agents, platform price and implementation printing 129%, negative three-year cost and 278% with nothing disclosed; now clamped, disclosed, completeness Directional. Tool PDF section renamed Evidence and Findings; ReportActions owns the confidence section. `bcb.test.mjs` 848 (12f extended to all axes, new 12g), `bcb.report.mjs` 323 (void document). A/B vs `main`: 19,169 clean in-domain cases identical. Local live PDFs reconciled. DECIDE for TB: benefit-stream baseline evidence |
| 2026-09-23 (S22) | 1-09 closed, WS1 closed | BCB merged (PR #3) and verified on production: normal, Finance-grade negative, void and guard PDFs identical to the local run, net $31,850 and three-year cost $1,722,000 reconcile, void PDF 2 pages with no figure, review payload `confidence: VOID`. All nine rail tools carry the three-axis taxonomy |
| 2026-09-23 (S22) | Reachability batch; V3 program approved | 8-04 and 0-03 verified already fixed and live (283 vendor titles from name fields, no duplicate titles or descriptions across 429 URLs). Homepage count already derived; the Organization JSON-LD literal "283 vendors scored. 30 free tools." now derived and gated in `seo.test.mjs`. TB: Amendment 11 is a guideline; all 21 non-rail tools go to V3 by group (CLAUDE.md section 12) |
| 2026-09-23 (S22) | V3 program step 1: removals | Service Design, Experience Scorecard and Integration Planner retired; Agent Experience and Calibration Drift removed as standalone tools (fold into Attrition and QA in step 3). 301s at the edge and in the app; sitemap 429 to 424; 13 files of inbound links repointed; `seo.test.mjs` R1 to R6 gate every retirement. Doctrine v1.3: Section 10 carries V3-Full and V3-Framework; 11.1 a guideline by TB ruling. 25 tools |
| 2026-09-23 (S23) | Hotfix: four WFM tools crashed after the email gate | Browser smoke of the 16 non-rail tools found Forecast Accuracy, Occupancy Risk, Schedule Adherence and Shrinkage Planner render a blank page for every user who passes the gate: each PDF export block referenced variables that do not exist (`data`, `occupancy`, `baseAdherence`, `categories`). Confirmed on production. Blocks rebuilt on computed values; the Forecast PDF bias label now matches the screen (it was inverted) and Occupancy bands match the screen. The floor (V3 step 2) adds a render gate so this class cannot recur |
| 2026-09-23 (S23) | Hotfix: License Gap rendered a blank page | A server-side render of every routed page found `LicenseBundleGapChecker.jsx` throws `evLabel is not defined` on first render: the engine returns `evLabel` but the component destructure omitted it, and the PDF methodology string reads it bare. Confirmed blank on production; present since the initial import (ea42b7c, 21 Sep). The engine harnesses slice the engine only, so a JSX crash was invisible to the suite. All 71 routed pages now render clean. The floor render gate covers this class |
| 2026-09-23 (S23) | V3 program step 2: the floor on all 16 non-rail tools (closes 2-01 triage, 12-05 gate policy, 11-05 rollout for these tools) | No email gate on any tool; no tool posts to Formspree itself; ReportActions, scenario links (read on first paint), journey nodes (25), `type.js`, disclosed input guards (calculators), out-of-scale answers dropped (frameworks), Vendor Match method disclosure, lazy route retry and route error boundary. Found and fixed: results-page crashes in CX IT Alignment, Governance and Roadmap; undefined tier in CX Maturity and AI Readiness PDFs; Schedule Adherence Erlang C missing 1/(1-rho); Forecast default actuals from Math.random; false "sent to your email" and "we will receive your flagged terms" copy. `floor.test.mjs` (484) server-renders every tool with defaults, sample and hostile links and probes every PDF field. Suite 19,246 green; 48 browser runs clean |
| 2026-09-23 (S23) | V3 program step 3a: V3-Framework for CX Maturity and AI Readiness | One rubric engine (`src/lib/rubric.js`), rubrics as data, published rubric pages at /methodology/cx-maturity and /methodology/ai-readiness rendered from the scored objects. Output adds an action checklist and a named next diagnostic. AI Readiness automation pattern published as a second band set. `rubric.test.mjs` (259) proves determinism, traceability, reachability and checklist completeness, and equality with the pre-rubric formulas on 20,000 answer sets per rubric; four engine mutants killed. Suite 19,515 green |
| 2026-09-23 (S23) | Plan re-laid as phases A to G; Phase A items 1 and 3 | CI: `suite.yml` runs the suite and build on every PR and push to main (fresh-clone simulation green); `nightly.yml` runs `scripts/live-check.mjs` against production daily. Live checker: 142 checks on production (25 tools, sample and hostile links, PDFs, rubric pages), 0 of 132 on a dead origin. TB: practitioner review skipped for now; aesthetic rebuild after C and D |
| 2026-09-23 (S23) | Phase A item 4: visual and usability audit | `scripts/visual-audit.mjs` measures and screenshots 29 pages at desktop and phone; punch list in `docs/VISUAL_AUDIT.md`. No phone overflow. Shared accessibility and legibility failures on every page (font inheritance, unnamed inputs, tap targets, sub-12px text, contrast, missing h1); retired and generic copy found in 14 files. Feeds Phase B and the aesthetic rebuild |
| 2026-09-23 (S23) | Phase B: audit punch list section 1, shared fixes | Controls inherit the site font; one type family (Archivo) on every audited page, down from five (InfoDot Georgia, homepage and How to Choose serif pair, app fallbacks). Every field named for screen readers (NumField, ReportActions, License Gap cells, Forecast table, QA builder, selects): 326 unnamed to 0. 44px touch targets on coarse pointers, steppers hidden there, InfoDot hit area widened. Text below 12px (11px uppercase eyebrows) 1,415 to 11 on desktop. MUTED darkened to #5B6E88 (5.2:1 on white), translucent white text raised to 0.72: contrast failures 2,031 to 762. h1 on every tool. Homepage glyph icons removed; BCB "survive a CFO" retired. Deferred to the aesthetic rebuild: ELECTRIC and status colours as text (no single blue passes on white and navy; they need text and fill variants), link tap targets, the 45 content pages still on the old type pair. Suite 19,515 green |
| 2026-09-23 (S23) | Phase B: shared tool frame on the 16 floor tools | `src/lib/ToolShell.jsx` (ToolNav, ToolHero, ToolStart): every floor tool opens with the same nav and header, a category label, the tool name as the one h1, and a paragraph on what it computes and from what. Seven calculators gained an intro they lacked; the seven assessments' start screens use the same header with the start action and rubric link, and their working screens keep a compact header. Copy corrected on the way: Platform Decision no longer promises "paths to scored vendors"; CX Maturity and AI Readiness labelled assessments; How to Choose no longer claims a QA test mode or License Gap's unsourced "40-100%" gap. `floor.test.mjs` gates the frame on every floor tool and exactly one h1 on every tool's default and sample render (541). Suite 19,572 green; local live check 142 of 142 |
| 2026-09-23 (S23) | Phase B: rail debts and live-check coverage | `scenarioUrl.js`: a crafted link could swap a decoded state's prototype or plant a `constructor` key; unsafe names are dropped in both directions (`track.test.mjs` M, 9 pins fail on the old file). `guards.js` `money()`: guarded money prints grouped and to the cent (was `-$1234567.891`), CPC set G. FCR PULLED badge fires only on another tool's value. Attrition: first live PDF pull; normal and Finance-grade reconcile 29 of 29 figures; the void printed `$∞`, `Infinity%`, variable names and a realization grade, and now publishes only the notice, corrections, method and next steps on page and PDF; shared `boundAxes`. Live checker now covers the nine rail tools' sample, hostile and PDF paths (195 checks, was 142): TCO printed `NaN% above cost per contact` on a hostile link (fixed in the engine, A/B identical on 12,000 in-domain cases); FCR gained a worked `SAMPLE`; TCO links open on Overhead & Results; the checker retries a page whose result is late. Suite 19,699 green |

---

*Update this document at the close of every session. A tracker that is not
updated is a plan that is not being followed.*