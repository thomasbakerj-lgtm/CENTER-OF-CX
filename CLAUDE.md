# CLAUDE.md

Operating brief for ContactCenterCX (`CENTER-OF-CX`). Read this first, every session.

Written 22 September 2026, at the close of chat session 20. It carries the state,
the rules, and the decisions that live nowhere else in the repo.

---

## 0. What this project is

ContactCenterCX.com is a bootstrapped, vendor-neutral intelligence and diagnostic
platform for the contact center and CX technology market. One operator, Thomas
Baker (TB), does the engineering, product, content and business development.

Roughly 30 React tools, 283 vendors across 8 categories, 78 routes. Vite + React 18
SPA on Vercel via GitHub auto-deploy.

The promise is not "100% factual." It is **100% traceable**. Every historical fact
sourced, every assumption labelled, every derivation reproducible, every forecast
explicitly conditional. That distinction is the product. Most of the rules below
exist to protect it.

The standing commercial line: monetize confidence in decisions, never access to
vendors. Independence is the product.

**Zero incremental spend is the current constraint.** No paid ads, paid data, new
SaaS, backend infrastructure, databases, accounts or auth. Operating principle:
prove behavior first, manually learn second, invest third, automate last.

---

## 1. Verified baseline, 22 September 2026

Measured against `refs/heads/main`. Re-measure before assuming it still holds.

Re-verified in Claude Code on 23 September 2026 at `main` 76f5248: every md5 below
matched, suite 18,018 of 18,018, chunk gate passing after `npm install`.

| Fact | Value |
|---|---|
| Suite | **18,018 assertions, 0 failed** |
| Rail audit | clean, no orphan pulls |
| Chunk gate | 25 of 25 (requires `npm install` first) |
| Runner | `node run-all.mjs` at repo root, exits 2 on any UNPARSED harness |
| `.jsx` at repo root | 81 |
| Routes in `App.jsx` | 78 |
| Harnesses | 26 files: 10 tool pairs (`.test.mjs` + `.report.mjs`) plus `rail`, `rail-audit`, `chunk`, `confidence`, `guards`, `journey`, `seo`, `track` |

File md5s at this baseline:

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

## 2. Where we are, exactly

### The current workstream

Tracker item **1-09**, the confidence taxonomy, was decided on 19 September 2026.
The decision is final: **three axes, Evidence times Realization times Completeness.**
No split into cost evidence and benefit evidence. No case-readiness axis. Cost and
benefit are streams inside Evidence. The headline grade is the minimum of the
applicable axes and the rationale always names the binding axis.

The spec is `docs/DOCTRINE_Section5_v1_2.md`. The retrofit is a
nine-tool walk, internally numbered 11A, 11B and so on, one tool per session.

### What just closed

Session 19 and 20 completed the **TCO Calculator** retrofit:

- `gradeTCO` grades evidence per field by origin across 12 ops fields (`TCO_OPS`)
  and 23 cost fields (`TCO_COST`). A field counts as default when it equals the
  selected industry preset.
- Realization is N/A with a stated reason. TCO prices cash out the door, so no
  capacity action applies.
- Completeness is held Directional by any of six validity checks.
- Void on non-finite outputs, buckets that do not sum to monthly, or Year 1 off
  the annual.
- The legacy two-axis grade is deleted. Arithmetic A/B against the original engine
  was identical across 6,000 cases.
- The rail now carries **origin grades**, TCO publishes them, and five consumers
  read them per field.
- TCO's constants are registered. Two false source claims are retired.
- Next-step links come from `nextFor` instead of a hardcoded list.

### The one thing still open in this item

**Step 6 of 11B part 2: the live PDF check. Not done.**

Pull two PDFs from the deployed TCO tool and reconcile them against the harness:

1. Normal: shipped defaults, Expected stance.
2. Voided: trip an invariant, for example a negative agent count through a scenario
   link, and confirm the void treatment renders, states the failed invariant and the
   remedy, and claims no grade in the strip, the PDF or the review submission.

