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

**Audience goal (TB, S23):** 100,000 people. For now the site stands on published sources to build trust, users,
data, feedback and a large community; the long-term aim is to create and own original research.

**Never plagiarize (TB, S23).** Content that is not our own is sourced. A quotation is quoted and credited with a link;
a paraphrase of someone else's finding is cited; everything else is written in our own words. Every converted page
carries an originality record (`src/lib/claims/originality.js`).

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
| `src/lib/type.js` | see git (S24: IBM Plex, redesign Phase 2) |
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
- **Decided S23 (TB):** BCB baseline evidence. One question, "Where do your baselines come from?" (our defaults,
  your estimate, a system report, a system report attested by checkbox), graded Directional, Planning-grade,
  Planning-grade, Finance-grade; a rail-pulled baseline grades by its origin (`railEvidence`). Closes the gap where the
  benefit stream could grade Finance-grade on default AHT, FCR, volume and wage. See section 11, P3.

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
| WS1 | V3 engine integrity, nine rail tools | Closed S22. 1-09 walk complete, all nine on production. Benefit-stream baseline evidence built S23 (P3 9) |
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
industry-leading, best-in-class, world-class, seamless. **No em-dashes or en-dashes** anywhere: prose, copy,
comments, commit messages. `copy.test.mjs` enforces both on every tracked text file (13-03 closed S23). No antithetical "X not Y" cadence in
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
  the literal. **F2 done S24 (TB: start at zero):** `MECH_INITIAL` is "none"; AI Deflection and Channel Shift withhold
  their decision until an action is chosen (item 83).
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
- **J11:** one wage, `market.wage.agent` BLS $21.53 median hourly (OEWS May 2025, released 15 May 2026, USDL-26-0725,
  SOC 43-4051; was $20.59, May 2024, until 28 Sep 2026). Label it May 2025, never "May 2026 wages" (TB). Mean $22.40 an
  hour, $46,590 a year, employment 2,595,750, for reference; the tools use the median.
  TCO industry wages are heuristics, never presented as medians.
- TCO sources paragraph is generated from the registry. Balto/Parloa/Teneo containment
  and the $19 "BLS" wage claims are retired and pinned dead.
- TCO to AID journey edge added. TCO order: license gap, AI deflection, business case.

**Security (TB, S23)**
- Every security finding gets the full `SECURITY.md` protocol: confirm and size, fix at the sink with the safe default,
  sweep for siblings, add a second layer, gate it with a harness and a static rule proven to fire, verify on production,
  record. The fix ships before any public detail. `security.test.mjs` and the live checker's policy checks stay green.
- A new external host (script, font, API) must be added to the policy in `vercel.json` in the same change, or it is
  blocked in production and `security.test.mjs` fails.

**TB decisions, 25 Sep 2026 (S23)**
- **TCO marginal load (Path B):** deflection and repeat savings value at the shared `load.marginal` 1.18 (J10), not
  the benefits load. One disclosure line: capturing the saving by not backfilling seats removes benefits too, about
  10% more. Unit costs stay on the loaded rate. A/B: only the savings figures move.
- **BCB baseline evidence:** one question graded per the section 2 note.
- **Market Position Index (Path 3):** ranking only inside competitive class; a category-wide map of class by position
  band with no order, no rank and no composite. Presentation only; separation law unchanged. Build at Stage 5.
- **CCaaS-by-industry pages:** a concept build; rebuild at research Stage 3. Until then noindex (like the other 70
  category-by-vertical pages), still live for visitors.
- **Distribution:** omni-channel (owned site and newsletter, social, earned, product-led), one research asset per week
  reused everywhere, free channels only, UTM convention and PostHog funnels first.
- **Design:** a separate design chat, briefed by `docs/DESIGN_HANDOFF.md`.

**Vendor introductions (TB, S24)**
- Wherever a vendor appears, the reader can ask for an introduction; it is part of lead generation and monetization.
  One component (`VendorIntro`, `VendorIntroLink`), one link format (`introHref`), one event (`vendor_action` intro,
  `intro_submit`). An introduction never changes a list's order, a score or a research finding.

**Contributors and Market Watch (TB, S24, 27 Sep)**
- D3 contributor rules approved as drafted. Perspectives never feed research, grades, tools or Vendor Match.
- Market Watch items are researched by us from primary pages, labelled verified, news or vendor-supplied, written in our
  own words (no shared run of 8 words with the source), facts only, at most two items per vendor in a set.

**Vendor tags (TB, S24, 27 Sep)**
- Be as comprehensive as possible: show a tag when the research supports it for any buyer, and caveat every intricacy
  (US public sector, government, region, separate offer, selective use) on the tag itself. A scope that limits a tag to one
  kind of buyer goes in the tag's label. Every tag and caveat cites its published records and is checked by a harness.
  Tags describe; they never order, grade or feed Vendor Match until V3 (Stage 4) takes them as buyer filters.

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
- ~~TCO publishes `analystRead`, a verdict on the rail.~~ Fixed S24: the rail refuses verdict keys (item 77).
- ~~TCO `marginalPerContact` uses 1.30x.~~ Moved to `load.marginal` 1.18 S23 (P3 10). ~~TCO's AHT lever and BCB's derived
  marginal at the loaded rate.~~ Moved S24 (TB: go): TCO method 1.4, Business Case method 1.3 (item 99).
- Every rail publisher sends origin grades: TCO, AHT Decomposition, Shrinkage and Occupancy per field; Staffing, CPC, FCR,
  AID and Channel at their evidence grade (S24, item 79).
- ~~CPC, Channel, FCR, AID still pull via `getPrimitiveWithSource`.~~ Fixed S24 (item 78): every pull is external.
- ~~FCR PULLED badge reads `getPrimitive`.~~ Fixed S23: the badge fires only on a value another tool produced.
- ~~Attrition live PDFs never pulled; local `boundAxes`.~~ Fixed S23: pulled and reconciled (29 of 29 figures,
  normal and Finance-grade); the void now publishes no figure (it printed `$∞` and a grade); shared `boundAxes`.

**Live defects**
- ~~`guardVal` money rendering in CPC.~~ Fixed S23: `money()` in `guards.js` (grouped, to the cent); set G pins it.
- ~~8-04 vendor titles, Sprinklr duplicate slug, homepage methodology claim.~~ Fixed (item 5; method pages published in E1).
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
- ~~BCB publishes `analystRead` and `confidence` on the rail.~~ Fixed S24 (item 77). BCB next steps are a hardcoded list,
  not `nextFor` (3-03).
- ~~`scenarioUrl` `__proto__` assignment.~~ Fixed S23: a link could swap a decoded state's prototype; unsafe names
  are now dropped in both directions (`track.test.mjs` M). `track.js` was already allowlisted.
- ~~`ReportExport.jsx` wrote section strings into the PDF window as raw HTML.~~ Fixed S23: a crafted scenario link could
  put markup into user text (criterion names, roadmap items, RFP lines) that ran in the same-origin report window.
  `reportHtml` is now pure and escapes every field; no tool used markup in PDF strings (37 reports scanned).
  `export.test.mjs` attacks every section type and cover field and checks every interpolation.
- ~~`ReportActions` `Field` labels unbound.~~ Bound (`useId`); the S24 axe audit found none unbound.
- ~~A failed lazy route chunk leaves the tool blank.~~ Fixed S23: one retry, one
  reload per session, then a route error boundary with a reload link.
- Non-rail tools carry floor only: no engine markers, harness pairs, claim-class
  language review or registry constants yet (step 3). Heuristics named in copy where
  seen (Occupancy multipliers, AHT reduction factors, adherence abandonment steps).
- ~~Occupancy 0.15 turnover factor, AHT benchmark ranges, Contract Risk "40-100%".~~ Retired in Phases C and D.
- ~~Staffing's solver started at ceil(A)+1 and could report one agent more on a fractional load.~~ Fixed S23 in the
  Phase D rail step (starts at floor(A)+1; A/B in `wfmrail.test.mjs`).
- ~~TCO guard case: marginal above cost per contact unflagged; "void" wording.~~ Fixed S24 (item 80, method 1.2).

**Test infrastructure**
- `channel.report.mjs` UNPARSED once in session 20, not reproducible. UNPARSED is
  always failure.
- `chunk.test.mjs` imports `vite`: `npm install` before the suite.
- `rail-audit.mjs` writes `.rail-audit-metrics.mjs` at repo root every run and never
  removes it. Covered by `.gitignore`.
- ~~Root file `download`.~~ Archived S24 (TB: archive, do not delete): `docs/archive/root-download.txt` with a README.

**TB actions outstanding**
- ~~11-01: verify custom events reach Vercel dashboard on Hobby.~~ Settled S23: Vercel Hobby has no custom events. PostHog
  is the event source of truth (production bundle carries `VITE_POSTHOG_KEY`; `track.js` sends every tool event there);
  Vercel Analytics counts page views only.
- ~~Make `suite` required on main.~~ Done S23 by TB: classic branch protection on `main`, PR required (no approval
  count), `suite` required and up to date, linear history off (merge commits), no bypass lock. Verified: `main`
  reports protected.
- Disclosure page (12-06): TB, S23: no disclosure text wanted; the site states facts and perspective only.

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
- Decided S23 (TB): Market Position Index Path 3, class-scoped ranking plus a category-wide map with no order.

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
15. Done S23: Phase C step 1, Transformation Readiness on the rubric engine: published rubric at
   `/methodology/transformation-readiness` (sitemap 427), action checklist, next diagnostic per weakest
   dimension. Cut points unchanged (20,000 answer sets equal the legacy formula, bands and every
   dimension flag); the unpublished Close/Monitor thresholds are now stated on their bands. Technical
   Readiness now routes to Platform Decision (was `/vendors`, not a diagnostic). Strong no longer says
   "Execute with confidence". Open: the rubric's next diagnostic and ReportActions' journey list can
   name different tools on the same page (also CX Maturity, AI Readiness); settle in 3-02.
16. Done S23: Phase C step 2, CX IT Alignment on the rubric engine (TB approved the rule). New paired kind,
   `scorePaired` in `src/lib/rubric.js`: a pair scores its CX to IT gap; bands and every area gap equal the
   legacy formula on 20,000 answer sets. Published rule: a pair 2+ points apart is misaligned, a pair at 2 or
   below on both sides is a shared weakness; both reach the checklist. Published at `/methodology/cx-it-alignment`
   (sitemap 428). Intro now recommends two respondents via the scenario link. Removed false "profile has been
   saved" copy in CX IT and Governance.
17. Done S23: Phase C step 3, Governance & Operating Model on its own engine (TB approved the design).
   `src/lib/ownership.js` (engine markers) reads the model in `src/lib/rubrics/governance.js`: one accountable
   role and one optional contributor per decision; no score. Six published rules: unowned (critical); function
   missing (high on five control and budget decisions, medium otherwise); bottleneck at twice an even share
   (10 of 30 across six roles; replaces the unpublished "more than 8"); influence without authority (5+
   contributing, 0 accountable); fragmented domain (4+ owners); different from the common pattern (confirm).
   Risk & Compliance appended as a sixth role so old links keep every assignment. Next diagnostic: CX IT
   Alignment when half the serious findings sit in strategy or technology, else Roadmap. Published at
   `/methodology/governance-model` (sitemap 429). `ownership.test.mjs` (46): every rule equals an oracle on
   20,000 maps; legacy counts and item list frozen. Phase C frameworks trio done.
18. Done S23: live checker reports every hostile outcome (result, start screen or blocked notice; none skipped). QA
   Scorecard defects fixed: Yes/No selection now shows, no score until every criterion is marked, bands labelled
   unsourced defaults. Suite 19,931.
19. Done S23: Phase C step 4, QA Scorecard on its own engine (TB approved the design). `src/lib/qa.js` (engine markers)
   reads `src/lib/rubrics/qaScorecard.js`. Form checks: weights total 100 and no empty category (critical); every
   criterion defined and every auto-fail names a legal, regulatory, security or customer-harm reason (high); one
   non-critical criterion swinging more than 15 points (medium, heuristic); focus mix shown as a fact, no threshold.
   Blind calibration (TB rule): each evaluator sees only their own score and sends a plain-text code (form
   fingerprint, initials, call, marks); nothing is compared until every evaluator has scored every call. The Center
   of CX Calibration Method 1.0 (our combination, cited): Krippendorff's alpha on scores (interval) and marks
   (nominal), Gwet's AC1 on critical fails (kappa paradox), percent agreement beside each, seeded 95% bootstrap
   intervals; Krippendorff 2004 cut points 0.800 and 0.667, applied to AC1 and disclosed; interval across a line is
   inconclusive; under 3 calls not graded. Heuristics labelled: bias 5, spread 5, item agreement 80%, critical load
   50%. Optional reference evaluator for accuracy. Next step: fix the form, calibrate, calibrate again, then FCR
   Leakage. Published at `/methodology/qa-scorecard` (sitemap 430). `qa.test.mjs` (97): alpha pinned to Krippendorff
   (2011) 0.743 and 0.849, AC1 to the paradox table 0.890 (kappa -0.053), brute-force oracles, blind rule, every
   rule, old links, 4 mutants killed.
20. Done S23: the report renderer escapes every field (`reportHtml`, `export.test.mjs`). Closes the scenario-link markup
   injection into the same-origin report window found during step 4. Suite 20,044.
21. Done S23: security hardening and a standing protocol (`SECURITY.md`, TB: a complete solution whenever a security
   problem is found). Site-wide Content Security Policy in `vercel.json` (scripts from the site only, no inline or
   eval, hosts limited to fonts, PostHog and Formspree), nosniff, DENY framing, referrer and permissions policies. The
   report window carries its own `script-src 'none'` policy, its print button is wired from the site and its opener is
   cut. `security.test.mjs` (29) gates headers, allowed hosts both ways, HTML sinks, the report window, new-tab links and
   committed secrets. The live checker fails on any policy violation and checks the served headers; `INJECT_HEADERS=1`
   runs it locally under the production policy (209 of 209; all 430 sitemap pages clean). QA calibration flow made
   explicit (TB could not tell where codes come from): four steps, an evaluator link that opens at step 3, add-my-code,
   a sample session, and rejection text that says where codes come from.
22. Done S23: Phase C step 5, Platform Decision as the renewal gate (TB approved the six-point design). `src/lib/renewal.js`
   (engine markers) reads `src/lib/rubrics/platformDecision.js` (truth type: the buyer's own view; reads no vendor
   research or score). Per need: rating 1 to 5 or don't know, how it is known (production or vendor), and whether it
   matters (must, nice, not needed). No averaging: a must-have at 2 or below is a gap; don't know is a proof request,
   never a gap; not needed drops out. Layer outcome: renew, renew with conditions, add a specialist (half or more
   must-haves are gaps, non-core layer), test the market (same on a core layer: Routing, Conversation). Gate: renew,
   renew with conditions, run an evaluation (a core market test or 3+ specialists). Clock: under 6 months to notice
   cannot evaluate, under 3 cannot negotiate, unknown exit terms, long term with open conditions (all heuristics
   labelled). Negotiation checklist in the PDF. Next: Contract Risk, RFP Builder or TCO. Old links keep every rating as
   must-have seen in production; the legacy sample now surfaces 14 must-have gaps the average hid. Journey no longer
   routes to the Phase 1 Vendor Match; the "ranked vendor shortlist" promise and "50 scored IVA vendors" are gone.
   Published at `/methodology/platform-decision` (sitemap 431). `renewal.test.mjs` (83): oracle on 20,000 answer sets,
   the no-average, unknown-is-not-weak, not-needed and monotonic laws, reachability, old and hostile links, 4 mutants.
   GitHub nightly on production after PR #22: green, headers and policy included. A 502 seen from the sandbox was its
   own egress (curl got no HTTP response on 11 of 40 tries; GitHub runners saw none).
