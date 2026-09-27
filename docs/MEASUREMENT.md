# Measurement: event taxonomy, UTM convention and funnels

Taxonomy version 1.3, 27 September 2026 (1.2 and 1.1 frozen the same day at redesign Phase 5; 1.0 frozen 25 September 2026, P2
task 7, tracker 11-01 to 11-03). The sections below are 1.0; sections "Taxonomy 1.1" to "Taxonomy 1.3" list what each
adds. Source of truth in code:
`src/lib/track.js`; pins in `track.test.mjs` section P. PostHog (free tier) is the event store; Vercel Analytics counts
page views only.

Every event is anonymous: an opaque random browser id, no person profile, and only the properties below, each checked
by a validator. A name or property outside this list never leaves the browser. Changing a name means a new taxonomy
version, a line in this file and the pins, because every funnel below is built on these names.

## Events

| Event | When it fires | Properties |
|---|---|---|
| `session_landing` | Once per session, on the first page rendered | `page_type`, `utm_source`, `utm_medium`, `utm_campaign`, `ref`, `repeat` |
| `tool_view` | A tool route is opened | `tool`, `depth`, `via_rail`, `repeat` |
| `tool_complete` | A tool rendered a result | `tool`, `real`, `depth`, `grade`, `severity`, `bound_axis`, `repeat` |
| `report_export` | The PDF was generated | `tool`, `grade`, `bound_axis`, `repeat` |
| `report_copy_requested` | The reader asked for a copy of the report | `tool`, `grade`, `bound_axis`, `repeat` |
| `review_form_opened` | The expert read form was opened | `tool`, `repeat` |
| `expert_read_submit` | A result was sent for a human read | `tool`, `grade`, `bound_axis`, `repeat` |
| `next_step_click` | A journey link into another tool was clicked | `from`, `to`, `repeat` |
| `scenario_shared` | A scenario link was created | `tool`, `repeat` |
| `scenario_loaded` | A tool opened from a scenario link | `tool`, `repeat` |

## Properties

| Property | Meaning |
|---|---|
| `tool` | Tool id (slug) |
| `from`, `to` | Journey origin and destination tool ids |
| `grade` | Headline confidence grade: `directional`, `planning-grade`, `finance-grade` |
| `bound_axis` | The axis or axes holding the headline down |
| `severity` | Result intensity band: `none`, `low`, `moderate`, `high`, `severe` |
| `real` | Inputs moved off the defaults |
| `depth` | How many different tools this session has opened (1 to 99) |
| `via_rail` | This tool was opened after another one in the same session |
| `repeat` | This browser had visited before this session |
| `page_type` | Landing page kind: `home`, `tool`, `method`, `industry`, `vendor`, `research`, `other` |
| `utm_source`, `utm_medium`, `utm_campaign` | The link's UTM tags, lowercased; a value that is not a slug of 40 characters or fewer is dropped |
| `ref` | The referring site's host name only (no path, no query); left out for the site's own pages |

## UTM convention

Every link TB posts carries all three tags. Lowercase, words joined by hyphens, no personal names.

| Channel | `utm_source` | `utm_medium` |
|---|---|---|
| LinkedIn post or comment (TB) | `linkedin` | `social` |
| LinkedIn company page | `linkedin-page` | `social` |
| LinkedIn newsletter | `linkedin-newsletter` | `newsletter` |
| Substack | `substack` | `newsletter` |
| X | `x` | `social` |
| Reddit, community forums, Slack groups | the community's short name, for example `reddit-callcenter` | `community` |
| Podcast show notes | the show's short name | `podcast` |
| Guest post | the publication's short name | `guest-post` |
| Live event or webinar | the event's short name | `event` |
| Email to a person or list | `email` | `email` |
| PDF and scenario links the site creates | `site` | `product` |

`utm_campaign` names the asset and its week: `YYYY-MM-asset`, for example `2026-10-healthcare-benchmarks` or
`2026-10-tco-method`. The weekly research asset (P4) uses the same campaign on every channel, so one campaign shows
which channel carried it.

An untagged visit still reports `ref` when the browser sends a referrer, so search, answer engines and untagged shares
show up by host (for example `google.com`, `chatgpt.com`, `linkedin.com`).

## Funnels to create in PostHog

Create these as saved insights (Product analytics, New insight, Funnels), conversion window one session unless noted.

1. **Landing by channel.** Trend of `session_landing`, broken down by `utm_source`, then by `ref`, weekly. Filter
   `repeat = false` for new readers.
2. **Tool completion.** Funnel `tool_view` then `tool_complete`, same `tool`, broken down by `tool`. Shows which tools
   lose readers before a result.
3. **First diagnostic to second (11-04).** The question the site must answer first: does a reader who finishes one
   diagnostic run a second? Funnel:
   1. `tool_complete` where `depth = 1`
   2. `tool_view` where `via_rail = true`
   3. `tool_complete` where `depth >= 2`

   Breakdown by the first step's `tool`. Conversion from step 1 to step 3 is the 11-04 rate. `next_step_click`
   between steps 1 and 2 shows how many used the journey link rather than finding the second tool themselves.
4. **Channel to completion.** Funnel `session_landing` then `tool_complete`, broken down by `utm_source`. Which channels
   bring readers who finish a diagnostic.
