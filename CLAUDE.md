# CLAUDE.md

Operating brief for ContactCenterCX (`CENTER-OF-CX`). Read this first, every session.

Written 22 September 2026 at the close of chat session 20. Re-verified against live
`main` the same day: TCOCalculator.jsx, journey.js and BusinessCaseBuilder.jsx md5s
match the baseline below. Re-verified in Claude Code on 23 September 2026 at `main`
76f5248: all 20 md5s match, suite 18,018 green, build and prerender green. This file
and `docs/` were committed on 23 September 2026.

---

## 0. What this project is

ContactCenterCX.com is a bootstrapped, vendor-neutral intelligence and diagnostic
platform for the contact center and CX technology market. One operator, Thomas
Baker (TB), does engineering, product, content and business development.

Roughly 30 React tools, 283 vendors across 8 categories, 78 routes. Vite + React 18
SPA on Vercel via GitHub auto-deploy. Production: https://contactcentercx.com

The promise is **100% traceable**. Every historical fact sourced, every assumption
labelled, every derivation reproducible, every forecast explicitly conditional.

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
| `src/lib/journey.js` | 54d372ec2cf606a01b28ddca4d69e5ac |
| `src/lib/track.js` | d04c15c02e96bdee21ded2cf03a45866 |
| `src/lib/confidence.js` | cd405788506e7970ad581cfcb9a84997 |
| `src/lib/metrics.js` | 37f924dfd1387e52f7da749537d1f940 |
| `src/lib/guards.js` | a640b502cbee94ebd08687656ba7d681 |
| `src/lib/type.js` | fde48210b6eac47c307681b3b90adba9 |
| `TCOCalculator.jsx` | d6cd022364855d52495a38e23b0481fd |
| `BusinessCaseBuilder.jsx` | 46382fac41ff92601347c07887f9395a |
| `StaffingCalculator.jsx` | 6f956589657ea7bfe8b7a3a7dab76dc1 |
| `CostPerContactCalculator.jsx` | 815a2bd4a1b23537f8ec413112e38944 |
| `ChannelShiftModel.jsx` | 9f7b3e2f941a5bd304a592a88a81efd6 |
| `FCRLeakageDiagnostic.jsx` | 366b409640f3eb8bb11dc0710a002d77 |
| `AIDeflectionRealityCheck.jsx` | d54d6ff73405d891a20d4314272799c4 |
| `LicenseBundleGapChecker.jsx` | 20af7a5d6be6b56f52343852f5d68aee |
| `AttritionCostCalculator.jsx` | 8a185ab19300f92e3847b3fad33b01c2 |
| `ReportActions.jsx` | db405106dfcbde98427f4be53a84be2a |
| `run-all.mjs` | c77b1ba5df2d9027535a8326bcf27d24 |
| `rail-audit.mjs` | 563baf0ef79024dc85d199824f630056 |

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

**Open now: 11B TCO step 6, the live PDF check.**
1. Normal: shipped defaults, Expected stance.
2. Voided: trip an invariant (negative agent count via scenario link). Confirm the
   void renders, states the failed invariant and remedy, and claims no grade in the
   strip, the PDF or the review submission.
If contactcentercx.com is unreachable from the environment, run against a local
build (`npm run build && npm run preview`) and TB pulls the two production PDFs.

**Then: Business Case Builder**, the ninth and last rail tool, 113 KB of source.
It must fix **1-12**: `r.payback === 0` caps confidence at Directional, conflating
"we do not know" with "the answer is no." Regression fixtures for BCB are in tracker
Section 1 (reference set and live PDF set).

---

## 3. The tracker

`docs/CCCX_MASTER_TRACKER.md`: 96 items, 16 workstreams (WS0 to WS15). `TAXONOMY.md`
references it. `docs/CCCX_Resequence_Under_Doctrine_Amendment_11.md` replaces its
Section 4 and controls run order. The tracker status columns are the 25 August
baseline; closures since are in its change log.

Also in `docs/`: doctrine, Section 5 v1.2, `SHIPPING.md`, the project knowledge
manifest, the bundle `README.md`, and Market Position Index Addendum 1.

**ID conflict.** The tracker defines 1-12 as `billingStartMonth` in BCB, GATED.
This file and Section 5 v1.2 use 1-12 for the `r.payback === 0` confidence cap
(`BusinessCaseBuilder.jsx` line 53). One ID, two items. TB to renumber one.

| WS | Subject | State |
|---|---|---|
| WS0 | Hygiene and blockers | Closed. `SHIPPING.md` drafted, awaiting TB approval |
| WS1 | V3 engine integrity, nine rail tools | In flight. TCO step 6, then BCB |
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

**The one thing to prove first:** a user who finishes one diagnostic runs a second.
Cost: 3-02 and 11-04, no money.

---

## 4. Doctrine

Full text: `docs/DOCTRINE_Epistemic_Standard.md` v1.1. Section 5 is superseded by
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
- FCR PULLED badge reads `getPrimitive`.
- Attrition live PDFs never pulled. `AttritionCostCalculator.jsx` line 307 local
  `boundAxes`.

**Live defects**
- 1-12 BCB `payback === 0`.
- `guardVal` money rendering in CPC; money-guard case missing in `cpc.report.mjs` set C.
- 8-04 vendor titles from `titleCase(slug)` on roughly 255 of 283 pages.
- Sprinklr duplicate slug (CCaaS and IVA) hides the IVA profile.
- Homepage claims methodology pages that do not exist.
- `VendorMatchEngine.jsx` 24-vendor CCaaS-only fork, does not import `VendorData.js`.
- ~~Bundle 2.9 MB single chunk.~~ Stale. `npm run build` on 23 Sep 2026: lazy route
  chunks, 237 KB entry, 77 KB gzip. Re-scope 10-01 to 10-03 before scheduling.
- Sitemap holds 429 URLs, not the 354 the tracker baseline and shipping facts state.
- `ReportActions.jsx` line 40, `scenarioUrl` `__proto__` assignment, `track.js` line 185.

**Test infrastructure**
- `channel.report.mjs` UNPARSED once in session 20, not reproducible. UNPARSED is
  always failure.
- `chunk.test.mjs` imports `vite`: `npm install` before the suite.
- `rail-audit.mjs` writes `.rail-audit-metrics.mjs` at repo root every run and never
  removes it. Covered by `.gitignore`.
- Root file `download` holds `.gitignore`-style content. Superseded; delete once TB
  confirms nothing reads it.

**TB actions outstanding**
- Confirm `VITE_POSTHOG_KEY` is set in Vercel.
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
   `SHIPPING.md` drafted. Open: TB approval of `SHIPPING.md`, 1-12 renumber.
2. **Next.** TCO step 6 live PDF check. Closes 11B TCO.
3. Business Case Builder retrofit with 1-12. Closes WS1.

Then the reachability batch.

Prove behavior first. Ration effort as strictly as money. Reachability precedes
rigor. Instrumentation precedes proof. Quality is the moat. Independence is the product.
