## 5. Capacity is not cash, and confidence has three axes

A restatement of existing `mech.js` doctrine, elevated here because it is a claim class problem, not merely an economic one.

Freed agent time is released capacity. It becomes cash only when a named action converts it: overtime reduction, hiring avoidance, vendor or BPO volume reduction, or headcount reduction. "No action selected" is a valid answer and realizes zero.

**Rules.**

Any tool that frees labor must implement `mech.js` or state prominently that its output is capacity-denominated.

Freed labor is scaled by the realization factor. Cash out the door, meaning platform fees, vendor invoices and escalation premium, is never scaled.

### 5.1 The three axes are final

Decided in tracker item 1-09, 27 August 2026. Confirmed and specified 19 September 2026.

The three axes stand as written. Confidence does not split into cost evidence, benefit evidence and case readiness. Two reasons, both structural.

**A claim stream is not an axis.** Cost evidence and benefit evidence ask the same question, which is where a number came from and how bookable its origin is. They differ in what they describe, never in how they are graded. Promoting them to separate axes would give one question two grades and force an arbitrary rule about which one leads. They are streams inside the Evidence axis, graded on one set of bands, with the weaker stream named in the rationale.

**Case readiness is not confidence.** Whether an organization can deliver a target is a property of the organization. Confidence is a property of the artifact. Folding readiness into a confidence axis would let an operational judgment lower a grade that describes evidence and completeness, which is the same category error that verdict strength commits. Readiness is a separate assessment with its own output, produced by the Transformation Readiness tool, and it is referenced beside a grade, never inside one.

**The three axes.**

**1. Evidence.** Where the inputs came from and how bookable that origin is. Applies to every tool. Never N/A.

**2. Realization.** Whether a modelled benefit converts to cash, governed by credit class. Applies only to a result that carries a modelled benefit.

**3. Completeness.** Whether the model is whole and internally consistent. Applies to every tool. Never N/A.

### 5.2 Axis definitions and grade bands

Three grades exist in this order: Directional, Planning-grade, Finance-grade. Void is a state, not a grade, and it is defined in 5.4.

**Evidence.**

| Grade | Band |
|---|---|
| Finance-grade | Every driver on the applicable streams comes from a document external to the platform, and that document is confirmed in writing. Invoice, signed proposal, executed contract, finance-confirmed export. |
| Planning-grade | Drivers come from a named system of record or a vendor quote, and are not yet confirmed in writing. |
| Directional | Any driver is an estimate, a tool default, a published benchmark, or an internal planning heuristic. |

Evidence streams. A result may carry a cost stream, a benefit stream, or both. The axis grade is the weaker stream. The rationale names which stream bound it.

Rail arrival confers consistency, never evidence. A value pulled over the rail is graded on the origin evidence its publisher recorded, and is capped at Planning-grade in every case, because a second tool restating a figure is agreement rather than attestation. A value with no recorded origin grades Directional.

Attribution stance sits on the benefit stream. A stance that applies no attribution haircut caps the benefit stream at Planning-grade, because the reader is being shown a figure built on a weaker derivation. This holds on a case that pays back in four months and on one that never pays back.

Target ambition sits on the benefit stream. An improvement target above the stated internal planning range, with no pilot behind it, is a weakly evidenced input and caps the benefit stream at Planning-grade. A target is a property of the question. It is graded as an input and never as an answer.

**Realization.**

| Grade | Band |
|---|---|
| Finance-grade | The committed action removes cash out the door. Vendor or BPO volume reduction, headcount reduction, license reduction against a contract. `cred: "cash"`. |
| Planning-grade | The committed action is finance-creditable against a stated plan. Hiring avoidance, attrition freeze, overtime reduction. `cred: "finance"`. |
| Directional | Capacity-only, or no action selected. `cred: "capacity"` and `cred: "none"`. |

Realization is read from `mech.js` credit class and from nothing else. It may never exceed the credit class of the action actually committed.

Where a result carries no modelled benefit, the axis is declared N/A and the reason is stated in the artifact. Silence is not a declaration. The reason names what the tool models: cash out the door, priced and not converted from freed capacity.

**Completeness.**