A live PDF generated mid-session is a defect discovery tool, not a validation step.
Several sessions have proved that passing engine assertions coexist with PDF
contradictions that only reconciliation catches.

### Then, the last tool in this workstream

**Business Case Builder.** It is the ninth and final rail tool in the 1-09 retrofit,
and it is the hardest. It is also 113 KB of source. Known issue going in: tracker
item **1-12**, `r.payback === 0` caps confidence at Directional, which conflates
"we do not know" with "we know and the answer is no." That is a named doctrine
violation and the retrofit must fix it, not preserve it.

---

## 3. The tracker and governance docs

`docs/CCCX_MASTER_TRACKER.md` is the single backlog. 96 items across 16 workstreams
(WS0 to WS15). Until 23 September 2026 it lived only in claude.ai project
knowledge, which is why `TAXONOMY.md` references WS2 and WS11 against a document
the repo did not hold.

**Landed in `docs/` on 23 September 2026.** Governance stays in both repo and
library, and the repo wins on conflict. Precedence, per `docs/README.md`: Section 5
v1.2 overrides Section 5 of doctrine v1.1, and the Resequence overrides tracker
Section 4. The tracker status columns predate sessions 1 to 20; see its section 3
note.

Files in `docs/`:

- `CCCX_MASTER_TRACKER.md`
- `DOCTRINE_Epistemic_Standard.md` v1.1
- `DOCTRINE_Section5_v1_2.md`
- `CCCX_Resequence_Under_Doctrine_Amendment_11.md`
- `SHIPPING.md`, drafted 23 September 2026 for TB approval, closing 0-06
- `CCCX_PROJECT_KNOWLEDGE_MANIFEST.md` and `README.md`, the handoff bundle index
- `CCCX_Market_Position_Index_and_Tool_Separation_Rules_Addendum_1.md`. Uploaded
  as `.docx` but the content is Markdown, so it lands as `.md`

**Not yet received.** `docs/README.md` lists two bundle files that have not arrived:
`TRACKER_CHANGELOG_S13_S20.md` (append to the tracker change log) and
`SHIPPING_FACTS.md` (verified deploy facts). `SHIPPING.md` was drafted from the repo
without it and gets reconciled against it on arrival.

**Known ID conflict.** The tracker defines 1-12 as `billingStartMonth` in BCB,
GATED. This file and Section 5 v1.2 use 1-12 for the `r.payback === 0` confidence
cap (`BusinessCaseBuilder.jsx` line 53). One ID, two items. TB to renumber one.

### The workstreams

| WS | Subject | State |
|---|---|---|
| WS0 | Hygiene and blockers | Closed. `SHIPPING.md` drafted, awaiting TB approval |
| WS1 | V3 engine integrity, the nine rail tools | In flight. 1-09 retrofit, TCO done, BCB last |
| WS2 | The other 21 tools | 2-01 triage is the highest-leverage item and is cheap |
| WS3 | Journey architecture and interlinking | Graph exists in `src/lib/journey.js` |
| WS4 | Vendor data depth | 283 vendors, 28 genuinely deep |
| WS5 | Vendor match engine v2 | 5-01 urgent and small: delete the 24-vendor hardcoded fork |
| WS6 | Stack analysis engine | Gated behind WS1 |
| WS7 | Vertical to vendor connectors | Gated on WS4 |
| WS8 | SEO | 8-04 vendor title defect is live |
| WS9 | Answer engine optimization | Blocked on published methodologies |
| WS10 | Web performance | Routes already lazy split. Measured 23 Sep: entry chunk 237 KB, 77 KB gzipped. 2.9 MB figure is stale |
| WS11 | Behavioral instrumentation | The gate on everything in WS14 |
| WS12 | Conversion and commercial | 12-06 independence disclosure is a credibility asset |
| WS13 | Brand and design system | 13-01 is a decision blocking three items |
| WS14 | Growth and distribution | GATED behind instrumentation, correctly |
| WS15 | Data moat and investment triggers | Decision register, not build work |