5. **Intent.** Funnel `tool_complete` then `report_export` then `expert_read_submit`, broken down by `grade`.

## Rules

- Add an event only to `EV` in `src/lib/track.js`, with a validator for any new property, a row here, and a pin in
  `track.test.mjs`.
- Never send a figure the reader entered, a result value, a name, an email address or a company.
- Measurement stays on the PostHog free tier (CLAUDE.md section 10: paid analytics waits until free-tier limits are
  actually hit).

## Taxonomy 1.1 (drafted in redesign Phase 0; frozen 27 September 2026 at Phase 5 by TB's go)

Status: frozen, with code, validators and pins (`track.test.mjs` section Q). Nothing in 1.0 is renamed or removed; 1.1
only adds. Every rule above applies unchanged. Wired at freeze: the four homepage events (`door_select`,
`route_select`, `route_start`, `layer_select` with surface `home`) and `audience` on `report_export`. The others fire as
their surfaces are built: `stop_here` with the tool frame in Phase 6, `vendor_view` and `vendor_action` with the vendor
profiles. `report_copy_requested` carries no `audience`: the copy request has no reader choice.

New events

| Event | When it fires | Properties |
|---|---|---|
| `door_select` | A homepage door (step 1) is chosen | `pillar`, `repeat` |
| `route_select` | A step 2 option is chosen | `pillar`, `route`, `repeat` |
| `route_start` | The route's start button is pressed | `pillar`, `route`, `to`, `repeat` |
| `stop_here` | The reader takes the honest exit on a result | `tool`, `grade`, `repeat` |
| `layer_select` | A stack layer is chosen anywhere it is interactive | `layer`, `surface`, `repeat` |
| `vendor_view` | A vendor profile is opened | `vendor`, `category`, `status`, `repeat` |
| `vendor_action` | An action on a vendor profile is taken | `vendor`, `action`, `repeat` |

New properties, and one added to existing events

| Property | Values |
|---|---|
| `pillar` | `diagnostics`, `vendors`, `industries`, `research`, `market-watch` |
| `route` | The step 2 option slug: `cost`, `ai-proposal`, `renewal`, `staffing`, `readiness`, `rfp`, `category`, `vendor`, `starting-list`, or an industry slug |
| `to` | Destination tool id, or a page type from `page_type` |
| `layer` | `l1` to `l7` |
| `surface` | `home`, `tool`, `vendor`, `industry` |
| `vendor` | Vendor slug. A vendor name is public data about a company, never about the reader |
| `category` | Vendor category slug |
| `status` | `complete` or `phase1`, from `researchStatus.js` |
| `action` | `test-it`, `rfp`, `brief`, `method`, `peer`, `request` (asks for a not yet researched vendor to be researched; one anonymous count) |
| `audience` | Added to `report_export`: `finance`, `operations`, `it`, `executive`, `advisor` |
| `page_type` | Gains `category` |

New funnels

6. **Door to first result.** `door_select` then `route_start` then `tool_complete` where `depth = 1`, broken down by
   `pillar`. Shows which doors lead to a finished diagnostic.
7. **Vendor to test.** `vendor_view` then `vendor_action` where `action = test-it` then `tool_complete`, broken down by
   `status`. Shows whether research pages send readers into their own numbers.
8. **Honest exit.** Trend of `stop_here` against `tool_complete`, by `tool`. A high rate is not failure: it is the
   buy-nothing outcome working.
9. **Report audience.** `report_export` broken down by `audience`, then `expert_read_submit`. Shows who the reports are
   for in practice.

## Taxonomy 1.2 (27 September 2026, vendor introductions; TB: every vendor surface offers one)

1.2 only adds. Every 1.0 and 1.1 name keeps its meaning, so every funnel built on them keeps working.

| Change | Detail |
|---|---|
| `action` gains `intro` | On `vendor_action`: the reader asked for an introduction to the vendor. Fires on the button, before the contact form |
| `surface` gains `category` | A vendor list on a category or category by industry page |
| New event `intro_submit` | The introduction request was accepted by the contact form's inbox. Carries `vendor` (profile slug, when there is one) |
| `vendor_action` carries `surface` | Where the action was taken: `vendor` (profile), `tool` (Vendor Match, RFP Builder), `category` (a vendor list) |

A vendor the reader typed into a tool, with no profile on the site, sends `action` and `surface` only: `vendor` takes a
profile slug and nothing else.

New funnel

10. **Introductions.** `vendor_action` where `action = intro`, broken down by `surface` and `vendor`, then
    `intro_submit`. Shows where introduction requests start and which vendors buyers ask to meet.

## Taxonomy 1.3 (27 September 2026, Market Watch and contributor pages, redesign Phase 10)

1.3 only adds. Every earlier name keeps its meaning.

| Change | Detail |
|---|---|
| `surface` gains `market-watch` | An introduction asked for from a Market Watch item that names the vendor |
| `page_type` gains `market-watch` | A session that starts on `/market-watch`, so a Market Watch item shared on a channel can be counted as a landing |
| `page_type` `research` widens | `/perspectives`, `/contributors/*` and `/contribute` count as Research landings |

