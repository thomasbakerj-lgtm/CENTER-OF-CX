# Visual and usability audit

Phase A item 4 (CLAUDE.md section 12). Run 23 September 2026 against production with
`scripts/visual-audit.mjs`: every tool on its sample link, both rubric pages, the
homepage and How to Choose, at desktop (1366 x 900) and phone (390 x 844). Rerun
the script after any fix; it writes screenshots and `audit.json` and judges nothing
itself. This file is the judgment.

## Verdict

The rail tools look professional and purpose-built, if dense. The 16 floor tools
work but read as a second, older product: no hero, a thin title, no `<h1>`, emoji
icons, and results laid out differently from the rail tools. The homepage and How to
Choose read as a generic dark SaaS template and are still on the old type pair.

Nothing breaks on a phone: no page scrolls sideways and every tool stacks to one
column. The measurable failures are accessibility and legibility, and they are the
same on every page, which means they are cheap to fix: most sit in a handful of
shared components.

## Measurements

Desktop unless marked. Unnamed fields: inputs a screen reader cannot name. Low
contrast: text below WCAG AA on a solid background. Small text: text below 12px.
Tap targets under 40px are measured on the phone. Other fonts: families in use besides
Archivo, the site face.

| Page | Unnamed fields | Low contrast | Small text | Tap targets under 40px (phone) | h1 | Emoji | Other fonts | Phone overflow |
|---|---|---|---|---|---|---|---|---|
| home | 0 of 0 | 99 | 46 | 39 of 74 | 1 | 1 | DM Sans, Instrument Serif | no |
| how-to-choose | 0 of 0 | 79 | 11 | 14 of 39 | 1 | 0 | DM Sans, Instrument Serif | no |
| cx-maturity-rubric | 0 of 0 | 11 | 12 | 7 of 8 | 1 | 0 | none | no |
| ai-readiness-rubric | 0 of 0 | 13 | 14 | 8 of 9 | 1 | 0 | none | no |
| cx-maturity | 1 of 1 | 21 | 11 | 6 of 13 | 0 | 1 | Arial | no |
| ai-readiness | 1 of 1 | 24 | 13 | 6 of 13 | 0 | 1 | Arial | no |
| cx-it-alignment | 1 of 1 | 31 | 29 | 4 of 12 | 0 | 1 | Arial | no |
| governance-model | 1 of 1 | 68 | 19 | 4 of 11 | 0 | 1 | Arial | no |
| roadmap-builder | 1 of 1 | 7 | 1 | 4 of 11 | 0 | 2 | Arial | no |
| business-case | 29 of 30 | 151 | 151 | 108 of 119 | 0 | 1 | Arial, Georgia | no |
| staffing-calculator | 10 of 11 | 98 | 84 | 37 of 44 | 1 | 1 | Arial | no |
| shrinkage-planner | 11 of 11 | 34 | 18 | 14 of 19 | 0 | 1 | Arial | no |
| occupancy-risk | 9 of 9 | 74 | 2 | 12 of 20 | 0 | 1 | Arial | no |
| forecast-accuracy | 64 of 64 | 106 | 29 | 71 of 76 | 0 | 1 | Arial | no |
| schedule-adherence | 9 of 9 | 35 | 8 | 12 of 18 | 0 | 1 | Arial | no |
| attrition-cost | 28 of 28 | 136 | 162 | 93 of 101 | 1 | 1 | Arial, Georgia | no |
| cost-per-contact | 9 of 10 | 98 | 83 | 28 of 38 | 1 | 2 | none | no |
| ai-deflection | 18 of 21 | 136 | 127 | 68 of 77 | 1 | 1 | Arial, Georgia | no |
| channel-shift | 25 of 32 | 170 | 159 | 93 of 106 | 1 | 2 | Georgia | no |
| license-gap | 49 of 50 | 127 | 137 | 79 of 87 | 1 | 2 | Georgia, Arial | no |
| aht-decomposition | 7 of 7 | 69 | 51 | 15 of 21 | 0 | 11 | Arial | no |
| qa-scorecard | 25 of 39 | 60 | 33 | 56 of 76 | 0 | 1 | Arial | no |
| fcr-leakage | 14 of 14 | 42 | 36 | 37 of 44 | 1 | 0 | Arial, Georgia | no |
| vendor-match | 1 of 1 | 92 | 48 | 30 of 43 | 0 | 9 | Arial | no |
| platform-decision | 1 of 1 | 46 | 10 | 11 of 22 | 0 | 1 | Arial | no |
| contract-risk | 1 of 1 | 69 | 21 | 33 of 40 | 0 | 8 | Arial | no |
| transformation-readiness | 1 of 1 | 40 | 26 | 16 of 26 | 0 | 1 | Arial | no |
| rfp-builder | 1 of 1 | 50 | 44 | 5 of 10 | 0 | 1 | Arial | no |
| tco-calculator | 9 of 9 | 45 | 30 | 32 of 38 | 1 | 0 | Arial | no |