### The approved sequence after WS1 closes

From the Amendment 11 resequence, which replaces Section 4 of the tracker:

1. Close 1-09 retrofit (TCO done, BCB remaining)
2. Reachability batch: 8-04 vendor titles, homepage index count, Sprinklr duplicate slug
3. SEO prerender verification
4. 11-01 through 11-03 instrumentation and event taxonomy freeze
5. 10-01 through 10-03 bundle splitting
6. 2-01 triage of the 21 orphan tools
7. 3-01 and 3-02 journey graph and NextDiagnostic

1-07 (benchmark constant audit) and 1-10, 1-11 (BCB engine enrichment) are
explicitly deprioritized until the platform is findable and observable.

### The one thing to prove first

**That a user who finishes one diagnostic runs a second one.** Everything in the
thesis depends on it. It costs two items, 3-02 and 11-04, and no money.

---

## 4. Doctrine: the rules that govern every edit

Full text in `DOCTRINE_Epistemic_Standard.md` v1.1. The load-bearing parts:

### The four claim classes

Every number a tool displays is exactly one of: **historical fact** (sourced, named
origin, user-editable), **assumption** (labelled, origin named, adjustable),
**conditional forecast** (explicitly conditional, conditions restated with the
output), **measured outcome** (realized after deployment).

"This saves $1.8M" is forbidden. "Under these assumptions this models $1.8M" is
required. An assumption is never laundered into a fact by arriving over the rail,
appearing in a PDF, or being computed to two decimals. Precision is not evidence.
Arithmetic correctness never promotes a claim to a higher class.

### The three confidence axes

Evidence, Realization, Completeness. Grades are `Directional`, `Planning-grade`,
`Finance-grade`. Headline is the minimum of the applicable axes. A null axis
requires a stated `naReason`. Void claims no grade anywhere.

- A value arriving over the rail confers **consistency, never evidence**.
- Finance-grade requires **document attestation**.
- Realization is N/A for cost-only tools, with a reason.
- **No verdict, return, payback or recommendation strength ever caps an axis.**
  Every tool harness carries a sign-invariance assertion proving it: hold inputs
  fixed, force the result negative and zero, assert all three axes and the headline
  are unchanged. A tool without that assertion is not locked.
- Doctrine forbids conflating "we do not know" with "we know and the answer is no."

### The data rail

`src/lib/toolData.js`. Session storage. Tools publish normalized primitives and
pull each other's.

- `publishToolResult(toolId, primitives, origins)` normalizes at the door.
- `getExternalPrimitive(key, selfToolId)` and `getExternalWithSource(key, selfToolId)`
  refuse to return a value the caller itself published. A tool cannot credential
  itself from its own prior output. Confidence gates must use these, never
  `getPrimitive`.
- **Pass facts, not verdicts.** Shared baseline, independent conclusions.
- `railReport().orphanPulls` must be empty before any tool locks. A dead pull is a
  defect, not graceful degradation.
- `rail-audit.mjs` finds pulls statically by matching a **string literal** argument
  against the accessor name. Never hide a rail key behind a variable. Doing so
  removes the tool from the audit without failing it.

### The benchmark registry

`src/lib/benchmarks.js`. Every constant a tool ships is registered with provenance
or the suite throws at load. Three kinds:

- `market`: a published external figure. Must name source and review date.
- `heuristic`: an internal planning value. Must be labelled as such everywhere it
  surfaces. A driver still at a heuristic default grades Evidence Directional.
- `threshold`: a judgment line. Carries a stated rationale, is versioned, and moves
  only because the evidence moved, never because of conversion or lead volume.

A fourth ownership value, `shared`, was added in session 20 for entries cited by
several tools. Per-tool harness gates accept `tool === TOOL || tool === "shared"`.

