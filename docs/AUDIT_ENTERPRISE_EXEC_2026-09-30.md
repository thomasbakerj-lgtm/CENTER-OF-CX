# Enterprise CX executive audit, 30 September 2026

The site was tested on production (www.contactcentercx.com, `main` at aaa62a9) as an enterprise CX executive: 1,800 seats, about 14M contacts a year, US, UK and India, incumbent on-prem Avaya, Salesforce CRM, PCI and GDPR in scope. The browser ran at 1440 and 390 px. Analytics and form posts were blocked, so no test data reached production.

Four passes ran:
- **Journey 1:** a cost and AI problem.
- **Journey 2:** IVA and Agent Assist research.
- **Journey 3:** a CCaaS replacement.
- **Tool audit:** break-testing the remaining 14 tools.

Findings marked **verified** were reproduced in a browser, and the ones marked (code) were also confirmed in the source.

---

## EXECUTIVE READOUT

1. **The math is right; the gaps are around it.** Across the passes, more than 20 headline figures were recomputed by hand and every one matched. This includes Staffing's Erlang C (237 agents, 81.0% service level), CPC's $10.06 cost per resolution, AI Deflection's $13,067 net, RFP coverage of 66.9%, 75.6% and 75.0%, and QA's Krippendorff alpha. The problems are in the handoffs between tools, the verdicts, and the scope.
2. **Critical: Business Case crashes for anyone who arrives from Cost per Contact or Staffing.** The screen reads "This page did not load"; the cause is `railEvidence` used but not imported (code). This is the last step of the homepage's "What our operation really costs" route, so the flagship journey dead-ends at the business case. Reloading does not help, because the rail lives in session storage.
3. **Vendor Match undermines the researched vendor work.**
   - An "Under 50 agents" buyer gets Genesys and NICE as the leading group. The Phase 1 data gives them `small:95, mid:60` (code).
   - Compliance picks (PCI, residency, SOC 2) change nothing, and all 24 vendors form the "starting list".
   - Vonage is a "Weak Fit" for a Salesforce shop, while the CCaaS page says Vonage is "especially rational when Salesforce is the operating system".
4. **The researched CCaaS profiles are the site's best asset.** Genesys's "Where does it break?" view gives a trigger, mitigation, cost, owner, "Ask the vendor" and "Walk away when" for each break, and it is RFP-ready. Uneven depth undercuts it: Talkdesk, marked complete, shows no breaks and an empty ask list, which reads as "no risk".
5. **Obvious enterprise competitors are absent.** Microsoft Dynamics 365 Contact Center, Google CES / CCAI Platform and Salesforce Contact Center are not in the CCaaS research or Vendor Match. An AI check of a 1,800-seat Salesforce shortlist would name all three first.
6. **AI Deflection says "Proceed" on a case that loses money.** The case nets $13,067 a month, is -$3.44M in Year 1, sits 0.9 points above break-even, and is -$263K a month in the conservative case. The verdict ignores one-time cost, payback, margin and the downside case, and it is the output an exec would most likely forward.
7. **The IVA and Agent Assist side is thin and partly broken.**
   - All 50 IVA profiles show empty Differentiator, Use Case and Segment tiles: `VendorProfile.jsx` reads `diff`, `useCase` and `segment`, but the data holds `differentiator`, `bestUseCase` and `verticals` (code).
   - The category pages are name lists.
   - The /vendors hub still says "Proprietary rubrics" and "Every vendor gets an honest assessment", and Agent Assist offers a "scored shortlist".
8. **Company size is almost invisible.** Of 25 tools, only Vendor Match and RFP Builder ask size, and both bucket it wrongly: RFP marks 200 to 500 agents as "Enterprise", whose own label says 500+. Every other tool, assessment and profile gives a 30-seat team and a global enterprise the same guidance. There is one US wage and no multi-region labor mix.
9. **Work is lost on refresh and back.** A scenario link is removed from the address bar after it loads, so a refresh silently returns to defaults (Staffing went from 237 base agents to 88). Back from a method page also resets typed inputs. For a tool meant to be taken into meetings, that erodes trust quickly.
10. **The same numbers disagree across tools and pages.**
    - Repeat burden: CPC $18.6M a year against FCR Leakage $13.9M for the same operation.
    - Cost to reach an occupancy target: Staffing +31 FTE and $2.7M against Occupancy +28 agents and $1.63M.
    - Vendor totals: 282 against the 278 the category counts add up to.
    - Categories: 8 or 9. IVA market categories: "7" claimed, 4 shown.
    - Ties: AI Readiness and CX Maturity name different "weakest" dimensions on the same page.

