# ContactCenterCX Doctrine

## The Epistemic Standard

**Version 1.3. 23 September 2026.** (1.1 consolidated 27 August 2026.)
Status: doctrine. Applies to every tool, every artifact, every public claim.
Supersedes any prior use of "factual," "accurate," or "correct" as a platform promise.

This version folds in Amendment 11 as Section 11 and applies the Section 5 amendment
decided in tracker item 1-09. Those two documents are now history, not doctrine. This
file is the only doctrine file. Nothing amends it from outside.

---

## 1. The promise

**Verified and traceable.**

Every calculation verified. Every historical fact sourced. Every assumption labelled. Every derivation reproducible. Every forecast explicitly conditional.

The math is always right. Whether the answer is right depends on the inputs, and every input shows where it came from.

These are two promises and the platform makes both. Verified is a claim about the computation: the software executes its stated method, and that is proved by test and reconciliation (Section 3, Level 1). Traceable is a claim about every number shown: the reader can see which class it belongs to and where it came from (Section 2).

What the platform does not promise is that an output is a fact. A forecast cannot be a fact until it happens, and a correct calculation on a preset or assumed input describes the modelled case, not the reader's operation. Promising factual outputs would be unachievable for the class of output this platform produces, and an unachievable promise degrades into marketing.

Verified and traceable is achievable on every line of every tool today, is testable, and is a higher bar than the category currently clears.

---

## 2. The four claim classes

Every number a tool displays belongs to exactly one class. A tool that cannot say which class a number belongs to is not ready to display it.

| Class | Definition | Standard it must meet | How it may be described |
|---|---|---|---|
| **Historical fact** | Something that already happened in the user's operation or in a cited source | Sourced. Named origin. Editable by the user. | Stated |
| **Assumption** | A target, rate, weight, benchmark or heuristic the user or the tool supplies | Labelled as an assumption. Origin named. User-adjustable wherever it drives an output. | Assumed |
| **Conditional forecast** | Any modelled output derived from assumptions | Explicitly conditional. Conditions restated with the output. Never presented as a result. | Modelled, under these assumptions |
| **Measured outcome** | A realized result observed after deployment | Measured against a definition fixed before the fact | Realized |

**Rules.**

A conditional forecast may never be rendered in language reserved for a historical fact. "This saves $1.8M" is forbidden. "Under these assumptions this models $1.8M" is required.

An assumption may never be laundered into a fact by arriving over the data rail, by appearing in a PDF, or by being computed to two decimal places. Precision is not evidence.

A platform benchmark is an assumption with an origin. It must name its origin and its scope, or it must be labelled an internal planning heuristic. It may never be presented as market truth.

Arithmetic correctness never promotes a claim to a higher class. A conditional forecast computed perfectly is still a conditional forecast.

---

## 3. The three validation levels

These are separate. Achieving one does not imply another. Every tool must be able to state which level it has reached, and no tool may make a claim that its level does not license.

### Level 1: Computationally verified

The software consistently executes the stated methodology. Equations reconcile. Boundaries hold. Units normalize. Impossible outputs are blocked. Rendered output equals engine output.

**Instrument:** Node engine harness against the live file, randomized sweeps, rendered-output reconciliation on multiple input sets.

**Licenses the claim:** "This tool computes what it says it computes."

**Does NOT license:** any claim about whether the methodology reflects reality.

### Level 2: Methodologically reviewed

The definitions, denominators, cost bases, attribution logic and realization assumptions have been reviewed by finance and contact center subject matter judgment, and each modelling choice has a stated rationale that survives challenge.

**Instrument:** documented methodology, adversarial peer review, explicit statement of known limitations and of which direction each known error runs.

**Licenses the claim:** "The method is defensible and its limitations are disclosed."

**Does NOT license:** any claim that outputs match outcomes.

### Level 3: Empirically calibrated

Forecast values have been compared against realized outcomes across a sample of transformations, and the platform's assumptions have been adjusted to fit that evidence.

**Instrument:** forecast-versus-actual capture on containment, AHT, FCR, attrition, implementation cost, ramp duration and financial realization.

**Licenses the claim:** predictive validity, within a stated confidence range and sample scope.

**Nothing short of Level 3 licenses a predictive claim. There is no substitute and no shortcut.**

---

## 4. Prediction is the goal. Calibration is the gate.

**The four sentences.**