### Effort, reachability, instrumentation (Amendment 11, Section 11)

- **Effort is rationed as strictly as money.** Any L or XL item needs demand
  evidence or a recorded reason it must precede evidence. "It is next in the
  tracker" is not a reason.
- **Reachability precedes rigor.** A tool is not shippable until it is findable,
  loadable and shareable. Where a reachability defect and a correctness defect
  compete, and the correctness defect is not producing a wrong number in front of a
  user today, reachability goes first.
- **Instrumentation precedes proof.** No tool is recorded as locked unless its
  completion event is instrumented.
- A DECIDE item that governs the shape of a later build is scheduled before that
  build, never after.

### Language

Retired: most conservative, only independent, survives the CFO, industry-leading.

**No em-dashes or en-dashes anywhere in prose, copy, comments or commit messages.**
Enforce with `s.count(chr(0x2014))` in Python. Grep is unreliable on Unicode. There
are still roughly 361 across 61 files, tracker item 13-03.

---

## 5. Decisions settled in chat that are written nowhere else

This is the section that matters most. Everything here is binding and none of it is
in the repo.

### From session 19 (TCO part 1)

- **J1 / defect D11.** A self-declared "invoiced" cost basis previously granted
  Finance-grade. Self-declaration is not attestation. The select now caps at
  Planning-grade. Finance-grade requires a document the tool does not collect.
- **D13.** Rail reads moved to `getExternalWithSource(key, TOOL_ID)`, which keeps
  the publisher and refuses self. The `pre` map is read once at mount. A scenario
  link is a deliberate act carrying its sender's entries, so a linked session grades
  those as **entered** and credits no rail value.
- **Regression caught and fixed.** `rail-audit` was blind to self-fed pulls on
  sourced getters. It now treats `getExternalWithSource` as an external read. New
  pins L7, L8, L9, M6b.
- The false `has_document_evidence` claim is removed from the wire.
  `decision_ready_signal` now reads the grade.
- **D14 downgraded.** The `implementationCost` pull from Business Case Builder
  creates no loop.

### Decisions TB ruled on directly

- **J9.** In-house vendor reduction caps realization at Planning-grade. TB's words:
  "your strongest most strategic recommendation."
- **J12.** Planning-grade requires all 35 graded fields off preset. The 6,000-case
  sweep reaches it in 18 cases. **Keep the strictness and disclose it on the page.**
  TB agreed. Do not loosen this to make the grade easier to reach.

### From session 20

- **Origin grades on the rail.** `publishToolResult` takes a third argument, a map
  of key to evidence grade. `getPrimitiveWithSource` returns it as `railOrigin`.
  A puller grades a rail value no higher than the grade it was born with.
- **Provenance does not transfer on restatement.** If a tool republishes a value it
  pulled, **unchanged**, the original producer keeps the key and its origin grade.
  The moment the user edits the figure the value differs, the editing tool becomes
  the producer, and the new number and grade travel to every puller. TB ruled on
  this directly: an edited number is the number the user now needs everywhere.
- **Rail evidence is graded per field, not per tool.** `pre[field].origin` decides
  the grade for that field. The `railOrigin` parameter survives only as a blanket
  fallback for a field with no recorded origin. One weak pull no longer drags every
  pull down.
- **J10, the load concepts.** Three shared multiples, and only three:
  `load.benefits` 1.30 (wage plus benefits and payroll burden, for unit metrics),
  `load.marginal` 1.18 (the only load a saving may be valued on), `load.fullyLoaded`
  1.95 (pricing a whole seat). TCO's 1.25x for salaried staff is a fourth, owned by
  TCO, because it prices a different population. **Do not invent a fifth multiple.**
  CPC's 1.35x and Channel Shift's 1.35x are retired to `load.benefits` 1.30. That
  moved two shipped defaults. Both were flagged to TB.
