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
5. **Prove it with people.** Practitioner feedback at three checkpoints, and the first-to-second-tool measure in PostHog before and
   after.

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
3. Homepage final, desktop and phone, with the five doors and taxonomy 1.1 events marked.
4. CCaaS category page: class explained, vendors A to Z within each class, research status, no order by merit.
5. Industry page and sub-page with the seven layer map.
6. Method page, contributor article and profile, Market Watch item, Research landing (coming soon), email and newsletter, share card.

Checkpoint A: practitioner round on the homepage, one tool and the Vonage page.

## Phase 2. Foundations in code (one to two sessions)

- `src/lib/tokens.js` and CSS variables for colour, type, space, radius, motion. Replaces per-file hex values.
- Self-hosted IBM Plex Sans (four weights), Plex Sans Condensed and Plex Mono under the site's own domain; `vercel.json` needs no
  new host. Archivo retired from `type.js`.
- Icon component with the 32 icons.
- Gate: a token test that fails on any hard-coded colour outside tokens in migrated files.

## Phase 3. Core components and the report (two sessions)

- Button, Input with source, Stepper, Result, Grade badge, Evidence mark, Readout, Stack, Claim marker, Finding, Next step, Byline,
  Door, Route card, States.
- The light paper report template replacing the current PDF layout in `ReportExport.jsx`, with the audience picker and print rules.
  Keeps `reportHtml` escaping and `export.test.mjs` green.
- Gate: every component has a harness assertion for its accessible name and contrast.

## Phase 4. Shells (one session)

- Site shell: five-pillar navigation with Research and Market Watch marked soon, footer, search entry.
- Tool shell v2: route sidebar, inputs, result, next step, exit; phone layout with pinned result and pinned next step. Replaces
  `ToolShell.jsx` and the nine rail tools' own headers.

## Phase 5. Homepage (one session)

- The two-question flow, the stack, the five pillar strip, the three arcs. Taxonomy 1.1 events live.
- Checkpoint B: practitioner round and a PostHog baseline for first tool to second tool.

## Phase 6. Tools onto the shell (four to six sessions, batches of four)

- Batch order: the proving journey first (Cost per Contact, FCR Leakage, AI Deflection, Business Case), then TCO, License Gap,
  Staffing, Attrition, Channel Shift, then the WFM five, the frameworks, the procurement tools, Vendor Match, Roadmap.
- Readout added to assessments once the part to layer mapping is published.
- No engine change in this phase: every A/B shows identical figures and grades.

## Phase 7. Research Stage 1 and Vendor Intelligence (three to four sessions)

- Stage 1 loader: reads the corpus from the private location at build time, checks schema version, filters to publishable
  evidence and Vendor Intelligence consumers, writes derived view data only. The 18 required separation tests from CLAUDE.md
  section 13 land here.
- Vendor template for the 18 researched CCaaS vendors; Phase 1 variant for the other 265 profiles.
- CCaaS category page by competitive class; CCaaS by industry pages rebuilt (research Stage 3).
- Checkpoint C: practitioner round on vendor pages; vendor correction policy live.

## Phase 8. Industry Insights (two sessions)

- Industry and sub-page templates carry all 71 pages; claim markers and sources unchanged.

## Phase 9. Methods and the rest (two sessions)

- Method, rubric and changelog pages; About, Contact, Advisory, Research landing, legal pages.

## Phase 10. Contributors, Research, Market Watch v1 (two to three sessions, zero spend)

- Contributor profile and article templates; submissions through the existing review request path; published as static pages.
- Research landing (coming soon, with the consent design once decided); Market Watch v1 as dated, labelled static items.

## Phase 11. Finish (one to two sessions)

- Retire old styles and dead components; performance pass against the budget; full accessibility audit; special edition switch;
  measurement review against the Checkpoint B baseline.

## Running alongside

- Research continues one vendor at a time (next: AnywhereNow). Each completed vendor becomes a page by rebuilding, with no
  design work.
- Engine integrity items (P3, P6 in CLAUDE.md) continue between phases where they do not touch the same files.

## Rough total

About 30 to 36 working sessions from Phase 1 to Phase 11, one phase at a time, each ending on a green, deployed site.
