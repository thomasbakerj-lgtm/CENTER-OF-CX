# CLAUDE.md

Operating brief for ContactCenterCX (`CENTER-OF-CX`). Read this first, every session.

Written 22 September 2026 at the close of chat session 20. Re-verified against live
`main` the same day: TCOCalculator.jsx, journey.js and BusinessCaseBuilder.jsx md5s
match the baseline below. Re-verified in Claude Code on 23 September 2026 at `main`
76f5248: all 20 md5s match, suite 18,018 green, build and prerender green. This file
and `docs/` were committed on 23 September 2026. S22 (23 Sep): PR #1 merged to
`main` (73a1e96), TCO fix live and verified on production. Stage 2 freeze on the
branch, then merged (PR #2, 3d8f575) and verified live. BCB 11B retrofit merged
(PR #3, 72af081) and verified on production: suite 18,363 green, build and prerender green. md5s updated below.

---

## 0. What this project is

ContactCenterCX.com is a bootstrapped, vendor-neutral intelligence and diagnostic
platform for the contact center and CX technology market. One operator, Thomas
Baker (TB), does engineering, product, content and business development.

Roughly 30 React tools, 283 vendors across 8 categories, 78 routes. Vite + React 18
SPA on Vercel via GitHub auto-deploy. Production: https://contactcentercx.com

The promise is **verified and traceable** (doctrine v1.2). Every calculation verified,
every historical fact sourced, every assumption labelled, every derivation
reproducible, every forecast explicitly conditional. The math is always right; whether
the answer is right depends on the inputs, and every input shows where it came from.

Commercial line: monetize confidence in decisions, never access to vendors.
Independence is the product.

**Zero incremental spend is the current constraint.** No paid ads, paid data, new
SaaS, backend, databases, accounts or auth. Prove behavior first, manually learn
second, invest third, automate last.

---

## 1. Verified baseline, 22 September 2026

| Fact | Value |
|---|---|
| Suite | **18,018 assertions, 0 failed** |
| Rail audit | clean, no orphan pulls |
| Chunk gate | 25 of 25 (requires `npm install` first) |
| Runner | `node run-all.mjs` at repo root, exits 2 on any UNPARSED harness |
| `.jsx` at repo root | 81 |
| Routes in `App.jsx` | 78 |
| Harnesses | 10 tool pairs (`.test.mjs` + `.report.mjs`) plus `rail`, `rail-audit`, `chunk`, `confidence`, `guards`, `journey`, `seo`, `track` |

| file | md5 |
|---|---|
| `src/lib/toolData.js` | 6108aae36f798ac0ba572888ad6c00c5 |
| `src/lib/benchmarks.js` | 565d1f2c826e32f1baf66faebac2d71a |
| `src/lib/journey.js` | see git (S23: 25 nodes) |
| `src/lib/track.js` | d04c15c02e96bdee21ded2cf03a45866 |
| `src/lib/confidence.js` | cd405788506e7970ad581cfcb9a84997 |
| `src/lib/metrics.js` | 37f924dfd1387e52f7da749537d1f940 |
| `src/lib/guards.js` | a640b502cbee94ebd08687656ba7d681 |
| `src/lib/type.js` | fde48210b6eac47c307681b3b90adba9 |
| `TCOCalculator.jsx` | 5329c88fa10063473c9710f8acfbbd27 (S22, on `main`) |
| `BusinessCaseBuilder.jsx` | eb43e3f4bf9d7a806ff3799a6635ef22 (S22 11B retrofit) |
| `StaffingCalculator.jsx` | 6f956589657ea7bfe8b7a3a7dab76dc1 |
| `CostPerContactCalculator.jsx` | 815a2bd4a1b23537f8ec413112e38944 |
| `ChannelShiftModel.jsx` | 9f7b3e2f941a5bd304a592a88a81efd6 |
| `FCRLeakageDiagnostic.jsx` | 366b409640f3eb8bb11dc0710a002d77 |
| `AIDeflectionRealityCheck.jsx` | d54d6ff73405d891a20d4314272799c4 |
| `LicenseBundleGapChecker.jsx` | see git (S23 hotfix: `evLabel` destructure) |
| `AttritionCostCalculator.jsx` | see git (S22: next-step and driver links repointed, engine untouched) |
| `ReportActions.jsx` | db405106dfcbde98427f4be53a84be2a |
| `run-all.mjs` | see git (S23: registers `floor.test.mjs`) |
| `rail-audit.mjs` | see git (S22: retired tools removed from the scan list) |

---

## 2. Where we are

**Tracker 1-09**, the confidence taxonomy, decided 19 September 2026 and final:
three axes, Evidence x Realization x Completeness. No cost/benefit split, no
case-readiness axis. Cost and benefit are streams inside Evidence. Headline is the
minimum of applicable axes; the rationale names the binding axis. Spec:
`docs/DOCTRINE_Section5_v1_2.md`. The retrofit walks the nine rail tools as 11B,
one per session.

Closed in the walk: Attrition, License Gap, Staffing, CPC, Channel Shift, AI
Deflection, FCR Leakage, TCO (steps 1 to 5). See the tracker change log, section 9.

**Closed S22: 11B TCO.** Step 6 live check (S21) found D15 to D17; S22 fixed them
(one confidence section owned by ReportActions; a void renders and publishes no
figure), merged PR #1, and re-ran the live check on production: normal PDF identical
to the verified build with all 37 dollar figures unchanged, void PDF two pages with
no figure, NaN, Infinity or grade claim, void review payload `VOID` with no
figure-derived signal. Production TCO chunk byte-identical to `main`.
Browser check tooling: Playwright from the scratchpad, Chromium pinned to the proxy
CA with `--ignore-certificate-errors-spki-list`, PostHog, Vercel Analytics and
Formspree intercepted so no test event or review reaches production data. Stop a
local `vite preview` by port, never `pkill -f "vite preview"` (it kills its own shell).

**Done S22 on the branch: research Stage 2, the CCaaS integrity freeze.** Phase 1
scores, tiers, vertical fit numbers and rank order no longer render on the CCaaS
category page, the 28 CCaaS and adjacent profiles, or the 10 CCaaS-by-industry pages.
`src/lib/researchStatus.js` carries only the 12 gate-passed vendors (slug, corpus
Vendor_ID, validation date) and one shared label: "Current research complete" or
"Phase 1 context, not yet researched". Lists are alphabetical, split by research
status. Three narrative strings that embedded Phase 1 scores were reworded. Copy and
metadata that claimed "scored" vendors or "published methodologies" were corrected
(homepage, vendor hub, How to Choose, `index.html`, `seo.js`). `freeze.test.mjs`
gates all of it: the pre-freeze files fail 27 of its 252 checks.
Not in scope, still Phase 1: Vendor Match output (Stage 4 rebuild) and the other seven
categories' scores and tiers (TB decision covered CCaaS).

**Done S22: 11B Business Case Builder, the ninth and last rail tool. 1-09 and WS1 closed.**
On production (PR #3): all four live PDFs (normal, Finance-grade negative, void, guard)
are identical to the local run; the void review payload carries `confidence: VOID`.
- Grades through `src/lib/confidence.js` and emits the Section 5.6 object: evidence is
  the weaker of the cost stream (cost basis, as before) and the benefit stream (Aggressive
  stance or targets above the planning range cap it at Planning-grade); realization from
  the credit class via `realizationFromCred`; completeness Directional on any substituted,
  held or domain-corrected input. Local `GRADE_RANK` and `CRED_GRADE` copies retired.
- Void (5.4) on non-finite outputs or cash flow, reachable by link (`agents: 1e308`).
  A void renders and publishes no figure: page notice, 2-page PDF (void block, next
  steps, methodology), review summary states the void, figure-derived signals withheld,
  nothing published to the rail.
- Domain guard on every numeric input (`BCB_DOMAIN`, no bound narrower than the form).
  Found by the boundary probe: `agents: -5` printed a 129% return, a negative platform
  price made three-year cost negative, a negative implementation printed 278%, all
  undisclosed. Now clamped and disclosed; completeness Directional.
- `confidenceOf` and `caseInsights` read the values the engine ran (`ranValues`).
- The PDF's own section is now "Evidence and Findings" and restates no axis; ReportActions
  receives `grades` and owns the one confidence section.
- 1-12 was already closed; 12f now proves all three axes and the grade object invariant
  to the return. New 12g: headline equals the pre-retrofit formula on 6,000 in-domain
  cases; emission, void and guard gates. Mutation set updated (3 equivalent mutants
  retired, 3 added). One-off A/B against the original engine from `main`: 19,169 clean
  in-domain cases, identical outputs, headlines, open items and findings.
- Local live check: normal PDF reconciles to the dollar (net $31,850, three-year cost
  $1,722,000, the tracker fixture); the Finance-grade case that does not return prints
  Finance-grade with the finding; the void PDF is 2 pages with no figure; the guard case
  discloses and grades Directional.
- **Open for TB (DECIDE):** BCB has no evidence selector for its operational baselines
  (AHT, FCR, volume, wage), and rail-pulled values are not origin-graded, so the benefit
  stream grades attribution and target ambition only, exactly as before. Honest per-field
  grading (as TCO does) would move most BCB cases to Directional. Decide before 1-10 or
  1-11 touch the engine.

---

## 3. The tracker

`docs/CCCX_MASTER_TRACKER.md`: 96 items, 16 workstreams (WS0 to WS15). `TAXONOMY.md`
references it. `docs/CCCX_Resequence_Under_Doctrine_Amendment_11.md` replaces its
Section 4 and controls run order. The tracker status columns are the 25 August
baseline; closures since are in its change log.

Also in `docs/`: doctrine, Section 5 v1.2, `SHIPPING.md`, the project knowledge
manifest, the bundle `README.md`, and Market Position Index Addendum 1.

**IDs in code, not in the tracker.** Resolved S22: 1-12 is the payback confidence cap,
as used across code, harnesses and Section 5 v1.2. The tracker's `billingStartMonth`
item moved to **1-17**. IDs 1-12b, 1-13 (PDF verdict tile colour), 1-14 (fragile
return case), 1-15 (TCO severity band) and 1-16 (finding sizing) are used in code
comments and were never added to the tracker.

| WS | Subject | State |
|---|---|---|
| WS0 | Hygiene and blockers | Closed. `SHIPPING.md` approved by TB 23 Sep |
| WS1 | V3 engine integrity, nine rail tools | Closed S22. 1-09 walk complete, all nine on production. Benefit-stream DECIDE open |
| WS2 | The other 21 tools | 2-01 triage is cheap and high leverage |
| WS3 | Journey architecture | Graph in `src/lib/journey.js` (3-01 done) |
| WS4 | Vendor data depth | 283 vendors, 28 genuinely deep |
| WS5 | Vendor Match v2 | 5-01: delete the 24-vendor hardcoded fork |
| WS6 | Stack analysis engine | Gated behind WS1 |
| WS7 | Vertical to vendor connectors | Gated on WS4 |
| WS8 | SEO | 8-04 vendor title defect live |
| WS9 | Answer engine optimization | Blocked on published methodologies |
| WS10 | Web performance | Already lazy split: 237 KB entry, 77 KB gzip (measured 23 Sep). Re-scope 10-01 to 10-03 |
| WS11 | Behavioral instrumentation | Gate on everything in WS14 |
| WS12 | Conversion and commercial | 12-06 independence disclosure |
| WS13 | Brand and design system | 13-01 decision blocks three items |
| WS14 | Growth and distribution | Gated behind instrumentation |
| WS15 | Data moat and investment triggers | Decision register |

Approved sequence after WS1:
1. Close 1-09 (TCO step 6, BCB)
2. Reachability batch: 8-04 vendor titles, homepage index count, Sprinklr duplicate slug
3. SEO prerender verification against the Vercel alias
4. 11-01 to 11-03 instrumentation and event taxonomy freeze
5. 10-01 to 10-03 bundle splitting
6. 2-01 triage of the 21 non-rail tools
7. 3-02 NextDiagnostic

Deprioritized until findable and observable: 1-07, 1-10, 1-11.

TB direction, 19 Sep 2026: all 30 tools reach V3, not only the nine rail tools.
CX Maturity and AI Readiness get rebuilt as differentiated assessments producing a
checklist and routing to an SE plus consultant conversation (accepted lead-gen
triggers). Experience Scorecard removed for now. CX IT Alignment kept, deprioritized.
Assessments are a distinct asset class from calculators. Governance must appear on
the site even if the current Governance Model tool is the wrong vehicle.

**TB decisions, 23 Sep 2026 (S22), on the CCaaS research integration:**
1. Order: TCO fix, then research Stage 2 (the freeze), then Business Case Builder.
   Stage 1 waits for the full corpus (TB, S22: the shared corpus is an example).
2. Remove Phase 1 numeric scores and tiers from public CCaaS surfaces (integrity
   freeze, Stage 2).
3. The 16 site CCaaS vendors without Phase 2 research stay, labelled "Phase 1
   context, not yet researched under the current methodology".
4. One `CLAUDE.md`: engineering brief plus research operating law (section 13).
5. The GitHub repo is **public** (verified S22). The raw research corpus is never
   committed. Stage 1 must keep it out of the repo and ship only filtered, publishable
   derived data. Proposal for TB: build-time ingestion from a private location.

Research integration plan (architecture-readiness report, S22): Stage 1 corpus
loader, schema check, normalization on read, publishability filter and the 20
required tests, no UI change; Stage 2 integrity freeze; Stage 3 Vendor Intelligence
pages for the 12 researched vendors; Stage 4 Vendor Match v3, class-scoped, blocked
on the CCaaS Next-Phase Research Strategy Handoff (.docx, not yet received); Stage 5
Market Position Index, blocked on capture data (`31_MARKET_POSITION_CAPTURE` is
empty); Stage 6 later categories on their own methodologies.

**The one thing to prove first:** a user who finishes one diagnostic runs a second.
Cost: 3-02 and 11-04, no money.

---

## 4. Doctrine

Full text: `docs/DOCTRINE_Epistemic_Standard.md` v1.3 (Section 10: V3-Full and V3-Framework; 11.1 a guideline). Section 5 is superseded by
`docs/DOCTRINE_Section5_v1_2.md`. Doctrine lives in `docs/`, not in code comments.

**Four claim classes.** Every displayed number is one of: historical fact, assumption,
conditional forecast, measured outcome. "This saves $1.8M" is forbidden. "Under these
assumptions this models $1.8M" is required. Precision is not evidence.

**Three axes.** Grades `Directional`, `Planning-grade`, `Finance-grade`. A null axis
needs a `naReason`. Void claims no grade anywhere.
- A rail value confers consistency, never evidence.
- Finance-grade requires document attestation. Self-declaration is not attestation.
- Realization is N/A for cost-only tools, with a reason.
- No verdict, return, payback or recommendation strength ever caps an axis. Every
  harness carries a sign-invariance assertion. Without it a tool is not locked.
- Never conflate "we do not know" with "we know and the answer is no."

**Capacity is not cash.** Freed agent time becomes cash only through a named
`mech.js` action. "No action selected" realizes zero. Freed labor is scaled by the
realization factor; cash out the door is never scaled.

**The rail** (`src/lib/toolData.js`, session storage):
- `publishToolResult(toolId, primitives, origins)` normalizes at the door.
- `getExternalPrimitive` and `getExternalWithSource` refuse self-reads. Confidence
  gates must use these, never `getPrimitive`.
- Pass facts, not verdicts.
- `railReport().orphanPulls` empty before any tool locks.
- `rail-audit.mjs` matches **string literal** keys. Never hide a key behind a variable.

**The registry** (`src/lib/benchmarks.js`). Every shipped constant is registered or
the suite throws. Kinds: `market` (source and review date), `heuristic` (labelled
everywhere; a driver at default grades Directional), `threshold` (rationale,
versioned, moves only with evidence). Ownership `shared` exists for multi-tool
entries; per-tool gates accept `tool === TOOL || tool === "shared"`.

**Amendment 11 (Section 11).** Effort rationed as strictly as money: any L or XL item
needs demand evidence or a recorded reason to precede it. Reachability precedes rigor.
Instrumentation precedes proof: no tool is locked without its completion event.
A DECIDE item that shapes a build is scheduled before it.

**Language.** Retired: most conservative, only independent, survives the CFO,
industry-leading. **No em-dashes or en-dashes** anywhere: prose, copy, comments,
commit messages. Check with Python `s.count(chr(0x2014))` and `chr(0x2013)`.
Roughly 361 remain across 61 files (13-03). No antithetical "X not Y" cadence in
public copy.

---

## 5. Decisions settled in chat and written nowhere else

Binding. None of this is in code comments beyond what is noted.

**Session 13 to 18 decisions (by tool)**
- Staffing A: headline stays Directional until upstream publishes origin grades. B:
  BLS May 2024 wage.
- CPC C: BLS wage. D: FCR and M lift evidence only when entered and attested by
  checkbox. E: concurrency below 1 corrected to 1 and disclosed.
- Channel G: validation checkbox caps at Planning-grade. F1: `MECH_INITIAL` replaces
  the literal. **F2 deferred:** flipping `MECH_INITIAL` to "none" breaks 14 assertions
  across four tools until unselected-state rendering exists.
- AID I5: cost checkbox required for Planning-grade on cost basis. I6: near-free bot
  threshold $0.01 per attempted conversation ($0.10 blocked a valid reconciled case).
- Defect class 2: any rail value with no origin grade grades Directional through
  `railEvidence(null)`. Defect class 3: any model-validity failure holds
  completeness Directional.
- All constants reaching a flag, band or verdict read from the registry by template id.

**Session 19**
- J1 / D11: self-declared "invoiced" basis capped at Planning-grade.
- D13: rail reads use `getExternalWithSource(key, TOOL_ID)`. `pre` map read once at
  mount. A scenario link grades its values as **entered** and credits no rail value.
- rail-audit treats sourced getters as external. Pins L7, L8, L9, M6b.
- False `has_document_evidence` removed from the wire; `decision_ready_signal` reads
  the grade. D14 downgraded: BCB `implementationCost` pull makes no loop.

**TB rulings**
- **J9:** in-house vendor reduction caps realization at Planning-grade.
- **J12:** Planning-grade requires all 35 TCO graded fields off preset (18 of 6,000
  sweep cases). Keep and disclose on page. Do not loosen.
- **Provenance:** unchanged restatement keeps the original producer and origin grade.
  An edited value makes the editing tool the producer and propagates everywhere.
  TB's governing principle: least user complexity.

**Session 20**
- Origin grades on the rail (`railOrigin`); graded per field via `pre[field].origin`,
  blanket `railOrigin` only as fallback.
- **J10:** three shared loads only: `load.benefits` 1.30, `load.marginal` 1.18 (the
  only load a saving may be valued on), `load.fullyLoaded` 1.95. `tco.load.salaried`
  1.25 is TCO-owned. Do not invent a fifth. CPC and Channel 1.35x retired to 1.30.
- **J11:** one wage, `market.wage.agent` BLS $20.59 (OEWS May 2024, SOC 43-4051).
  TCO industry wages are heuristics, never presented as medians.
- TCO sources paragraph is generated from the registry. Balto/Parloa/Teneo containment
  and the $19 "BLS" wage claims are retired and pinned dead.
- TCO to AID journey edge added. TCO order: license gap, AI deflection, business case.

**Standing engineering rules**
- Each tool serves its own goal. No generic shared ranges or one-size logic. If the
  same key means a different fact in another tool, do not prefill (TCO does not pull
  Staffing occupancy for this reason).
- `MECH` and `CRED_RANK` do not apply to cost-only tools.
- Vendor Match must disclose methodology. Ceiling saturation is model failure
  (Five9 and Talkdesk both 99 on 27 dimensions).
- Watch: split rendering, self-credentialing, unreachable grades, undisclosed zero
  substitution, unguarded negative inputs.
- "Digital twin" is internal language. Public term: "decision model."

---

## 6. Carried debt

**Rail and confidence**
- TCO publishes `analystRead`, a verdict on the rail.
- TCO `marginalPerContact` uses 1.30x; registry marginal is 1.18x. Undecided.
- Only TCO publishes origin grades. Staffing, CPC, FCR, AID, Channel read but publish none.
- CPC, Channel, FCR, AID still pull via `getPrimitiveWithSource` (self-read capable;
  graded `self` and Directional, so not yet a defect).
- ~~FCR PULLED badge reads `getPrimitive`.~~ Fixed S23: the badge fires only on a value another tool produced.
- ~~Attrition live PDFs never pulled; local `boundAxes`.~~ Fixed S23: pulled and reconciled (29 of 29 figures,
  normal and Finance-grade); the void now publishes no figure (it printed `$∞` and a grade); shared `boundAxes`.

**Live defects**
- ~~`guardVal` money rendering in CPC.~~ Fixed S23: `money()` in `guards.js` (grouped, to the cent); set G pins it.
- 8-04 vendor titles from `titleCase(slug)` on roughly 255 of 283 pages.
- Sprinklr duplicate slug (CCaaS and IVA) hides the IVA profile.
- Homepage claims methodology pages that do not exist.
- `VendorMatchEngine.jsx` 24-vendor CCaaS-only fork, does not import `VendorData.js`.
- ~~Bundle 2.9 MB single chunk.~~ Stale. `npm run build` on 23 Sep 2026: lazy route
  chunks, 237 KB entry, 77 KB gzip. Re-scope 10-01 to 10-03 before scheduling.
- Sitemap holds 429 URLs, not the 354 the tracker baseline and shipping facts state.
- CCaaS-by-industry pages (10) are indexable in `seo.js` because they carried per-vendor
  vertical fit scores. The freeze removed those, so their distinct content is now the
  vertical requirements plus the vendor list. Decide at Stage 3: rebuild them from
  Phase 2 research or set noindex like the other 70 category-by-vertical pages.
- Vendor Match still ranks on its 24-vendor Phase 1 fork and prints fit scores (Stage 4,
  5-01).
- Seven non-CCaaS categories still show Phase 1 scores and tiers as current.
- BCB publishes `analystRead` and `confidence` on the rail (verdicts), like TCO's
  `analystRead`. BCB next steps are a hardcoded list, not `nextFor` (3-03).
- CCaaS vendor profile nav renders "Vendors" twice. Pre-existing, cosmetic.
- ~~`scenarioUrl` `__proto__` assignment.~~ Fixed S23: a link could swap a decoded state's prototype; unsafe names
  are now dropped in both directions (`track.test.mjs` M). `track.js` was already allowlisted.
- `ReportActions` `Field` labels are not bound to their inputs (no `htmlFor`/`id`).
  Screen readers cannot name the review form fields.
- ~~A failed lazy route chunk leaves the tool blank.~~ Fixed S23: one retry, one
  reload per session, then a route error boundary with a reload link.
- Non-rail tools carry floor only: no engine markers, harness pairs, claim-class
  language review or registry constants yet (step 3). Heuristics named in copy where
  seen (Occupancy multipliers, AHT reduction factors, adherence abandonment steps).
- Occupancy Risk "Critical Threshold Warning" panel uses an unsourced 0.15 turnover
  factor; AHT benchmark ranges and Contract Risk "gap runs 40-100%" are unsourced.
- TCO guard case (1 agent, 120,000 contacts) prints marginal cost per contact above
  cost per contact, unflagged, and its open-issues text says "treat the output as void"
  while grading Directional. Low.

**Test infrastructure**
- `channel.report.mjs` UNPARSED once in session 20, not reproducible. UNPARSED is
  always failure.
- `chunk.test.mjs` imports `vite`: `npm install` before the suite.
- `rail-audit.mjs` writes `.rail-audit-metrics.mjs` at repo root every run and never
  removes it. Covered by `.gitignore`.
- Root file `download` holds `.gitignore`-style content. Superseded; delete once TB
  confirms nothing reads it.

**TB actions outstanding**
- 11-01: verify custom events reach Vercel dashboard on Hobby.
- Disclosure page (12-06).

---

## 7. Parallel research program. Do not collide.

- **Research Operating Standard** governs. The latest Next-Phase Research Strategy
  Handoff per category is methodology authority. Existing matrices and workbooks in
  project knowledge are **Phase 1 baselines and hypotheses, not current evidence.**
- Category order: CCaaS, IVA and Conversational AI, Agent Assist, WFM and QM,
  Experience Analytics and VoC, CX Orchestration and Workflow, Digital Engagement,
  Payments and Identity and Trust. Delivered as one complete category upload.
- Standard: rate every qualified vendor within competitive class; separate Product
  Capability, Evidence Confidence, Buyer Fit, Production/Operating Risk,
  Implementation/Change; unknown does not equal weak; preserve score lineage.
- **AI Builder Handoff: Vendor Intelligence and Vendor Match V3** (19 Sep 2026) is
  build authority: two products on one corpus; public universal leaderboard removed;
  ranking happens inside Vendor Match after buyer context. CCaaS is the first proof.
- **Addendum 1** (`docs/CCCX_Market_Position_Index_and_Tool_Separation_Rules_Addendum_1.md`): Market Position Index, five equal
  dimensions, class-scoped, no composite decimal, analyst coverage shown not scored,
  one-way wall so the index never feeds Vendor Match.
- Queued vendor work: Vendor Match ceiling cap (interim Phase 1 fix); Phase 2 schema
  and category extension registry (`VENDOR_RECORD_SCHEMA_V2.md` in repo); unfork
  scoring out of `VendorMatchEngine.jsx` into `VendorData.js`; completion-gate and
  score-change-control suite gates; class-scoped Vendor Match rebuild.
- Open TB decision: Market Position Index inside competitive class only (locked) or
  also category-wide.

---

## 8. Verification loop (definition of done)

1. `git pull`. Read the source before editing it.
2. Boundary-probe the engine before writing assertions.
3. Arithmetic lives between `/* @engine-start */` and `/* @engine-end */`. Both
   harnesses slice that region via `new Function`. No JSX inside. New dependencies in
   the region must be injected into both harness signatures.
4. Prove extraction behavior neutral across the full scenario set (A/B, thousands of cases).
5. Engine harness and separate reconciliation harness, both in `run-all.mjs` with a
   `report` field.
6. `node run-all.mjs`: 0 failed, 0 UNPARSED, rail audit clean, chunk 25 of 25.
7. Dash check on every touched file.
8. Live PDF, normal and voided, reconciled to the dollar.

Retired with Claude Code: single-file uploads with md5 per file, Downloads-folder
hygiene, GitHub web UI in-place edits, breadcrumb checks, md5 tables in kickoff
packets, Python inline string replacement as the edit tool (keep the
abort-on-wrong-count discipline).

Kept: everything in steps 1 to 8 and one tracker item per session.

---

## 9. Working with TB

- Direct, decisive, concise. Outcome first, analyst voice. Answers short; TB asks
  for more.
- "next" = next tracker item in order. "done" = proceed. "go" = approved.
- Present decisions as a numbered list, get approval, then execute the full loop
  autonomously. Push back when wrong. Make sequencing calls.
- Peer review is adversarial: concede valid challenges, rebut misreads with source.
- Say when an item is done. At session close, update this file and the tracker
  change log. A tracker not updated is a plan not followed.

---

## 10. Not yet

Do not build: stack analysis engine, remaining category-by-vertical pages,
localStorage save-and-return (`scenarioUrl` already covers it), accounts, database,
dashboard, the 12-phase growth program.

| Investment | Trigger |
|---|---|
| Accounts | Users generate a scenario link and return to it repeatedly within 30 days |
| Database | Manual handling of qualified opportunities exceeds several hours a week |
| Dashboard | Same user runs 3+ tools per session repeatedly and asks for a combined view |
| Cross-device reports | Same scenario link opened on two device classes |
| Personalization | Vertical defaults overridden in a consistent direction |
| CRM automation | Qualified inbound outgrows a spreadsheet and calendar |
| Paid data | A decision repeatedly blocked by unsourceable data |
| Paid analytics | Free-tier event limits actually hit |

---

## 11. Next three sessions

1. Done 23 Sep 2026: `CLAUDE.md` and `docs/` committed, change log appended,
   `SHIPPING.md` approved, 1-12 conflict resolved, doctrine v1.2.
2. Done S22: 11B TCO closed on production.
3. Done S22 on the branch: research Stage 2, the CCaaS integrity freeze. Merge and
   verify on production.
4. Done S22: Business Case Builder 11B retrofit, live and verified. 1-09 and WS1 closed.
5. Done S22: reachability batch. 8-04 and the Sprinklr slug (0-03) were already fixed
   in an earlier change and are live: all 283 vendor pages carry their own name as title
   (production spot check `sprinklr-iva`, `genesys-acd`), 429 URLs with no duplicate
   title or description. Homepage and Vendors counts already derive from data. The one
   survivor was the site-wide Organization JSON-LD in `App.jsx` ("283 vendors scored.
   30 free tools."); now derived, and `seo.test.mjs` E-surfaces gate it.
6. Done S22: V3 program step 1. Retired Service Design, Experience Scorecard, Integration
   Planner; Agent Experience and Calibration Drift removed as standalone tools. Each path
   301s at the edge (`vercel.json`) and in the app (`LegacyRedirect`) to cx-maturity,
   cost-per-contact, `/vendors`, attrition-cost and qa-scorecard. Removed from the
   sitemap (424 URLs), `SEO_MAP`, How to Choose and every inbound link (13 files
   repointed). 25 tools. `seo.test.mjs` R1 to R6 gate each retirement; E9 no longer
   counts redirect routes. Doctrine v1.3 carries both standards. Attrition's coaching
   driver now points to QA Scorecard; its Agent Experience content returns in step 3 as
   Attrition's root-cause layer, and Calibration Drift as QA's calibration module.
7. Done S23: V3 program step 2, the floor, on all 16 non-rail tools. Live defects found
   and fixed on the way (all confirmed on production first):
   - Four WFM tools (Forecast, Occupancy, Schedule Adherence, Shrinkage) rendered a
     blank page for every user who passed the email gate: PDF blocks read variables
     that did not exist. Hotfix PR #7.
   - License Gap, a V3 rail tool, rendered a blank page for every visitor since the
     initial import (`evLabel` missing from a destructure). Hotfix PR #8.
   - CX IT Alignment, Governance Model and Roadmap Builder crashed on their results
     page (PDF blocks read `DIMS`, `dimScore`, `overallScore`, `phases`, none defined).
   - CX Maturity and AI Readiness PDFs printed "undefined" for the tier.
   - Schedule Adherence's Erlang C dropped the 1/(1-rho) factor (C(2,1) printed 1/6,
     true value 1/3), overstating service level; now the Erlang B recurrence, the same
     form Staffing uses.
   - Forecast Accuracy's default "actuals" came from Math.random on every load and
     printed in the PDF as the reader's data; now a deterministic sample, labelled.
   - Roadmap told users their roadmap "has been sent to your email" (it went to TB's
     Formspree). Contract Risk promised "we will receive your flagged terms" from a
     silent post. Both now route through the review request, which carries them.
   Floor delivered: no email gate on any tool, no tool posts to Formspree itself
   (only the ReportActions review request does), ReportActions and scenario links on
   all 25, the scenario read on first paint, `type.js` everywhere, input guards
   disclosed on the five calculators, answers outside the scale dropped on the
   frameworks, 16 journey nodes (25 total) with six rail edges into them, Vendor
   Match method disclosure on page and in the PDF, lazy route retry and a route error
   boundary. `floor.test.mjs` bundles and server-renders every tool with defaults,
   its sample and hostile links, with ReportActions swapped for a probe that prints
   every PDF and review field, so a crash or a NaN, Infinity or undefined headed for a
   PDF fails the suite. Suite 19,246 green. Browser check: 48 runs clean.
8. Done S23: V3 program step 3a, V3-Framework for CX Maturity and AI Readiness.
   - `src/lib/rubric.js` is the one scoring engine (engine markers); rubrics are data in
     `src/lib/rubrics/` (registry `index.js`). Answer keys unchanged, so old links open.
   - Output adds an action checklist (every statement answered at 2 or below, weakest
     dimension first) and a named next diagnostic (the weakest dimension's journey tool).
     Replaces the two unpublished dimension-to-tool maps.
   - Published rubric pages `/methodology/cx-maturity` and `/methodology/ai-readiness`
     render from the same objects the engine scores (`RubricPage.jsx`); linked from the
     intro, the results and the PDF Method section. Sitemap 426.
   - AI Readiness "Era" pattern had its own unpublished thresholds; now a published
     second band set. Copy softened where a self-assessment cannot claim it: CX
     "Leading" no longer says "competitive advantage"; AI "ready for autonomous AI
     agents" and "Readiness is no longer your constraint. Ambition is." restated as what
     the rubric maps to. Cut points unchanged.
   - `rubric.test.mjs` (259): engine sliced live and equal to the module; determinism;
     checklist completeness and order; traceability (every criterion moves its dimension,
     the overall score and its action); every band, pattern, action and diagnostic
     reachable; partial and invalid answers claim nothing; 20,000 answer sets per rubric
     equal the pre-rubric formulas read from git. Four engine mutants all killed.
9. S23: plan re-laid as phases A to G (section 12). Phase A item 1 and 3 on the
   branch: `.github/workflows/suite.yml` (suite and build on every PR and push to
   main) and `nightly.yml` (daily live check on production), and the committed live
   checker `scripts/live-check.mjs` (142 checks on production: every tool, sample and
   hostile links, their PDFs, the rubric pages; fails correctly on a dead origin).
10. Done S23: Phase A items 1 to 4 merged and running (PR #11). CI `suite` green on its
   first real runs; nightly live check triggered by hand on GitHub, 142 of 142.
11. Done S23: Phase A item 4, the visual audit (`scripts/visual-audit.mjs`, punch list
   in `docs/VISUAL_AUDIT.md`). Nothing overflows on a phone. Shared failures on every
   page: controls render in Arial (no font inheritance), inputs unnamed for screen
   readers (up to 64 per tool), most tap targets under 40px, 30 to 162 elements below
   12px per rail tool, WCAG AA contrast failures from translucent white text, no `<h1>`
   on floor tools, Georgia and the old homepage type pair. Copy: retired "survive a CFO"
   in Business Case, and "industry-leading", "best-in-class", "world-class",
   "seamless" in tools, vertical pages and vendor data.
12. Done S23: Phase B shared fixes (punch list section 1). One type family on every audited
   page; every field named (326 to 0); 44px touch targets; sub-12px text 1,415 to 11; contrast
   failures 2,031 to 762; h1 on every tool. Left for the aesthetic rebuild: ELECTRIC and status
   colours used as text (need text and fill variants), link tap targets, the 45 content pages
   still on DM Sans and Instrument Serif.
13. Done S23: Phase B shared tool frame (`src/lib/ToolShell.jsx`) on all 16 floor tools; gated in
   `floor.test.mjs` (frame present, exactly one h1 per render). Rail tools keep their own headers,
   same shape; fold them onto ToolShell in the aesthetic rebuild.
14. Done S23: Phase B rail debts. Scenario links can no longer reach an object's prototype; guarded money
   prints grouped and to the cent on every tool; FCR's PULLED badge ignores its own restored values;
   Attrition's void publishes no figure and no grade on page or PDF. The live checker now covers the nine
   rail tools' sample, hostile and PDF paths (195 checks, was 142); on its first run it found TCO printing
   "NaN% above cost per contact" on a hostile link (fixed, A/B neutral on 12,000 cases). TCO links now open
   on Overhead & Results. The checker retries a page whose result has not appeared yet.
15. **Next:** TB: make `suite` required on main; 11-01. Me: Phase C, frameworks on the rubric engine
   (Transformation Readiness, CX IT Alignment, Governance first).
Research Stage 1 waits on TB: the CCaaS corpus shared in S22 is an example. TB shares
the raw corpus and the category Research Strategy Handoff once all 40 to 50 CCaaS
vendors are complete, when the site-enhancement work starts.

Then the reachability batch.

Prove behavior first. Ration effort as strictly as money. Reachability precedes
rigor. Instrumentation precedes proof. Quality is the moat. Independence is the product.

---

## 12. V3 program for the non-rail tools (approved by TB, 23 Sep 2026, S22)

TB ruling: **Amendment 11 is a guideline, not a hard rule.** The goal is that a user's
first use of any tool builds enough trust to come back. Every tool reaches V3 before
demand evidence exists; order is by group, not by demand.

Standards (write into doctrine in the first program session): **V3-Full** for
calculators, **V3-Framework** for assessments, frameworks and procurement tools, as in
TB's 22 Sep handoff.

Measured S22: none of the 21 non-rail tools has engine markers, a harness,
ReportActions, scenario links, `track.js`, `type.js` or a journey node; 14 carry
dashes; each is 14 to 30 KB.

**Phased plan, S23 (supersedes the order below from step 3 on).** Steps 1 and 2 and
step 3a are done.
- **A. Guardrails:** CI suite on every PR, required on main; nightly production live
  check; committed live checker; visual audit of all 25 tools and the rubric pages on
  desktop and phone into a punch list; TB confirms events reach Vercel (11-01).
- **B. Shared quality:** accessibility on the shared parts (ReportActions labels,
  contrast, keyboard, error states); one shared tool layout applied to the 16 floor
  tools; rail debts (CPC corrected-dollar display, FCR pulled badge, Attrition live
  PDF, ReportActions `__proto__`).
- **C. Frameworks on the rubric engine:** Transformation Readiness, CX IT Alignment,
  Governance; QA Program with the calibration module; Platform Decision as the renewal
  gate; RFP and Contract Risk published criteria; Roadmap stays a planner with
  anonymous sequence capture.
- **D. WFM to V3-Full:** engine markers and harness pairs for AHT, Shrinkage, Occupancy,
  Forecast, Adherence; every constant sourced and registered or labelled; rail into
  Staffing with origin grades; Agent Experience folds into Attrition.
- **E. External proof:** a generated methodology page per calculator (formulas,
  sources, assumptions, worked example); reference fixtures (Erlang tables, textbook
  cases, tracker fixtures) pinned to the dollar; version stamps and a public changelog.
- **F. Practitioner validation:** skipped for now (TB, S23).
- **G. Gated on TB:** TCO marginal load, BCB benefit stream, disclosure page 12-06;
  research Stages 1 to 4 and Vendor Match V3.
- **Aesthetic rebuild (TB, S23):** the site is v1 visually and must not read as
  AI-generated. Scheduled after C and D, before E, once tool shapes settle. Starts from
  a brief: 3 to 5 reference sites TB wants to stand beside, then mockups, then one
  design system applied once.

Original order (steps 1 and 2 done):
1. Removals and verdict moves: retire Service Design, Experience Scorecard, Integration
   Planner; Agent Experience to Attrition and Calibration Drift to QA as 301s. Doctrine
   standards.
2. **V3 floor on every remaining tool at once**: ReportActions, scenario links,
   `tool_complete`, journey node with `nextFor`, `type.js`, no dashes, input domain
   guards disclosed, no gated output (settles 12-05, 11-05, 2-01). One `floor.test.mjs`
   gates every tool route. Commit a parameterized live PDF checker.
3. Deep V3 by shared shape: one rubric engine and harness template for assessments
   (CX Maturity and AI Readiness first, then Transformation Readiness, CX IT Alignment,
   Governance); WFM cluster to V3-Full with one harness template, publishing to Staffing
   with origin grades; procurement cluster (QA Program, Platform Decision Gate, RFP,
   Contract Risk with rails to License Gap and TCO).
4. Section H of the handoff (Vendor Match v2 on `VendorData.js`) is replaced by
   Vendor Match V3 under section 13. Interim only: ungate, disclose, cap the ceiling.

## 13. Research program operating law

Merged 23 Sep 2026 (S22) from TB's research `CLAUDE.md`. It governs research data,
vendor surfaces, Vendor Match and the Market Position Index. Sections 0 to 12 govern
the calculators and engineering. Where both speak, the stricter rule applies.

Read `docs/research/CCCX_Claude_Code_Master_Handoff_v1.0.md` (once landed; until then the claude.ai project) before changing data models, scoring logic, ranking logic, research ingestion, vendor pages, or Vendor Match.

### Product thesis

The Center of CX is a buyer decision-intelligence system, not a feature-comparison site.

The product must answer:
- what a platform can actually do;
- when that capability matters;
- what must be true for success;
- where and why the architecture or operating model breaks;
- whether implementation can mitigate the break;
- what that mitigation adds in services, cost, dependency, change burden and risk;
- who owns complexity after go-live;
- what evidence the buyer should demand;
- when another architecture becomes more rational.

Operating principle: **Research individually. Validate independently. Normalize collectively.**

### Authority order

When sources conflict, use this order:

1. User/project Research Operating Standard.
2. Latest category `Next-Phase Research Strategy Handoff`.
3. Latest category Master Research Corpus JSON.
4. `CCCX_Market_Position_Index_and_Tool_Separation_Rules_Addendum_1.docx` for public-surface/tool-separation rules.
5. Current Master Research Corpus XLSX for human audit.
6. Vendor readouts as narrative summaries only.
7. Phase 1 workbooks as historical baselines/hypothesis sources only.
8. Current source evidence used to validate claims.

Never allow a lower-authority artifact to silently override a higher-authority artifact.

### Current CCaaS checkpoint

- Schema: v1.0.
- Schema status: locked after three-vendor calibration.
- Current checkpoint: `PRODUCTION_COHORT2_DIALPAD_COMPLETE`.
- 12 vendors completed: 3 calibration + 5 Production Cohort 1 + 4 Production Cohort 2.
- Production Cohort 2 is 4/5 complete: Zoom, 8x8, Odigo, Dialpad.
- Cohort 2 vendor 5 is **not yet locked**. Do not infer or choose it in code.
- Phase 2 numeric ratings remain locked/unapplied.
- After vendor 5: run the required five-vendor normalization gate before any methodology/rating change.
- No schema change was approved for Dialpad.
- Do not silently change competitive-class status/definitions. In the current corpus, classes 001 to 003 are calibrated/locked; later classes may still carry draft metadata pending normalization.

### System of record

`CCaaS_Master_Research_Corpus_v1.0_Production_Cohort2_Dialpad_Complete.json` is authoritative.

The XLSX is the human audit/research workbook. Narrative markdown/readouts are secondary.

Do not scrape narrative output back into the corpus. Do not treat a UI-derived value as research evidence.

### Research genealogy

Preserve this chain:

**Phase 1 Baseline → Claim Migration Ledger → Evidence Ledger → Validated Finding → Rating/Score Delta → Published Decision Intelligence → Continuous Revalidation**

Phase 1 is never silently overwritten.

### Five decision layers must remain separate

Never collapse these into one uncontrolled score:

1. Product Capability
2. Evidence Confidence
3. Buyer Fit
4. Production / Operating Risk
5. Implementation / Change implications

**Unknown or unverified is not weak.** Missing public evidence raises proof burden; it does not become a capability penalty.

### Competitive-class law

Do not force unlike vendors into a universal peer set. Enterprise suites, programmable/hyperscaler platforms, unified-stack midmarket vendors, sovereignty-led platforms, resilience/orchestration specialists, regional platforms and migration-centric products can solve different primary jobs.

Class assignment is context for comparison, not a hidden quality score.

### Three truth surfaces, hard separation

#### Market Position Index = market truth
Answers: who is established in this market, what do they sell, and how did they get here?

#### Vendor Intelligence = research truth
Answers: what is the platform, what can it do, where does it break, what does it take to implement and own?

#### Vendor Match = buyer truth
Answers: which platforms are rational for this buyer, in what order, and what is the buyer signing up for?

#### Absolute separation law
- Market Position values, components, bands and ordinals must never feed Vendor Match.
- Vendor Match outputs must never feed Market Position.
- Phase 1 scores never feed Vendor Match.
- Score-delta governance records never feed Vendor Match.
- Facts may be reused only when independently represented as atomic current claims with their own evidence.
- Pass facts across tools, never another tool's verdict/rank/recommendation.
- Every new tool declares one truth type. If it produces two truth types, treat it as two tools.

### Market Position Index rules

The index uses five presence dimensions, each 0 to 4, equally weighted:
- Market Footprint
- Customer Evidence
- Product and Solution Breadth
- Ecosystem and Interoperability
- Commercial and Operating Maturity

Rules:
- scope ranking to competitive class;
- show five components and dates;
- no composite decimal score presented as a buying verdict;
- where component sums differ by one point or less, show a tied position;
- use position bands;
- publish methodology, inputs, exclusions, refresh cadence and known limitations;
- disclose that four of five dimensions correlate with company scale;
- analyst inclusion may be displayed as a dated fact but never scored;
- never use estimated market share, analyst placements, star ratings/review averages, review text, sponsorship/commercial relationships, web traffic/social following, Vendor Match output, buyer-session data or Phase 2 atomic capability findings as index inputs.

The current workbook's `31_MARKET_POSITION_CAPTURE` has no populated records. Do not fabricate them.

### Evidence ingestion rules

Every ingested artifact must carry:
- source/evidence tier;
- retrieval/session date;
- confidentiality state;
- publication-permission state.

If confidentiality has not been determined, treat the artifact as confidential.

Evidence is a separate reusable object. Claims and evidence have a many-to-many relationship.

Public product/technical docs can support current capability claims. Marketing collateral creates vendor-stated claims and questions. Private demos/briefings, RFP/RFI responses, buyer transcripts and field intelligence have restricted publication rules. Never publish confidential material or private-source claims without permitted corroboration.

Nothing ingested changes an existing rating until it has passed through claim migration/evidence validation and the appropriate completion/normalization governance.

### Research state rules

Explicitly preserve maturity states such as:
- Preview
- Beta
- Early Access / EAP
- GA
- current marketed state where GA is not established

Do not award GA/production credit to roadmap or Early Access functionality.

### Vendor completion

A vendor is not complete because a narrative exists. Current CCaaS requires the locked 20/20 completion gate. No score/rating or market-facing current-state change should publish before completion.

### Schema/change governance

Do not change the schema because one vendor is awkward.

Schema/framework changes:
- happen only at calibration or normalization gates;
- are versioned;
- identify every prior record needing back-application;
- preserve previous definitions and score lineage.

Build derived view models if the UI needs another shape. Do not mutate the authoritative corpus schema merely for presentation convenience.

### Build architecture expectations

Prefer:
- immutable/raw current corpus input;
- schema validation at ingestion;
- derived selectors/view models per truth surface;
- explicit field-consumer permissions;
- stale/refresh-state handling;
- publishability/confidentiality filtering;
- source/evidence drill-through;
- competitive-class-aware comparison;
- deterministic rail tests preventing verdict leakage.

Do not:
- hard-code a universal vendor ranking;
- convert null/unknown/unverified into zero;
- average structural risks away;
- use company size as a shortcut for buyer fit;
- infer missing evidence;
- silently normalize IDs or rewrite historical records;
- expose confidential/non-publishable evidence on public surfaces.

### Required automated acceptance tests

At minimum test that:
1. Vendor Match cannot import/read any Market Position value, component, band or ordinal.
2. Market Position computation receives no Vendor Match/session output.
3. Phase 1 baseline fields cannot become current match inputs.
4. Score-delta records cannot become buyer-fit inputs.
5. Evidence Confidence remains separate from capability/fit.
6. Unknown/unverified does not coerce to weak/zero.
7. Competitive class is applied before peer ordering/comparison.
8. Stale material claims are flagged.
9. Non-publishable/confidential evidence cannot render publicly.
10. Preview/Beta/EAP state is preserved and cannot render as GA.
11. Durable IDs remain stable through transformations.
12. Schema version is checked before ingest.
13. Completion-gate state is checked before current vendor publication.
14. Phase 2 numeric ratings do not render while `phase2_ratings_locked=true`.
15. Index near-ties are displayed as ties.
16. Every index component/rating and material vendor claim can expose a last-validated date.
17. No analyst ranking/review content is reproduced into scoring or public research.
18. New tools declare truth type and their allowed incoming data rail.

### Category execution order

1. CCaaS
2. IVA + Conversational AI
3. Agent Assist
4. WFM/QM
5. Experience Analytics + VoC
6. CX Orchestration + Workflow
7. Digital Engagement
8. Payments, Identity & Trust

Do not force one category's criteria or scoring model onto another category. Reuse the research control system, not the category-specific decision logic.

### Before coding

First report:
- which authority files you read;
- the current checkpoint/schema version;
- which truth surface the requested feature belongs to;
- which corpus fields it may read;
- what it must not read;
- whether any proposed change is presentation-only or a methodology/schema change;
- what tests will prove separation and lineage are preserved.

If a requested code change appears to require a research-methodology or schema change, stop and flag it rather than silently implementing it.