23. Done S23: Phase C steps 6 and 7, the procurement pair (TB approved all eight points; TB: facts and perspective only,
   the buyer decides, no steering, no disclosure text wanted).
   - Contract Risk on `src/lib/terms.js` + `src/lib/rubrics/contractRisk.js`: 13 clauses (7 kept with their answers, so
     old links open; new: price at renewal, liability cap, AI use of your data, security and residency, assignment,
     transition help). Every option has a published severity and reason; "don't know" on every clause is a find item,
     never a pass. Published reading: any critical, do not sign as written; any high, negotiate; any unknown, find the
     missing clauses; any medium, acceptable with notes; else clear. Unsourced figures (15 to 30%, 40 to 100%, "most
     common tactic", "walk", "non-negotiable") retired; negotiation figures labelled as positions from practice; uptime
     minutes are arithmetic. Next: License Gap, Platform Decision or TCO. `terms.test.mjs` (77).
   - RFP Builder on `src/lib/rfp.js` + `src/lib/rubrics/rfpBuilder.js` (truth type: the buyer's requirements and their
     vendors' responses; any vendor can be entered, on the site or not). Response scorer: only generally available earns
     full credit, preview and roadmap earn none, partner 0.5 (labelled default), unanswered is a clarification never a
     zero, a must-have claim stays to verify until seen in the demo. Analyst read: unmet and not-GA must-haves, partner
     ownership, clarifications, demo script, add-ons to price, where the choice is decided, layers no vendor covers,
     ties within 5 points (heuristic). Order only among the vendors entered. Next move: Vendor Match as a starting list
     (the bridge), Platform Decision, License Gap or Contract Risk; consultant path and review request carry the lead.
     Fixed: a link dropped the Healthcare and Government tags, so HIPAA and FedRAMP vanished on reopen. Scenario links
     pack responses one character per requirement (worst case 6 vendors, 1,531 characters). `rfp.test.mjs` (62).
   Published at `/methodology/contract-risk` and `/methodology/rfp-builder` (sitemap 433). Phase C is complete except
   Roadmap (stays a planner). Suite 20,320; local live check under the production policy 212 of 212.
24. Done S23: Phase D step 1, Occupancy Risk Simulator to V3-Full (TB approved six calls; TB: keep sourcing calls short,
   implication plus recommendation). Engine `src/lib/occupancy.js` (markers, constants injected); four heuristics
   registered (`occ.attrition.mult.caution` 1.15, `occ.attrition.mult.critical` 1.40, `occ.hours.week` 40,
   `occ.hours.year` 2080) plus shared `load.benefits` and `market.wage.agent`. One attrition model (the invented 0.15
   formula, which contradicted the ladder, is gone); shared occupancy bands (was 80/85/88/92); target occupancy is an
   input (default 85); staffing cost carries the 1.30 benefits load; default wage is the BLS $20.59; training weeks
   now price the ramp (replacement cost = hire + loaded ramp wages); tenure input removed; unsourced claims retired
   ("82 to 86% most efficient", "15 to 40%", "6 months", "it usually is"). Opening case changed to 440 calls an hour
   (88%, caution band); the old default opened at 24%. At that case reaching 85% costs about $111K a year against
   about $34K of modelled attrition, the opposite of the retired copy. First generated calculator method page
   (`CalcPage`, kind `calc`): formulas in words, bands, every constant with its kind and source, and a worked example
   computed by the engine at the tool's defaults. `/methodology/occupancy-risk` (sitemap 434). `occupancy.test.mjs` (34):
   oracle on 20,000 cases, A/B equal to the previous tool on occupancy, ladder, idle time and attrition (10,000 cases),
   laws, dollar fixture, registry, 4 mutants. `occupancy.report.mjs` (34): PDF reconciled to the engine on four links.
   The rail into Staffing (occupancy target to Staffing's cap, shrinkage and AHT) is one step after all five engines.
25. Done S23: Phase D step 2, Shrinkage Planner to V3-Full (TB approved six calls). Engine `src/lib/shrinkage.js`; PTO is
   planned; agents to schedule = need ÷ (1 − shrinkage) rounded up; paid time off the queue at the loaded BLS wage (wages
   already paid, never a saving) replaces "Annual Cost of Gap"; one point sized; unsourced claims and the $18 wage retired.
   Shared registry entries: `shrinkage.range.low/high` (the 28 to 35% planning range, labelled heuristic, also Staffing's
   flag) and `time.hours.week/year` (Occupancy repointed). Float noise ("28.000000000000004") is now bad text in the
   Shrinkage report harness, `floor.test.mjs` and the live checker. Chunk gate re-based with attribution (see its
   comment). `/methodology/shrinkage-planner` (sitemap 435). `shrinkage.test.mjs` 34, `shrinkage.report.mjs` 44.
26. Done S23: Phase D step 3, AHT Decomposition to V3-Full (TB approved six calls). Engine `src/lib/aht.js`; time outside the
   conversation is a fact (never "reducible"); share ranges and reducibility ratings retired; seven lever shares registered
   (`aht.lever.*`), editable, counted only when selected, compounding on a shared component; the unreachable 90% talk floor
   removed; contacts per month gives agent hours as capacity. `/methodology/aht-decomposition` (sitemap 436).
   `aht.test.mjs` 35, `aht.report.mjs` 39.
27. Done S23: Phase D step 4, Forecast Accuracy to V3-Full (TB approved six calls). Engine `src/lib/forecast.js`; interval
   accuracy (1 minus WAPE) leads, since total-volume accuracy lets interval errors cancel (a 20% miss every interval scored
   99.8% "Excellent"); MAPE beside it; misses ranked by contacts; tracking signal against the cited plus or minus 4
   (`forecast.ts.limit`); unsourced grades retired; optional AHT gives workload hours and agents busy. `CalcPage` example
   note. `/methodology/forecast-accuracy` (sitemap 437). `forecast.test.mjs` 32, `forecast.report.mjs` 37.
28. Done S23: Phase D step 5, Schedule Adherence to V3-Full (TB approved six calls). Engine `src/lib/adherence.js`; opening
   case 820 calls an hour (the old one printed 100% service level everywhere); stepped abandonment retired; overtime prices
   the agents needed to hold the target over entered open hours and days; FLSA multiplier registered (`adh.ot.multiplier`);
   Erlang C pinned to published tables and agrees with Staffing's solver. `/methodology/schedule-adherence` (sitemap 438).
   `adherence.test.mjs` 37, `adherence.report.mjs` 35. All five WFM engines done.
29. Done S23: Phase D rail step (TB approved five calls). AHT Decomposition (today's handle time), Shrinkage Planner
   (total) and Occupancy Risk (target as occupancy ceiling) publish with origin grades: Directional at an example or
   corrected input, Planning-grade once the reader's own. Staffing reads them once at mount, a scenario link outranks
   the rail, pulled fields are badged with their source, and a pulled driver grades by railEvidence(origin) while held.
   Staffing's solver starts at floor(A)+1 (1,297 of 20,000 random queues moved down one agent, about 0.2% at 70 to 90%
   targets). Rail audit no longer credits a member access (v.target) with v's keys. `wfmrail.test.mjs` 34. Phase D done.
30. Done S23: Phase E1, published method pages for the nine rail calculators (TB: keep formulas public; the repo stays
   public for now, since GitHub Free drops branch protection on private repos). `/methodology/<tool>` for Staffing, CPC,
   Channel Shift, FCR Leakage, AI Deflection, TCO, License Gap, Attrition and Business Case (sitemap 447). Engines stay in
   the tool files; each model in `src/lib/rubrics/<tool>Model.js` carries pins and `methods.test.mjs` (101) recomputes them
   from the tool's own engine (Staffing also pins Nextiva's published 68/98/84.0% case). Tool page and PDF link the method.
   Attrition and Business Case read no registry: all constants registered (`attrition.*`, `bcb.*`), both open on the BLS
   wage and shared benefits load (J10, J11): Attrition $38,000 to $42,827 and 28% to 30%, Business Case $18 to $20.59.
   A/B 20,000 cases each, equal inputs equal figures and grades; fixtures pinned at their verified inputs. Retired
   unsourced copy: Attrition "published 40-60% band" and "$10-20K reference", Business Case "most centers achieve" and
   "15 to 25% is realistic". Suite 20,934.
31. Done S23: Phase E2, reference fixtures. `src/lib/fixtures.js` lists cases whose answer is known outside the site,
   each marked published, derivation or reconciled: Erlang C at 10 Erlangs (0.6821 to 0.1741), 1 Erlang on 2 agents by
   hand (1/3), 80/20 at 10 Erlangs (14 agents), Nextiva (68, 98, 84.0%), Krippendorff (2011) alpha 0.743 and 0.849, a
   WAPE case whose errors cancel, the tracker fixture. `fixtures.test.mjs` (16) computes each with the shipped engine
   (Staffing and Adherence Erlang C both, plus an independent factorial oracle); method pages print them under
   "Checked against".
32. Done S23: Phase E3, version stamps and the public changelog. `src/lib/methodVersions.js` (checked equal to every
   model by `methods.test.mjs`); ReportActions prints "Method 1.0, published ..." with the method and changelog links on
   every tool with a published method, and the PDF cover carries it. AI Deflection's "3.1" and Staffing and TCO's
   private version strings retired to the shared table. `/changelog` (sitemap 448) from `src/lib/changelog.js`: method
   changes only (TB), starting with the Phase D rebuild; each method page lists its own changes. Chunk gate re-based
   with attribution (routes and SEO for 13 pages). Suite 20,968; local live check 227 of 227.
33. Done S23: full site scan part 1. All 1,437 dashes removed (13-03 closed) and 41 superlatives retired from public
   copy; `copy.test.mjs` gates both on every tracked text file.
34. Done S23: full site scan part 2, the integrity freeze on every category (TB: yes). No Phase 1 score, tier, rank,
   quadrant, leaderboard or fit rating renders for the seven non-CCaaS categories: shared `Phase1Directory.jsx` on the
   category pages, `Phase1Badge` on the profiles, `researchStatus(category, slug)` and `phase1Label()`. CCaaS gap closed on
   the ten industry pages (they printed Genesys 94). Scored claims removed from SEO and copy. `freeze.test.mjs` section 7.
   Both open items settled in part 3.
35. Done S23: full site scan part 3 (TB approved three calls). CCaaS buyer guide page no longer shows the Phase 1 scoring
   model, tiers or fit table; both PDFs stay downloadable as dated Phase 1 editions (seo J). Industry-page statistics: 60
   cut to 16, each checked against its primary publisher; aggregator, vendor-blog, stale and uncited figures removed
   (Healthcare and Travel now show none, the strip hides); six sources link the publisher's own page. `copy.test.mjs`
   section 4 gates the sources. Unsourced figures inside tools relabelled as internal planning values and registered:
   AI Deflection source claims (only Gartner's 14% self-service resolution kept), FCR's "published 1.5x to 2x", BCB's
   "most centers", TCO's check lines, read lines and sensitivity bands (7 registry entries; A/B on 12,000 cases, figures
   and flag levels unchanged). Unused `ToolGate.jsx` deleted. Deferred to the aesthetic rebuild copy pass (TB): the
   "X, not Y" cadence (about 440 occurrences), page by page. Still open: unsourced figures in sub-vertical prose
   ("catches 95%", "40 to 60% of the time"); sub-vertical email gate removed (TB: yes, S23): the 61 frameworks open to everyone, reaching the results sends
   nothing, a copy button keeps the profile, and a labelled optional review request is the only send (`copy.test.mjs` 5).
   The Healthcare claims pilot is on local branch `claims-wip` and was reverted out of this PR; it returns by reverting
   the revert once its research lands (needs a session with the widened network policy).
36. Done S23 (on the branch): full site scan part 4, Healthcare research and originality pass. The pilot returned by reverting
   the revert. Egress: eCFR, PubMed (eutils), CMS, SQM Group and federalregister.gov read directly; bls.gov refuses curl and
   headless Chromium (Akamai 403) and the unregistered BLS API quota is spent from this IP, but WebFetch reaches bls.gov;
   hhs.gov, theacsi.org and Cochrane refuse. Every fact below was read on the publisher's own page (the SQM health insurance
   average from SQM's own chart image).
   - Claims model: `src/lib/claims.js`, `src/lib/claims/healthcare.js`, `ClaimText.jsx`, `claims/originality.js`,
     `claims.test.mjs` (in `run-all.mjs`). Kind `none` keeps the pre-scan figure as `draft` for lineage; it never renders.
   - Benchmark table: most pre-scan cells were SQM Group all-industry figures placed in healthcare cells, and its 52%
     healthcare FCR contradicts SQM's own 69% (health insurance, 2026 chart, range 51 to 91%). Now two columns: Healthcare
     (FCR 69% health insurance, the only published figure; the other five say "No public benchmark" and link the tool that
     measures yours) and All industries (SQM, each labelled with what it measures). Top quartile column removed (no public
     source for any cell). Intro rewritten to what the sources show; notes no longer compare. Industries hub card reads
     "69% FCR, health insurance".
   - Regulatory: HIPAA penalty was the 2009 statutory "$100 to $50,000"; now $145 to $73,011 per violation (45 CFR 102.3,
     2025 adjustment). Medicare Advantage grievance sentence was wrong: 30 days from receipt (extendable 14), 24 hours only
     for the two expedited kinds (42 CFR 422.564); the "72 hours" alert fell after the 24 hour limit.
   - Prose: reminders lower hospital non-attendance by 29% of baseline (Hasvold and Wootton 2011, 29 studies); 34.8% of
     primary care referral scheduling attempts ended in a documented appointment (Patel et al. 2018). Retired with no source:
     3.5 calls per scheduling need, 40% turnover, 20 to 30% referral leakage, 30% gone after two weeks, 30 to 50% admin
     workload, 60 to 70% tech check, 30 to 40% proactive updates. Four relabelled as planning assumptions.
   - All 24 sub-page KPI tiles: no public source for any healthcare segment; compact "No public benchmark, Measure yours"
     tiles; notes rewritten as drivers. CMS publishes Medicare plan call center hold time, disconnects and interpreter
     availability (Display Measures and Star Ratings technical notes); a labelled strip on the health insurance page is an
     option for TB, not built.
   - Originality: 668 segments, 62 exact-phrase searches, 24 pages compared: no shared run of 8 words. Three close
     paraphrases rewritten (Carevoyant superlative, uncited "4-6 systems", a trade cliche). Gate now also catches count
     ranges and counted nouns ("50-500 agents", "20 visits"); five more bare figures rewritten. Suite 21,412.
   - CMS strip (TB: yes): the health insurance page shows CMS test-call measures for Medicare plan call centers (hold
     0:32 against a 2:00 standard, 1.01% dropped against 5%, interpreter and TTY 97%), labelled as not handle time.
37. Done S23 (on the branch): full site scan part 4, the other nine industries (TB: go). One shared sub-page component
   (`src/lib/SubVerticalPage.jsx`; the ten industry files are wrappers). Nine research agents, one per industry, on one
   brief; the lead verified headline sources on the publisher's page and integrated. Every figure on all ten main pages,
   61 sub-pages and the hub cards is now a fact, a labelled assumption, an example, or "No public benchmark"
   (`claims.test.mjs` 2,748; suite 23,870; browser sweep 144 runs clean at desktop and phone).
   - Pattern across industries: the benchmark tables' industry cells were mostly SQM all-industry figures or unsourced;
     each industry now shows SQM's own 2026 chart figure where one exists (Retail 77, Telecom 56, Utilities 70, Insurance
     75, Financial 70, Government 70, Health Insurance 69), else none. Top quartile columns removed everywhere.
   - Regulatory corrections (read on eCFR, statute or regulator): FTC click-to-cancel vacated (ROSCA stands); PHMSA sets
     no 60 minute gas response limit; recall reports are due in 5 working days, not 24 hours; FERPA covers attendees, not
     applicants; Clery, not Title IX, for campus crime statistics; Section 508 is WCAG 2.0 AA, ADA Title II is 2.1 AA; EU261
     scope follows departure airport and carrier; Florida claim acknowledgment is 7 days; no FCC rule bars cable retention
     offers; 99.9% uptime is about 43 minutes a month, not 87.
   - Hub stats replaced: $146B cat losses (no source; Munich Re 2025 is $108bn insured), 30M+ recalls (29.3M, our sum of
     NHTSA's own recall file, reproduced), 72% of students (a consultant's claim), 11 points behind (unverified).
   - Stats strip entries may be a claim token or `{ id }`; the source comes from the registry (`copy.test.mjs` 4).
   - Claim source tags wrap (a long publisher name widened phone pages).
   - Originality: no shared run of 8 words on any page. The session's web search budget ran out mid-pass, so coverage
     differs by industry and each record says what ran: full phrase searches (Healthcare, Retail, Insurance,
     Manufacturing after a positive control), partial (Telecom 33, Education 32, Travel 20 of 40), none possible
     (Financial Services, Utilities, Government: word-run comparison against 51 to 61 fetched pages instead). Queued
     phrases are in each agent's notes; run them in a session with search budget.
   - Two sources read off the publisher's own site, disclosed in the claim: ACSI federal figures from ACSI's study PDF
     hosted by FedScoop (theacsi sites refuse this network). Government CSAT row sets ACSI's index (65) beside SQM's
     top-box 78%, with the scale difference stated.
38. **Done S24 (28 Sep), item 81.** BLS wage update, its own change after the site scan. OEWS now publishes May 2025; the site
   wage (`market.wage.agent`, $20.59, J11) is May 2024. Read the May 2025 national row for SOC 43-4051 first (bls.gov
   refuses this sandbox; WebFetch reaches only index pages; the national XLSX or TB can supply it), then move the registry
   entry and its review date, and A/B every wage-driven tool (figures move by the wage ratio, grades unchanged).
39. Done S23: full site sweep closed (parts 1 to 4 plus the ungate). TB approved a new priority list, below. It
   supersedes the older "Next" lines and the reachability batch note. Work top down; one item per session where large.
40. Done S24 (26 Sep 2026): design program closed its concept rounds. TB adopted Brand Guide 1.0 (`docs/BRAND_GUIDE.md`:
   IBM Plex Sans, five pillar colours, layer colours on the stack, colourless grades, evidence mark and readout, special
   editions, icons, components, page patterns) and the phased build order in `docs/REDESIGN_PLAN.md` (P5 design now runs by that
   plan). Canvas: private artifact "Center of CX Design Concepts", page "Brand kit V5"; concepts on its archive page.
41. Done S24, redesign session 1 (Phase 0): research status registry to Cohort 3 (18 CCaaS complete; freeze test 332);
   taxonomy 1.1 drafted in `docs/MEASUREMENT.md` (freezes at Phase 5); TB decisions D1 to D4 drafted in
   `docs/PHASE0_DECISIONS.md` (corpus in a private repo read at build time, vendor corrections, contributor rules, test
   group), all open. Suite 24,105 green. Next: Phase 1, design the final desktop tool page.
42. Done S24, redesign session 2 (Phase 1, design 1 of 6): final desktop tool page on the canvas page "Phase 1 designs"
   (Cost per Contact as the pattern): five-pillar nav, route sidebar, two question groups with sourced inputs and
   hold-to-speed steppers, live result with the evidence mark and each axis's lift, what it means, what would change it,
   one next step and Stop here, report audience picker (finance, operations, IT, executive, advisor). Awaits TB approval.
43. Done S24, redesign session 3 (Phase 1, design 2 of 6): vendor profiles on the canvas. Researched (Vonage): six questions
   switch the view (fit and products, 61 findings, breaks, effort and cost, proof and contract terms, sources); findings come
   from the corpus by criterion with plain labels, a state filter and each finding's public sources (title, publisher, tier,
   dates); who published the evidence (Vonage 32, AVANT 2, Ericsson 1); class marked draft; practitioner perspectives and
   Market Watch kept separate; report an error. No score, rank, tier or count of states. Not yet researched (Aircall): no
   class, no claim, a research status track, an anonymous "ask us to research" count, four tools to test it, and the
   questions the 18 researched vendors kept returning to. Recommendation for TB: Phase 1 prose (strengths, weaknesses,
   beats, loses to) leaves public profiles in the rebuild; it stays in data for lineage. TB approved both designs and the
   recommendation (26 Sep, "go").
44. Done S24, redesign session 4 (Phase 1, design 3 of 6): homepage, desktop and phone, on the canvas. Hero "Diagnose before
   you buy." beside the stack; step 1 five doors, step 2 the door's question and a route card (steps, time, possible endings,
   one start button). A stack layer opens its plain name, what it does, and the tool and vendor category Platform Decision's
   published model already maps to it (no new mapping). Routes lift only the layer that model names (AI proposal L4,
   staffing L6); cost, renewal, readiness and RFP light all seven. Below: the evidence mark explained, three proof tiles
   (23 methods, 18 researched vendors, A to Z), what changed from the method changelog, the contributor invitation. Phone:
   doors as a list, step 2 as a bottom sheet with the start button pinned; no stack on the phone home. A "Show events"
   design note marks door_select, route_select, route_start and layer_select. Taxonomy 1.1 draft gains action `request`
   (vendor research request on the not yet researched profile). TB approved (26 Sep, "go").
