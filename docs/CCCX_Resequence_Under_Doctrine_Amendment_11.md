# CCCX Resequence Under Doctrine Amendment 11

Replaces Section 4 of `CCCX_MASTER_TRACKER.md`, "What to run, chat by chat," from
session 8 onward. Sessions 1 through 7 are closed and are recorded here only so the
line is continuous.

Every L and XL item below carries the reason it precedes demand evidence, per 11.1.

---

## Closed

| # | Item | Status |
|---|---|---|
| 1 | WS0 batch, 0-01 through 0-06 | Closed, except `SHIPPING.md` never landed |
| 2 | 1-01 AI Deflection Archivo | Closed |
| 3 | 1-02 FCR Leakage | Closed, suite 1,168 |
| 4 | 1-03 Cost per Contact | Closed, suite 1,693 |
| 5 | 1-04 Channel Shift | Closed, suite 2,138 |
| 7 | 1-05 License Bundle Gap | Closed, suite 2,637, lock gate 2 to 1 |

Session 6, the instrumentation verify, was scheduled and did not run. That is the
loop 11.3 exists to break, and it is why it moves up rather than down below.

---

## The next eight sessions

| # | Item | Effort | Why it precedes demand evidence |
|---|---|---|---|
| 8 | **1-09 confidence taxonomy** DECIDE | M | Governs the shape of 1-06. Deciding after 1-06 means the build makes the decision by shipping, and the retrofit then spans nine tools plus `ReportActions`. Per 11.1 corollary on sequence. Decision and written spec only, no retrofit |
| 9 | **1-06 Attrition Cost** engine extraction | XL | Closes WS1 and unblocks 2-02, 3-03, 6-01, 10-04, 13-02. Built against the 1-09 answer. It is the last tool with a recorded lock and no harness |
| 10 | **Reachability batch: 8-04, index count, Sprinklr slug** | S each | 11.2 gate. Roughly 255 vendor pages titled from the slug rather than the name, a homepage count that contradicts the live data, and one unreachable profile. Vendor lookup is the dominant demand per Search Console, so these are the pages most first contacts land on. Small, and currently the cheapest trust defects on the platform |
| 11 | **SEO prerender** | L | 11.2 gate, and the highest-value one. Crawlers and unfurlers currently receive an empty shell, so every tool link shared into LinkedIn or Slack misrepresents the platform. Real engineering, not a file drop. Verify against the Vercel alias before promoting |
| 12 | **11-01 through 11-03 instrumentation** | M | 11.3 precondition. `track.js` is imported by 2 of 30 tools. Until this runs, no later prioritization can be evidence-based and the doctrine cannot function. Verify whether the Hobby tier gates custom events; PostHog is the zero-cost fallback behind a single endpoint swap |
| 13 | **10-01 through 10-03 bundle splitting** | L | 11.2 gate. 2.9 MB, 731 KB gzipped, single chunk, mobile-majority traffic. Sequenced after instrumentation so the improvement is measurable rather than asserted |
| 14 | **2-01 triage of the 21 orphan tools** | M | First session that can run on real demand evidence rather than file order. Per 11.1 corollary on unaudited assets, this is what decides which of the twenty-one ever receive an XL pass |
| 15 | **3-01 plus 3-02 journey graph and NextDiagnostic** | L | The compounding item. Deliberately after instrumentation so the journey is built on observed paths rather than assumed ones |

---

## What moved, and why

**1-09 moved up, from unscheduled to next.** It was a DECIDE item with no dependencies
and no owner, which is how it became load-bearing without anyone scheduling it.

**1-07 benchmark constant audit moved down, behind session 15.** It walks all nine
locked files. If the 1-09 retrofit is also a nine-file walk, they should be one pass.
Do not run 1-07 until 1-09's retrofit scope is known.

**1-10 and 1-11 moved down, behind session 15.** Both are engine enrichment on
Business Case Builder. Neither has demand evidence and neither is a correctness defect.
Under 11.1 they cannot be scheduled ahead of the reachability and instrumentation work.

**Reachability items moved up out of workstreams 8 and 10.** They were classified as
SEO and performance work. Under 11.2 they are quality gates and they sit with the
correctness work.

**Instrumentation moved up and is now a gate, not a session.** After session 12 no
tool is recorded as locked without its completion event wired.

---

## Carried debt, not blocking

- `SHIPPING.md` still absent. Item 0-06 recorded closed, file never landed. Re-upload.
- `guardVal` money-rendering defect live in `CostPerContactCalculator.jsx`, plus a
  money-guard case missing from `cpc.report.mjs` set C. Roll into 11-01 or take standalone.
- FCR Leakage PULLED badge still reads `getPrimitive` rather than `getPrimitiveWithSource`.
  CPC, Channel Shift and License Gap are the pattern.
- `AttritionCostCalculator.jsx` is the last tool claiming a lock with no harness.

---

## The line

Prove behavior first, manually learn second, invest third, automate last.
Ration effort as strictly as money.
Reachability precedes rigor.
Instrumentation precedes proof.