- **J11, one shared wage.** `market.wage.agent` at BLS $20.59, OEWS May 2024,
  SOC 43-4051. It replaces the three duplicate copies in Staffing, CPC and Channel
  Shift, closing Decision H from session 15. TCO's seven industry wages are
  registered heuristics and are explicitly **not** presented as published medians.
- **TCO's sources paragraph is generated from the registry, never hand-written.**
  The old paragraph named Balto, Parloa and Teneo for a containment range the tool
  does not model, and cited BLS for a $19 wage that is not the BLS figure. Both are
  retired and pinned dead by name in `tco.test.mjs`.
- **A journey edge was missing.** TCO's page linked to AI Deflection, which was not
  an edge in the journey graph at all. The edge was added, because TCO prices
  containment savings and AID pressure-tests them. TCO's order is now license gap,
  AI deflection, business case, with the decision node last.

### Standing engineering rules not in the repo

- Each tool must operate specifically to its own goal. **No generic shared ranges
  or one-size logic imposed across tools.** Same key can mean a different fact in a
  different tool, and where it does, do not prefill. TCO deliberately does not pull
  occupancy from Staffing for exactly this reason.
- `MECH` and `CRED_RANK` do not apply to cost-only tools. They model cash out the
  door, not freed capacity.
- Vendor Match scoring must disclose methodology. Ceiling saturation, multiple
  vendors at max score, is a signal of model failure. Five9 and Talkdesk both
  scoring 99 on a 27-dimension model is the live example.
- Defect patterns to watch: **split rendering** (corrections section and main output
  rendering from different code paths), **self-credentialing**, **unreachable
  confidence grades**, **zero substitution without disclosure**, **negative inputs
  producing impossible results without a guard**.

---

## 6. Carried debt register

Nothing here is blocking. All of it is real.

**Rail and confidence**

- TCO publishes `analystRead`, which is a verdict on the rail. Doctrine says pass
  facts, not verdicts. Not yet resolved.
- TCO's `marginalPerContact` uses the 1.30x load while the registry marginal concept
  is 1.18x. Now that both are named, the discrepancy is visible and undecided.
- Only TCO publishes origin grades. Staffing, CPC, FCR, AID and Channel Shift read
  them but publish none, so their own outputs grade Directional downstream. No
  regression, but the mechanism is half wired.
- CPC, Channel Shift, FCR and AID still pull with `getPrimitiveWithSource`, which
  can return their own prior output. Only TCO and Staffing use the external getter.
  Their grade paths mark self-reads as `self` and grade them Directional, so this is
  not currently a defect, but it is one refactor away from being one.
- FCR Leakage PULLED badge still reads `getPrimitive` rather than
  `getPrimitiveWithSource`.

**Known live defects**

- 1-12: `BusinessCaseBuilder` `r.payback === 0` caps confidence at Directional.
- `guardVal` money-rendering defect in `CostPerContactCalculator.jsx`, plus a
  money-guard case missing from `cpc.report.mjs` set C.
- 8-04: `seo.js` builds vendor titles from `titleCase(slug)` rather than `name`,
  producing malformed titles across roughly 255 of 283 vendor pages.
- Sprinklr duplicate slug across CCaaS and IVA data makes the IVA profile
  unreachable.
- Homepage claims published methodologies that do not exist as pages.
- `VendorMatchEngine.jsx` holds a 24-vendor hardcoded fork that does not import
  `VendorData.js` and covers CCaaS only.
- The 2.9 MB single-chunk bundle figure is stale. `npm run build` on 23 September
  2026 emits lazy route chunks with a 237 KB entry, 77 KB gzipped, and prerender
  writes 429 routes. Re-scope 10-01 to 10-03 against the measured build before
  scheduling them.
- `ReportActions.jsx` line 40, the `scenarioUrl` `__proto__` assignment, and
  `track.js` line 185 were all queued and never addressed.

**Test infrastructure**