---

## JOURNEY 1: Executive with a business problem

**Objective.** Costs up about 12% year on year, CSAT slipping, customers repeating themselves across channels, and leadership pushing AI as the fix. Can the site take me from "I have a problem" to "I know what to investigate next"?

**Path taken**
1. `/`, Diagnostics door, then the route card "What our operation really costs".
2. `/tools/cost-per-contact`, then "Run this next" to `/tools/fcr-leakage`.
3. Then `/tools/ai-deflection`, then `/tools/business-case`, which crashed; I completed it in a fresh tab.
4. From AI Deflection to `/vendors/iva`; I also opened `/vendors/ccaas`.
5. I reopened scenario links in fresh contexts, refreshed mid-tool, and ran the route cards at 390.

**Key decisions**
- **Volume and quality:** 1,166,667 contacts a month, FCR 68%, M 2.5.
- **Cost basis:** loaded $6.80, marginal $4.10.
- **Wage:** $15 blended across US, UK and India. The tools accept only one wage.
- **Handle time and staffing:** AHT 450 s, attrition 35%.
- **Capacity action:** avoid hiring, at 75%.
- **AI proposal:** from a vendor, 40% eligible, 60% apparent resolution, $2.5M implementation, $350K a month platform.
- **Business Case:** $6M investment, 12 months of dual run, $2.5M of Avaya spend eliminated.

**What worked**
- The door, question and route card fit the problem and state their possible endings.
- **Cost per Contact** keeps four figures apart: cost per contact, repeat burden, capacity released and savings realizable ("capacity is not cash"). All four match hand math.
- **FCR Leakage** names the top leakage source and its owner ("Channel Mismatch, Owner: CX tech and routing"). It gives a 30-day test with a stop condition and lists anti-gaming metrics.
- **AI Deflection's bridge** runs from a $4.76M "vendor claim" to $13,067 net and reconciles to the dollar. "Against your total demand it is 19.2%" is the most useful sentence in the journey.
- **Business Case is candid:** "a shortfall of 1% in benefit removes the return entirely".
- No email wall anywhere.

**Where friction occurred**
- Volume has to be retyped in each tool; the rail does not carry it.
- The home route card says CPC, then FCR, then Business Case; the tool's rail says CPC, then FCR, then AI Deflection.
- Changing one FCR Leakage input means clicking through the 6-area diagnostic again.
- CPC's channel mix (60/25/15) and handle times drive the figures but cannot be edited.

**Where trust increased**
- The released-versus-realizable distinction.
- The vendor denominator bridge.
- Versioned method pages whose figures reconcile.

**Where trust decreased**
- The Business Case crash, with a message that blames "a dropped connection or a site update".
- AI Deflection's green "Proceed", which contradicts its own Directional grade and its own figures.
- CPC and FCR Leakage give two different repeat burdens, and neither page reconciles them.
- AI Deflection's next step promises to "carry the net automation number into a case", but Business Case does not read it and has no AI running-cost line. With the same 19.2% containment, Business Case credits $5.55M a year of benefit; AI Deflection nets $157K a year after $5.1M of running cost.

**Problems or bugs found**

| # | Severity | Finding |
|---|---|---|
| 1 | Critical, verified (code) | Business Case crashes after CPC or Staffing: `ReferenceError: railEvidence is not defined`. BusinessCaseBuilder.jsx lines 793 and 800 call it; the import on line 14 omits it. |
| 2 | High, verified | AI Deflection "Proceed" is gated only on net above 0, eligibility and evidence rank of at least 1 (a vendor proposal qualifies). Payback is capped at "None in 12 months"; the true payback is about 16 years. |
| 3 | High, verified | A refresh wipes all inputs, although the rail says "Your numbers stay in this browser tab". |
| 4 | Medium, verified | CPC publishes neither volume nor marginal cost, so FCR Leakage opens at 50,000 contacts and $6.50. |
| 5 | Medium, verified | Two repeat models (CPC uses M; FCR Leakage uses one callback) with no reconciliation. |
| 6 | Low, verified | FCR Leakage's Year 1 includes an undisclosed 4-month ramp: -$543,734 shown against -$349,982 without it. |
| 7 | Low, verified | A loaded cost of -3 clamps to a "$0.00 per contact" headline with no warning. |
| 8 | Low, verified | FCR Leakage copy "Benchmarks run 50% to 90%" has no source. |