45. Done S24, redesign session 5 (Phase 1, design 4 of 6): CCaaS category page on the canvas. What the category covers and
   where it ends; where the research stands (18 researched, 6 not yet, 6 classes, validated 19 to 23 Sep, ratings locked);
   "Start with the job you need done": six class cards (plain name, job, typical buyer, calibrated or draft, count), each
   filtering the list; vendors A to Z inside each class with "Compared on" from the class boundary, validation date and
   the vendor's first publishable best-when statement from the corpus; the 6 not yet researched vendors with no class and
   an anonymous research request (AnywhereNow marked researching next). No score, rank, tier or order by merit. Class
   names, jobs and boundaries restated in plain words from the corpus (presentation only). TB approved (26 Sep).
46. S24 (26 Sep), TB: skip the practitioner feedback rounds, commit to the new design, build now (tools are V3 and hardened;
   research continues on its own clock). Designs 5 (industry) and 6 (method, contributor, Market Watch, Research, email)
   move to the start of the phases that build them. Done, redesign session 6, Phase 2 foundations:
   - `src/lib/tokens.js`: Brand Guide 1.0 as data (house, pillars, layers, arcs, findings, type scale, space, radius,
     motion, contrast helpers). `scripts/tokens-css.mjs` writes the font rules and `--cx-` CSS variables into index.html
     (TOKENS markers) from `src/lib/tokensBlock.js`.
   - IBM Plex self-hosted in `public/fonts` (Sans 400/400i/500/600/700, Condensed 400/600, Mono 400/600; OFL.txt), two
     weights preloaded, cached a year. No new host: `font-src 'self'` already allowed. `type.js` FONT is Plex, so every tool
     changes font on merge; the 36 content pages stay on DM Sans until Phases 8 and 9. The report window loads Plex from
     Google Fonts (its existing allowed host) until Phase 3 rebuilds the report.
   - `src/lib/Icon.jsx`, the 32 icons (24 grid, 2px stroke, currentColor, hidden unless labelled).
   - `tokens.test.mjs` (289): every value against the guide's tables, WCAG AA for every text pairing (lowest pillar pair
     5.02:1; the guide said 4.8, corrected to 5.0), fonts present and woff2, index.html block current, type.js and the
     report on Plex, icon set equal to the guide's list, no colour literal in migrated files (list starts with Icon.jsx).
   - Phone overflow found and fixed (pre-existing on main): the shared `NumField` input lacked border-box sizing (AI
     Deflection scrolled 7px), Channel Shift's guardrail panel stayed two columns, rubric method tables were wider than
     a phone. Sweep: 112 page loads at 390 and 1440, no overflow, no page error.
   - Tooling note: `vite preview` serves the homepage HTML for `/tools/x` (no trailing slash), so every tool fails hydration
     (React 425) locally while production is clean. Serve dist with the Vercel rules instead (scratchpad `serve.mjs`: a path
     serves `dist/<path>/index.html`, else `spa.html`).
   Suite 24,394 green, rail audit clean, chunk 25 of 25, build and prerender green (426 pages, 121 cards), local live check
   under the production policy 254 of 254. Next: Phase 3, the components and the light report.
47. S24, redesign session 7, Phase 3 part 1: the light paper report. PR #41 opened for Phase 2 (TB: go). `ReportExport.jsx`
   rebuilt to Brand Guide section 13: masthead with the mark, title, the evidence mark on the cover (three print arcs filled
   by grade, a dotted ring for not applicable, "Held by" the binding axis; a void prints "No figure" and its failed invariant,
   no mark, no grade; a tool without grades prints no mark), a "Written for" line, sections, and a footer stating how figures
   are made. Paper palette from tokens (new `ARCS_PRINT`: #2F8FD0, #0072BB, ink, track #E4E9EF, n/a #5B6B80; recorded in the
   guide); a tool's metric colour is no longer printed (colour never marks a figure); high priority prints its word beside
   the print red. Plex now self-hosted in the report too: fonts from the site origin, report policy `font-src 'self' <origin>`,
   no Google host left in the report. Reader picker in the download dialog (Finance default, Operations, IT and platform,
   Executive sponsor, Advisor): `orderSections` reorders sections by reader and never alters one; the button reads "Generate
   the finance report". ReportActions passes `how`. `export.test.mjs` 51 (escaping allowlist explicit; readers keep every
   section once and every figure once; mark fills by grade; void and no-grades draw no mark; fonts and policy; print arcs
   3:1). The `audience` event property waits for taxonomy 1.1 at Phase 5. Harness note: Playwright request routing (context
   or opener page) stalls a document.write popup's font loads, so report screenshots run without routing; the live checker's
   text read is unaffected. Suite 24,434 green; live check 254 of 254. Next: Phase 3 part 2, the component library.
48. S24, redesign session 8. PR #41 (Phases 2 and 3 part 1) merged by TB's instruction (afe9bd2) and verified on production:
   fonts served with the year cache, pages carry the token block, GitHub nightly live check on the merge commit green (every
   tool and report window). From this sandbox 4 of 254 report checks failed; traced to the sandbox proxy returning 502 for the
   main script (the page never hydrated), the same egress fault as S23; GitHub's runner saw none. Phase 3 part 2 done:
   `src/lib/ui.jsx`, the Brand Guide section 12 components on tokens only (no colour literal; `alpha()` and `LINE` added to
   tokens for translucency): Button (primary, secondary, text, pillar with `onFill` text), SourceInput (yours, default,
   pulled, corrected), Stepper (`holdCurve`: 400 ms falling to 60 ms, tenfold steps after 20 repeats), EvidenceMark (dark
   arcs by grade, dotted n/a, nothing on void), GradeBadge (weight and fill only), Result (counts to value, reduced motion
   respected, void says why and shows no figure), Readout (layer colours, no score until every part is answered), Stack,
   ClaimMarker, Finding (word and icon, unknown never red), NextStep (always with Stop here), Byline, Door, RouteCard (three
   steps at most), Loading, Failure, Empty, SharedScenario. `components.test.mjs` 99. Gallery rendered and checked. Suite
   24,534 green. Next: Phase 4, the site shell and tool shell built from these.

49. S24, redesign session 9, Phase 4 part 1: the site shell. `src/lib/Shell.jsx` (tokens only): one header (mark, the five
   pillars with the current one marked, Research and Market Watch tagged soon, Market Watch a label until it has a page,
   Subscribe, a phone menu with 44px targets), one footer (four link columns, privacy, terms) and `Crumbs`, a breadcrumb row
   with at most one action. App renders the header and footer once around every route. 61 pages lost their own bars (six
   hand-built link sets) and 16 tools their `ToolNav`; method pages and sub-vertical pages keep their back links as crumbs.
   The 37 pages whose old bar was fixed keep the header over the page (`headerFixed`); every other page has it in the flow.
   Found and fixed: /about scrolled sideways on a phone (a 340px grid minimum; the same guard applied to 23 grids on 12
   pages); /vendors and /about still said every vendor was scored with proprietary rubrics, across "350+ vendors in nine
   categories" (now what the profiles are; `freeze.test.mjs` gates both). Gates: `shell.test.mjs` (55: header, pillars,
   live footer links, crumbs, App wiring, no page draws its own bar, fixed or in flow per route, no grid wider than a
   phone), `prerender.test.mjs` (every page has the shell once). Chunk gate re-based with attribution: the shell adds
   10,457 bytes to the entry (Shell 7,506, Icon 2,117, tokens 715, App 95; no route or data file). Suite 24,593; all 426
   sitemap pages at 390 and 1440 with no overflow, no page error, one header and one footer; local live check under the
   production policy 254 of 254. Next: Phase 4 part 2, the tool shell v2.
50. S24, redesign session 10. PR #42 (components and site shell) merged by TB's instruction (29af17b); GitHub live check on
   production green on the merge commit, and production serves the shell and the corrected /vendors copy. Phase 4 part 2:
   `src/lib/ToolFrame.jsx` (tokens only, computes nothing, reads no engine). Route rail: this tool and the next steps from
   `journey.js` `routeFrom(toolId, choice)` (new; step 2 is the engine's choice, so the rail and the page's one next step
   always agree; then first edges, stopping on arriving at Business Case, on a repeat, or at three steps), change route,
   and "Your numbers stay in this browser tab unless you ask for a review." (true while the analytics allowlist carries no
   input; the frame harness pins the allowlist). Breadcrumb row with the method stamp and the report action; the question
   as the one h1; the result sticky beside the work; on a phone the question first, result, then the rail, with the
   headline pinned to the bottom and a jump to the result. Found while proving it: the header nav wrapped between 901 and
   1100px (the menu now takes over at 1100); `Result` squeezed its figure into its evidence mark in a narrow column (now
   wraps below). Gates: `toolframe.test.mjs` (22), `journey.test.mjs` F (route laws on every tool and all 80 engine
   choices), shell rule allows a breadcrumb nav. Suite 24,620; sweep of all 426 pages clean; live check 254 of 254. No
   tool moved yet; Phase 6 moves them onto the frame. Next: Phase 5, the homepage.
51. S24, redesign session 11. PR #43 (tool frame) merged by TB's instruction (cdced89). Phase 5, the homepage (TB: go), held
   from merge until TB supplies the PostHog first-to-second-tool baseline or waives it. `Homepage.jsx` to the approved
   design: hero "Diagnose before you buy." beside the stack; five doors; each door's question with one route card; the
   evidence mark explained; three proof tiles; the four newest method changes. `src/lib/home.js` derives every figure:
   tool, profile, category and segment counts from `seo.js` (new `SEGMENT_COUNT`, 61, equal to the sitemap), CCaaS
   researched from `researchStatus.js`, methods from `methodVersions.js`, route steps from the journey graph, industry FCR
   from the claims registry with its source (Education, Manufacturing and Travel show no public benchmark), the stack's
   layer to tool and category map from Platform Decision's published model, what changed from the changelog. Departures
   from the design, each because the design would have claimed what the data cannot: no minutes on routes (never
   measured; a route says how many tools), vendor steps describe today's profiles (no findings or proof tests until Phase
   7), no search box (none exists), no contributor invitation (D3 open). Phone: no stack, step 2 in the page. The homepage
   header now sits in the flow. Taxonomy 1.1 frozen (`TAXONOMY_VERSION` 1.1, `track.test.mjs` Q, `docs/MEASUREMENT.md`):
   seven events and nine properties added, page type `category`; the homepage fires door, route, start and layer events,
   and `report_export` carries `audience`. Found by the privacy harness: a global `vendor` key would have let a tool leak
   the reader's own current vendor, so every 1.1 key travels only on the events that own it (`EVENT_SCOPED`, B7 and B8).
   `Button` now passes `onClick` on links; `RouteCard` takes `onStart` and a figure slot. Gates: `home.test.mjs` (33),
   seo E surfaces and J13 retargeted to `home.js`, shell and tool frame pins updated. Suite 24,692; 426-page sweep clean;
   live check 254 of 254.
   TB waived the baseline ("skip the baseline, merge"); PR #44 merged (d8193af). Next: Phase 6, tools onto the frame,
   first batch Cost per Contact, FCR Leakage, AI Deflection, Business Case.
52. S24 (27 Sep), TB: "What Changed on the home page and any other page should be removed." Removed every change list:
   the homepage section, each method page's "Changes to this method", and the `/changelog` page (301 to `/how-to-choose`
   at the edge and in the app; out of the sitemap, now 425, and the metadata). Links removed from the footer, the seven
   method page captions and the tool report area; the Research door now points to `/research`. Version stamps ("Method
   1.0, published ...") stay on tools, method pages and PDFs. `src/lib/changelog.js` stays as the record behind each
   stamp (`methods.test.mjs` still checks each method's newest entry carries its version); nothing renders it.
   `methods.test.mjs` and `home.test.mjs` prove the removal (both fail on the old tree); the live checker checks the
   redirect. Suite 24,686; live check 254 of 254.
   Then TB: "I don't want my audience to see the change log. We can create a page for documentation but hide it." The
   record renders at `/internal/method-log` (`RubricPage` id `method-log`): linked from nowhere, not prerendered, outside
   the sitemap and the metadata map (so the app and the shell mark it noindex), and `X-Robots-Tag: noindex, nofollow` at
   the edge for `/internal/(.*)`. Hidden is not private: anyone with the URL can open it, and the repo is public. Gates in
   `methods.test.mjs` (mounted, unlinked, out of sitemap and metadata, the edge header); the live checker opens it and
   reads its noindex. Suite 24,691; live check 255 of 255.

53. S24, redesign session 12, Phase 6 batch 1 (TB: "merge it and go"): Cost per Contact, FCR Leakage, AI Deflection and
   Business Case moved onto `ToolFrame`. Each page is the frame's question as the one h1, the route rail (AI Deflection's rail
   follows its verdict), the result column (`Result` with the evidence mark from `resultHow(gradeObj)`; a void shows no figure),
   dark inputs (`NumField tone="dark"`), findings with word and icon, and the report on a paper panel. No engine change: the
   engine region, the component logic and every ReportActions prop are byte-equal to `main` (checked per file), and every tool
   harness passes. Fixed on the way: AI Deflection linked "50 scored IVA vendors" (now "IVA vendor profiles"). Business Case pins
   updated for the frame (selectors read the resolved keys on the shared choice group, the tiles share one helper).
   `toolframe.test.mjs` section 5 gates each moved tool. Suite 24,703; live check 255 of 255. Next: batch 2 (TCO, License Gap,
   Staffing, Attrition, Channel Shift).
   PR #46 merged by TB's instruction (dfdf849).
54. S24, redesign session 13, Phase 6 batch 2 (TB: "merge it and go"): TCO, License Gap, Staffing, Attrition and Channel
   Shift on `ToolFrame`, the nine rail tools now all on the frame. Same rule as batch 1: every engine region, the component
   logic and every ReportActions prop byte-equal to `main`; the only logic lines removed are colour-only (`gradeColor`,
   `tierColor`, local card styles). Attrition's rail follows its own next step (occupancy risk when seats go unfilled). TCO keeps
   its six steps as a step group and drops its own global stylesheet and fixed-header clearance (its header now sits in the
   flow). License Gap's module table became one card per module, so it fits a phone. Colour no longer marks a figure or a
   band on these pages (verdicts, flags and chips carry a word). Harness pins updated where they read the old render:
   Staffing's void now reaches the frame's Result; the shell's fixed-header list drops TCO.
   `toolframe.test.mjs` 5 covers all nine. Suite 24,718; live check 255 of 255. Next: Phase 6 batch 3, the WFM five.
   Known, unchanged: License Gap's page still shows its tiles on a void (the Result shows none).
   PR #47 merged by TB's instruction (a2423b9).
55. S24, redesign session 14, Phase 6 batch 3 (TB: "merge it and go"): the five WFM tools (Occupancy Risk, Shrinkage Planner,
   AHT Decomposition, Forecast Accuracy, Schedule Adherence) moved from `ToolShell` onto `ToolFrame`. New `src/lib/frameKit.jsx`
   (tokens only, computes nothing): dark text styles, panel, question group, number field (same `Number(value)` contract as the
   tools' own inputs), tile, choice group, corrections notice, assumptions list, paper panel; later moves read it instead of
   copying styles. Each tool's logic above the render is unchanged from `main` and every ReportActions prop is byte-equal; the
   tools have no grade object, so their Result shows the headline figure with no evidence mark. Bands, bars and charts carry
   words and one hue at graded strengths (colour never marks alone); Occupancy's band colours now print in the PDF only.
   `floor.test.mjs` accepts ToolFrame or ToolHero; `toolframe.test.mjs` covers 14 tools plus the kit (tokens only, imports,
   field contract). Suite 24,736; live check 255 of 255. Next: batch 4, the frameworks (CX Maturity, AI Readiness,
   Transformation Readiness, CX IT Alignment, Governance), then procurement (QA, Platform Decision, RFP, Contract Risk),
   Vendor Match and Roadmap.
   PR #48 merged by TB's instruction (35d90a1).
56. S24, redesign session 15, Phase 6 batch 4 (TB: "merge it and go"): the five frameworks (CX Maturity, AI Readiness,
   Transformation Readiness, CX IT Alignment, Governance) moved from `ToolShell` onto `ToolFrame`. The kit gains `Scale`
   (1 to 5 radio group), `StatementStep` (tabs, statements, previous and next) and `DimensionBars`; the kit still imports
   only tokens, type, the components and guards. Each page keeps an intro with its start button (the live checker's
   hostile-link rule), then the statements, then results: the band as a word, the checklist, "Next diagnostic:" and the
   published rubric link (harness pins), and the report on paper. CX IT Alignment keeps its paired CX and IT sides and
   states each gap in words; its area chart marks CX filled and IT as a ring, with both averages written. Governance
   severities are words on outlined chips (critical heavier, confirm dashed); role buttons no longer colour-code roles.
   Band and severity colours print in the PDF only. Logic above the render and every ReportActions prop byte-equal to
   `main`; rubric, ownership, floor and journey harnesses pass. `toolframe.test.mjs` 5 covers 19 tools. Suite 24,751;
   live check 255 of 255. Next: batch 5, procurement (QA Scorecard, Platform Decision, RFP Builder, Contract Risk), then
   Vendor Match and Roadmap.
   PR #49 merged by TB's instruction (b1c12bb).
57. S24, redesign session 16, Phase 6 batch 5 (TB: "merge it and go"): the procurement four (QA Scorecard, Platform Decision,
   RFP Builder, Contract Risk) moved from `ToolShell` onto `ToolFrame`. The kit gains `numInput`, the dark input style for a
   tool that keeps its own input handler (Platform Decision's clock, RFP weights, QA text fields). Option groups use the
   kit's `Choice`; severities, priorities, grades and outcomes are words on outlined chips (critical heavier, unknown and
   note dashed); nothing is colour-coded on the page. Platform Decision keeps its start screen; Contract Risk and QA open
   on the work with the result beside it; RFP keeps its three steps and the scoring table (it scrolls inside its panel on
   a phone). The logic above the render and every ReportActions prop are byte-equal to `main` (RFP's two render helpers,
   `ReqRow` and `Groups`, restyled; everything before them unchanged). terms, renewal, rfp, qa, floor and journey
   harnesses pass; `toolframe.test.mjs` 5 covers 23 tools. Suite 24,763; live check 255 of 255. Next: batch 6, Vendor
   Match and Roadmap, then retire `ToolShell`.
   PR #50 merged by TB's instruction (31f95eb).
58. S24, redesign session 17, Phase 6 batch 6 (TB: "merge it and go"): Vendor Match and Roadmap on `ToolFrame`, and
   `src/lib/ToolShell.jsx` deleted. **Phase 6 complete:** all 25 tool routes render in the frame; `toolframe.test.mjs` counts
   them from App.jsx and fails if ToolShell returns; `floor.test.mjs` now requires ToolFrame. Vendor Match: presentation only
   (research law): its data tables, scoring, the Phase 1 method note and every ReportActions prop are unchanged; fit bands
   are words, strengths and risks are labelled lines, the result column reads "Vendors on the starting list" (no rank or
   score promoted into the headline). "Explore All 29 Tools" corrected to "Explore all the tools". Roadmap: statuses are
   words, a flagged milestone has a heavier border, "Depends on" reads "Waiting on:", and the button that said "Save & Send
   Roadmap" (nothing is sent) now reads "See the summary and report". Open for TB: Vendor Match's "Request a Vendor
   Introduction" card ("we coordinate a tailored demo with your top match") sits uneasily with "never access to vendors";
   kept as is. Suite 24,771; live check 255 of 255. Next: Phase 7 (Research Stage 1 and Vendor Intelligence), which needs
   D1 (corpus location) decided first.
59. S24, redesign session 17 (continued). TB: "If there is a vendor there should be a vendor introduction button. That is
   part of the lead gen and monetization strategy." Built: `src/lib/intro.js` (`introHref`, `readIntro`: a link carries
   a known profile slug, checked by `isVendorSlug` in seo.js, or a plain name of 60 characters at most; anything else
   opens a plain contact form) and `src/lib/VendorIntro.jsx` (`VendorIntro` on the new design, `VendorIntroLink` for the
   older light pages). On every vendor profile variant (8) under the name; every Vendor Match result (24) and the
   "Request a Vendor Introduction" card (now pointed at the top match); each named vendor in RFP Builder; the CCaaS
   category lists, the other categories' directory and the category by industry pages. The contact form reads it after
   first paint, preselects the topic "Vendor introduction", titles the form and the email subject with the vendor, and
   sends `intro_vendor`, `intro_profile` and `intro_from`. Taxonomy 1.2 (additive): `vendor_action` action `intro` with
   `surface` (`vendor`, `tool`, `category`), new event `intro_submit` on a sent request; funnel 10 in MEASUREMENT.md.
   Rule kept: an introduction never moves a vendor (no list order, score or research reads it; `intro.test.mjs` 4).
   `intro.test.mjs` (23): every sitemap profile slug round-trips, hostile names dropped both ways, every surface offers
   one, the form receives it, Vendor Match renders 25 introduction links. Suite 24,802; live check 255 of 255.
   D1 (corpus location): recommendation revised in `docs/PHASE0_DECISIONS.md`: raw corpus in a private repository, a sync
   job writes a publishable per-category snapshot with a provenance manifest and opens a pull request; the site builds from
   the snapshot only. Awaiting TB's go and the four setup steps.
   PR #51 merged by TB's instruction (d59de08). **Phase 6 complete on production.**
60. S24, redesign session 18, Phase 7 part 1: research Stage 1 (TB: "merge it and go", which decided D1). Truth surface:
   Vendor Intelligence. Authority read: section 13, the Cohort 3 corpus metadata and its `surface_permissions` table.
   Checkpoint `PRODUCTION_COHORT3_NORMALIZED`, schema 1.0 locked, `phase2_ratings_locked` true. Presentation only: no
   methodology or schema change. `src/lib/research/snapshot.js` (`deriveSnapshot`, `splitByVendor`, `stableJson`):
   refuses a wrong category, schema or a corpus not marked system of record; publishes only gated vendors; evidence only
   when PUBLIC with a publishable permission state (unknown treated as confidential), review aggregations excluded;
   claims only when Vendor Intelligence may read them, active, with a publishable summary and at least one public
   citation (a limiting or context source counts: an unverified finding is still a finding); derived records keep only
   their own vendor's published claims and are withheld if none remain; governance and hypothesis tables (Phase 1,
   migration, score deltas, gates, normalization, framework, calibration, refresh, permissions, Market Position) and
   internal fields (notes, researcher, raw claim text, excerpts, confidence notes, lineage, internal owner) never publish;
   dashes become commas (1,117 replaced, ids untouched); stale sources flag a claim, never remove it.
   `scripts/research-sync.mjs` writes `src/data/research/ccaas/` (manifest with checkpoint and source SHA-256, shared
   classes and criteria, one file per vendor, one record per line so a checkpoint is a readable diff). Snapshot: 18
   vendors, 1,205 claims, 621 sources, 118 products; withheld 17 claims, 40 sources, 6 products and the records listed
   in the manifest. `research.test.mjs` (72, 74 with the corpus): a synthetic corpus attacks every rule (restricted ids and titles absent,
   gate, derived records, withheld tables and fields, UNKNOWN and PREVIEW preserved, stale flag, determinism, no rating
   field) and the committed snapshot is checked (registry of 18, every link resolves in its own file, no restricted
   string, no dash, under 900 KB a file, nothing outside the research layer reads it); with `RESEARCH_CORPUS` set it
   re-derives and requires byte equality. `.github/workflows/research-sync.yml` runs the same from the private repository
   once TB adds it and the `RESEARCH_TOKEN` secret. Corpus findings for the research program in
   `docs/research/CORPUS_FINDINGS_COHORT3.md`: 14 Avaya claims and 6 products rest only on the internal-only sources;
   four G2 and Peer Insights review sources withheld (three claims rest on them alone); six Genesys records link Content
   Guru claims (lineage error). No UI change. Suite 24,874. Next: Phase 7 part 2, the researched vendor profile on the
   snapshot (approved design, redesign session 3).
   PR #52 merged by TB's instruction (c599323).
