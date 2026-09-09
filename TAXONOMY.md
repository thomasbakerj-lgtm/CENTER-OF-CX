# EVENT TAXONOMY, FROZEN

**Frozen 9 September 2026.** Capture went live the same day.

This document is the contract between what the platform emits and what any
later analysis is allowed to assume. It is frozen because renaming an event
after collection begins does not migrate history, it splits it. A funnel built
across a rename silently under-reports the period before it.

The vocabulary itself is enforced in code. `EV` in `src/lib/track.js` is a
closed object and `buildPayload` refuses any name not in it, so a typo produces
no data rather than a second funnel nobody knows to look at. This document
records what each name means and what it may be read as. The code cannot
enforce meaning.

---

## 1. THE RULES

1. **Names never change.** An event name in section 2 is permanent. If a name
   turns out to be wrong, the meaning is corrected in this document and the name
   is left alone.
2. **Meanings never widen.** Firing an existing event from a new kind of moment
   changes what every historical row meant. Add a new event instead.
3. **New events land here before they land in code**, with an intent class.
4. **One source per event.** Two call sites emitting the same name is a double
   count, and a double count is invisible in the data. Locked by assertions
   G6a, G6b and G7 in `track.test.mjs`.
5. **The property allowlist is the privacy boundary.** `ALLOWED_PROPS` in
   `track.js` is the whole list. Nothing outside it reaches the wire, whatever
   a caller passes.
6. **A dropped property reads as not published, never as zero.** An
   unrecognised severity word fails its validator and the property is omitted.
   It never becomes `none`, because `none` is a measurement.

---

## 2. THE EVENT VOCABULARY

Intent classes follow the master tracker WS11 taxonomy.

| Event | Fires when | Intent class | Source |
|---|---|---|---|
| `tool_view` | A `/tools/*` route is opened | Curiosity | `Journey` in `App.jsx`, only |
| `tool_complete` | A result renders with a confidence grade | Operational pain, or economic pain when severity is high or severe | `ReportActions.jsx`, only |
| `report_export` | The PDF is generated | Active investigation. Highest intent action on the site | `ReportExport.jsx` |
| `report_copy_requested` | The result summary is copied | Active investigation | `ReportActions.jsx` |
| `review_form_opened` | The expert read form is opened | Active investigation | `ReportActions.jsx` |
| `expert_read_submit` | A result is submitted for a human read | Procurement | `ReportActions.jsx` |
| `next_step_click` | A journey CTA into another tool is clicked | Active investigation | Per tool `goNext` |
| `scenario_shared` | A scenario link is generated | Active investigation | Per tool |
| `scenario_loaded` | A shared scenario link is opened | Active investigation | Per tool |

### Two events that are not the same thing

`tool_view` counts arrivals. `tool_complete` counts results. The ratio between
them is the completion rate, and it is the single number that decides which
tools survive the WS2 triage of the twenty-one orphan tools. It is therefore the
number most worth protecting from a counting defect. See section 5.

`scenario_shared` and `scenario_loaded` are the save-and-return mechanism the
platform already has. Before any localStorage history is built, and long before
accounts, the question is whether anyone generates a scenario link at all, and
whether anyone opens one. These two events answer it at zero cost.

---

## 3. PROPERTIES

| Key | Type | Meaning |
|---|---|---|
| `tool` | slug | Tool id or route slug |
| `from` | slug | Journey origin tool |
| `to` | slug | Journey destination tool |
| `grade` | enum | Headline confidence grade |
| `severity` | enum | Result intensity band |
| `real` | boolean | Inputs moved off the defaults |
| `depth` | 0 to 99 | How many tools deep in this session |
| `via_rail` | boolean | Arrived after another tool ran |
| `repeat` | boolean | This browser has been here before |

**Grades:** `indicative`, `directional`, `supported`, `validated`, `finance`,
`none`. Lower cased at the boundary so title case cannot split a funnel.

**Severity bands:** `none`, `low`, `moderate`, `high`, `severe`. `none` means
the tool ran and found no severity. An unreadable input publishes nothing.

**Known gap, tracked separately.** TCOCalculator, StaffingCalculator and
AIDeflectionRealityCheck hand-write their severity and can only ever reach
`low`, `moderate` and `high`. For those three, `none` and `severe` are
unreachable in practice. Any cross-tool severity comparison that includes them
is comparing a five band scale against a three band one. Do not read a severity
distribution across all nine tools until the retrofit lands.

---

## 4. WHAT NEVER LEAVES THE BROWSER

No input value. No wage. No contact volume. No cost figure. No scenario. No
email. No company name. No person profile: every event sets
`$process_person_profile: false`.

Identity is an opaque random generated in `track.js`, stored in localStorage for
the browser and sessionStorage for the visit. It is never derived from anything
about the reader.

---

## 5. THE FIRST DEFECT, RECORDED

Within the first hour of live capture, `tool_view` fired twice per view on
TCOCalculator and BusinessCaseBuilder. `Journey` in `App.jsx` fires centrally
for every tool route, and both files had kept a mount call of their own from
before that existed. Both fired.

The effect was not a cosmetic inflation. It halved the reported completion rate
on the two most commercially important tools on the platform, which is the
metric that decides what gets built next.

`tool_complete` had carried a single source assertion since it was written.
`tool_view` had not. Both are locked now.

**Any `tool_view` count for 9 September 2026 on `tco-calculator` or
`business-case-builder` is inflated and must not be used as a baseline.**
Measurement starts from the deploy that carries this document.

---

## 6. WHAT THIS DOES NOT MEASURE, DELIBERATELY

Vendor pages and category pages are not instrumented. Vendor lookup is the
dominant demand surface per Search Console, so the event stream currently
describes the tool platform and not the traffic. Tracked as 11-06. Until it
lands, no statement of the form "readers do X" is supported. The supported form
is "readers who reach a tool do X".