**Recommendations**
1. Fix the import, and add a live check that runs CPC and then Business Case in one session.
2. Gate AI Deflection's "Proceed" on payback within the contract term, a margin above break-even, and a non-negative conservative case.
3. Carry volume, marginal cost, M and net automation on the rail, and add an AI running-cost line to Business Case.
4. Reconcile the two repeat models on both pages.
5. Link the CCaaS class "Moving off an existing system" from the cost and AI routes; it fits this executive exactly and the route never shows it.

---

## JOURNEY 2: Research and technology exploration (Conversational AI / IVA and Agent Assist)

**Objective.** Learn what IVA and Agent Assist do, where they fit, their prerequisites, risks, vendor differences, what to ask and when not to buy, before talking to vendors.

**Path taken**
1. `/vendors/iva` (a search landing), then `/vendors` and `/vendors/agent-assist`.
2. Eight Phase 1 profiles (kore-ai, cresta, cresta-aa, observe-ai, sierra, genesys-aa, intercom-fin, polyai).
3. `/vendors/genesys` (researched) for comparison.
4. `/research`, `/market-watch` (17 source links curl-checked), `/how-to-choose`, `/platforms-and-tech`, `/human-premium`.
5. The IVA buyer guide page and PDF, and the 7-layer framework page and PDF.
6. `/tools/ai-readiness` and its method page.
7. A 390 check on five pages.

**Key decisions.** AI Readiness answered realistically: every statement a 2 or 3, including a 2 for "A written policy says what AI may and may not do".

**What worked**
- **The 7-layer framework PDF is the best teaching asset in this journey.** It is dated 29 Sep 2026, says Layer 4 covers virtual agents and agent assist, names who usually owns them, and asks sharp questions. It tells you to check knowledge base ownership first. Every figure is dated and linked (Gartner 14% self-service resolution, ContactBabel 18%, Salesforce 30%).
- **The researched Genesys profile** covers best when, take care when and rule it out when, and warns that AI token spend "can make spend nonlinear relative to seat count".
- **Market Watch** has 12 dated, labelled items; 15 of 17 source links return 200, and the other two are bot blocks.
- **AI Readiness** runs cleanly, ties every checklist item to a statement, and honestly declines to give a percentile.
- Phase 1 labels are consistent, and no scores render.

**Where friction occurred**
- The IVA and Agent Assist category pages are a paragraph and a list of names. What the technology does, its prerequisites, its failure modes and the questions to ask exist only in the PDFs.
- Both guides ask for name and email, but the PDFs are served openly at their URLs. The gate adds friction and protects nothing.
- After AI Readiness, the route rail sends the AI learner to Platform Decision and Contract Risk, which are renewal tools.
- Unknown URLs return "Page not found" with HTTP 200.

**Where trust increased**
- The Genesys profile, the framework PDF, and Market Watch's VENDOR-SUPPLIED label ("We have not confirmed it elsewhere").

**Where trust decreased**
- **The /vendors hub** still claims "Proprietary rubrics built for operational reality", "Every vendor gets an honest assessment", "Competitive context: How this vendor compares" and "a shortlist of 3 to 5 vendors with honest assessments". Agent Assist offers "a scored shortlist". None of this exists, and it contradicts "no profile carries a score or a rank".
- **Platforms and Tech** promises each category covers "When you need it (and when you don't)", "Which vendors lead", "Where AI fails in production" and "RAG realities". The category pages deliver none of it.
- **The IVA guide PDF** still says "43 vendors scored", "Validated with Gartner, Forrester, and Opus Research data" and "the most comprehensive independent IVA market evaluation available". It puts paraphrases in quotation marks without links and carries 47 em dashes.
- **AI Readiness** returns "Foundation Set. Data access, workflows and governance work" and "Roll out agent assist broadly", while my answers said there is no written AI policy.

**Problems or bugs found**

