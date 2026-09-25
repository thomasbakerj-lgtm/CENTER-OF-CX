# Next phase handoff: reach, measurement, integrity

Written 25 September 2026 at the close of session 23. For the next Claude Code session. CLAUDE.md stays the operating
brief; this file is the task list with a definition of done for each item. Order and scope are TB-approved (CLAUDE.md
section 11, priority list P0 to P7). Goal: 100,000 people, on published sources today and owned research later.

## 0. Start of session

1. Open a new Claude Code session on the web: repository `thomasbakerj-lgtm/CENTER-OF-CX`, environment **Default**,
   branch `claude/website-project-review-iuz1uk`.
2. First message to paste:
   > Read CLAUDE.md and docs/NEXT_PHASE_HANDOFF.md. Confirm you can fetch https://www.bls.gov and https://www.ecfr.gov,
   > then start at task 1.
3. If either host still fails (proxy 403), the environment's network policy did not apply: TB checks the cloud
   environment menu in the session title bar, Edit, Network access (Full, or the publisher domains allowed). Tasks
   3 to 10 need no outside network and can run meanwhile.

## 1. State at handoff

**Update, 25 Sep 2026 (branch `claude/zen-faraday-t6xkur`, PR #37):** tasks 1 and 2 are done on that branch, which
merged this branch in. All ten industries, 61 sub-pages and the hub cards are on the claims registry, with no pending
entry and an originality record per page; the suite is green (23,870). The state below is the handoff as written.
Next after PR #37 ships: task 3.

- `main` at 8478a1c (PR #36, the sub-page ungate), live and verified; nightly live check green on it.
- Branch `claude/website-project-review-iuz1uk` at 4d01a77 carries, unmerged:
  - the Healthcare claims pilot (`src/lib/claims.js`, `src/lib/claims/healthcare.js`, `src/lib/ClaimText.jsx`,
    `src/lib/claims/originality.js`, `claims.test.mjs`, the converted Healthcare pages);
  - `docs/DESIGN_HANDOFF.md`, this file, and the CLAUDE.md and tracker updates.
- The branch suite is **red on purpose**: `claims.test.mjs` fails 4 checks while 56 of the 70 Healthcare claim entries
  are `research: "pending"` and both originality records are missing. Everything else is green (21,125 assertions on
  `main`).
- Pending facts render "source pending" in the page, so nothing unverified can pass as a fact, and the gate keeps the
  branch from merging until research lands.
- Git in this environment: no force push (the classifier blocks it). To ship part of a branch, revert what must not
  ship, merge, then revert the revert (the pattern used for PR #36).

## 2. Rules that bind every task

- CLAUDE.md sections 4, 5 and 8 (doctrine, decisions, definition of done). No dashes, no retired words, no "X, not Y".
- Never plagiarize: quote with credit and a link, cite any paraphrased finding, write everything else in our own words.
- A figure becomes a fact only when read on the publisher's own page. No aggregators (Zipdo, GITNUX, WiFi Talents and
  similar), no vendor blogs as fact sources. WebSearch summaries are leads, never verification.
- Unknown is never shown as weak. Zero incremental spend. A new external host goes into `vercel.json` in the same change.
- Ship process: commit, push, PR, `suite` green, merge with the full head SHA, pull `main` into the branch, verify
  production, trigger `nightly.yml`.

## 3. Tasks

### P0. Trust content (start here)

**Task 1. Healthcare research and originality.**
- For each pending entry in `src/lib/claims/healthcare.js` (each has a `lead`): read the publisher's own page. Record
  `kind: "fact"` with `source: { publisher, title, year, url }` and `checked` (date), or reclassify as `assumption`
  (reasoning, `test` tool), `example` or `none` (reason, `test` tool). Drop `research` and `lead` when settled.
- The benchmark table (6 metrics x Healthcare, cross-industry, top quartile): expect public sources for some cells only
  (SQM FCR by industry, ContactBabel's free guides, ACSI indexes, BLS JOLTS quits). Cells without one become `none`.
- Regulatory figures on eCFR and the regulator: HIPAA civil money penalty tiers (45 CFR 160.404, current inflation
  adjustment) and Medicare Advantage grievance limits (42 CFR 422.564).
- Vendor claims (for example "reduces staff workload 30 to 50%"): keep only as the vendor's stated claim with the vendor's
  page linked, or retire.
- Originality: for each converted file, take distinctive sentences, fetch the top matching pages, flag any verbatim
  run of 8 or more words, rewrite in our own words or quote with credit. Write the record in
  `src/lib/claims/originality.js` (`checked`, `method`, `matches` with a resolution per match).
- Rewrite the Healthcare intro ("underperforms cross-industry on FCR, transfer rate, and attrition") and the benchmark
  notes to what the sourced figures show.
- Done: `claims.test.mjs` green, full suite green, build green, browser check of the Healthcare page and six sub-pages
  (phone and desktop, no overflow), PR merged, production verified, nightly green.

**Task 2. The other nine industries, one per session.** Financial Services, Insurance, Retail, Telecom, Travel,
Utilities, Government, Manufacturing, Education.
- First session also builds one shared sub-page component to replace the 10 near-identical `*SubVerticalPage.jsx`
  files (behaviour equal: the ungate, copy profile, review request, `copy.test.mjs` section 5 still passes).
- Per industry: inventory every figure (main page, sub-pages, hub card), tokenize, add a claims file, add the page to
  `CONVERTED` in `claims.test.mjs`, then research and originality as in task 1.
- Keep the 16 already-verified stat strip entries (`copy.test.mjs` section 4) and fold them into the claims registry.

### P1. Reach foundations (no outside network needed; can run alongside P0)

**Task 3. Full-page prerender.** `prerender.mjs` writes only the head today; bodies are client-rendered.
- Server-render each of the 448 sitemap URLs at build time into `dist/<path>/index.html`, hydrating on the client.
  `floor.test.mjs` already bundles and server-renders tools; reuse its approach.
- Pages that read `window` at render need guards; lazy routes must resolve before render.
- Done: a harness proves every sitemap URL's HTML carries its h1 and main text, and the client hydrates without a
  mismatch warning. Chunk gate re-based with attribution if needed. Live check green.

**Task 4. Structured data by page type**, from `src/lib/seo.js`: tools `WebApplication`; method and rubric pages
`TechArticle` (and `HowTo` where the page is steps); industry pages `Article` with `citation` entries from the claims
registry; `FAQPage` only where the page has real questions. Done: `seo.test.mjs` validates each type's required
fields on every URL of that type.

**Task 5. Share cards.** A build-time preview image per tool, method and industry page (self-hosted in `dist`, no new
host), wired into `og:image` and `twitter:image`. Done: every sitemap URL has an image that exists in the build and
the correct dimensions; security and seo harnesses green.

**Task 6. Noindex the 10 CCaaS-by-industry pages** until their Stage 3 rebuild (TB decision), still reachable for
visitors; out of the sitemap or kept with `noindex` consistently. Done: `seo.test.mjs` pins it.

### P2. Measurement (before distribution scales)

**Task 7. Event taxonomy and funnels.** Freeze the event names and properties in `src/lib/track.js` (11-01 to 11-03),
set a UTM convention (source, medium, campaign names per channel), and define PostHog funnels: landing by channel, tool
completion, and 11-04, a first diagnostic followed by a second in the same session. PostHog free tier only. Done:
`track.test.mjs` pins the frozen names; a short `docs/MEASUREMENT.md` states the taxonomy, UTM rules and funnel
definitions for TB to create in PostHog.

**Task 8. 3-02 NextDiagnostic.** One next step per result from one source of truth (`src/lib/journey.js`), used by
ReportActions and by the rubric, ownership, renewal, terms and rfp engines, so a page never names two different next
tools. Done: a harness proves every tool renders exactly one next diagnostic and it equals the journey graph.

### P3. Engine integrity (TB decided S23)

**Task 9. Business Case baseline evidence.** Add one question, "Where do your baselines come from?": our defaults
(Directional), your own estimate (Planning-grade), a system report (Planning-grade), a system report attested by
checkbox (Finance-grade). A rail-pulled baseline grades by its origin (`railEvidence`). The benefit stream takes the
weaker of this and the existing attribution caps. Done: A/B over thousands of cases shows only the evidence axis moves;
sign invariance holds; harness pins and mutants updated; method page and version stamp updated; live PDFs normal and
void reconciled.

**Task 10. TCO marginal load.** `marginalPerContact` values savings at `load.marginal` 1.18 instead of the benefits
load, with one disclosure line: capturing the saving by not backfilling seats removes benefits too, about 10% more.
Unit costs stay on the loaded rate. Done: A/B shows only savings figures move; `tco.test`, `tco.report`, method pins
and changelog updated; live PDFs reconciled.

### P4. Distribution launch (TB posts; the site supplies assets)

**Task 11.** Free channels only, one research asset per week reused everywhere:
- owned: a LinkedIn newsletter or Substack fed by the method changelog and each newly sourced industry page;
- social: TB on LinkedIn plus a company page; practitioner communities (answers link a method page, never a pitch);
- earned: podcasts, guest posts, live events presenting a method or finding;
- product-led: scenario links and PDFs carry the site URL; embeddable calculators later.
Site work: a public "what's new" feed built from `changelog.js` and the claims registry, and asset text TB can post.
Needs task 7's UTM convention first.

### P5. Design

**Task 12.** TB runs a separate design chat from `docs/DESIGN_HANDOFF.md`. Its output returns here and is applied once
across the site: tokens, components, the 45 content pages on the old fonts, text and fill colour variants, link tap
targets, the nine rail tools onto `ToolShell`, the CCaaS-by-industry rebuild at Stage 3, and the "X, not Y" copy pass
(about 440). Gated by the suite, `scripts/visual-audit.mjs` and the live checker.

### P6. Remaining debt

13. Unsourced figures on Human Premium, Research, Advisory, Platforms, About and the Industries hub (claims pattern).
14. TCO and BCB publish verdicts on the rail (`analystRead`, `confidence`); publish facts only.
15. CPC, Channel, FCR and AID read with `getPrimitiveWithSource`; move to the external getters. Staffing, CPC, FCR, AID
    and Channel publish origin grades.
16. BCB next steps to `nextFor` (3-03); `MECH_INITIAL` F2 (unselected-state rendering); TCO guard-case wording;
    ReportActions `Field` labels bound with `htmlFor` and `id`.
17. Roadmap anonymous sequence capture; Attrition root-cause layer from the Agent Experience content.
18. WS10 performance re-scope and Core Web Vitals on production; delete the root `download` file once TB confirms.

### P7. Gated on TB or the corpus

19. Research Stage 1 loader (waits on the full CCaaS corpus and the Research Strategy Handoff), Stage 3 Vendor
    Intelligence pages for the 12 researched vendors, Stage 4 Vendor Match V3 (interim: 5-01 unfork and a ceiling cap),
    Stage 5 Market Position Index on Path 3 (class-scoped ranking plus an unordered category-wide map).
20. Opt-in anonymous benchmark exchange, the start of owned research; needs consent design and a storage decision
    (CLAUDE.md section 10 trigger).

## 4. Close of every session

Update CLAUDE.md section 11 (what was done, what is next) and add a row to the tracker change log
(`docs/CCCX_MASTER_TRACKER.md`, before the closing "Update this document" line). Say when an item is done.
