# The Center of CX. Redesign Plan, start to completion

Written 26 September 2026 with Brand Guide 1.0 (`docs/BRAND_GUIDE.md`). Governs the order of the redesign. The tracker change log
records progress; CLAUDE.md section 11 records sessions.

## How the plan is built

1. **Design each template once, before building it.** Every page type is designed on the canvas and approved before code. No page
   is designed in code.
2. **Build the system once, then move pages onto it.** Tokens, then components, then shells, then pages. Templates carry many
   pages at once: one vendor template serves 283 profiles, one industry template serves 71 pages.
3. **Ship in slices that stand alone.** Every phase merges to main on its own, behind the existing gates, and leaves the site
   whole. No long-lived redesign branch.
4. **Highest leverage first.** The report and the tool shell touch every diagnostic; the vendor template turns the research into
   pages; the homepage routes everyone.
5. **Prove it with measurement.** The first-to-second-tool measure in PostHog before and after. The practitioner checkpoints were
   dropped by TB on 26 September 2026: the design is committed and the build goes straight through.

Definition of done for every build phase: suite green (currently over 24,000 assertions), rail audit clean, chunk gate, copy and
security tests, visual audit at desktop and 390 pixels, live checker on production, screenshot comparison before and after, no
URL changes (or a 301 for every one), CLAUDE.md and tracker updated.

## Phase 0. Inputs and decisions (session 1, 26 September 2026: Claude's items done; TB's four in `docs/PHASE0_DECISIONS.md`)

| Item | Owner | Why it matters |
|---|---|---|
| Private location for the research corpus (build-time ingestion) | TB | The repository is public; the raw corpus is never committed. Needed before Phase 7 |
| Update the research checkpoint: 18 CCaaS vendors complete, Cohort 3 normalized | Claude | `researchStatus.js` and CLAUDE.md still say 12 |
| Vendor correction policy | TB | How a vendor reports an error, how fast we review, how a correction is logged. Needed before vendor pages go live |
| Contributor rules | TB | Who may publish, review before publishing, disclosure of vendor ties, licence of submitted work |
| Measurement taxonomy 1.1 | Claude | New events for doors, step 2 choices, report audience, stop here. Freeze before Phase 5 |
| Test group | TB | Five to eight practitioners for three short feedback rounds |

## Phase 1. Design the remaining templates (canvas, about six sessions)

Designs approved before their build phase begins; order follows the build.

1. Tool shell, desktop, final (Cost per Contact as the pattern) with the evidence mark, route sidebar and report audience picker.
   Designed in session 2, 26 September 2026; awaiting TB approval.
2. Vendor profile with real research (Vonage, from the Cohort 3 corpus) and its Phase 1 variant.
   Designed in session 3, 26 September 2026 (Vonage and Aircall); approved by TB.
3. Homepage final, desktop and phone, with the five doors and taxonomy 1.1 events marked.
   Designed in session 4, 26 September 2026; approved by TB.
4. CCaaS category page: class explained, vendors A to Z within each class, research status, no order by merit.
   Designed in session 5, 26 September 2026; approved by TB.
5. Industry page and sub-page with the seven layer map. Moved: designed at the start of Phase 8, the phase that builds it.
6. Method page, contributor article and profile, Market Watch item, Research landing (coming soon), email and newsletter, share card.
   Moved: designed at the start of Phases 9 and 10.

Sequence change (TB, 26 September 2026): no practitioner checkpoints; the build starts with Phase 2 now, and designs 5 and 6 are
made just before the phases that build them, so nothing waits on pages that ship months later.

## Phase 2. Foundations in code (done, session 6, 26 September 2026)

- `src/lib/tokens.js` and CSS variables for colour, type, space, radius, motion. Replaces per-file hex values.
- Self-hosted IBM Plex Sans (four weights), Plex Sans Condensed and Plex Mono under the site's own domain; `vercel.json` needs no
  new host. Archivo retired from `type.js`.
- Icon component with the 32 icons.
- Gate: a token test that fails on any hard-coded colour outside tokens in migrated files.
- Done: `tokens.js`, `tokensBlock.js` and `scripts/tokens-css.mjs` (CSS variables and font rules in index.html), nine Plex files in
  `public/fonts` (OFL, cached a year), every tool on Plex through `type.js`, the report window on Plex, `Icon.jsx` with the 32
  icons, `tokens.test.mjs` (289). Found on the way: three pages scrolled sideways on a phone (a method table, the shared number
  field, a Channel Shift panel); fixed, 112 page loads clean at 390 and 1440 pixels.

## Phase 3. Core components and the report (done: the report in session 7, merged in PR #41; the components in session 8)

- Button, Input with source, Stepper, Result, Grade badge, Evidence mark, Readout, Stack, Claim marker, Finding, Next step, Byline,
  Door, Route card, States.
- The light paper report template replacing the current PDF layout in `ReportExport.jsx`, with the audience picker and print rules.
  Keeps `reportHtml` escaping and `export.test.mjs` green.
- Gate: every component has a harness assertion for its accessible name and contrast.

## Phase 4. Shells (done: the site shell in session 9, merged in PR #42; the tool frame in session 10)

- Site shell: five-pillar navigation with Research and Market Watch marked soon, footer, search entry. Done in session 9
  (`src/lib/Shell.jsx`, rendered once by App): 61 pages lost their own bars; back links survive as a breadcrumb row. The
  search entry waits for a search to point at (none exists). The 37 pages built to clear a fixed bar keep the header over
  the page (`headerFixed`) until Phases 8 and 9 rebuild them.