| # | Severity | Finding |
|---|---|---|
| 1 | High, verified (code) | All 50 IVA profiles show three empty attribute tiles (field name mismatch); "Research status" also renders twice. |
| 2 | High (trust) | AI Readiness gives an optimistic band below the neutral midpoint (2.6 cut point), with no gate on governance gaps and no published rationale for the cut points. |
| 3 | Medium, verified | AI Readiness on a tie: the tile says "Biggest gap: AI Governance", while the next step and the PDF say "Integration Architecture". CX Maturity has the same defect: one dimension is called both "strongest" and "lowest-scoring". |
| 4 | Medium, verified | "7 market categories" on /vendors/iva; 4 are shown. |
| 5 | Medium, verified | Hub "key vendors" (PolyAI, Nuance, Uniphore, Coveo, Shelf, Guru, Bloomfire) are missing from the directories. Nuance has been Microsoft since 2022. /vendors/polyai is "coming soon". |
| 6 | Medium, verified | Genesys has four profiles (one researched, three Phase 1) that do not link to each other. Cresta has two, with different claims. |
| 7 | Medium, verified | The Intercom Fin profile ("$0.99/resolution", undated) ignores the Salesforce acquisition that Market Watch reports (closed 10 Sep 2026). |
| 8 | Low, verified | Counts: 282 vendors against 278 summed; 8 against 9 categories; About says "23 in all" published methods for 25 tools without saying which two lack one. |
| 9 | Low, verified | Raw database labels on the researched profile: "CORE_PLATFORM", "Release state: Ga". |
| 10 | Low, verified | The FCC TCPA item still reads "draft order" on the 30 Sep vote date. |

**Recommendations**
1. Fix the IVA field mapping (a small change that repairs 50 pages).
2. Rewrite the hub's "How we evaluate" section and the "scored shortlist" calls to action to match what the profiles contain.
3. Put a sourced "Before you buy" section on the IVA and Agent Assist pages, drawn from the framework PDF and the guide's demo questions.
4. Make Platforms and Tech promise only what exists.
5. Stamp the IVA PDF cover "Phase 1 edition, scores withdrawn", and drop the email gate on both guides.
6. In AI Readiness: break ties consistently, cap the band when any governance statement is at 2 or below, and route to AI Deflection or Governance.
7. Link each vendor's Phase 1 profiles to its researched profile.
8. Return a real 404 for unknown URLs.

---

## JOURNEY 3: Active buying (CCaaS replacement)

**Objective.** Replace on-prem Avaya with CCaaS: 1,800 seats, US, UK and India, Salesforce, PCI and GDPR, 14 months to contract end. Define requirements, build a shortlist, compare vendors, and estimate cost, risk and contract exposure.

**Path taken**
1. `/vendors/ccaas`: class cards, the Enterprise, SMB, public sector and UCaaS filters, and a class hash link.
2. Six researched profiles in all six views (genesys, nice-cxone, five9, talkdesk, amazon-connect, cisco); 141 unique source URLs curl-checked.
3. `/vendors/salesforce-service`.
4. `/tools/vendor-match`: 6 runs across sizes and compliance settings.
5. The demo request and introduction forms, submitted with the send aborted.
6. `/tools/rfp-builder`: 52 requirements, 3 vendors, 156 responses, scenario link reopened.
7. `/tools/platform-decision`, `/tools/contract-risk`, `/tools/tco-calculator` (enterprise case plus 6 extreme links), `/tools/license-gap`.
8. A 390 check on a profile, RFP Builder, the category page, Vendor Match and TCO.

**Key decisions**
- **Vendor Match:** Financial Services, 1000 to 5000 agents, Avaya, five enterprise priorities, compliance PCI, residency and SOC 2.
- **RFP Builder:** Genesys, NICE CXone and Vonage.
- **License Gap:** 1,980 seats against 2,000 committed.

**What worked**
- **The researched profiles.** Genesys's breaks, with "Prove our P95/P99 and peak-event workload against current org limits" and "Walk away when", are exactly what an evaluation team needs.
- **RFP Builder.** Coverage recomputed exactly (66.9%, 75.6%, 75.0%). An unanswered requirement is "a clarification, never a zero". It refuses to order vendors with open must-haves, and a 738-character link restores everything.
- **License Gap** reconciles: $163 quoted to $222 effective, and $53,280 of commit exposure.
- **TCO** reconciles: $9.34 per contact, and the span-of-control check fires.
- **The demo form** reports a failed send correctly.
- Phase 1 status is labelled honestly throughout.
- No overflow at 390.

**Where friction occurred**
- There is no way to carry a shortlist from the category page into RFP Builder; names had to be retyped.
- Platform Decision needs 35 answers before any output.
- The introduction link lands on a consulting form with 7 required fields; the demo form needs only an email.
- Vendor Match lost clicks made in the first second after load.

**Where trust increased**
- "Walk away when" lines.
- Publisher counts per profile.
- "Not yet proven ... it is not a weakness".