61. S24, redesign session 19, Phase 7 part 2: the researched vendor profile (TB: "merge it and go"; design approved 26 Sep).
   Truth surface: Vendor Intelligence; presentation only. The 18 researched CCaaS vendors (`CCAAS_RESEARCH.complete`) render
   `ResearchedProfile.jsx` from the snapshot; every other profile keeps the Phase 1 page. `src/lib/research/loadProfile.js`
   loads each vendor's file as its own chunk (`import.meta.glob`, 130 to 360 KB, 17 to 57 KB gzip); the prerender waits,
   so the served page carries the research. `src/lib/research/profileView.js` (`buildProfile`) is the pure view model:
   plain words for states ("Not yet proven" for unknown, never weak), findings grouped by the corpus's rating layer so the
   five decision layers stay separate, sources per finding, publisher counts. Six questions switch the view (linkable by
   hash): Is it a fit? (class with job, typical buyer, comparison boundary and draft or calibrated status; best when, take
   care when, rule it out when; fit improves and declines; products with their release state), What does it do? (every
   finding by layer and criterion with capability and evidence words, conditions, stale flag, validation date and its
   sources; a state filter with no counts), Where does it break? (trigger, who, mitigation, build and cost, day 2 owner, the
   question to ask, when to walk away), What will it take? (implementation, SOW terms, after go-live, cost drivers,
   integrations), What should I ask for? (proof, contract terms, AI controls, open questions), Where does this come from?
   (who published the evidence, every source with publisher, tier and date; ratings locked note). The introduction button
   and a Report an error link sit under the name. No score, rank, tier, count of states or Phase 1 prose. `profile.test.mjs`
   (12): every vendor in all six views (one h1, the page's own words carry no score, rank, tier, weak, count or
   NaN/undefined once the research's own strings are removed; every finding, source, break and decision reaches its view;
   https links with noopener; publisher counts sum; draft class marked; the introduction link), the filter shows exactly
   its findings, the route uses research for exactly the 18, tokens only. A mutation adding "score" to the page fails it.
   Phone overflow fixed on the way (key and value grid stacks under 600px; long research strings wrap). Suite 24,886; live
   check 255 of 255; 18 profiles at 1440 and 390 clean. Next: Phase 7 part 3, the CCaaS category page by competitive class.
   PR #53 merged by TB's instruction (fe24123).
62. S24, redesign session 20, Phase 7 part 3: the CCaaS category page by competitive class (TB: "merge it and go"; design
   approved 26 Sep). Truth surface: Vendor Intelligence; presentation only. `src/lib/research/categoryView.js`
   (`buildCategoryIndex`) reads the snapshot's classes and vendors and each vendor's first published best-when statement
   (Decision_ID order); `research-sync` writes it as `src/data/research/ccaas/category.json` (8.5 KB), so the page loads no
   vendor file. `research.test.mjs` proves the committed index equals a fresh build from the committed snapshot (and from
   the corpus when `RESEARCH_CORPUS` is set; re-synced from the Cohort 3 corpus, byte equal). `CCaaSCategory.jsx` rebuilt on
   tokens: what the category covers and where it ends; where the research stands (18 of 24 researched, 6 classes, 3
   calibrated and 3 draft, validated 19 to 23 Sep, ratings locked); "Start with the job you need done", six class cards
   (plain name and job restated in `PLAIN`, the corpus buyer, calibrated or draft, vendor count) that filter the list and
   link by hash (`#cls-cc-004`); each class with its research name and definition word for word and its vendors A to Z
   with the best-when statement, "Compared on" (the class boundary) and validation date (Talkdesk publishes no best-when:
   the page says so); the 6 not yet researched with no class, AnywhereNow marked "Researching next"
   (`CCAAS_RESEARCH.next`), the others with "Ask us to research" (one anonymous `vendor_action` `request` event, no
   count shown); adjacent suites; method; four tools. An introduction on every vendor (28). Phase 1 scores stay withdrawn
   (freeze pins pass). `category.test.mjs` (130): every vendor once in its own class, order, statements, boundary, dates,
   each filter exact, the not yet researched carry no class, the page's own words carry no score, rank, tier, grade or
   count (a mutation adding "Ranked first" fails it), tokens only, no dash. Browser: 1440 and 390 no overflow, no page
   error, filter and hash link work. Suite 25,017; live check 255 of 255. Next: Phase 7 part 4, the CCaaS by industry pages (research Stage 3).
   PR #54 merged by TB's instruction (64c7202).
63. S24, redesign session 20 (continued). TB: "Each vendor should be tagged to their respective categories UCaaS + CCaaS
   and whether they are true enterprise or midmarket or smb." Built as presentation of the research, never new research:
   `src/lib/research/ccaasTags.js` gives each of the 18 researched vendors "UCaaS + CCaaS" or "CCaaS" and the sizes the
   research says the platform is sold to (SMB, Midmarket, Enterprise; "Enterprise, selected use" where the research calls
   it selective: 8x8, Dialpad, UJET). Every tag cites the published records it rests on (a product's
   Primary_Target_Segment or Product_Type, or a claim), and `research.test.mjs` 11b proves each citation is published in
   that vendor's file and that each size is tagged exactly when its records state it (mutations caught). UCaaS + CCaaS:
   Cisco, 8x8, Dialpad, RingCentral, Vonage, Zoom, Avaya (Avaya on its Government Cloud UC and contact center product).
   The research lists no UCaaS product for the other eleven. Category page: chips on every researched vendor, filters
   for size served and UCaaS + CCaaS (they narrow, never reorder; a class with no match says so); the not yet researched
   show their Phase 1 segment labelled as such. Profile: chips under the name and a "Who it is sold to" panel quoting the
   research's own words. No size feeds Vendor Match, an order or a grade. `category.test.mjs` 155, `profile.test.mjs`
   pins the chips. Suite 25,151; live check 255 of 255.
   PR #55 merged by TB's instruction (effa5d8).
64. S24, redesign session 20 (continued). TB: "This site should be comprehensive as possible. In the avaya and cisco,
   zoom etc. instances, it's okay to note or caveat US public sector, gov, etc. Rule holds true for all intricacies we run
   into. We can include this on their vendor page which should tie into the vendor match engine and applicable tools,
   assessments, research." Built: every tag keeps its caveat (`ccaasTags.js`: `uc.note`, `uc.scope`, `sizeNote`,
   `publicSector`, `core`). A scope that limits a tag to one kind of buyer is in the tag's own label (Avaya "UCaaS +
   CCaaS (US public sector)"); notes say what a tag rests on (Cisco, Zoom, Dialpad: findings, no separate UC product
   listed; RingCentral: RingCX terms require a RingEX account). New tag "Public sector offer" exactly when a GA product
   is sold to government or public sector (Content Guru, Talkdesk, Cisco, Zoom, Avaya). `research.test.mjs` 11b adds:
   the scope rule, the public sector rule both ways, every note present, the core product published. Category page:
   notes under each vendor's chips and a public sector filter. Profile: "Who it is sold to" moved up under the class,
   with the notes, where it runs (the core product's Geographic_Scope) and the research's own words; a "Take it further"
   panel links RFP Builder with the vendor already entered (a relative scenario link; RFP Builder now says "Carried
   over: X" on arrival), the class peers, Platform Decision, Contract Risk, TCO, License Gap and Vendor Match (labelled:
   still Phase 1, reads no research yet). Vendor Match is linked, not fed: research law keeps Phase 1 scoring and
   research apart until Vendor Match V3 (Stage 4), where size served, UCaaS + CCaaS, public sector and where it runs
   become buyer filters. Suite 25,210; live check 255 of 255.
   PR #56 merged by TB's instruction (6db98ee). TB on an interim Vendor Match filter: "wait" (Stage 4 takes the tags).
65. S24, redesign session 20 (continued), Phase 7 part 4: the ten CCaaS by industry pages rebuilt from the research (TB:
   "merge and go"). Truth surface: Vendor Intelligence; presentation only. The corpus has no industry field, so each page
   gathers the research by published rules (`src/lib/research/ccaasIndustry.js` THEMES: healthcare EHR, HIPAA and
   healthcare offers; government authorization and public sector; financial services collections, FINRA and PCI, banks and
   packages; retail packages, PCI and order actions; insurance, travel and utilities packages; none yet for telecom,
   manufacturing and education). A theme shows every published record (finding, decision, fit condition, product, break
   trigger) whose words meet its rule, with its evidence state and date, vendors A to Z; nothing is picked by hand. The
   research sync writes `industry.json` (34 KB). `research.test.mjs` proves the index equals a fresh build (and the corpus
   derivation), each theme holds exactly the matching records, and every row carries its record's own words.
   `CCaaSIndustry.jsx` (tokens): what the page is and how it gathers; themes; an industry with nothing says so and claims
   nothing about the vendors; all 24 vendors with tags, notes and an introduction; RFP Builder opens with the industry
   chosen; the sourced industry page linked for requirements. The unsourced vertical prose (handle time "20 to 30% longer",
   "FedRAMP increasingly expected") no longer renders on CCaaS; the 70 other category by industry pages still show
   `verticals.js` prose (P6 debt). `industry.test.mjs` (116). The pages stay noindex and out of the sitemap (TB decision
   S23); indexing the three with substance (healthcare, government, financial services) is TB's call. Suite 25,331; live
   check 255 of 255.
   PR #57 merged by TB's instruction (8dfa53f).
66. S24 (27 Sep). TB: "index the three." Healthcare, government and financial services CCaaS by industry pages are
   indexable (`CCAAS_INDEXED_INDUSTRIES` in `verticals.js`): in the sitemap (428 URLs), prerendered with their research,
   titled "Contact Center Platforms for X | What the Research Says", an Article in structured data. The other 77 category
   by industry pages stay noindex and out of the sitemap. `seo.test.mjs` N (the three indexable and in the sitemap, the
   77 not), L1 (Article), `industry.test.mjs` (an indexed page carries at least 20 research records). Suite 25,356; live
   check 255 of 255.
   PR #58 merged by TB's instruction (20146ea).
67. S24 (27 Sep), decision D2 (TB): the vendor correction policy, points 1 to 5, no vendor response block; accepted
   corrections noted on the vendor's page. `/corrections` (sitemap 429, footer link): the policy (anyone reports with a
   public source; acknowledge in 5 working days, decide in 20; only public, citable evidence changes a finding, through
   the research process; every accepted change shown, every rejection answered; no vendor pays, previews or approves) and
   a report form (statement, what the source shows, a required https link, email, whether the reporter represents the
   vendor) posting to the existing Formspree inbox. Profiles: "Report an error" opens the form for that vendor (only a
   known slug travels); a corrections note on every researched profile lists accepted corrections with date, what
   changed and the source, or says none has been made. The log is `src/lib/research/corrections.js` (empty; an entry is
   added when a correction passes the research process and the snapshot is re-synced). `corrections.test.mjs` (35);
   `research.test.mjs` 11c validates the log. Suite 25,398; live check 255 of 255.
   PR #59 merged by TB's instruction (5e0f9b9). **Phase 7 complete.**