- `channel.report.mjs` returned UNPARSED once in session 20, then passed standalone
  and on five consecutive suite runs. Not reproducible. If it recurs it is a
  `run-all` output capture issue, not a harness defect. UNPARSED is always a failure
  and `run-all` exits 2 on it.
- `chunk.test.mjs` imports `vite`, so `npm install` is mandatory in a fresh
  container before the suite will reach 25 of 25.
- `rail-audit.mjs` writes `.rail-audit-metrics.mjs` to the repo root on every run
  and does not remove it. It is in `.gitignore`.
- The file named `download` at repo root holds what looks like `.gitignore`
  content (`node_modules`, `dist`). It is superseded by `.gitignore` and can be
  deleted once TB confirms nothing reads it.

---

## 7. The parallel research program

TB runs a vendor research program alongside the engineering. **Do not collide with
it.** It has its own authority documents in project knowledge.

- The **Center of CX Research Operating Standard** governs. The latest Next-Phase
  Research Strategy Handoff per category is the current methodology authority.
  Existing matrices, workbooks and prior scores are **Phase 1 historical baselines
  and hypothesis sources, not current evidence** unless revalidated.
- Eight category handoffs exist. Execution order: CCaaS, IVA and Conversational AI,
  Agent Assist, WFM and QM, Experience Analytics and VoC, CX Orchestration and
  Workflow, Digital Engagement, Payments and Identity and Trust.
- Research is done five vendors at a time but delivered to Claude as one complete
  category upload.
- The **AI Builder Handoff: Vendor Intelligence and Vendor Match V3** (19 Sep 2026)
  is build-direction authority: two connected public products on one research
  corpus. The public universal vendor leaderboard is removed. Contextual ranking
  happens inside Vendor Match after buyer context is known. CCaaS is the first
  technical proof.
- **Addendum 1, Market Position Index and Tool Separation Rules**, in `docs/`. A public Market
  Position Index returns as a separate surface from Vendor Match. Five equally
  weighted dimensions: market footprint, customer evidence, product and solution
  breadth, ecosystem and interoperability, commercial and operating maturity.
  Class-scoped. No composite decimal score. Analyst coverage displayed but never
  scored. **A one-way wall: the index never feeds Vendor Match.**
- Open decision for TB: whether Market Position Index positions publish inside
  competitive class only (currently locked) or also category-wide.
- `VENDOR_RECORD_SCHEMA_V2.md` is already in the repo. Build against it.

---

## 8. The verification loop

No step is skipped. This is the definition of done for any engine change.

1. Pull live source. `git pull` in Claude Code. Historically the rule was codeload
   tarball only, never `raw.githubusercontent.com`, which caches per path with no
   cache-busting. Git makes that rule obsolete.
2. **Read the source before editing it.** Not the harness, the source.
3. **Boundary-probe the engine before writing any assertions.** Defects are found
   before assertions, not after. An assertion written first encodes the defect.
4. Extract arithmetic into a testable `compute(d)` between `/* @engine-start */`
   and `/* @engine-end */`. Both harnesses slice that exact region out of the
   shipped file at runtime and evaluate it, so the tested engine and the shipped
   engine cannot drift. **Nothing inside the region may be JSX.** If you add a new
   dependency inside the region, you must inject it into both harnesses'
   `new Function(...)` signatures.
5. **Prove the extraction is behavior neutral across the full scenario set before
   applying any guard.** TCO's was an A/B across 6,000 cases.
6. Write the engine harness (`[tool].test.mjs`) and the rendered-output
   reconciliation harness (`[tool].report.mjs`). **The reconciliation harness is a
   mandatory separate gate.** Multiple sessions confirmed that passing engine
   assertions coexist with PDF contradictions only reconciliation catches.
7. Register both in `run-all.mjs` with a `report` field.
8. `node run-all.mjs`. Green means: every assertion passes, rail audit clean, chunk
   gate 25 of 25, and **zero UNPARSED**.
9. Em-dash check with Python on every touched file.
10. **Generate a live PDF, one normal and one voided.** Reconcile against the
    harness. This is a defect discovery tool.