- Tool shell v2: route sidebar, inputs, result, next step, exit; phone layout with pinned result and pinned next step. Replaces
  `ToolShell.jsx` and the nine rail tools' own headers.
  Done in session 10 as `src/lib/ToolFrame.jsx`: route rail from the journey graph (`routeFrom`, whose step 2 is always the
  page's one next step), breadcrumb row with the method stamp and the report action, the question as the one h1, the tool's
  inputs, a sticky result column; on a phone the question first, then the result and the rail, with the headline pinned to
  the bottom of the screen. Tools move onto it in Phase 6; ToolShell and the rail tools' headers retire as they do.

## Phase 5. Homepage (done in session 11; merged in PR #44, the baseline waived by TB)

- The two-question flow, the stack, the five pillar strip, the three arcs. Taxonomy 1.1 events live.
- A PostHog baseline for first tool to second tool, taken before the new homepage ships.
- Built in session 11 (`Homepage.jsx`, data in `src/lib/home.js`, gated by `home.test.mjs`); taxonomy 1.1 frozen with each
  new property scoped to the events that own it. Departures from the design: no time estimates (none measured), vendor
  steps describe today's profiles (findings and proof tests arrive in Phase 7), no search (none exists), no contributor
  invitation (D3 open), and on a phone step 2 follows the doors in the page rather than in a bottom sheet. Held from
  merge until TB supplies the baseline or waives it.

## Phase 6. Tools onto the shell (four to six sessions, batches of four)

- Batch order: the proving journey first (Cost per Contact, FCR Leakage, AI Deflection, Business Case), then TCO, License Gap,
  Staffing, Attrition, Channel Shift, then the WFM five, the frameworks, the procurement tools, Vendor Match, Roadmap.
- Readout added to assessments once the part to layer mapping is published.
- No engine change in this phase: every A/B shows identical figures and grades.
- Batch 1 done (S24, 27 Sep 2026): Cost per Contact, FCR Leakage, AI Deflection, Business Case on ToolFrame. Engine regions,
  grading and report payloads byte-equal to `main`; `toolframe.test.mjs` section 5 gates each moved tool. Merged (PR #46).
- Batch 2 done (S24, 27 Sep 2026): TCO, License Gap, Staffing, Attrition, Channel Shift. All nine rail tools on the frame. Next:
  batch 3, the WFM five.
- Batch 3 done (S24, 27 Sep 2026): the WFM five on the frame, with the shared `frameKit.jsx`. Next: batch 4, the frameworks.
- Batch 4 done (S24, 27 Sep 2026): the five frameworks on the frame; the kit gains Scale, StatementStep and DimensionBars. Next: batch 5, procurement (QA, Platform Decision, RFP, Contract Risk), then Vendor Match and Roadmap.
- Batch 5 done (S24, 27 Sep 2026): the procurement four on the frame; the kit gains numInput. Next: batch 6, Vendor Match and Roadmap, then retire ToolShell.
- Batch 6 done (S24, 27 Sep 2026): Vendor Match and Roadmap on the frame; `ToolShell.jsx` deleted. **Phase 6 complete:** all 25 tool routes render in ToolFrame (`toolframe.test.mjs` counts them from App.jsx). Next: Phase 7, which needs TB decision D1 (where the corpus lives) first.

## Phase 7. Research Stage 1 and Vendor Intelligence (three to four sessions)

- Stage 1 loader: reads the corpus from the private location at build time, checks schema version, filters to publishable
  evidence and Vendor Intelligence consumers, writes derived view data only. The 18 required separation tests from CLAUDE.md
  section 13 land here.
- Vendor template for the 18 researched CCaaS vendors; Phase 1 variant for the other 265 profiles.
- CCaaS category page by competitive class; CCaaS by industry pages rebuilt (research Stage 3).
- Vendor correction policy live (decision D2).

- Part 1 done (S24, 27 Sep 2026): Stage 1 loader, committed CCaaS snapshot, research harness, sync workflow (D1 decided).
  Next: the researched vendor profile on the snapshot.
- Part 2 done (S24, 27 Sep 2026): the researched vendor profile for the 18 CCaaS vendors, six views, from the snapshot.
  Next: the CCaaS category page by competitive class.
- Part 3 done (S24, 27 Sep 2026): the CCaaS category page by competitive class, from the snapshot's category index.
  Next: the CCaaS by industry pages (research Stage 3) and the vendor correction policy (D2).
- Tags and caveats (S24, 27 Sep 2026): every researched vendor tagged by offer (UCaaS + CCaaS), sizes served and public
  sector, each caveat on the tag; profiles link into the tools.
- Part 4 done (S24, 27 Sep 2026): the ten CCaaS by industry pages rebuilt from the research by published rules.
  Next: the vendor correction policy (D2), then Phase 8.

## Phase 8. Industry Insights (two sessions)

- Industry and sub-page templates carry all 71 pages; claim markers and sources unchanged.

## Phase 9. Methods and the rest (two sessions)

- Method, rubric and changelog pages; About, Contact, Advisory, Research landing, legal pages.

## Phase 10. Contributors, Research, Market Watch v1 (two to three sessions, zero spend)

- Contributor profile and article templates; submissions through the existing review request path; published as static pages.
- Research landing (coming soon, with the consent design once decided); Market Watch v1 as dated, labelled static items.

## Phase 11. Finish (one to two sessions)

- Retire old styles and dead components; performance pass against the budget; full accessibility audit; special edition switch;
  measurement review against the Phase 5 baseline.

## Running alongside

- Research continues one vendor at a time (next: AnywhereNow). Each completed vendor becomes a page by rebuilding, with no
  design work.
- Engine integrity items (P3, P6 in CLAUDE.md) continue between phases where they do not touch the same files.

## Rough total

About 30 to 36 working sessions from Phase 1 to Phase 11, one phase at a time, each ending on a green, deployed site.