68. S24, redesign session 21, Phase 8 part 1 (TB: "merge and go"): the 61 industry segment pages on the new design through
   the one shared component (`src/lib/SubVerticalPage.jsx`, tokens only). Same states, thresholds, claim tokens and one
   send (the review request). Header, figure tiles (with each figure's note), the CMS strip, the 7-layer map with each
   layer's colour as a border beside its words, Have, Need and Planned as words with a mark and a pressed state, the
   results in words ("N of M capabilities in place", "What you marked Need"), the sources list. Found and fixed: the
   "Recommended Technology Stack" label (a verdict the site does not make) is now "vendors named for this layer", labelled
   as examples in our words, neither a research finding nor a recommendation; every named vendor offers an introduction
   (profile slug when the link names a profile, else the name; guidance rows with role "None" get none); maturity
   percentages and statuses no longer rely on red, amber and green; "highest-priority investments" copy removed.
   `subpage.test.mjs` (all 61 in both phases, vendor lists open); `tokens.test.mjs` migrated list now covers the Phase 7
   pages and the sub-page; copy pin accepts the initial-state form. Browser: 61 pages at 1440 and 390, no overflow or
   error. Suite 25,410; live check 255 of 255. Next: Phase 8 part 2, the ten industry pages and the hub.
   PR #60 merged by TB's instruction (f052f9e).
69. S24, redesign session 22, Phase 8 part 2 (TB: "merge and go"): the ten industry pages and the hub on the new design.
   **Phase 8 complete.** `src/lib/IndustryPage.jsx` (tokens only) renders every industry; each industry file keeps its
   content as data, character for character (segments, stats, failure modes, stack, benchmarks, outsourcing, platforms,
   sources, next step), and passes it. Claim tokens still render through ClaimText and every source is listed once;
   stat labels may carry tokens; a stat with its own source line links the claim's source. A one-off A/B against main
   on all ten: the only text lost is the relabelled section kickers, "Key vendors:" (now "Vendors in this layer
   include"), the old breadcrumb "Home", and on purpose the vendor blurbs. The blurbs were Phase 1 prose presented as fact
   ("Deepest routing", "Proven in large health systems", per-vendor FedRAMP levels with no source); platforms now show
   A to Z by name with an introduction, their research tags when researched, a label where the page had one (Adjacent,
   Education-specific), and a note that the list carries no ranking or recommendation, linking contact center platforms
   for the industry where the research is gathered. The section title "often evaluated for" (an unsourced frequency)
   became "Platforms named for X". Broken `/tco-calculator` links repointed to `/tools/tco-calculator`. Hub
   (`Industries.jsx`): same text less "vendor recommendations" and "vetted"; cards state one sourced figure each; links to
   contact center platforms by industry. The nine conversions were done by three parallel agents on one brief and checked
   by the A/B and the harnesses. `industrypage.test.mjs` (156); copy, claims and freeze pins moved to the shared
   component. Browser: hub and ten pages at 1440 and 390, no overflow or error. Suite 25,568; live check 255 of 255.
   Next: Phase 9, methods and the rest.
   PR #61 merged by TB's instruction (b5e70fa). **Phase 8 complete.**
70. S24, redesign session 23, Phase 9 part 1 (TB: "merge and go"): the method pages, About, Contact, Advisory, Research,
   Privacy and Terms on the dark design. `RubricPage.jsx` (all eight method page kinds and the internal method log): the
   old palette names map onto tokens, so every kind moved at once, with no colour literal left. The six content pages were
   converted by one mechanical rule set (palette constants to tokens, gradients to the navy surface, white to ink and mist,
   translucent white by role, Google font import and per-page body rules removed, solid buttons to action and paper),
   then fixed by hand where the rules could not decide (the Contact submit button, focus ring and error border; Research's
   tag colours, now one accent with the tag word). `index.html` gains the house base: body font, ink page and mist text,
   so a page on the new design never falls back to a serif; pages still on the old design keep their own body rule, which
   wins. Checked on all 429 sitemap pages against the old defaults: no page gets worse. The contrast problems that remain
   are on the old-design pages (Phase 9 part 2) and in the tools' coloured grade chips (known debt). `tokens.test.mjs`
   migrated list adds the seven files. Suite 25,569; live check 255 of 255. Found and flagged for TB, not changed (legal
   text): the Privacy Policy says vendor scores are "independently assigned" (withdrawn since S22), names only Vercel
   Analytics (PostHog receives tool events) and describes email collection for guides and tools (gates removed S23);
   Contact promises a "vetted consultant". Next: Phase 9 part 2, the old-design pages (vendor hub, seven category pages,
   Phase 1 profiles, category by industry outside CCaaS, Human Premium, CX Ecosystem, Platforms, Subscribe, the article,
   the gated report).
   PR #62 merged by TB's instruction (5bfd11d).
71. S24 (27 Sep), TB on the flagged text: "Privacy Policy: 1. Update for accuracy 2. Update all tools plug ins etc 3.
   Adjust to legal savvy messaging" (most tools need no email; for specific purposes the user starts, we may require a
   valid email and sometimes a phone); Contact: "vetted" is true, word it smarter. Privacy Policy rewritten from an
   inventory of the code: every service (Vercel hosting and Web Analytics, PostHog events with what they carry and never
   carry, Formspree, Google Fonts on older pages, GitHub with no visitor data), every form and its fields (seven forms,
   `FORMS` in the page), browser storage in place of cookies, the user-initiated contact-details clause with phone and the
   right to require it before fulfilling, sharing (providers, a vendor only on an introduction request, a consultant on
   request), independence (no scores; the correction policy), retention, rights (EU, UK, US states, no sale or
   cross-context advertising), security, transfers, children, contact. Terms: the "vendor scores ... published
   methodologies" sentence corrected (scores withdrawn). Contact h1: "We will match you with a consultant we have vetted
   for exactly that kind of problem." `privacy.test.mjs` (13): every Formspree endpoint in the code and every third-party
   host in the security policy must be named in the policy, so a new service cannot ship without it. Not legal advice:
   worth a lawyer's read before relying on it.
   PR #63 merged by TB's instruction (a112364).
72. S24, redesign session 24, Phase 9 part 2 (TB: "merge and go"): the remaining old-design pages onto the dark design on
   tokens only: Vendors hub, the seven non-CCaaS category pages and the shared `Phase1Directory`, the Phase 1 vendor profile
   (`VendorProfile`), the category by industry pages, Human Premium, CX Ecosystem, Platforms and Tech (layer colours from
   `LAYERS`), Subscribe, the CCaaS cost article, the gated report and How to Choose. Buttons on action with paper text; no
   page loads its own Google font or body rule (the house base in index.html owns them; stray CSS remnants removed from
   eleven pages). Presentation only: no data, list order, research or Phase 1 label changed. `tokens.test.mjs` migrated list
   covers every converted file. Contrast sweep of all 429 sitemap pages at 1440 and 390: no overflow, no serif, no AA
   failure outside the tools' grade chips (known debt, 25 tool pages). Suite 25,605; live check 255 of 255. **Phase 9
   complete.** Next: Phase 10.
   PR #64 merged by TB's instruction (99de2e0).
73. S24, redesign session 25, Phase 10 (TB: D3 approved as drafted; Market Watch launch items researched by us). Contributor
   platform: `/contribute` publishes the eight D3 rules, the house rules and the steps, with a proposal form (declared vendor
   tie, originality and rules confirmations) to the existing Formspree inbox; `/perspectives` (honest empty state) and the
   templates for a piece (`/perspectives/<slug>`: byline first, CONTRIBUTOR PERSPECTIVE, the declared tie, review date,
   sources) and a profile (`/contributors/<slug>`). `src/lib/contributors.js` refuses a piece with a dash, promotion, an
   undeclared tie, an unknown author or review after publication. To publish: add the author and piece, a SEO_MAP entry
   each and the sitemap lines, then rebuild (the prerender passes the piece to structured data, so no piece rides in the
   entry chunk). Market Watch v1 at `/market-watch`: 12 dated items (July to September 2026; 7 verified, 2 news, 3
   vendor-supplied; regulation, product, deal, outage, pricing), each written from the page it cites and labelled by the
   source it rests on; a machine check compared every item with 19 of its 20 cited pages for shared 8-word runs, three
   matches rewritten (record in `claims/originality.js`; the Cisco page refuses this network). Filters by label and kind;
   introductions for named vendors (taxonomy 1.3: surface and page type `market-watch`). Market Watch is live in the
   header, footer and homepage door ("What is new in the market?"); Research stays marked soon until a study of our own.
   Research landing rebuilt from data (vendor research by category in the section 13 order, methods, industries, Market
   Watch, perspectives, the two reports that exist, studies to come); the old landing listed eight articles that were never
   written and figures with no source. Gates: `contributors.test.mjs` (73), `marketwatch.test.mjs` (58),
   `researchpage.test.mjs` (15), pins in tokens, shell, home, track, seo, research, methods. Chunk gate re-based with
   attribution (270,220 raw; main had used the headroom). Suite 25,770; sweep of the new pages clean at 1440 and 390; live
   check 255 of 255. Open: the FCC TCPA item is a draft order (vote 30 Sep; update after); the EU item can move to
   verified once EUR-Lex is readable; deals were thin in the window.
   PR #65 merged by TB's instruction (b14dc25).
74. S24, redesign session 26, Phase 11 part 1 (TB: "merge and go"): old styles and dead code.
   - Live defect found and fixed: `/seven-layers-map.html` (linked from Platforms and Tech) ran an inline script that the
     site policy has blocked on production since it shipped (S23), so the map drew nothing; its script is now
     `public/seven-layers-map.js`. The page showed invented dashboard figures ("LIVE NOW", containment, cost per
     contact) with no label; a note now says every figure is an invented example. It loaded Inter, JetBrains Mono and
     Instrument Serif from Google; now self-hosted Plex. Google Fonts is out of the policy (`font-src 'self'`, no style
     host) and out of the Privacy Policy. `security.test.mjs` fails on any inline script or remote stylesheet in
     `public/*.html`; the live checker opens the map and requires its grid to draw (256 checks).
   - The not found page, the loading line and the route error screen still used the light palette on the dark site:
     "Page not found." and "This page did not load." were navy on ink (1.13:1). Now on tokens.
   - Contrast on every tool page (sweep of 25 tools at 1440 and 390, now 0): the report panel's grade chips are
     colourless (Finance-grade filled, Planning-grade heavy outline, Directional light outline, not applicable dashed,
     void the print red with its word); `ReportActions` is on paper tokens; the route rail's step number and two
     tools' pressed choices use `onFill`; `InfoDot` is on tokens with a 32px hit area and a dark note; disabled send
     buttons are solid. Dead code: `src/lib/scenario.js` (superseded by scenarioUrl) deleted. `tokens.test.mjs` adds
     ReportActions, InfoDot and App.jsx. Suite 25,777; live check 256 of 256.
   - Noted for the performance pass: arriving on Staffing from Shrinkage (a rail value pulled on load) scrolls the page
     sideways for about 300 ms before layout settles (202 px at 1440); the served HTML is clean.
   Next: Phase 11 part 2 (performance against the budget, full accessibility audit, special edition switch); the
   measurement review needs TB's PostHog numbers.
   PR #66 merged by TB's instruction (5fc11f6), with CX Dive repointed to customerexperiencedive.com (TB; every other
   ecosystem link checked).