**Where trust decreased**
- An "Under 50 agents" buyer gets a Genesys and NICE leading group.
- Vonage's rating contradicts the category page, and the Phase 1 Salesforce page names a third set of vendors.
- "Verified Integrations: Healthcare: Epic" is shown to a Financial Services buyer, from unsourced Phase 1 data.
- Evidence is almost entirely vendor-published (Five9 28 of 28, Talkdesk 40 of 40), and Cisco's share is understated ("17 of 23") because publisher aliases are split.
- Talkdesk shows "The research records no break for this vendor".

**Problems or bugs found**

| # | Severity | Finding |
|---|---|---|
| 1 | Critical, verified (code) | Vendor Match size logic: the Phase 1 fit data gives Genesys and NICE small 95, mid 60, so the order is not monotonic in size. 500 to 1000 and 1000 to 5000 give identical results. |
| 2 | High, verified | Compliance and billing inputs have no effect. There is no CRM, region or country input. All 24 vendors are "on the starting list", and the count renders twice ("24 24"). |
| 3 | High, verified | Missing competitors: Microsoft, Google and Salesforce Contact Center. "Microsoft Dynamics" is plain text with no page behind it. |
| 4 | High, verified (code) | The contact and introduction form swallows failed sends (`.catch(() => setSending(false))`): no error, no confirmation. An empty submit shows red borders with no text. |
| 5 | High, verified | Cross-page contradictions (Vonage, Amazon Connect's Phase 1 large 57 against small 76, "Five9: Strong mid-market" against the research's Enterprise tag). |
| 6 | Medium, verified | TCO "Blocks the result" still prints figures, ungrouped ("$1382512.04" at 0 contacts). 1e9 agents prints "$64626028.5M". |
| 7 | Medium, verified | Talkdesk: no breaks, an empty ask list, and a Sources view that points to it. |
| 8 | Medium, verified (code) | RFP Builder: `size.includes("500")` marks 200 to 500 agents as Enterprise. |
| 9 | Medium | Contract Risk lacks minimum commit and true-down, ramp schedule, consumption and AI usage pricing, DPA and international transfer, sub-processor change, and a PCI responsibility matrix. "Liability cap of 12 months' fees, no carve-outs" rates only Medium, so it is left out of the negotiation checklist. |
| 10 | Medium | Platform Decision has a flat 6-month evaluation rule with no seat count or migration duration. |
| 11 | Low | Stale options: StateRAMP (now GovRAMP), "99.999% availability" and "Seasonal scale (10x)" in Vendor Match and RFP. |
| 12 | Low | NICE source link https://www.nice.com/customer-support returns 404. |
| 13 | Low | An internal note renders publicly on Genesys: "must not be used as Vendor Match input". |
| 14 | Low | The Salesforce page invites "Score this vendor". |

**Recommendations**
1. Take Vendor Match out of the buying path until Stage 4, or fix the size data. Either way, remove "Strong Fit", "Verified Integrations" and the Phase 1 platform notes, and show each vendor's research class.
2. Add Microsoft, Google and Salesforce Contact Center to the research queue, or say on the CCaaS page why they are out of scope.
3. Render an empty breaks or asks view as "not yet researched".
4. Merge publisher aliases in the source counts, and seek independent evidence.
5. Add a "Send this list to RFP Builder" action on the category page.
6. Add the enterprise clauses to Contract Risk, and show Medium items in the checklist.
7. Fix the contact form's failure handling.

---

## CRITICAL BUGS

1. **Business Case crash after CPC or Staffing** (`railEvidence` not imported). It breaks the flagship route and survives a reload. Verified in the browser and the code.
2. **Vendor Match returns enterprise suites as the leading group for a buyer with under 50 agents,** and compliance inputs are inert. It produces an actively wrong shortlist.
3. **The contact and introduction form fails silently** when a send fails. Leads are lost with no signal to the user or to TB.
4. **All 50 IVA profiles show empty attribute tiles** (field mapping). The pages look broken to every search visitor.

## HIGH-IMPACT UX ISSUES