| Grade | Band |
|---|---|
| Finance-grade | No unknown on a driver. No substituted, held or corrected input. No plausibility guard tripped. No single-driver dominance left unconfirmed. Every displayed quantity derives from one code path. |
| Planning-grade | The model runs whole and a disclosed gap remains: an unconfirmed non-driver input, an unconfirmed dominant line, a known double-count risk, or a value inside the plausible range and outside the published band. |
| Directional | An unknown sits on a driver, an input was substituted or held before the model ran, a plausibility guard tripped on a driver, or the scenario computed differs from the scenario the link carried. |

A substituted enum or a held numeric is a completeness failure and never an evidence failure. The reader is looking at a different case from the one they were handed, which is a question about which model ran, not about where its inputs came from.

### 5.3 Tool classes and axis applicability

| Class | Definition | Axes | Members among the nine rail tools |
|---|---|---|---|
| A. Cost-only | Prices cash out the door. Frees no labor and monetizes no capacity. | Evidence, Completeness. Realization N/A with a stated reason. | License Bundle Gap Checker, Staffing Calculator |
| B. Benefit | Models a benefit as its headline result, whether or not it also prices an investment. | All three. | Business Case Builder, AI Deflection Reality Check, FCR Leakage Diagnostic, Channel Shift Model |
| C. Dual result | Prices a cost as the headline and publishes a monetized benefit as a secondary module. | Two graded results. The cost result follows Class A. The benefit result follows Class B. | TCO Calculator, Cost per Contact Calculator, Attrition Cost Calculator |
| D. Framework assessment | Produces a readiness, maturity or fit score with no economic claim. | None. Carries a methodology version and a scope statement. | None of the nine. Applies to the assessment tools in WS2. |

Class C exists because a single headline covering two claim streams is the failure that produced this item. A cost figure sourced from invoices does not become uncertain because a side module's capacity has no committed action. The two results are graded separately, displayed adjacently, and never merged into one number. The headline carried by `ReportActions` is the cost result. The benefit result carries its own grade, its own binding axis, and its own rationale.

A Class D tool states that it produces no economic claim and therefore no confidence grade. Declaring no grade is a declaration. Displaying a grade a tool cannot support is a defect of the same class as an unsourced benchmark.

### 5.4 The headline grade

**The headline is the minimum of the applicable axes.** One word. It is the citable artifact.

**The rationale always names the binding axis.** Where two axes tie at the binding value, both are named.

**All applicable axes are always exported and always displayed.** The headline is for citation, the breakdown is for defense. Each axis has a different remedy: get a better source, commit a harder lever, or finish the model.

**A failed invariant voids the result.** Where the model contradicts itself, the output is voided and no grade is rendered. A self-contradicting document has no confidence grade at all. Void supersedes every axis, is displayed in its own treatment, and carries the remedy that would lift it. Void is never written into an axis.

**An N/A axis is declared with its reason.** A null axis and an absent reason is a defect, and the artifact says so in those words rather than rendering a silent blank.

### 5.5 What may never move an axis, and how that is enforced

**The strength of a verdict is never a confidence axis.** A well-evidenced, complete, cash-creditable case that does not pay is a Finance-grade negative result. Capping its confidence would report certainty as doubt.

**The forbidden inputs, named.** No confidence axis may take as input: payback, the absence of payback, breakeven month, ROI, net value, savings magnitude, margin of return, fragility of return, recommendation strength, severity band, verdict label, or any comparison of a result against a threshold that describes the answer rather than the inputs.

**Enforcement is by construction, not by review.** The headline is computed by one shared function in `src/lib/confidence.js`, and that function accepts an axes object only:

```
gradeConfidence({ evidence, realization, completeness })
  -> { headline, boundBy, applicable }
```

It never receives the result object. A verdict it cannot see is a verdict it cannot use. Every tool calls it. No tool computes a headline locally, and no tool passes a result object into the confidence layer. This is the structural reason the 1-12 defect class cannot recur: `r.payback === 0` capping a grade at Directional required the grading code to hold `r`, and after this pass no grading code holds `r`.