75. S24, redesign session 27, Phase 11 part 2 (TB: "merge and go").
   - Performance: `scripts/perf-check.mjs` holds ten page kinds to LCP and FCP within 2.5 s, CLS under 0.1 and 300 KB of
     compressed script on a throttled phone (390, 4x CPU, 1.6 Mbps). Production: all ten within budget (LCP 0.5 to 1.1 s,
     script 116 to 250 KB, Genesys the heaviest at CLS 0.049). Runs nightly after the live check.
   - Accessibility: axe-core (WCAG 2.2 A and AA) on all 432 sitemap pages at 1440 and 390. Found and fixed: the Contact
     topic menu and, beyond what axe saw, every Contact, Subscribe, gated report, vendor review and ReportActions label
     unbound (fields named only by placeholder or aria-label); the review form's two radio groups unnamed; sideways
     scroll regions not reachable by keyboard (Schedule Adherence, Occupancy, RFP, Staffing, Forecast, industry
     benchmarks, and every method page table on a phone); step numbers and counts faded to 1.6 and 2.3:1 (Advisory,
     About, How to Choose). Re-audit: 0 violations. `a11y.test.mjs` gates each pattern, each rule proven to fire.
   - Found by tracing the Staffing overflow noted in item 74: the shared `Result` count-up showed raw floats mid-animation
     ("129.2584297154897" at 64 px) and announced every frame to screen readers. It now rounds to the figure's own
     places and one hidden live region announces the settled value.
   - Special editions: `src/lib/editions.js` (Pillar edition: magenta, amber, teal arcs, sky X; each 3:1 on the house),
     a dated schedule (empty until TB sets one), the header switches after load so the prerender never differs;
     `editions.test.mjs` (25). TB (27 Sep): the Pillar edition runs 5 to 9 October 2026 for Customer Service Week and
     CX Day; checked in a browser with the clock set (arcs switch on 6 Oct, everyday mark on 12 Oct, no hydration error).
   Suite 25,812; live check 256 of 256. Phase 11 complete except the measurement review (needs TB's PostHog numbers).
   PR #67 merged by TB's instruction (5b7fdbf).
76. S24 (28 Sep), P6 item 13, unsourced figures (TB: "merge and go"). BLS wage update (item 38) blocked: every bls.gov page,
   the national file and the API refuse this network (API daily limit); TB to supply the May 2025 national mean and median
   hourly wage for SOC 43-4051. Human Premium: the 60 to 80% automation, 20 to 40% remainder, 2 to 3x complexity, $2M
   account, $200 an hour and 10 to 15 years claims were stated as fact with no source; the argument stays in words and the
   500-agent case is labelled an illustrative example of our own. Its certification list was checked on each provider's
   page (research agent, 28 Sep): nine of twelve were wrong or unverifiable (Google AI Essentials is USD 49 a month, not
   free; AWS AI Practitioner USD 100, not 150; Azure AI-900 retired for AI-901 at USD 99; no ICMI CCCA credential exists,
   removed; no Qualtrics XM Certification, now Platform Essentials at $100; Tableau Desktop Specialist now Salesforce
   Certified Tableau Desktop Foundations at USD 75; UiPath exam USD 150, training free; HDI $849 to $1,699; COPC 40 hours
   from $3,950); superlative "why" lines retired; prices and times now as each provider states them, with the check date
   on the page. Platforms and Tech: per-agent cost ranges and automation rates by era (including 2030) and the 2% QA
   sample retired; points to the TCO calculator. Advisory: "350+ vendor assessment library" becomes the derived profile
   count; "50+ implementations" dropped. `copy.test.mjs` section 6 keeps them retired and pins the certification list
   (https link, provider cost and time, check date). Suite 25,822.
   PR #68 merged by TB's instruction (1b99278).
77. S24 (28 Sep), P6 item 14, facts not verdicts on the rail. The debt named TCO and Business Case; the sweep found twelve
   verdict keys across nine tools, none read by any tool: `analystRead` (AI Deflection, Attrition, Business Case, Channel,
   CPC, FCR, License Gap, Staffing, TCO), `grade` (Channel, CPC), `confidence` (Business Case), `licenseConfidence`,
   `deflectionVerdict`, `attritionConfidence`, `fcrLeakageConfidence`. All removed from the publish calls, and the rail now
   refuses them at the door: `normalizeForPublish` (which `publishToolResult` runs) drops any key in `RAIL_VERDICT_KEYS`
   or ending Verdict, Confidence, Grade, Read, Recommendation, Headline or Severity, with a flag naming it; the registry
   no longer lists analystRead, confidence or grade. `rail.test.mjs` V0 to V4 (no registered fact matches the pattern; the
   publish-call scan proven on a planted key). Channel, CPC and FCR pins now require no verdict in the publish. Suite
   25,827; live check 256 of 256.
   PR #69 merged by TB's instruction (4bb2e15).
78. S24 (28 Sep), P6 item 15 part 1, every rail pull external. Seven tools (AI Deflection, Attrition, Business Case, Channel,
   CPC, FCR, License Gap) pulled with `getPrimitiveWithSource`, which hands back a tool's own publish; 25 reads now use
   `getExternalWithSource(key, TOOL_ID)`, with a frozen `NO_RAIL` empty read in the old shape so the code after each read
   is unchanged. A reopened tool no longer badges its own value as pulled; a value another tool published still arrives
   with its source and origin grade (browser: CPC publishes, FCR shows PULLED, CPC reopened shows none of its own).
   `rail.test.mjs` V5 and V6: no page calls a self-capable getter (proven on a planted pull); AI Deflection, Attrition,
   Channel and FCR pins moved to the external getter. Suite 25,829; live check 256 of 256. Part 2 (Staffing, CPC, FCR,
   AI Deflection and Channel publish origin grades) is next.
   PR #70 merged by TB's instruction (bfcbcd8).
79. S24 (28 Sep), P6 item 15 part 2, origin grades. Staffing, CPC, FCR, AI Deflection and Channel pulled graded values but
   published none, so a consumer graded their figures Directional through railEvidence(null) whatever the reader had
   entered. `originsFor(gradeObj, published)` in `confidence.js` grades every key a tool publishes at its evidence grade
   (the weakest evidence behind the result: it can understate a well-evidenced input, never overstate one); a void
   publishes none; a republished unchanged value keeps its producer's grade (toolData provenance rule). The five tools
   pass it to `publishToolResult`. Browser: every published key carries a grade (Directional at the defaults). `rail.test`
   V7 to V10; the channel report harness's slice marker moved with the publish block. Suite 25,833; live check 256 of
   256. P6 item 15 closed.
   PR #71 merged by TB's instruction (147d13a).
80. S24 (28 Sep), P6 item 16. Two of its four debts were already done: ReportActions `Field` labels are bound (`useId`),
   and Business Case's next step comes from the journey graph through ReportActions (3-02). TCO method 1.2: when the
   marginal cost per contact is above the full cost per contact (the handle time does not fit in the agents' paid
   hours), the result says so with both figures and holds completeness Directional (defect class 3); a corrected input
   now says the result grades Directional until corrected (it said "treat the output as void" while grading
   Directional). Since method 1.1's marginal load the S21 guard case (1 agent, 120,000 contacts) no longer crosses; the
   pin uses 300,000. A/B on 6,000 cases against the engine without the check: figures identical, grades differ only
   where it fires; the method 1.1 load A/B now sets those cases aside and counts them. Method page, changelog entry,
   version 1.2. Suite 25,841; live check 256 of 256. Open for TB: `MECH_INITIAL` F2 (defaulting the capacity action to
   "none" shows $0 realizable until the reader picks an action; needs unselected-state rendering first).
81. S24 (28 Sep), item 38, the BLS wage update. TB validated the release against BLS: OEWS May 2025, released 15 May
   2026 (USDL-26-0725), the latest; there is no May 2026 dataset. SOC 43-4051 median hourly $21.53 (was $20.59), mean
   $22.40, mean annual $46,590. `market.wage.agent` 21.53, version 2, reviewed 2026-09-28, source "May 2025 (released 15
   May 2026)" with the BLS tables link; `BLS_WAGE_VINTAGE` in `benchmarks.js` feeds the Occupancy, Shrinkage and Schedule
   Adherence hints, so no tool writes a vintage by hand. Eight methods move a version (Staffing, CPC, Channel, Attrition,
   Occupancy, Shrinkage, Adherence 1.1; Business Case 1.2) with a changelog entry each; method pins recomputed from the
   engines. A/B: with the wage held at $20.59 every pre-change pin reproduces exactly (121 of 121), so only the wage
   moved; grades on 10,000 random cases equal across wages except 39 Attrition cases where the higher salary crosses the
   40 to 60% band edge (the salary is that band's denominator). Opening cases: Staffing annual $10,502,407 to $10,981,876,
   Channel net realizable $3,022 to $3,344 a month, Attrition salary $42,827 to $44,782, Business Case with hiring
   avoidance net $995,257 to $1,039,240 and payback month 31 to 30; no action unchanged ($31,850). Old scenario links
   carry only changed fields, so a link that left the wage at default opens at the new one. Suite 25,841; live check 256
   of 256. TB suggested next: the May 2025 set for other contact center SOC codes (supervisors, technical support).
   PR #73 merged by TB's instruction (2063c4c).
82. S24 (28 Sep), P6 item 17 part 1, Attrition's root-cause layer (TB: "go"). Attrition method 1.2. The retired Agent
   Experience Diagnostic returns as "Why are agents leaving?" on the Attrition page: six drivers (workload and recovery,
   schedule control, tools and desktop, knowledge and enablement, supervisor coaching, career path) as statements rated 1
   to 5, in our words, with no figure (the old statements carried unsourced thresholds and its bands predicted attrition
   rates and replacement costs). Data in `src/lib/rubrics/attritionDrivers.js`, scored by the one rubric engine: a
   statement at 2 or below becomes its action, weakest driver first, each driver with the tool that measures it
   (Occupancy Risk, Staffing, AHT Decomposition, FCR Leakage, QA Scorecard; career says no tool yet and links The Human
   Premium). No overall score, band or predicted rate; drivers are not averaged. It replaced a list that marked drivers
   High or Medium from the attrition rate alone ("the most controllable attrition driver", "leave faster than agents who
   feel underpaid", no source). The cost engine is untouched and reads no answer; the report harness proves answers move
   no figure, grade, signal or other section. Scenario links carry the answers (`LINK_DEFAULTS`); older links open with
   none. The PDF prints "Why Agents Leave: Your Answers" when a driver is complete; the method page publishes every
   statement and action from the same object (`checks` on the model, rendered by `CalcPage`). `drivers.test.mjs` (31).
   Root `download` archived to `docs/archive/` (TB: archive, not delete). Suite 25,963; live check 256 of 256.
   TB decisions the same day: F2 agreed (capacity action starts at "none", so zero until the reader picks one; queued).
   SOC codes: recommended only where a tool shows the figure: Attrition's unsourced supervisor ($55), trainer ($45) and
   HR ($48) loaded rates would become BLS medians for 43-1011, 13-1151 and 13-1071 at the shared benefits load; needs the
   May 2025 rows from TB (bls.gov refuses this network).
   PR #74 merged by TB's instruction (15b2aa4).
83. S24 (28 Sep), F2 (TB: "agreed, start at zero"). `MECH_INITIAL` is "none": CPC, Channel Shift, FCR Leakage, AI
   Deflection and Attrition open with no capacity action, so freed time realizes $0 until the reader chooses; no tool
   picks an action for them. Unselected state: AI Deflection (method 1.1) and Channel Shift (method 1.2), whose decision
   turns on that net, withhold it ("Choose a capacity action first", with what the choice unlocks) instead of printing
   "Buy nothing" or "Do not approve yet"; AI Deflection also withholds the severity band on the review payload; their
   headlines, and FCR's, say why the figure is a cost or counts nothing yet. Every figure still shows; formulas unchanged;
   with an action chosen every figure, grade and decision equals the previous engine. Method pages run their worked
   examples at avoided hiring and say so (pins unchanged). Harness fixtures that pinned "the shipped default" now pin
   avoided hiring explicitly; new pins prove the opening state, the withheld decisions and their restoration. Suite 25,955;
   live check 256 of 256; browser at 1440 and 390 on the five tools clean.
   PR #75 merged by TB's instruction (48f1283).
84. S24 (28 Sep), P6 item 17 part 2, Roadmap anonymous sequence capture (TB: "go"). Taxonomy 1.4: event
   `roadmap_snapshot` with `tool` and `milestones`, one letter per fixed milestone m1 to m18 (n, p, r, b, c for not
   started, in progress, at risk, blocked, complete), exactly 18 letters or dropped, scoped to that event only. Sent when
   the reader opens the summary, once per distinct code; notes and the initiative name never travel. It is the first event
   that carries anything the reader entered, so it is disclosed where it happens: Roadmap's rail says what is recorded
   (`PRIVACY_BY_TOOL` in ToolFrame; every other tool keeps the shared line) and the Privacy Policy's PostHog paragraph
   names the exception. `docs/MEASUREMENT.md` 1.4 section and rule. Gates: `track.test.mjs` P1 to P9 (version, names,
   the code builder, the summary-only send, no text on the wire), `toolframe.test.mjs` (scope, validator, per-tool privacy
   line). Suite 25,964; live check 256 of 256; browser at 1440 and 390 clean. Once events arrive, a PostHog breakdown of
   `milestones` shows where plans stall.
   PR #76 merged by TB's instruction (055f243).
85. S24 (28 Sep), the other contact center SOC codes (TB validated against BLS Table 1, May 2025, released 15 May 2026):
   43-1011 First-Line Supervisors of Office and Administrative Support Workers $33.41, 13-1151 Training and Development
   Specialists $33.31, 13-1071 Human Resources Specialists $36.51 (median hourly; means and employment in the registry
   comment). Registered as `market.wage.supervisor`, `market.wage.trainer`, `market.wage.hr` (kind market, Table 1 link,
   reviewed 2026-09-28); the three unsourced Attrition heuristics ($55, $45, $48 loaded) are retired. Attrition method 1.3
   opens each rate at the median times the shared benefits load, to the cent ($43.43, $43.30, $47.46). Opening case:
   all-in per departure $18,535 to $18,381, annual burden $1,297,454 to $1,286,673; the verified fixture keeps its old
   inputs and reproduces to the cent, so only the three rates moved. Method page names each rate with its median; pins
   recomputed; `attrition.test.mjs` pins values, SOC codes, the release wording (never "May 2026"). Suite 25,966; live
   check 256 of 256.
   PR #77 merged by TB's instruction (b968890).
86. S24 (28 Sep), first visit batch 1 (TB: "ensure the first visit is one that builds trust, allows it to be shared, used
   and revisited"; no PostHog numbers needed to fix what is known). Audit of the homepage, a tool, a method page, About and
   Subscribe at 1440 and 390. Fixed:
   - Every capacity tool opened with a red "High: Check this input" (and Cost per Contact a red-outlined question) because
     F2 starts at no action. An open choice is not a defect: `isNoActionFlag` in `mech.js`; Cost per Contact, Channel
     Shift, FCR Leakage and AI Deflection show it as Unknown, "Your choice is still open"; AI Deflection's issue count
     leaves it out unless an input is invalid. Engines, flags, PDFs and grades unchanged.
   - 16 pages (About, Advisory, Contact, the seven Phase 1 category pages, Vendors, Phase 1 profiles, Human Premium, CX
     Ecosystem, Platforms and Tech, the CCaaS cost article) hid every section at opacity 0 until scrolled to: empty bands
     on a fast scroll, a print or a screenshot. `FadeIn` is now a plain wrapper. The content that surfaced had one AA
     failure (Platforms and Tech era tag at 70% opacity, 3.3:1), fixed; era buttons carry `aria-pressed`.
   - Share: `ShareButton` on every `Crumbs` row (method, industry, segment, CCaaS category and industry, researched
     profiles, Market Watch, Research, About, Contribute, Corrections): the phone's share sheet on touch devices, else the
     link is copied; the page's path and view hash only, never the query. Taxonomy 1.5: `page_shared` with `page_type`
     and `via` (native or copy), scoped to that event.
   - About rewritten as facts a reader can check, every count derived (tools, methods, profiles, categories, researched
     CCaaS, industries, segments): what you can use, how the numbers are made (four claim kinds, three grades, published
     methods, sources), independence rules, your data, get in touch. Retired: "some platforms are genuinely better ... and
     we'll say so", "Our research, scoring and vendor evaluations", "operator credibility", "Six pillars that make this
     different from everything else". Metadata "About", not "Our POV". Header in the flow.
   - Subscribe asked for first name, last name, company and email, all required, and said nothing about what arrives.
     Now email only; what an email carries (method changes, vendor research, Market Watch), at most one a week, reply to
     stop. Privacy Policy field list updated. Header in the flow.
   - Cost per Contact FCR tiles: heading and chip stack instead of squeezing.
   `firstvisit.test.mjs` (34). Suite 26,009 green; live check 256 of 256; 432-page sweep at 1440 and 390 clean.
   TB (28 Sep): About stays without a name for now ("incognito"). Subscribe reworded to the value of each email (key
   takeaways, ideas to test, Market Watch, vendor research, method changes) and a planned rhythm that moves with the news:
   about once a week, an extra one when more is worth it, skipped in a quiet week; reply to stop (handled by hand).
   PR #78 merged by TB's instruction (fa1f1b5).
87. S24 (28 Sep), first visit batch 2 (TB: "Sound human. Be an expert. Be concise but descriptive assuming not everyone
   knows everything"; audience from newcomers to ten years in, leadership, strategy, operations, IT and security).
   - Voice pass on all 25 tools and the nine rubric data files (which also render the method pages), by seven writers on
     one brief (scratchpad `voice-brief.md`: define a term in one clause where a newcomer first needs it; say what a
     number is, why it matters, what to do; no "X, not Y", no swipes or sales lines, no slash shorthand; every figure,
     formula, threshold, doctrine word, verdict label, id, key and pinned opening unchanged). Harness pins moved only
     where they matched old wording of a kept meaning; each is listed in its commit.
   - Found and fixed on the way: Attrition's main read printed "${BAND.low} to ${BAND.high} percent" literally in three
     branches (plain strings); `floor.test.mjs` now fails on any printed "${". Five tools said a corrected input made the
     output "void" while grading Directional (CPC, Staffing, Channel, License Gap, Attrition now say Directional). FCR's
     and AI Deflection's method text described two confidence axes (three). Business Case said recruiting and training
     spend is never scaled (trainee ramp is). Staffing no longer calls handle time "reducible".
   - Cost per Contact's "Vertical planning ranges" retired with its 15 registry entries (TB: follow the recommendation):
     heuristic ranges for three industries whose "Avg FCR" read as measured. The panel now says no reliable public
     benchmark exists for cost per contact by industry and links the industry pages.
   - Header tag "Coming soon" (was SOON). `src/lib/IdeaBox.jsx` on Research ("What should we study first?") and
     Perspectives: the idea required, role and email optional, to the existing inbox, named in the Privacy Policy; the
     homepage Research door says "Suggest a study". Phone question labels keep to one line (tighter tracking).
   - Live checker: a start screen is now recognised by "Start" in sentence case too (the rewrite changed "Start
     Assessment" to "Start the assessment"; the checker caught it, 252 of 256, before the fix).
   `firstvisit.test.mjs` 41. Suite 26,016 green; live check 256 of 256; 432-page sweep clean at 1440 and 390; axe 0 on
   105 tool, method and landing pages. Open: TCO's input hints "Bench 5:00 to 7:00" and "Industry range: $4.5K to $7.5K
   loaded" carry unsourced figures (same treatment as the CPC ranges); Staffing's "Most centres run 80% in 20 to 30s"
   is pinned and unsourced; Vendor Match's "demo with your top match" card (item 58) still open.
   Then TB flagged the homepage missing the "reverberating rings" of the approved design (canvas P1-Home: a contour
   `repeating-radial-gradient`, 5% sky, a ring every 24px, spreading from the stack; Brand Guide texture rule 4 to 7%).
   Built as `CONTOUR` in `Homepage.jsx`, centred on the stack at desktop and the top right on a phone; the page's inline
   `background` shorthand had to become `backgroundColor` or it resets the image. The homepage Research door's tag now
   reads "Coming soon" too. `home.test.mjs` pins both. Suite 26,018; homepage axe 0 at 1440 and 390.
   PR #79 merged by TB's instruction (6fb4f5f).
88. S24 (28 Sep), sourced comparisons, "How others report it" (TB: "Go", after two benchmark research runs: the Benchmark
   Corpus and the Benchmark Library, both 28 Sep). Verdict given to TB: the data supports context beside a result, not
   per-industry averages in every tool (the Library itself: no industry figure clears three publishers); only FCR and
   wages have industry depth. Built display only: `src/lib/comparisons.js` (sources, groups, per-tool map, WITHHELD),
   `src/lib/comparisons/stateWages.js`, `src/lib/HowOthersReport.jsx` on 11 tools (CPC, FCR Leakage, Attrition,
   Staffing, Occupancy, Shrinkage, Adherence, AI Deflection, Channel Shift, TCO, License Gap). No tool imports the
   figures; nothing reaches an engine, default, flag or grade. One publisher and method per row, never averaged.
   - Read on the publisher's page this session: SQM 2026 FCR text (overall 71, retail 77, insurance 75, not-for-profit
     73, tech support 64, telco 56; financial and health insurance as ranges, their 70 and 69 read off SQM's chart in S23
     and kept from the claims registry, which the FCR group reads), SQM 2024 (69%, AHT 697 s), SQM KPI standards 2023,
     ContactBabel 2026 key findings ($7.20 an inbound call, 74 s ASA, 18% of web chats without an agent; the canonical
     contactbabel.com page replaces the Corpus's dev host), ContactBabel 2024 HR table via RingCentral (mean 31%, median
     24%, defined as total), ContactBabel 2025 channel mix via Contact Center Pipeline, NICE 2025 PDF, SHRM ($5,475; 39
     days), Salesforce (30%), YouGov (35% phone), Call Centre Helper occupancy, shrinkage and adherence, Intradiem,
     Verint, TechTarget, CPUC GO 103-A (80% in 30 s, abandonment 5% or less), seven vendor pricing pages, and all 51
     BLS May 2025 state medians on O*NET (every one equal to the Library to the cent; national $21.53 equals the
     registry). BLS pay by industry (five OOH rows) rests on TB's research (bls.gov refuses this network).
   - Corrections to the research: NICE's 39% is unmanaged attrition (the Library called it total); the Library's
     "consensus" occupancy, shrinkage and adherence ranges average several publishers' ranges and are not used; its
     SQM 2026 "n/a" for four industries is wrong (the chart publishes them).
   - Withheld and gated: Gartner 2024 cost per contact (403 from here), Umbrex shrinkage, the FCC relay rule
     (unreadable here), Freshworks ticket FCR, JOLTS turnover index, May 2023 industry means, Dialpad prices (secondary),
     vendor-defined and forecast figures, and the excluded-sources tab's misattributions.
   - The state wage is shown, never filled: filling the wage field would make a published median count as the
     reader's own figure and lift the grade.
   - Retired: TCO's "Bench 5:00 to 7:00" and "$4.5K to $7.5K loaded", Staffing's "Most centres run 80% in 20 to 30s"
     (now SQM's traditional standard, named), CPC's "How does yours compare?" text panel and `cpc.read.fcrLeakLink`.
   `comparisons.test.mjs` (699). Browser: 11 tools at 1440 and 390, every group open, no error, no overflow, axe 0.
   PR #80 merged by TB's instruction (ee7c527); production serves the panel.
89. S24 (28 Sep), P6 13b, the queued originality searches (TB: "go"). The queued phrase lists lived in earlier scratchpads,
   so the runs were rebuilt from the current files: 152 distinctive 10 word runs (Telecom 20, Travel 20, Education 20,
   Financial Services 42, Utilities 30, Government 20) searched as exact phrases by six agents on one brief (WebSearch;
   a positive control found its published source first). No result carried any run verbatim. Every related page the
   searches returned was fetched and compared by script with every prose segment for shared 8 word runs: 381 pages
   compared, 74 blocked or script-rendered; of 10 PDFs, 5 compared on text extracted from their streams and 5 gave no text. One shared run, GAO's own
   wording in a sentence that credited GAO ("federal legacy systems most in need of modernization", Government main and
   sub-page); reworded in our own words and recorded as a match. Each industry's originality record carries the second
   pass and the check date 2026-09-28.
   PR #81 merged by TB's instruction (abd1e88). GitHub nightly on production after PR #80: live check and performance
   budget green (the sandbox's 19 of 256 was its own egress, as before).
90. S24 (28 Sep), TCO's remaining unsourced input hints (TB: "go"). Retired: "Typically 25 to 35%" (benefits), "Bench 65 to
   85%" (FCR), "Bench 15 to 45%" (containment), "25 to 35%" (shrinkage), "Bench 20 to 40%" (attrition), "5 to 10%"
   (absenteeism), "Target 88 to 95%" (adherence), "Target under 30s" (ASA), "Target under 5%" (abandon), "Bench 3.8 to
   4.5" (CSAT), and the report's per-agent colour band ($4,500 to $7,500, `getBench`). Hints now say what to enter or
   point to How others report it; TCO's panel gains FCR, attrition, service level, occupancy, shrinkage and adherence,
   and the shrinkage group adds ContactBabel's US 2023 median short-term absence (6.5%, read in its own table). No figure,
   grade or engine line moved (TCO harnesses unchanged). `comparisons.test.mjs` section 7 keeps them retired. Open for TB:
   TCO's industry wage presets ($19 general, $22 financial, $20 healthcare, $16 retail, $19 telecom, $21 insurance, $15
   BPO) are labelled heuristics; BLS May 2025 now publishes medians for four of them (national $21.53, insurance $22.47,
   retail $17.96, business support $17.68). Moving them is a method change (version bump, A/B).
   PR #82 merged by TB's instruction (b0d9d7d).
91. S24 (29 Sep), TCO method 1.3 (TB: "go"): industry profile wages at BLS medians where BLS publishes them. J11 refined:
   the cross-industry profile reads `market.wage.agent` itself ($21.53, was a $19 planning value; `tco.wage.general`
   retired, so no copy of the national wage exists); insurance $22.47 (was $21), retail $17.96 (was $16) and BPO at
   business support services $17.68 (was $15) are registered `market` entries, the BLS OOH May 2025 industry medians for
   SOC 43-4051 (TB research; bls.gov refuses this network); financial services, healthcare and telecom have no May 2025
   industry row and stay labelled heuristics. A/B: at the old $19 the engine reproduces every old pin exactly; in all four
   profiles only wage-driven figures move (technology, telephony, seats, hires and flags unchanged); formulas and grades
   unchanged (a preset still grades Directional). Opening case: annual $15,291,986 to $16,703,994, cost per contact $10.62
   to $11.60, marginal $2.51 to $2.83, savings $68,000 to $76,000 gross ($48,000 to $54,000 expected). Pins, changelog,
   method page, sources paragraph (TCO now names the BLS wages it reads) and `tco.test` J11 updated. Suite 26,783; live
   check 256 of 256.
   PR #83 merged by TB's instruction (862ddc9).
92. S24 (29 Sep), TB: the Vendor Match demo card is a CTA to keep ("I can leverage that. Need a button linked to
   formspree"); About "should not involve me but should involve why we built this and the value intended it brings all
   user types and personas"; no newsletter yet. Built:
   - `src/lib/DemoRequest.jsx` on Vendor Match (replaces the link card): "Request a demo with <top match>" opens a short
     form (work email required; name, company and what the demo should show optional) posting to the contact inbox
     (xvzvdnry), `_subject` "Demo request: <vendor>", intro fields as the contact form's. The reader's answers in the tool
     (industry, size, current platform, priorities, compliance) travel only while a listed checkbox stays ticked. Tracked
     as `vendor_action` intro on open and `intro_submit` on send. States that asking never changes a list, order or
     finding, and that nothing reaches the vendor until the reader confirms the scenarios (a process promise for TB).
     Privacy Policy FORMS entry added. `intro.test.mjs` pins (29).
   - About: "Why we built this" (four paragraphs in a human voice: the floor lives with decisions made far away; those
     decisions are hard and the guidance is often from someone selling; the site shows its working, sources and grades;
     better decisions make better days and better service) and "What it offers you", nine readers (new to contact
     centers, operations and workforce, leadership, strategy, IT, security, finance and procurement, consultants,
     vendors). No name, no figure, no outcome claim; `firstvisit.test.mjs` pins both (43).
   - Market Watch (recommendation to TB): keep the FCC TCPA item labelled a draft until the 30 Sep vote, then update it
     from the FCC's own release (adopted as circulated, changed, or pulled) in a dated PR; keep the EU AI item labelled
     news (EUR-Lex still returns nothing to this network); refresh weekly once distribution starts. A check-in is set for
     1 Oct.
   PR #84 merged by TB's instruction (d18a733).
93. S24 (29 Sep): AHT Decomposition gets How others report it (voice handle time: SQM 2024, 697 seconds; ContactBabel
   "over seven minutes"). It was the one tool whose subject had verified published figures and no panel. Twelve tools
   now carry the panel; Forecast Accuracy, Business Case and the frameworks stay without one (no published figure that
   passes, per the eligibility decision). Sweep of every tool's copy for unsourced benchmark wording: none left outside
   registered, labelled planning values.
   PR #85 merged by TB's instruction (8c56212).
94. S24 (29 Sep), site audit item 1 (TB: take the audit findings one at a time): the 7-Layer CX Orchestration Framework
   download returned 404 on production after the reader gave name and email (the file was committed as
   "CX-Orchestration-Framework-2026 (1).pdf"). The April document itself carried unsourced figures (2% QA sample, 10%
   forecast gap, 20% and 50% thresholds), retired wording ("Industry-Leading", "competitive advantage", "table stakes"),
   forecasts, a vendor statistic, an out of date EU AI Act date and links to retired tools. TB chose a rebuild.
   `src/lib/frameworkGuide.js` (content as data: seven layers named as the site names them, each with what it does, who
   usually owns it, three questions, what to check first, what fails, the diagnostics that test it, and published figures
   only through comparison groups with their sources), `src/lib/frameworkHtml.js` (pure page), `scripts/framework-pdf.mjs`
   (prints it with Chromium and self-hosted Plex to public/CX-Orchestration-Framework-2026.pdf, 14 pages, and records page
   and file hashes in `src/data/frameworkGuide.manifest.json`). Readiness checklist: any statement at 2 or below is an
   action; no total or band. Download page copy updated. `framework.test.mjs` (62): every gated file exists, the PDF was
   printed from the current content (a content change without a reprint fails, proven), house rules, live links.
   Reprint after any content change: `CHROMIUM_PATH=/opt/pw-browsers/chromium node scripts/framework-pdf.mjs`.
95. S24 (29 Sep), Privacy Policy hardened from TB's legal review notes (LegalZoom general information: describe practices
   accurately, no promises the code does not prove, legal bases, retention criteria, processors named). Facts checked in
   the code first: scenario links use the query string (`?s=`), so opening one sends its inputs to the host, whose logs may
   keep them (TB: keep the format; the policy warns); analytics send the path only; PostHog is called without its library
   (no autocapture or replay), person profiles off, random id in local storage and visit id in session storage, and TB
   confirms "Discard client IP data" is on; mail is Google Workspace (the domain's MX records); no other processor (TB);
   vendor reviews are not published anywhere. Operator: sole proprietorship based in the United States (TB: not formed
   yet; no name, as on About). Policy dated 29 September 2026: no "By using the Site"; tools "designed to" process inputs
   in the browser; scenario link warning; sensitive information warning; reviews not published and email never public;
   processors named (Vercel, PostHog, Formspree, Google Workspace, GitHub); introductions: the vendor handles what it
   receives under its own practices; marketing apart from requests ("occasional related updates" removed); retention by
   category; rights with appeal and agent; EEA and UK legal bases; transfers; reasonable safeguards (the "strict content
   security policy" and "no passwords to protect" promises removed); children; other websites. The tool frame and About
   now say numbers stay in the tab unless you ask for a review or share a scenario link. `privacy.test.mjs` 23.
   Before the first newsletter: a postal address is needed in the email footer (US commercial email rules). Next: Terms of
   Use, per TB's notes.
96. S24 (29 Sep), Terms of Use from TB's legal review draft (LegalZoom general information, not legal advice), with TB's four
   items: (1) entity and jurisdiction: operator named as in the Privacy Policy (sole proprietorship based in the United
   States; no entity formed), no placeholder published, governing law and venue left out until TB and counsel decide;
   (2) visible assent: `src/lib/Assent.jsx` ("By submitting, you agree to the Terms of Use and acknowledge the Privacy
   Policy.") beside the submit button on vendor reviews, contributor proposals, consultation requests, research
   corrections, demo requests and review requests (notice, no checkbox; TB and counsel may switch to a checkbox);
   (3) separate commercial terms: the Terms say paid engagements take their own written agreement; (4) no arbitration
   clause. `TermsOfService.jsx` renders TERMS_SECTIONS (27 sections; disclaimers set in capitals by CSS, so the source stays
   readable); section 3 says the Phase 1 scores are withdrawn and none shows today; section 12 notes that publishing a
   method does not license its reuse. Page title "Terms of Use"; /privacy and /terms descriptions no longer claim "No
   third-party tracking". `privacy.test.mjs` 37.
   TB (29 Sep): the operator is based in Arizona. Both documents say "a sole proprietorship based in Arizona, United
   States"; Terms section 22, governing law: Arizona law, courts located in Arizona (no county named; counsel to confirm).
   Privacy Policy aligned to the Terms' minimum age (18). PR #86 merged by TB's instruction (39c9413); production serves
   the framework PDF (200) and both documents' Arizona text.
97. S24 (29 Sep), site audit item 2: the IVA buyer guide. The PDF (April 2026, 25 pages) is the Phase 1 edition: composite
   scores out of 100 for 43 vendors, tiers, forecasts to 2029 and analyst quotations. Per the standing S23 decision (the
   Phase 1 PDFs stay downloadable as dated editions), the download page now reads like the CCaaS guide's: "The Phase 1
   assessment of 43 IVA and conversational AI vendors, dated April 2026", scores and tiers withdrawn on the site, forecasts
   as that edition stated them and not re-checked; retired "50 vendors scored across 7 market categories", "validated by
   Gartner and Forrester", "why the best CX operations" and "vendor shortlists" (the PDF counts 43, not 50). Search
   description and the IVA category link label say Phase 1 edition. `framework.test.mjs` 65.
   PR #88 merged by TB's instruction (b73153e).
98. S24 (29 Sep), site audit item 3: two calls to action still offered vendor scores the site withdrew in S22 ("See CCaaS
   Vendor Scores" on the WEM and QM category page, "See Our CCaaS Vendor Scores" on the CCaaS migration cost article).
   Both already linked the CCaaS category page, which lists vendors by the job they do; the labels now say so ("Browse CCaaS
   Platforms by Job"). The article's two TCO links go straight to `/tools/tco-calculator` (they reached it through a
   redirect). `freeze.test.mjs` walks every page, component and data file: none may offer to see, view, compare, explore,
   browse or check vendor scores, rankings or ratings (proven on the old WEM page). 
   TB (29 Sep): the homepage's A to Z proof tile linked About; it now opens the vendor directory ("Browse the vendors"),
   so each proof tile opens its own evidence (`home.test.mjs`). Suite 26,939.
   PR #89 merged by TB's instruction (a517581).
99. S24 (29 Sep), TB's fix list (TB: "1. Merge 2. Fix 3. Yes 4. Agreed 5. Go 6. Agreed").
   - TB decision, audit item 4: the 264 Phase 1 vendor profiles stay as they are ("many have been researched to a certain
     extent"); each is updated as clean research arrives. No removal for want of sources.
   - License Gap: a void rendered no figure in its Result but still showed the seat tiles, hidden annual, drivers, commit
     and projection tiles and the read; all now sit inside `!voided` (`licensegap.test.mjs`, 10 fail on the old file).
   - 11-04 measurement: the route rail on every tool page linked the next tools and sent nothing, so the first-to-second
     funnel undercounted journey use. Each rail link now sends `next_step_click` (from, to), the event ReportActions'
     next step sends; checked in a browser with a test key (`toolframe.test.mjs`).
   - Vendor Match ceiling cap (section 7 interim): on 20,000 random profiles the top vendor sat at 99 in 67% and two or more
     shared 99 in 63% (order by list position). Order now follows the unclipped score, no score shows above 90 ("90+"),
     vendors within 5 points of the top are one leading group; disclosed on page and in the PDF; "Ordered by fit on the
     Phase 1 model". Weights unchanged. `vendormatch.test.mjs` (13, registered).
   - J10 completed: TCO method 1.4 (handle-time lever at the marginal load) and Business Case method 1.3 (derived marginal,
     handle time and freed trainee time at the savings rate; absorbed labor stays loaded, recruiting cash unchanged).
     Opening cases: TCO $76,000 to $74,000 gross a month; Business Case with hiring avoidance net $1,039,240 to $946,250,
     return 23% to 12%, payback 30 to 32; no action unchanged ($31,850). bcb.test PRE13 (same engine at the 1.2 valuation)
     keeps every historical artifact chain; 12j A/B on 6,000 cases: only the load-valued savings move, by exactly the ratio;
     costs, cash and grades identical.
   - 26 unused copies of the retired three-arc mark removed; four tools carry an `@helpers-end` slice marker; `mark.test.mjs`
     refuses the old mark. Suite 26,975; build green; local live check 256 of 256; browser at 1440 and 390 clean.
   Next from the list: item 7 (source the 77 category by industry pages) and item 8 (the "X, not Y" pass).
   PR #90 merged by TB's instruction (3466a83).
100. S24 (29 Sep), fix list item 7 (TB: "Validate and source the research on these pages"): the 70 category by industry
   pages outside CCaaS (7 categories by 10 industries; CCaaS has its own research pages) all render one industry paragraph and
   one chip list from the shared data. Each paragraph is rewritten in our own words around figures already sourced in the
   claims registry (items 36 and 37), rendered by ClaimText with a sources list: HIPAA penalties, referral completion,
   Regulation E, returns, CPNI, claim acknowledgment, catastrophe losses, DOT refunds and EU 261, Section 508 and ADA
   Title II, EIA outage hours, PHMSA gas procedures, warranty claims, NHTSA Part 573, FERPA and Title IV. Retired with no
   source: "20-30% longer" handle time, "7+ minutes", "40-50%", "8-10x", "60-70%", "5-20x", "3-5x", "99.999%", "12-24
   months", and the verdicts ("top CX killer", "strictest", "highest-ROI"). The chips became "Rules and standards buyers ask
   about": 21 rules in `RULES`, each linked to its publisher's page with its kind and how it was checked (17 read on 29
   Sep; FFIEC, NAIC, ISO and FBI CJIS refuse this network and link their own addresses); operating wishes ("Seasonal 10x
   scale", "Multi-currency", "24/7 global coverage", "99.999% availability") and vague entries are gone; StateRAMP is
   GovRAMP. The hero no longer says vendors were "evaluated" for the industry. Content lives in `src/lib/verticalsContent.js`
   (loaded only by the page), so the entry chunk fell from 276,174 to 268,346 bytes; the pre-audit text stays there as
   drafts for lineage. `catvertical.test.mjs` (150, registered). Suite 27,125; browser at 1440 and 390 clean.
101. S24 (29 Sep), fix list item 8 (TB: "Go"): the "X, not Y" cadence retired from public copy. 342 matches outside
   `node_modules` across 64 files; five writers on one brief (scratchpad `xnoty-brief.md`: say what a thing is; keep every
   figure, id, key, claim token, doctrine word and pinned phrase; comments are not copy). About 230 lines rewritten
   across 41 files, reviewed against the originals (a few now state a reason the sentence already implied). 13 remain,
   each allowlisted in `copy.test.mjs` section 7 with its reason: pinned by a harness (Business Case's "not a measured
   outcome", Channel Shift's "capacity, not headcount", TCO's "not a published median"), the Phase 1 label (TB, S22),
   approved Terms text, stored values (a Contract Risk option that links store; a QA criterion the form fingerprint
   hashes), and records that never render (lineage drafts, originality notes, an internal registry note). The gate fails
   on any new one (proven on a planted sentence) and on a stale allowlist entry. Terms of Use untouched. Suite 27,127;
   build green; 252 page loads (industry, segment, tool, method and content pages at 1440 and 390) clean.

102. S24 (30 Sep), first readings of PostHog and Search Console (TB exports; TB: "go").
   - PostHog, 24 to 30 Sep: about 25 browsers; the two busiest (`16gdez...`, `cer7x01...`) are TB's own. No second-tool
     run by a visitor yet. Three of four `tool_complete` events fired 0.2 to 0.3 s after `tool_view`, before any input
     was possible. ReportActions now counts a state change as a completion only after a trusted keystroke, tap or
     edit on the page; a change before that moves the baseline (`track.test.mjs` J18 to J18d). A browser replay of the
     cause and the `?me=1` switch for TB's browsers were blocked by this session's permission classifier (both need a
     browser that passes the site's own bot and internal-traffic filters); both are left for TB to decide.
   - Search Console, 21 to 27 Sep: 226 impressions, 1 click, average position about 41. The migration article ranks 4.3
     for "cloud contact center migration" with no clicks; its search title and description are rewritten to the
     search, and the description's unsourced claims ("most organizations are spending the same or more", "20-year
     operator", "five migrations") are gone. The body keeps TB's first-person essay pending TB (it carries the same
     claims plus Forrester, Gartner and Puzzel figures with no links). CCaaS category page retitled around "CCaaS
     vendors" (position 15.8). Researched profiles and segment pages already rank on page one for their long tail.

103. S24 (30 Sep), search metadata pass (TB: "go"). Measured all 432 sitemap pages: 121 page names over 55 characters and
   115 descriptions over 160, cut off in Google results; many descriptions also broke the site's rules ("Ranked
   Shortlist", "vendor recommendations", "reducible" handle time, "the 85% occupancy threshold", "Strengths,
   weaknesses" on profiles, "282" by hand). Rewritten: home, vendor hub (counts derived), 8 category pages, 3 CCaaS
   research pages ("CCaaS Research: X Contact Centers"), 25 tools, 23 methods, 11 industry pages, the 61 segment
   template and its 8 hand-written descriptions ("X Contact Center CX", no benchmark claims), the vendor profile
   template (drops the category when name and category pass 55), and 12 content pages. `seo.test.mjs` W1 to W5 gate
   length, retired words and derived counts (the old metadata fails four of five). Section 14 records the search rules.

104. S24 (30 Sep), TB's phone review (TB: "a: yes, b: yes, c: yes, merge"). PR #94 merged (bde0c63).
   - Unreadable buttons: a button with no background of its own took the browser's light grey (and iPhone's native look)
     under pale text; RFP Builder's focus areas could not be read on a phone. The base stylesheet in `index.html` now
     starts every button transparent with its container's colour (`a11y.test.mjs` pins it).
   - RFP Builder method 1.1: step 3 "Review + Customize" now lets the buyer reword any requirement (marked edited on the
     page and in the report), remove any (a Removed list puts it back; it leaves every count and score), and add up to 20
     of their own on any layer (key `c-<id>`, should-have by default, scored like any other). Edits, removals and
     additions travel in the scenario link (text capped at 160 characters, angle brackets stripped); a link too long
     for the cap falls back to the existing "too detailed to fit" notice. Scoring, weights, credits and rules unchanged:
     with none of the three, 2,000 random evaluations equal method 1.0 (the 1.0 builder spliced into today's engine).
     `rfp.test.mjs` 82. Browser at 390: focus stays in the text box while typing; the reopened link keeps all three.
   - Next (TB approved): reader reports written for each reader (b), starting with RFP Builder and the nine rail tools;
     then TB's business-size journey idea (proposal to TB first).

105. S24 (30 Sep), reports written for each reader (TB: "the reports by persona all look the same"; TB: "1", build it).
   PR #96 (RFP 1.1) merged (49fb47b). The reader picker only reordered sections by type, with one generic line per
   reader, so every reader got the same report in a different order, and RFP Builder's finance cover promised "how sure
   it is" on a tool with no grade. `src/lib/readerBriefs.js`: for RFP Builder and the nine rail tools, each of the five
   readers gets the sections they need first (matched by title) and three questions to put to this result ("What to
   check first", printed under the reader line). The executive sponsor gets a short front (the brief's sections, the
   confidence section, the next step; the tool's first summary when none of the brief's sections exist yet) and the rest
   as "Appendix: the detail" on a new page. A tool without grades gets reading lines that make no confidence promise
   (`READ_NO_GRADE`). A brief never changes a figure, a grade or a section; every section prints once. Tools without a
   brief keep the type order. `export.test.mjs` 319: every lead names a section the tool emits, three questions per
   reader with no dash, every section once per reader, at least three readers lead differently per tool, the executive
   front and appendix, the no-grade line, the tool id reaches the renderer, the escaping allowlist. Browser: RFP Builder
   IT report leads with layers 1 to 4; the executive report is questions, context and next step, then the appendix.
   Next: briefs for the other fifteen tools; TB's business-size journey is on hold (another chat may build it).

106. S24 (30 Sep), enterprise executive audit and fix batch 1 (TB: "Go. Let's come back to the others after"). Audit of production
   as an enterprise CX executive: three journeys (cost and AI problem, IVA and Agent Assist research, CCaaS replacement) and a
   break test of 14 more tools; report, top ten and the size matrix in `docs/AUDIT_ENTERPRISE_EXEC_2026-09-30.md`. Math held
   everywhere it was recomputed. Fixed:
   - Business Case crashed ("This page did not load") for any reader arriving from Cost per Contact or Staffing: `railEvidence`
     was called for a pulled baseline and never imported. `rail.test` V11 and V12: every function a shared module exports that a
     page calls is imported or declared (fires on the old file). The live checker opens every tool after every other in one tab.
   - The contact form (introductions included) and the vendor review form swallowed a failed send. Both say "That did not go
     through" and keep the answers; an empty contact submit says which fields. ReportActions' failure lines carry role alert.
     `privacy.test`: every page that posts a form carries a failure message (the gated report is exempt: it opens the file anyway).
   - All 50 IVA profiles printed empty Differentiator, Use Case and Segment tiles and two empty chips (the page read `diff`,
     `useCase`, `segment`, `type`; the data holds `differentiator`, `bestUseCase`, `verticals`, `category`). Segment became
     "Industries named"; the duplicate research status tile is gone. `prerender.test`: no vendor page renders an empty value.
   - AI Deflection method 1.2: Proceed also needs payback inside the 12 months modelled and a Conservative scenario that breaks
     even; else "Run a bounded pilot" naming the failed test, routed to Contract Risk. The Conservative multiples are registered
     (`aid.downside.*`, 0.8, 0.85, 1.5, unchanged). The audit case ($13,067 a month net, $2.5M implementation, about 192 months to
     pay back, Conservative loses $263,219 a month) printed Proceed. A/B on 6,000 cases: every figure identical, only failing
     Proceeds move. Suite 27,144; local live check under the production policy 257 of 257.
   Open from the audit, for TB: Vendor Match size data and inert inputs, missing Microsoft, Google and Salesforce contact
   center research, refresh loses inputs, company size and region context, cross-tool reconciliation, stale hub and PDF copy.

107. S24 (30 Sep), audit batch 2 item 1 (TB: "go"), refresh and Back keep the reader's inputs (audit top ten 6). Every tool
   removed its scenario link from the address bar once it loaded, so a refresh or Back from a method page reopened the
   defaults (Staffing 237 agents to 88). The live inputs now ride in the address fragment (`#s=`, same encoding as a shared
   link), which a browser never sends to the server, so nothing new reaches the host's logs. `src/lib/useScenarioHash.js`
   writes it: at once for a page opened from a link (a shared `?s=` link moves into the fragment), otherwise only after a
   trusted keystroke, tap or edit, so rail values are not written on arrival; the first render never clears a link the tool
   has not read yet. ReportActions calls it for every tool; the eleven tools whose report sits on a later step (four
   frameworks, Governance, Roadmap, Platform Decision, RFP, Vendor Match, TCO, FCR Leakage) call it themselves with the
   state their report encodes. `readScenario` reads the query first, then the fragment; `main.jsx` renders a fragment page
   fresh; QA's evaluator `#score` is kept beside it. A refresh treats restored values as entered, like opening your own
   scenario link (D13), so a pulled value the reader has not touched can count as entered after a refresh; the same holds
   today for a copied link. Privacy Policy says where the copy lives (browser history, and the address if copied), updated
   30 September 2026. `track.test.mjs` S (26). Browser: all 25 tools refresh with their inputs, Back from a method page,
   a shared link then refresh, the QA evaluator link, no page error. Suite 27,475; local live check 257 of 257.
108. S24 (30 Sep), audit batch 2 item 2 (TB: "go"), stale promises (audit top ten 9). The /vendors hub promised
   "Proprietary rubrics", "Every vendor gets an honest assessment", "Competitive context" and a shortlist "with honest
   assessments"; it now says how the profiles are built (the researched CCaaS count from `researchStatus.js`, Phase 1
   profiles labelled, no scores or ranks, corrections) and the six questions a researched profile answers. Counts: the
   category stat reads `CATEGORY_COUNT` (was a typed 8), "Nine categories" became "8 vendor categories and one emerging
   area", and the hero says the category counts add up to 278 because the other 4 profiles are adjacent suites on the
   CCaaS page. Its "Key vendors" lists named vendors with no profile (Nuance, Coveo, Shelf, Forter and 29 more); now
   "Profiles include (A to Z)", every name a real profile in that category (`isVendorSlug`). Agent Assist and Advisory no
   longer offer scored shortlists; Phase 1 profiles label their weaknesses "Phase 1 assessment". Platforms and Tech: the
   "Each category answers" promise (who owns it, which vendors lead) now lists what the cards show; the topic chips are
   "Questions to settle before you buy", written as questions; vendor names A to Z, Nuance as Microsoft (Nuance). IVA page
   counts the categories it shows (4, was a claimed 7). Guides: every guide opens with no form (the email form is optional,
   for updates); the IVA PDF has a first page, added 30 September 2026, saying it is the Phase 1 edition, scores withdrawn,
   figures and quotations not re-checked (26 pages; metadata subject says the same; stamped with pdf-lib from the
   scratchpad, the original pages unchanged). Researched profiles print product types and release states as words with
   acronyms kept ("GA", "EAP", "Core platform"; was "Ga", "CORE_PLATFORM"). Gates: `freeze.test.mjs` 8, `framework.test.mjs`,
   `profile.test.mjs`, seo J16. Suite 27,493. Browser: nine pages at 1440 and 390, no overflow or error.

94. S24 (29 Sep), the new mark (TB: "Go and ship it"). TB chose Voice in blue from eight concepts, their full builds and two
   finalist rounds on the canvas "Center of CX Logo Concepts" (Woven dropped: a stroke across the voice reads as a break or a
   mute; Headset dropped: it ties the brand to one channel). A solid C for the contact center, a C of 17 blue bars for the
   voice of the customer on every channel, the X where they meet (CCX). `src/lib/mark.js` is the one geometry: the header and
   footer `Mark` (Shell.jsx), `public/favicon.svg` (`node scripts/favicon.mjs`, `--check`) and the report masthead
   (ReportExport.jsx, ink C, action-blue voice and X). Below 40 px a small drawing (9 heavier bars) takes over, so the header,
   footer, favicon and masthead all use it. Special editions colour the voice bars in turn (`voices`, was `arcs`); the C stays
   mist. Brand Guide sections 4 and 5 rewritten. `mark.test.mjs` (41): construction, the small switch, colour contrast, every
   place draws from mark.js, favicon current, three-arc mark gone. Not changed: share cards (text only, no mark) and 27 dead
   `Logo`/`LogoMark` copies of the old mark left in page files (never rendered; several are md5-pinned tool files). Suite
   26,846; build and prerender green; browser at 1440 and 390, the edition on 6 Oct and the report masthead checked.

102. S24 (30 Sep), TB: the header mark looked too small, and on a phone "text runs out of the border boxes" (TB: go).
   - Mark: the voice bars take the outer part of the box, so at 30 px the C and X were about 12 px, and the square box
     left its right third empty beside the name. `src/lib/mark.js` BOX (76 by 106 units, the drawing's own bounds,
     `mark.test.mjs` proves both drawings fit with round caps and at most 3 units spare a side); trimmed marks take their
     height. Header 40 px, footer 34, report masthead 28; the small drawing now runs below 48 px. Favicon unchanged.
   - `scripts/containment-audit.mjs`: text (measured per line with a Range) and controls that cross the edge of their
     bordered or filled box; a clipping or scrolling box ends the check, closed details and legends are exempt. The
     page-level overflow sweeps missed these because the page still fit. First run, all 432 pages at 390 and 360 px:
     the Vendors hub category cards (a 280 px column inside 276 px, so every card spilled; the chip row now wraps), the
     How others report it list (an auto figure column crushed the name to one letter a line on License Gap at 360;
     now fit-content(40%)), the eight vendor profile call-to-action headings (a long name such as ContactCenter4All
     left the card; they break), the Platforms and Tech map card (a 240 px minimum), and at 320 px the community box on
     every Phase 1 profile variant and the How others report it chips. Every finding fixed and its pages re-checked clean at
     390, 360 and 320 px. It runs nightly on production at the same three widths.
   Suite 27,132.

**PRIORITY LIST (TB, 25 Sep 2026, S23). Reach first, then measurement, then integrity, toward 100,000 people.**
Task detail and definitions of done: `docs/NEXT_PHASE_HANDOFF.md`.

P0. Trust content. **Done on the branch (items 36 and 37, PR #37); ship and verify live.**
  1. Healthcare claims research and originality pass.
  2. The other nine industries on the claims pattern, with one shared sub-page component (done in one session).

P1. Reach foundations. **Done S23 on the branch (PR #37).**
  3. Full-page prerender. `entry-server.jsx` (vite --ssr) renders every sitemap URL after all lazy chunks resolve;
     `prerender.mjs` writes the body into `#root`; `main.jsx` hydrates a stateless page and renders fresh a tool page
     with a query string or session state (rail, saved contact). The empty shell is `dist/spa.html` (the homepage owns
     index.html) and `vercel.json` rewrites paths outside the sitemap to it. Found: React escapes `<style>` text the
     browser reads raw, so every page failed hydration (the prerender decodes it, `src/lib/prerenderHtml.js`); claim
     source links inside card links made nested links (`ClaimText links={false}`). Browser: 426 pages hydrate clean in
     one session. Vercel serves `/about` its own `about/index.html` (checked on production).
  4. Structured data from `seo.js structuredData` only, written by the prerender: tools WebApplication, method pages
     TechArticle (version date), industry pages Article citing every source the page renders (the server render records
     claims), homepage Organization and WebSite. No HowTo (no page is steps). The TCO FAQPage is retired: its questions
     were not on the page and its answers carried unsourced figures. The browser adds no JSON-LD.
  5. Share cards: 1200 x 630 PNG per tool, method and industry page (121 with the site card) from `src/lib/shareCard.js`,
     drawn with `@resvg/resvg-js` (dev dependency) and the committed Archivo font (OFL, `assets/fonts`); og:image,
     size, alt and twitter:image on every page. No new host.
  6. All 80 category-by-industry pages noindex (CCaaS included) and out of the sitemap (448 to 426 URLs, including 12
     the Search Console export had surfaced). The prerender writes robots from `seo.known` (it wrote index everywhere)
     and refuses a non-indexable sitemap URL; the shell outside the sitemap is noindex.
  Gates: `prerender.test.mjs` (39: every URL renders with h1, text, no inline script, no nested link; structured data
  fields per type on every URL; share cards; wiring), `seo.test.mjs` L and N; the live checker adds nine page types
  (body in the served HTML, hydration with no error, share card served): 254 of 254 locally.

P2. Measurement (before distribution scales). **Done S23.** P0 and P1 plus task 7 shipped in PR #37 (merged bc80fde,
  production checked: bodies, JSON-LD, share cards and noindex served).
  7. Taxonomy 1.0 frozen (`TAXONOMY_VERSION`, `track.test.mjs` P): new `session_landing` event (page type, UTM tags as
     short slugs, referrer host only). `docs/MEASUREMENT.md`: events, properties, UTM convention per channel, five
     PostHog funnels for TB to create, including 11-04.
  8. 3-02 NextDiagnostic: `journey.js` `nextDiagnostic(toolId, choice)` returns one step, the engine's choice among the
     tool's edges or the first edge; `withNextStep` puts that one step in the PDF. ReportActions renders it on the page
     and in the PDF; no tool authors a next-step list (25 removed; they had drifted from the graph: Cost per Contact's
     PDF named Business Case where the page named AHT, Business Case's named tools outside its graph, Roadmap and Vendor
     Match had no links). Engine tools pass their choice (rubric weakest dimension, governance, renewal gate, contract
     reading, RFP state, QA, AI Deflection verdict, Attrition's unfilled seats to Occupancy Risk). Edges added for every
     choice an engine can make. `journey.test.mjs` E (every choice is an edge, one step, fallback, PDF has one step, no
     tool list), `floor.test.mjs` (every floor tool's sample carries one step on its edges), report harnesses read the
     composed PDF. Suite 24,024.

P3. Engine integrity (TB decided S23). PR #38 (task 8) merged 889c188, one next step checked on production.
  9. **Done S23 on the branch.** BCB baseline evidence, Business Case method 1.1: `BASELINE_EVIDENCE` (defaults, estimate,
     report) plus `baselineAttested`; handle time, FCR, volume and wage. Defaults Directional; estimate or unattested
     report Planning-grade; attested report Finance-grade. Pulled baselines grade by `railEvidence(origin)` while they hold
     the pulled value (`railBase`, never from a scenario link); unanswered with an edited baseline reads as an estimate.
     Benefit stream = weaker of attribution caps and baseline grade. A/B 6,000 cases: figures, cost stream, realization,
     completeness unchanged. `bcb.test.mjs` 12i; older fixtures answer "report, attested". Changelog now keeps a
     method's earlier versions (`methods.test.mjs`: newest entry carries the current version). Suite 24,060.
  10. **Done S23 on the branch.** TCO method 1.1: `marginalPerContact` values handle-time labor at wage × `load.marginal`
     1.18 (never above the loaded rate entered); containment and FCR savings follow; unit costs, grades, AHT and
     attrition levers unchanged. One disclosure line in the read and PDF (`marginalLoadLine`: about 10% more when
     seats are not backfilled). Opening case: marginal $2.75 to $2.51, savings $71K to $68K gross a month. `tco.test`
     marginal-load section (A/B on 6,000 cases against the same engine at the old load), report pins, method pins,
     changelog. Report set H now starts at 5% containment to keep the moderate band exercised. Open for TB: the AHT
     lever still values freed minutes at the loaded rate, and BCB derives its marginal at 1 + benefits (J10 says a
     saving is valued only on the marginal load).
  10b. **Done S24 (item 81).** BLS wage update (item 38).

P4. Distribution launch (TB posts; site supplies assets).
  11. LinkedIn newsletter or Substack from the method changelog and each sourced industry page; weekly asset cadence
      (finding, chart, "test yours" link); practitioner communities; podcasts, guest posts, live events.

P5. Design.
  12. Design chat from `docs/DESIGN_HANDOFF.md` (TB), then one design system applied once; includes the CCaaS-by-industry
      rebuild at Stage 3, the 45 content pages on the old fonts, text and fill colour variants, link tap targets, the
      nine rail tools onto ToolShell, and the "X, not Y" copy pass (about 440).

P6. Remaining debt.
  13. Unsourced figures on Human Premium, Research, Advisory, Platforms, About (the Industries hub is done in item 37).
  13b. ~~Queued originality phrase searches for Telecom, Education, Travel, Financial Services, Utilities, Government.~~ Done S24 (item 89).
  14. ~~TCO and BCB publish verdicts on the rail.~~ Done S24 (item 77): no tool publishes a verdict; the rail refuses them.
  15. ~~External getters and origin grades.~~ Done S24 (items 78 and 79).
  16. ~~BCB next steps, TCO guard case, Field labels.~~ Done S24 (item 80). ~~`MECH_INITIAL` F2~~ done S24 (item 83).
  17. ~~Roadmap anonymous sequence capture~~ (done S24, item 84); ~~Attrition root-cause layer~~ (done S24, item 82).
  18. WS10 performance re-scope and Core Web Vitals; ~~root `download`~~ archived S24 (item 82).

P7. Gated on TB or the corpus.
  19. Research Stage 1 loader (full CCaaS corpus and Research Strategy Handoff), Stage 3 Vendor Intelligence pages,
      Stage 4 Vendor Match V3 (interim: 5-01 unfork and ceiling cap), Stage 5 Market Position Index (Path 3).
  20. Opt-in anonymous benchmark exchange, the start of owned research; needs consent design and a storage decision
      (section 10 trigger).

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
- Current checkpoint: `PRODUCTION_COHORT3_NORMALIZED` (corpus generated 2026-09-23, received S24 on 26 Sep 2026; system of record
  `CCaaS_Master_Research_Corpus_v1.0_Production_Cohort3_Normalized_1.json`, kept outside the repository).
- 18 vendors completed (VEN-CC-0001 to 0018): the 12 above plus Puzzel, Avaya, Enghouse Interactive, UJET, Bright Pattern, Vonage.
  `src/lib/researchStatus.js` lists all 18 (S24 redesign session 1); 10 CCaaS and adjacent profiles remain Phase 1 context.
- Cohort 3 five-vendor normalization gate passed: no schema, criterion or class change; CLS-CC-004 not split.
- Phase 2 numeric ratings remain locked/unapplied (peer-class coverage thin in CLS-CC-002, 003, 005, 006).
- Next research vendor: AnywhereNow (Cohort 4), one at a time under schema v1.0.
- Two evidence objects are `INTERNAL_RESEARCH_ONLY`; never render them or their existence.
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

---

## 14. Search rules (TB, 30 Sep 2026)

Google's ranking system is not public. We build to what Google publishes (Search Essentials, the helpful content
guidance, the Search Quality Rater Guidelines and its E-E-A-T, Core Web Vitals, structured data) and treat the 2023
antitrust testimony and the 2024 API documentation leak as hints, never as weights. Every new or changed page follows
these rules:

1. **Title and description match a real search.** Write the words people type (Search Console queries first), not a
   slogan. The page's own name stays within 55 characters (the brand suffix may be cut); the description runs 70 to
   160 characters and says what the page gives the reader. `seo.test.mjs` W gates length and the retired sales words.
2. **Answer first.** The page's main answer or tool sits near the top in plain words; a newcomer can tell in one screen
   what the page is for.
3. **Every figure sourced, linked and dated** (doctrine); no metadata claims what the page does not show.
4. **Say who and how.** Name the method (and, when TB decides, the author or editor); link the published method and the
   sources. Trust is the E-E-A-T axis we can prove today; experience and expertise need a named person.
5. **Link the next step.** Each page links the related tool, method, industry and vendor pages, so a reader and a crawler
   can move through the site.
6. **Structured data from `seo.js structuredData` only**, prerendered, one type per page kind.
7. **Page experience stays in budget** (`scripts/perf-check.mjs`: LCP and FCP within 2.5 s, CLS under 0.1 on a throttled
   phone).
8. **Thin pages stay noindex** until they carry their own substance.
9. **Read Search Console weekly.** A page at positions 1 to 10 with impressions and no clicks gets its title and
   description rewritten to the query; a page at 11 to 20 gets content and internal links for that query.
10. **Links and mentions come from distribution.** Every asset we publish is something another site can cite: a sourced
    figure, a tool, a method.