- Refresh and back lose all inputs, because the scenario link is stripped from the URL after it loads.
- AI Deflection's "Proceed" on a loss-making case.
- Staffing's "$29.5M a year" treats one peak half hour's headcount as a year's payroll. Schedule Adherence treats its peak hour the same way when pricing overtime.
- Tied scores name different dimensions on the same page (AI Readiness, CX Maturity).
- The /vendors hub and Platforms and Tech promise assessments, scored shortlists and "which vendors lead" that do not exist.
- Email gates on PDFs that are served openly.
- Two introduction flows with different friction: 7 required fields against 1.
- Units trap: Channel Shift takes AHT in minutes while every other tool uses seconds. Entering 450 returned "$159.17M a year" and 5,670 FTE freed, with no plausibility warning.
- Money formats are inconsistent: "$3721016.8M", "$1,630K/yr", "$41,916,326".
- The Diagnostics hub's groups and blurbs disagree with the tools ("MAPE, bias" where the tool leads with WAPE; "QA drag" in Attrition, which does not exist). "POPULAR" badges have no usage behind them.
- Unknown URLs return a soft 404 (HTTP 200).

## TOOL FINDINGS

| Tool | Purpose | Inputs tested | Expected | Actual | Issues | Recommendation |
|---|---|---|---|---|---|---|
| Cost per Contact | Loaded cost, repeat burden, realizable savings | 1.17M a month, FCR 68%, M 2.5, negative cost | Hand math | $10.06, $1.55M a month, $485K, $364K, exact | Mix and AHT not editable; publishes no volume or marginal cost; -3 becomes $0.00 silently | Expose mix, AHT and load; publish volume and marginal cost |
| FCR Leakage | Repeat cost, root cause, 30-day test | Cross-channel, target 78% | $13.9M | Correct | Differs from CPC; hidden ramp; the diagnostic must be rerun after each edit | Carry M; disclose the ramp; recompute live |
| AI Deflection | Vendor claim to net value | Vendor proposal, $2.5M implementation | Cautious verdict | "Proceed" at $13K a month, -$3.44M in Year 1 | Verdict gate too loose | Gate on payback, margin and the downside case |
| Business Case | Board case | $6M, 12-month dual run | Model | Crashes after CPC; correct in a fresh tab | Crash; no AI running cost; ignores AI Deflection's net | Fix the import; add AI running cost |
| TCO | 3-year cost | 1,800 agents; 0, negative, 1e9 | Blocked output | Prints ungrouped figures while blocked | One US wage; facilities and IT do not scale | Suppress figures when blocked; add a location mix |
| License Gap | Seat and commit exposure | 1,980 against 2,000 | Reconciles | Correct | "this axis.." | Keep |
| Vendor Match | Starting list | 6 sizes, with and without compliance | Size-monotonic, compliance-aware | Neither | See Journey 3 | Remove from the buying path or rebuild |
| RFP Builder | Requirements and scored responses | 52 requirements, 3 vendors | Hand math | Exact; the link works | Size bucket; no BYOC, migration, coexistence, India or transfer requirements | Add them; import a shortlist |
| Platform Decision | Renewal gate | 10 and 4 months to notice | Timing that reflects scale | Flat 6-month rule | Renew and evaluate messages mixed | Add seat and migration-month inputs |
| Contract Risk | Clause reading | 12 of 13 clauses | Enterprise coverage | Good per-clause asks | Missing enterprise clauses | Add 5 clauses |
| AI Readiness | Readiness band and checklist | All answers at 2 or 3 | Cautious | "Foundation Set, governance work" | Tie defect; optimistic; wrong next tool | Governance gate; tie rule |
| Staffing | Erlang C for one interval | 900 per 30 min, AHT 450, 80/20 | 237 agents | 237, 339 FTE, 81.0%, exact | Annual cost from one interval; 30 s freeze typing 1e9 | Cost from hours open; debounce the solve |
| Occupancy Risk | Occupancy and turnover | 237 agents, 1,800 an hour | 94.9% | Correct | $1.63M against Staffing's $2.7M; no shrinkage; different load | One load and one set of bands |
| Shrinkage | Paid time off the queue | 40%, 142%, $0 wage | 2,084 to schedule | Correct | Breakdown not clamped ("Planned 109%") | Clamp the breakdown; guard the wage |
| AHT Decomposition | Components and levers | 450 s split | Correct | Correct | Opens with levers ticked at unsourced shares ("19.9% lower") | Open with levers unticked |
| Forecast Accuracy | WAPE, MAPE, tracking signal | 31 rows, hostile | Correct | Correct | One day, typed by hand; accuracy can go negative; an empty table reads "matched" | CSV paste; floor at 0 |
| Schedule Adherence | Adherence to service level and overtime | 250 agents, 88% | Correct | Correct | Peak hour treated as all year | Intraday profile |
| Channel Shift | Voice to digital value | 1.17M a month | Reconciles | Correct | Minutes trap; no plausibility cap | Use seconds; warn on implausible values |
| Attrition and drivers | Cost of turnover and causes | 1,800 at 40%, 250% | $13.23M | Correct | Refresh loses driver answers | Keep |
| CX Maturity | Rubric and actions | Mixed, ties | Tie stated | Contradictory | One respondent | Tie rule; several respondents |
| Transformation Readiness | Go or no-go | Mixed | Band | "Proceed with care" | The hub files it under Vendor Selection | Align the hub |
| CX IT Alignment | Paired gaps | CX side only | Handoff | Works | "Aligned" headline beside 10 shared weaknesses | Lead with shared weaknesses |
| Governance | Decision ownership | Realistic, all to CX | Findings | Sensible | 6 roles; no region, business unit, legal or CISO | Add roles and a region view |
| QA Scorecard | Form checks and blind calibration | 2 evaluators by 3 calls, garbage codes | alpha 0.599 | 0.60, sealed, set-asides explained | PDF spacing ("PRIORITYReword") | Strong; keep |
| Roadmap | 90-day plan | Contradictory statuses | A plan PDF | 12-line PDF; impossible statuses accepted | "Written for Finance"; fixed milestones | Editable milestones and a full export |