1. The goal is to predict reality.
2. Until prediction is empirically demonstrated, every forecast remains conditional.
3. Verified and traceable means every calculation is verified, every historical fact is sourced, every assumption labelled, every derivation reproducible, and every forecast explicitly conditional.
4. Predictive claims unlock only when forecast-versus-actual evidence demonstrates calibration.

The platform's ambition is to predict reality. That ambition is stated as a direction of travel, never as a current capability.

**The gate:** no tool, page, document or conversation may claim predictive accuracy until that specific claim is supported by Level 3 evidence, with the sample size and scope stated alongside it.

**Standing rule.** Until a tool reaches Level 3, its outputs are described as conditional forecasts and its validation is described as computational and methodological. Test counts, assertion counts and reconciliation results are Level 1 evidence and must never be presented in a way that implies predictive validity. "230 assertions" proves the software executes the methodology. It proves nothing about whether the methodology is right.

**Why the gate is the doctrine and the ambition is not.** Writing "predict reality" into doctrine without this gate creates continuous pressure to imply predictive validity before it is earned, which is the exact failure this addendum exists to prevent. The ambition is recorded so the roadmap points somewhere. The gate is recorded so the copy stays honest while we get there.

---

## 5. Capacity is not cash, and confidence has three axes

A restatement of existing `mech.js` doctrine, elevated here because it is a claim class problem, not merely an economic one.

Freed agent time is released capacity. It becomes cash only when a named action converts it: overtime reduction, hiring avoidance, vendor or BPO volume reduction, or headcount reduction. "No action selected" is a valid answer and realizes zero.

**Rules.**

Any tool that frees labor must implement `mech.js` or state prominently that its output is capacity-denominated.

Freed labor is scaled by the realization factor. Cash out the door, meaning platform fees, vendor invoices and escalation premium, is never scaled.

### 5.1 The three confidence axes

Decided in tracker item 1-09, 27 August 2026.

**1. Evidence.** How good are the inputs, and where did they come from. Sourced externally, documented, validated, confirmed in writing. **Applies to every tool. Never N/A.**

**2. Realization.** Whether a modelled benefit converts to cash, governed by credit class: capacity-only earns Directional, finance-creditable earns Planning-grade, cash out the door earns Finance-grade. **Applies only to a tool that models a benefit.**

**3. Completeness.** Whether the model is whole and internally consistent: no unknown input on a driver, no unresolved integrity flag, no corrected input, no impossible magnitude, no failed invariant. **Applies to every tool. Never N/A.**

**The headline grade is the minimum of the applicable axes.** One word. It is the citable artifact.

**The rationale always names the binding axis.** Where two tie at the binding value, both are named.

**All applicable axes are always exported and always displayed.** The headline is for citation, the breakdown is for defense. Each axis has a different remedy: get a better source, commit a harder lever, or finish the model.

**A tool declares its N/A axis and states why.** Silence is not a declaration. A tool that models no benefit has no realization axis. Pricing cash out the door is not the same as converting freed capacity into cash, and a cost model must not borrow a capacity taxonomy to resemble its siblings.

**A failed completeness check is a floor, not a cap.** Where the model is internally inconsistent, the output is voided rather than graded down. A self-contradicting document has no confidence grade at all.

**The strength of a verdict is never a confidence axis.** A well-evidenced, complete, cash-creditable case that does not pay is a Finance-grade negative result. Capping its confidence would report certainty as doubt.

---

## 6. Commercial relevance never alters the diagnosis

The business model is: independent diagnosis, genuine problem identified, user may choose specialist help. It is not: free tool, manufactured problem, sell consultant. The difference between those two is invisible from the outside and total from the inside, so it has to be enforced structurally rather than by intent.

**The rule.** A tool may surface that specialist help is warranted. It may generate a commercial opportunity. The possibility of that opportunity may never change a score, threshold, warning, benchmark, recommendation or conclusion.

**Structural test one: separability.** No commercial variable is an input to any engine. The diagnosis must be computable without knowing whether a commercial relationship exists, and the test is direct. If the entire commercial layer were deleted, would any number change? If yes, the firewall is already breached.

**Structural test two: threshold provenance.** The corruption to guard against is not changing a score. It is calibrating a threshold so more cases land in the band where help is needed. Nobody outside the platform could detect that from an output. So every judgment threshold, meaning confidence gates, status bands, plausibility ranges and planning benchmarks, carries a stated rationale, is versioned, and may never have a change justified by conversion, engagement or lead volume. A threshold moves because the evidence moved.