## Punch list, in order

### 1. Shared fixes, once for every page (Phase B, one session)

1. **Buttons, inputs and selects do not inherit the site font.** Every tool renders
   its controls in Arial. One global rule (`button, input, select, textarea
   { font: inherit }`) fixes all 25.
2. **Inputs are not named for screen readers.** Up to 64 per tool. Bind every label
   to its input in the shared `Input`, `NumField` and `Field` components and in the
   per-tool copies of `Input`. Also carried debt on ReportActions.
3. **Tap targets are too small on phones.** Most buttons and links are under 40px.
   Set a 44px minimum on buttons, segmented controls, links styled as buttons and
   inputs.
4. **Text below 12px.** 30 to 162 elements per rail tool, mostly 10 to 11px captions
   and hints. Floor captions at 12px and hints at 12.5px through `type.js`.
5. **Contrast.** The failures are mostly translucent white on dark panels
   (`rgba(255,255,255,0.35)` to `0.5`) and muted grey hints. Replace them with named
   tokens that pass AA, then use only the tokens.
6. **No `<h1>` on any floor tool.** The tool title becomes the page `<h1>`.
7. **Georgia** survives on six rail tools (Business Case, Attrition, AI Deflection, Channel Shift, License Gap, FCR) and the homepage pair (DM Sans, Instrument
   Serif) survives on the homepage and How to Choose. Move both onto `type.js`.

### 2. Per-tool fixes (with Phases C and D, tool by tool)

1. **Retired and generic copy.** "Built to survive a CFO" (Business Case, a retired
   phrase), "world-class" (FCR), "best-in-class" (Schedule Adherence, Forecast
   Accuracy), and "industry-leading", "best-in-class" or "seamless" across seven
   vertical pages and the vendor data files. Reword each to a claim the page can
   support.
2. **Unsourced benchmark claims in tool copy.** Shrinkage "typically runs 28 to 35%"
   and "often the highest-ROI workforce initiative"; Occupancy multipliers; AHT
   benchmark ranges; Contract Risk "the gap runs 40 to 100%". Source and register each,
   or label it an assumption.
3. **Emoji used as icons.** AHT (11), Vendor Match (9), Contract Risk (8), the homepage
   cards (one renders as a stray glyph). Replace with the site's own icon set during
   the aesthetic rebuild; remove the broken homepage one in Phase B.
4. **Chart labels collide.** Shrinkage's breakdown bar prints labels inside segments
   too narrow for them ("Coachir / 1:1s", "PTO / vacationAbsenteeis"). Label narrow
   segments outside the bar, or in the legend only.
5. **Forecast Accuracy "Randomize"** now shifts a deterministic sample. Rename it
   "New sample".
6. **Floor tools lack the rail tools' page shape.** Hero with eyebrow, title, one-line
   purpose and confidence strip; inputs panel; results panel; disclosure panel. This is
   the shared tool layout in Phase B item 2, and the base the aesthetic rebuild restyles.

### 3. Inputs to the aesthetic rebuild (after Phases C and D)

- The homepage hero, the three-card row with emoji and the pill bar are the most
  template-like surface on the site and the first one a visitor sees.
- The navy gradient hero with an uppercase eyebrow and a centred score card is used
  on almost every page. It is consistent, which is a strength to keep, and generic,
  which is the thing to change.
- The rail tools' results cards (bordered stat tiles in four colours) are the house
  style today. Decide in the rebuild whether they stay.
- Colour carries meaning inconsistently: green, amber and red mark bands in one tool,
  categories in another and decoration in a third.

Screenshots from this run are not committed. Rerun `scripts/visual-audit.mjs` to
reproduce them.