**Enforcement is proved by assertion.** Every tool harness carries a sign-invariance assertion: hold the inputs fixed, force the result to a negative and a zero outcome through the engine, and assert that all three axes and the headline are unchanged. A tool without that assertion is not locked. The assertion is the standing regression guard for this doctrine, and it belongs in the tool's `.test.mjs` beside the reconciliation gate.

**Where a verdict observation reaches the reader.** In a findings channel, in full, stated as an observation about the return, with an explicit sentence that it moves no axis. A finding that has no rendered channel is a finding nobody reads, so a tool that produces findings must render them.

### 5.6 The emission contract

Every graded tool emits one object per graded result:

```
grades = {
  evidence:     "Directional" | "Planning-grade" | "Finance-grade",
  realization:  "Directional" | "Planning-grade" | "Finance-grade" | null,
  completeness: "Directional" | "Planning-grade" | "Finance-grade",
  naReason:     string,          // required when any axis is null
  boundBy:      string,          // from gradeConfidence, never hand-written
  reasons:      { evidence, realization, completeness }  // one sentence each
}
```

`ReportActions` renders it in one place so a retrofit cannot drift:

1. The axis strip shows all three axes in fixed order, Evidence then Realization then Completeness, with N/A rendered for a null axis and the headline shown beside them.
2. The exported PDF carries one Confidence section, built inside `ReportActions` and never assembled in the tool, containing the headline, the binding axis, one reason per axis, and the standing sentence explaining what each axis rates.
3. The review submission appends one field per axis plus the binding axis, so a submitted case can be triaged on its weakest axis without opening the PDF.
4. A Void result renders in the void treatment, states the failed invariant and the remedy, and claims no grade in the strip, the PDF or the submission.
5. A Class C tool passes the cost result as the headline and the benefit result as a secondary graded block. The two blocks are never averaged, and neither is described in the other's language.
6. A null axis with an empty `naReason` renders the defect sentence rather than a blank, because a silent N/A is indistinguishable from an oversight.

### 5.7 Retrofit scope

Eight of the nine rail tools carry a confidence model that predates this section and disagrees with it, in three different vocabularies. Attrition Cost Calculator already emits the specified object and is the reference implementation.

| Tool | Current shape | Change |
|---|---|---|
| Attrition Cost Calculator | Three named axes, min rank, `boundBy`, void state | Reference. No axis change. |
| License Bundle Gap Checker | Evidence and completeness ceiling, `boundBy`, void state | Declare realization N/A with a reason. Emit the object. |
| Cost per Contact Calculator | Evidence against a credit-class ceiling | Add completeness. Split the FCR dividend into a Class C benefit result. Emit. |
| Channel Shift Model | Evidence against a credit-class ceiling | Add completeness. Rename the ceiling to the realization axis. Emit. |
| AI Deflection Reality Check | `costConf`, `realConf`, `headlineConf` | Rename to the three axes. Add completeness. Emit. |
| FCR Leakage Diagnostic | `costConf`, `realConf`, `headlineConf` | Rename to the three axes. Add completeness. Emit. |
| Staffing Calculator | One scalar from a sourced flag, downgraded by guards | Split into evidence and completeness. Declare realization N/A. Emit. |
| Business Case Builder | Cost basis and realization, with completeness smuggled into a caps array | Promote corrections and held numerics to the completeness axis. Keep stance and target caps on the benefit evidence stream. Emit. |
| TCO Calculator | One scalar mixing cost basis, stance and flags | Split into three. Move stance to the benefit evidence stream. Split optimization into a Class C benefit result. Emit. |

**Files the pass touches.** One new shared module, `src/lib/confidence.js`. Nine tool files. `ReportActions.jsx`, for the Class C secondary block and the empty-reason defect sentence. Nine harnesses, each gaining the sign-invariance assertion. `run-all.mjs` is unchanged because every harness is already registered.

**Sequencing.** This pass and the 1-07 benchmark constant audit both open all nine tool files and change no engine arithmetic. They run as one walk, one open per file, in ascending order of distance from the specified shape. A file is finished when its axes are emitted, its benchmarks are sourced or labelled, its sign-invariance assertion passes, and its reconciliation gate is green.