**Corollary on routing.** Where a diagnosis implies a next action, the generic action is stated first and any platform tool is named second and as optional. Ecosystem routing presented as objective methodology is a disclosure failure even when every tool named is the right one.

**Corollary on independence.** What is true about funding, governance, vendor relationships, scoring, data handling and whether human review creates commercial follow-up is stated publicly and plainly. Stating it once in specifics does more for neutrality than asserting vendor-neutrality repeatedly.

---

## 7. Corrections and versioning

A methodology that changes is honest. A methodology that changes silently is not.

**Every artifact carries a methodology version.** A downloaded document states which version of the model produced it, so a conclusion can be traced to the logic that generated it.

**Material methodology changes are logged publicly**, with what changed, why, and the direction of the effect on prior outputs.

**A change that would materially alter a previously delivered conclusion is stated as such.** During validation this platform has already found a single defect worth roughly twenty thousand dollars on a delivered case, and a capacity treatment that inverts a case from positive to negative. Artifacts of that kind end up in front of boards. The obligation is to be able to say which ones are affected and how, not to notify every past user, which is impossible without accounts.

**Known errors are disclosed with their direction.** Where the platform knows a model overstates or understates, and by roughly how much, it says so rather than waiting until the fix ships.

---

## 8. What this forbids, concretely

Presenting a modelled output in the grammar of an observed result.

Citing a statistic without a source, including in internal positioning documents, sales copy and this project's own materials. If a number is an estimate, it says so. If it has no source, it is deleted.

Superlatives about the category that have not been checked against the category. "The only," "the first," "universal," "always," "no vendor will."

Using consistency as evidence of correctness. Two tools agreeing establishes that they share a definition, nothing more. This applies to the data rail and it applies equally to shared cost bases across tools.

Using test counts, reconciliation results or engineering rigor as evidence about the world.

Presenting a benchmark as market truth when it is an internal planning heuristic.

Attacking a competitor class in product copy on the strength of an assumption about their behavior.

---

## 9. The calibration instrument, and what it actually costs

Level 3 is the long-term moat and the eventual justification for infrastructure spend. It is also the one level that cannot be reached by working harder on the model.

It can, however, be **instrumented now with no new infrastructure**, and the instrument is a product feature that stands on its own merits.

**It is not free.** No new software, database, accounts or recurring technology expense are required. Manual follow-up, normalization, analysis and subject matter review are real costs, and they fall on the scarcest resource the platform has. Per standing automation doctrine, that time burden is stated rather than hidden, and it is the burden that eventually justifies investment.

Every business case artifact should carry, per lever: the baseline, the target, the owner, the evidence source, the measurement definition, the measurement window, and the named realization action. That table is a benefits realization plan, which is independently valuable to the buyer and which most competing tools do not produce.

It is also, without any additional infrastructure, a forecast recorded in a form that a future actual can be compared against.

**The sequence.**

1. Ship the realization plan as a product feature because it is good product.
2. Users who return with actuals are handled manually. No database, no accounts.
3. When enough voluntary, anonymized forecast-versus-actual pairs exist to say something defensible, that is the evidence that justifies building the data platform.
4. Only then does the predictive claim unlock.

This follows the standing investment doctrine exactly: prove behavior first, manually learn second, invest third, automate last. The difference is that the behavior being proven here is the highest-value behavior on the platform.

**Calibration is published whether or not it flatters the model.** A gate that only opens on favourable evidence is not a gate. Committing in advance to report what forecast-versus-actual shows, including where the platform's assumptions were wrong and by how much, is what makes Level 3 a real standard rather than a marketing milestone. Selective calibration is worse than none, because it manufactures the appearance of falsifiability.

---

## 10. V3 lock criteria

Two standards, one per asset class. Every public tool meets one of them (TB, 23 Sep 2026).

- **V3-Full** governs calculators: any tool whose output is a number derived from inputs. The criteria below are V3-Full.
- **V3-Framework** governs assessments, frameworks and procurement tools: any tool whose output is a scored judgment, a checklist or a document. Its criteria are in Section 10.1.

A tool that does both meets both.

**Engineering.**

- `@engine-start` and `@engine-end` markers, with the harness slicing the live file at runtime.
- Node engine harness. Boundary probe before assertions are written.
- Rendered-output reconciliation as a separate gate from engine testing.
- Unit normalization, boundary tests, category tests, single-driver dominance check.
- Impossible-output blocking.
- Guard and disclose: every clamped or substituted input recorded and printed.
- Rail publish contract validated, `railReport().orphanPulls` empty.
- `getExternalPrimitive(key, toolId)` on any confidence gate. Self-credentialing is a defect class.
- `ReportActions` wired. `scenarioUrl` wired.
- Archivo via `src/lib/type.js`. No hand-written font stacks.
- No em-dashes. Verify with Python `s.count(chr(0x2014))`, never grep.