### What changes now that you are in Claude Code

These rules were artifacts of TB working exclusively through the GitHub web UI with
no local dev server. **They can be retired:**

- One file per upload with md5 verification after each.
- Clearing the Downloads folder to avoid `(1)` naming collisions.
- In-place edit in the GitHub web UI for `src/lib/` and `public/`, because the
  upload dialog repeatedly dropped files at repo root.
- Confirming the GitHub breadcrumb before every upload.
- Pasting md5 baseline tables into session kickoff packets.
- Python3 inline scripts with exact string matching as the edit mechanism. Keep the
  discipline behind it, which is abort on a wrong match count, but use real edit
  tools.

**These do not change.** They are doctrine, not workflow: the boundary probe, the
behavior-neutral proof, the separate reconciliation gate, UNPARSED as failure, the
live PDF check, the em-dash prohibition, and one tracker item per session.

---

## 9. Working with TB

- Direct and decisive. Concise outputs, punchy declarative language, outcome first,
  analyst voice. No hedging, no preamble.
- "done. next" means proceed without deliberation. "next" means the next tracker
  item in order.
- TB approves recommendations and sequencing. **Execute autonomously across the
  full engineering loop. Push back when something is wrong.** Make explicit
  sequencing calls rather than asking.
- Peer review is adversarial by design. Distinguish valid challenges from misreads.
  Concede when wrong. Push back with reasoning when the source proves the challenge
  incorrect.
- One tracker item per session, occasionally waived.
- Every session closed with a kickoff packet for the next item. In Claude Code, the
  equivalent is updating this file and the tracker change log at the close of every
  session. **A tracker that is not updated is a plan that is not being followed.**

---

## 10. What not to build yet

1. The stack analysis engine. It consumes an engine layer that is still moving.
2. The remaining 70 category-by-vertical pages. Thin content at scale is a sitewide
   quality risk and they are blocked on vendor data that does not exist.
3. Any localStorage save-and-return system. `scenarioUrl` already does the job.
   Measure whether anyone generates a scenario link first.
4. User accounts, a database, or a dashboard. No WS15 trigger has been met.
5. The 12-phase growth program. Gated on instrumentation, correctly.

### Investment triggers

| Investment | Trigger, before any spend |
|---|---|
| User accounts | Users generate a scenario link **and return to it**, repeatedly, within 30 days |
| Database | Manual handling of qualified opportunities exceeds several hours per week |
| Dashboard | The same user runs three or more tools in a session, repeatedly, and asks for a combined view |
| Cross-device saved reports | Measured mobile-to-desktop handoff, the same scenario link opened on two device classes |
| Personalization | Vertical defaults being overridden in a consistent direction |
| CRM automation | Qualified inbound exceeds a spreadsheet and a calendar |
| Paid data | A decision repeatedly blocked by data not sourceable from public filings, vendor docs or the existing matrices |
| Paid analytics | Free-tier event limits actually hit, not projected |

---

## 11. Suggested first three sessions in Claude Code

1. **Done 23 September 2026.** Governance docs in `docs/`, `SHIPPING.md` drafted.
2. **Next. Step 6: the live TCO PDF check, normal and voided.** Closes 11B and the
   TCO retrofit. Production is https://contactcentercx.com. If the domain is blocked
   from the container, run against a local build and TB pulls the production PDFs.
3. **Business Case Builder retrofit**, fixing 1-12 as part of it. Closes the 1-09
   walk and WS1, which unblocks 2-02, 3-03, 6-01, 10-04 and 13-02.

Then the reachability batch, because reachability precedes rigor and 255 malformed
vendor titles sit on the pages that receive the most first contacts.

---

## 12. The line

Prove behavior first, manually learn second, invest third, automate last.
Ration effort as strictly as money.
Reachability precedes rigor.
Instrumentation precedes proof.
Quality is the moat. Independence is the product.
