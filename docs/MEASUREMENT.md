# Measurement: event taxonomy, UTM convention and funnels

Taxonomy version 1.0, frozen 25 September 2026 (P2 task 7, tracker 11-01 to 11-03). Source of truth in code:
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