**Epistemic.**

- Every displayed number is assignable to one of the four claim classes.
- No output is rendered in language above its class.
- A tool that frees labor implements `mech.js` or states that its output is capacity-denominated.
- The tool states its validation level and makes no claim beyond it.
- Every benchmark names its origin or is labelled an internal planning heuristic.
- Known errors are disclosed with their direction.
- No commercial variable is an input to any engine, and deleting the commercial layer would change no number.
- Every judgment threshold carries a stated rationale and a version.
- The artifact carries a methodology version stamp.
- The tool states all three confidence axes, or declares an axis not applicable with a reason.
- The headline grade is the minimum of the applicable axes and the rationale names the binding axis.
- No verdict, return, payback or recommendation strength caps a confidence axis.

**Reachability and observability.**

- The asset is findable, loadable and shareable, per Section 11.2.
- The asset's completion event is instrumented, per Section 11.3.
- Where the item was L or XL effort, the tracker records why it preceded demand evidence.

**Positioning, replacement language.**

Retire: most conservative, only independent, survives the CFO, industry-leading.

Adopt: a transparent contact center investment model that separates technical potential, operational capacity, cash realization and evidence strength, shows the assumptions an investment requires in order to work, identifies where the economics fail, and defines how each claimed benefit will be verified after implementation.

And beneath it: no output is presented as a fact because the arithmetic is correct. Historical inputs are facts or sourced evidence. Targets are assumptions. Modelled outputs are conditional forecasts. Realized benefits are measured after deployment.

**V3-Full additions (23 Sep 2026).** A regression fixture recorded in the tracker. A live PDF, normal and voided, reconciled to the dollar against the UI and the engine. Void is a state: a voided result renders and publishes no figure. Every benchmark constant is in the registry. A journey node with `nextFor` routing. The `tool_complete` event wired: no lock without it. An assertion that typography edits leave every headline unchanged.

### 10.1 V3-Framework lock criteria

**Engineering.**

- The scoring logic sits between `@engine-start` and `@engine-end` and is sliced live by the harness, as for a calculator.
- The harness proves scoring determinism (same answers, same output), criterion-to-output traceability (every output line names the criteria that produced it), no dead branches (every band and every recommendation is reachable) and checklist completeness (every failing criterion yields a checklist action).
- `ReportActions`, `scenarioUrl`, a journey node with `nextFor`, and the `tool_complete` event.
- Archivo via `src/lib/type.js`. No em-dashes or en-dashes.

**Epistemic.**

- A published rubric page. Every criterion, its weight and its bands are public, and every criterion traces to the output it can change.
- The output is an action checklist plus a named next diagnostic.
- The output is ungated. Only a request for a human conversation is gated.
- The tool discloses what it cannot tell you: a self-assessment measures the respondent's view, not the operation.
- A score is a position on the published rubric, never a benchmark percentile, unless a sourced distribution exists.
- No commercial variable is an input, and no vendor is recommended from an assessment score.

---

## 11. Effort, reachability, instrumentation

Originally Amendment 11, 27 August 2026.

### 11.0 Why this exists

The standing investment doctrine is: prove behavior first, manually learn second, invest third, automate last. It has held up. It also has three gaps that only became visible once the platform had thirty tools and no evidence about which of them anyone uses.

1. Every existing constraint rations **money**. Nothing rations **effort**. Money is no longer the binding limit; a single operator's hours are. An unrationed resource gets allocated by list order rather than by evidence.

2. The V3 lock criteria govern whether a tool is **correct**. Nothing governs whether it is **reachable**. A tool can pass every gate in this document and still be unloadable on mobile, invisible to a crawler, and blank when shared into Slack. Those are quality defects and they were classified as marketing work.

3. The doctrine requires evidence of behavior but never requires the ability to **observe** behavior. Instrumentation therefore loses to tool work indefinitely, which means the evidence the doctrine depends on never accumulates, which means priority stays list-driven. That is a closed loop, and the platform has been inside it.

### 11.1 Effort is rationed as strictly as money

**The rule.** Any item at L or XL effort requires either demand evidence or a stated reason it must precede evidence. The reason is recorded in the tracker next to the item.