## TRUST AND VALIDATION FINDINGS

What an executive would paste into an AI or an analyst inquiry, and what would come back:

- **Vendor Match for a 30-agent center (Genesys and NICE leading).** Rejected immediately; the site's own research says "Midmarket to large/global enterprise".
- **"Vonage: Weak Fit" for a Salesforce shop.** Contradicted by the site's own CCaaS page.
- **A CCaaS shortlist with no Microsoft, Google or Salesforce.** Flagged as a gap in the first line of any AI answer.
- **AI Deflection "Proceed" at -$3.44M in Year 1.** Fails standard pilot-first advice; the site's own figures supply the rebuttal.
- **Staffing "$29.5M a year".** Any workforce manager or AI will say peak-interval FTE times 12 months is not annual cost.
- **AI Readiness "governance work" with no written AI policy.** Any analyst says governance is a prerequisite.
- **IVA guide "Validated with Gartner, Forrester", "Containment 35 to 55%", "TCO 3 to 5x license".** Unsourced; an AI flags them, and the Gartner quotes cannot be traced to a link.
- **Nuance as a key vendor.** Dated (Microsoft, 2022).

These would survive:
- Erlang C results, the BLS $21.53 wage, SQM 80/20 and 697 s AHT, ContactBabel figures, and Gartner 14%.
- The Genesys break and ask lines.
- The QA alpha.
- The framework PDF's Layer 4 figures.

The pattern: where the site shows its working, it survives external checking. Where Phase 1 content or loose verdicts remain, it does not, and those are the outputs most likely to be forwarded.

## BUSINESS-SIZE PERSONALIZATION

**Today.** Size is asked in two tools, and both bucket it wrongly. The CCaaS research carries SMB, Midmarket and Enterprise tags. Everything else is size-blind.

Diverge only where size changes the decision:

| Where | SMB (under 50 seats) | Mid-market (50 to 500) | Enterprise (500 to 5,000) | Global enterprise (5,000+, multi-region) |
|---|---|---|---|---|
| CCaaS category and Vendor Match | Low or no minimum commit, fast deployment, UCaaS + CCaaS bundles; suites excluded unless asked | Unified stacks, packaged CRM connectors | Suites and programmable platforms; CRM-native options (Salesforce, Microsoft) | Add residency by region, follow-the-sun support, sovereign options, per-region carriers |
| RFP Builder | Short prescriptive template (30 requirements) | Standard | Add migration and coexistence, BYOC and SIP, SSO and SCIM, audit | Add data transfer and residency, languages, regional telephony, multi-BU tenancy |
| Contract Risk | Month-to-month and exit ease | Commit and true-down | Minimum commit, ramp, usage and AI pricing, liability carve-outs | DPA and transfer mechanisms, sub-processors, local-law schedules |
| TCO and Business Case | One wage, simple | One wage | Wage mix by site; facilities and IT scaling with seats | Currency, wage mix by country, dual-run by region |
| Platform Decision timing | Weeks | 3 to 6 months | Scaled by seats and integration count | Plus regional rollout waves |
| WFM tools | One queue is fine | One queue | Sites, hours open, intraday profile | Time zones, follow-the-sun |
| Assessments and Roadmap | Shorter, prescriptive | Standard | Several respondents, BU view | Region and BU rollups; governance roles by region |