"It is next in the tracker" is not a reason.
"It closes a workstream that unblocks nine gated items" is a reason.
"It is the tool with the most sessions this month" is a reason.
"It is the tool a real user got a wrong number from" is the strongest reason.

**Status (TB ruling, 23 Sep 2026).** Section 11.1 is a guideline, not a hard rule. The governing goal is that a user's first use of any tool builds enough trust to return. Every public tool reaches V3 before demand evidence exists, and work is ordered by shared shape and dependency. The corollary on unaudited assets below is superseded: all non-rail tools receive a V3 pass. Sections 11.2 and 11.3 stand unchanged.

**Corollary on unaudited assets.** Where many assets await the same treatment and only some will receive it, the selection is made on demand evidence, not on file order. Twenty-one tools have never been audited. They will not all receive an XL pass. Which five do is an evidence question, and answering it from a list is guessing with extra steps.

**Corollary on sequence.** A DECIDE item that governs the shape of a later build is scheduled before that build, never after. Deciding after means the build makes the decision by shipping, and the decision then costs a retrofit across every asset that shipped in the interim.

**What this does not license.** It does not license shipping something known to be wrong because usage is unproven. Correctness is not subject to demand evidence. This governs which correct thing gets built next, not whether things are built correctly.

### 11.2 Reachability precedes rigor

Sections 1 through 10 assume the tool loaded. Every V3 criterion is an assertion about a document a reader already has in front of them.

The defects that cost trust at first contact are a different class, and none of them are arithmetic:

- A shared link that unfurls as an empty shell, because metadata resolves client-side only.
- A page that does not paint in a usable time on a mobile connection.
- A page whose title, description or count contradicts the live data.
- A route that is unreachable because of a duplicate identifier.

**The rule.** A tool or page is not shippable until it is findable, loadable and shareable. Reachability is a quality gate, not a growth activity, and it is checked before the correctness gates are claimed as complete.

**The reachability gate, concretely.**

- A crawler and a social unfurler receive asset-specific title and description in the raw payload, not a generic shell.
- The page is usable on a mobile connection. Where a measured budget does not yet exist, the standing constraint is that no single delivered bundle may be the reason a first-time visitor leaves.
- Every public count, claim or label on the page matches the live data it describes.
- Every route resolves to exactly one asset, and every asset is reachable by exactly one canonical route.

**Ordering.** Where a reachability defect and a correctness defect compete for the same hours, and the correctness defect is not producing a wrong number in front of a user today, reachability goes first. A perfect instrument nobody can open generates no trust and no evidence.

### 11.3 Instrumentation precedes proof

**The rule.** Instrumentation is a precondition of the investment doctrine, not a phase inside it. A tool that ships uninstrumented cannot generate the evidence the doctrine requires, so shipping it uninstrumented defers the doctrine rather than following it.

**The gate.** No tool is recorded as locked unless its completion event is instrumented. Wiring the existing client is S effort per tool and requires no new spend.

**What is measured.** Only what the doctrine already asks for: which tools are used, whether a result was reached, whether a second tool followed, whether a report was taken, whether the visitor returned. No personal data, consistent with the standing zero-spend and no-account constraints.

**What this protects against.** Building the platform's evidence base last, after the assets it is supposed to evaluate have already been built.

---

## 12. The line

Prove behavior first, manually learn second, invest third, automate last.
Ration effort as strictly as money.
Reachability precedes rigor.
Instrumentation precedes proof.

---

## 13. Version history

| Version | Date | Change |
|---|---|---|
| 1.0 | Aug 2026 | Original epistemic standard, Sections 1 through 10 |
| 1.1 | 27 Aug 2026 | Amendment 11 folded in as Section 11. Section 5 amended per tracker 1-09: credit class governs the realization axis only, confidence has three axes, verdict strength is never an axis. V3 criteria consolidated into Section 10. Standalone amendment files retired |
| 1.2 | 23 Sep 2026 | Section 1 and Section 4 sentence 3: the promise restated as verified and traceable, so verified calculation is promised explicitly alongside traceability. No rule changed. Section 5 remains superseded by `DOCTRINE_Section5_v1_2.md` until that file is folded in |
| 1.3 | 23 Sep 2026 | Section 10 names two standards, V3-Full and V3-Framework (new 10.1), per TB's V3 program for the non-rail tools. Section 11.1 made a guideline by TB ruling; its unaudited-assets corollary superseded |