**What to collect, once, in a persistent context.** Seats (4 bands), countries of operation, and CRM. Industry is already asked in some tools. Carry these as rail facts, and let the reader skip them.

**Where not to personalize.** Erlang C, cost per contact arithmetic, License Gap, Attrition cost, QA calibration and method pages. The math is size-neutral and already correct.

## MISSING JOURNEYS

1. **Platform replacement end to end:** current state, renewal gate, class-scoped shortlist, RFP, contract, TCO, business case, in one carried context. Every piece exists; the joins do not.
2. **AI program decision:** readiness, AI Deflection, governance, a vendor class for IVA or Agent Assist, then the business case including AI running cost. Today it routes to renewal tools.
3. **Board-level business case:** one pack combining CPC, FCR, AI and TCO outputs on a reconciled basis, with a downside case.
4. **Vendor consolidation:** which layers overlap across incumbents (License Gap plus the stack map).
5. **Post-purchase optimization:** a 90 to 180 day check against the business case's assumptions (the "measured outcome" claim class has no home yet).

## TOP 10 IMPROVEMENTS

| # | Issue | Change | Why it matters | Expected user impact | Effort |
|---|---|---|---|---|---|
| 1 | Business Case crash | Import `railEvidence`; add a live check that runs CPC and then Business Case | The flagship route dead-ends | The core journey completes | Low |
| 2 | Vendor Match gives wrong shortlists | Remove it from the buying path until Stage 4, or fix the size data, drop inert inputs and remove "Verified" and "Strong Fit" | It contradicts the site's best asset | Protects research credibility | Low to Medium |
| 3 | Silent contact form failures | Show an error, keep the entered text, offer mailto | Lost leads | Conversion | Low |
| 4 | IVA profile fields empty | Map `differentiator`, `bestUseCase` and `verticals`; remove the duplicate status block | 50 pages look broken | Search visitors' first impression | Low |
| 5 | AI Deflection "Proceed" too loose | Gate on payback within term, margin to break-even and the conservative case | The most-forwarded verdict | Defensible AI decisions | Low |
| 6 | Refresh and back lose work | Keep `?s=` in the URL (replaceState on change) | Tools used in meetings | Retention | Low to Medium |
| 7 | Size and region blindness | One persistent context (seats, countries, CRM) carried on the rail to CCaaS filters, RFP, Contract Risk, TCO and Platform Decision | The enterprise versus SMB gap | Relevance for both ends | Medium |
| 8 | Missing obvious CCaaS competitors | Research or explicitly scope Microsoft, Google and Salesforce Contact Center | Survives an AI cross-check | Credibility of the shortlist | High (research) |
| 9 | Stale promises on the hub, Platforms and Tech, and the IVA PDF | Rewrite to what exists; stamp the PDF; drop the fake gates | Doctrine says verified and traceable | Removes contradictions | Low |
| 10 | Inconsistent cross-tool figures | One repeat model, one WFM load, bands and shrinkage treatment; Staffing cost from hours open; tie rule in the rubric engine; one money format | Two answers to one question | Numbers an executive can defend | Medium |

## WHAT WOULD MAKE ME COME BACK?

As the enterprise CX executive:

- **The researched vendor profiles, for every vendor I would actually shortlist.** "Where does it break", "Walk away when" and "Prove our P95/P99 at peak" are things I cannot get from Gartner quickly, or from ChatGPT at all. Extend them to Microsoft, Google, Salesforce Contact Center and the IVA and Agent Assist leaders, with dates and with independent evidence alongside vendor documents.
- **Tools that remember my operation.** Enter seats, countries, CRM and volume once. Have every tool, shortlist and contract check use them. Let me reopen my scenario next quarter and see what moved.
- **One reconciled board pack:** cost, repeats, AI net, TCO and the business case on one basis, with the downside case. That is the meeting I actually have.
- **Fresh, dated signals.** Market Watch weekly, with changes to a vendor's profile flagged when something happens (an acquisition, an outage, a price change).
- **Benchmarks I can place myself against,** with sample sizes, sliced by size band and industry, and eventually from peers who contributed anonymously. That is the thing a generic AI model cannot replicate.
- **Honesty kept everywhere.** The site already earns trust by saying "not yet proven is not a weakness" and by grading its own confidence. Every remaining Phase 1 claim, loose verdict and silent failure spends that trust. Remove them and this becomes the place I check before I believe a vendor.
