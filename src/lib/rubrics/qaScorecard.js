/* QA Scorecard Builder, version 1.0. A QA program model (kind "qa").
 *
 * Published at /methodology/qa-scorecard from this object. It does two jobs, both read
 * by the engine in src/lib/qa.js:
 *
 * 1. Form checks. Before anyone scores against a form, the rules below check that its
 *    weights hold together, that every criterion is defined, that every auto-fail has a
 *    reason that can be defended, and that no single judgment call can swing the score
 *    too far. What the form measures (customer outcome, compliance, process) is shown as
 *    a fact, with no threshold, because no source says what the right mix is.
 *
 * 2. Calibration. Several evaluators score the same calls blind: each sees only their own
 *    score and sends a submission code to the QA lead. Nothing is compared until every
 *    evaluator has scored every call. The Center of CX Calibration Method then reports
 *    score and item reliability with Krippendorff's alpha, critical-fail agreement with
 *    Gwet's AC1, plain percent agreement beside both, and a bootstrap interval on each so
 *    a small session cannot claim more than it shows. The method is our own combination;
 *    every statistic inside it is published and cited below.
 *
 * Thresholds marked heuristic have no published source. They are labelled as such on the
 * page, in the tool and in the PDF.
 */
export const QA_SCORECARD = {
  id: "qa-scorecard",
  kind: "qa",
  title: "QA Scorecard Builder",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/qa-scorecard",
  methodology: "/methodology/qa-scorecard",
  what: "Whether a QA form is built to produce scores you can defend, and whether your evaluators, scoring the same calls blind, agree closely enough for those scores to mean the same thing whoever gives them.",
  method: {
    name: "The Center of CX Calibration Method",
    version: "1.0",
    summary: "Our own combination of published reliability statistics, chosen for how QA calibration actually runs: few calls, several evaluators, and critical fails that are rare. Krippendorff's alpha grades total scores and item marks; Gwet's AC1 grades agreement on critical fails, where rare fails make older statistics read agreement as poor; percent agreement sits beside both; a bootstrap interval on each shows how far a small session can be trusted.",
  },
  focus: [
    { id: "outcome", label: "Customer outcome" },
    { id: "compliance", label: "Compliance" },
    { id: "process", label: "Process and behavior" },
  ],
  reasons: [
    { id: "legal", label: "Legal" },
    { id: "regulatory", label: "Regulatory" },
    { id: "security", label: "Security" },
    { id: "harm", label: "Customer harm" },
  ],
  thresholds: {
    swingMax: { value: 15, kind: "heuristic", text: "points one non-critical criterion can move the score" },
    criticalLoadMax: { value: 0.5, kind: "heuristic", text: "share of calibration evaluations decided by a critical fail" },
    biasMax: { value: 5, kind: "heuristic", text: "points an evaluator scores above or below the others, on average" },
    spreadMax: { value: 5, kind: "heuristic", text: "points an evaluator's score sits from the call's average" },
    itemAgreementMin: { value: 0.8, kind: "heuristic", text: "share of evaluator pairs that mark a criterion the same way" },
    minCalls: { value: 3, kind: "heuristic", text: "calls a session needs before reliability is graded" },
    minEvaluators: { value: 2, kind: "rule", text: "evaluators, besides any reference, a session needs" },
  },
  bootstrap: { resamples: 1000, seed: 20260924, level: 0.95 },
  /* Krippendorff (2004): rely on data at 0.800 or above; draw tentative conclusions only
     from 0.667 to 0.800; discard below 0.667. Gwet publishes no fixed cut points for AC1,
     so the method applies the same two to it, and says so. */
  bands: [
    { id: "reliable", label: "Reliable", min: 0.8, desc: "Evaluators agree closely enough to rely on the scores." },
    { id: "tentative", label: "Tentative", min: 0.667, desc: "Agreement supports tentative conclusions only. Reword the flagged criteria and calibrate again before scores drive coaching or pay." },
    { id: "unreliable", label: "Not reliable", min: -Infinity, desc: "Evaluators do not agree closely enough for the scores to mean the same thing whoever gives them." },
  ],
  measures: [
    { id: "score", label: "Total score reliability", stat: "Krippendorff's alpha, interval metric, on each evaluator's weighted score before critical fails" },
    { id: "items", label: "Item reliability", stat: "Krippendorff's alpha, nominal metric, on every criterion mark on every call" },
    { id: "critical", label: "Critical-fail agreement", stat: "Gwet's AC1 on every critical criterion mark on every call" },
  ],
  sources: [
    { id: "k2004", text: "Krippendorff, K. (2004). Content Analysis: An Introduction to Its Methodology, 2nd edition. Sage. Source of alpha's cut points, 0.800 and 0.667." },
    { id: "k2011", text: "Krippendorff, K. (2011). Computing Krippendorff's Alpha-Reliability. Annenberg School for Communication, University of Pennsylvania. The computation used here; its worked example is pinned in the test suite." },
    { id: "g2008", text: "Gwet, K. L. (2008). Computing inter-rater reliability and its variance in the presence of high agreement. British Journal of Mathematical and Statistical Psychology, 61(1), 29 to 48. Source of AC1." },
    { id: "fc1990", text: "Feinstein, A. R. and Cicchetti, D. V. (1990). High agreement but low kappa: I. The problems of two paradoxes. Journal of Clinical Epidemiology, 43(6), 543 to 549. Why kappa misreads rare critical fails." },
    { id: "et1993", text: "Efron, B. and Tibshirani, R. J. (1993). An Introduction to the Bootstrap. Chapman and Hall. The percentile interval used on every measure." },
  ],
  /* The kappa paradox, as it appears in QA: two evaluators, 100 calls, one critical item.
     Both pass 90, each fails 5 the other passed, neither fails the same call. */
  paradox: { calls: 100, bothPass: 90, splitA: 5, splitB: 5, bothFail: 0 },
  rules: {
    weights: { severity: "critical", group: "form", title: "Weights do not total 100", test: "Category weights must total exactly 100.",
      action: "Adjust the weights to total 100; they total {total} now, so no score from this form can be compared with another." },
    emptyCategory: { severity: "critical", group: "form", title: "Category with no criteria", test: "A category carries weight but has no criteria to score.",
      action: "Add criteria to {category} or set its weight to 0." },
    definition: { severity: "high", group: "form", title: "Criterion with no definition", test: "Every criterion needs a written definition of what earns a yes, so two evaluators mark it the same way.",
      action: "Write what earns a yes for the {count} criteria with no definition, starting with {first}." },
    criticalReason: { severity: "high", group: "form", title: "Auto-fail with no stated reason", test: "Every critical-fail criterion names its reason: legal, regulatory, security or customer harm. An auto-fail that cannot name one is hard to defend when it leads to discipline.",
      action: "Name the legal, regulatory, security or customer-harm reason for {criterion}, or make it a scored criterion instead of an auto-fail." },
    swing: { severity: "medium", group: "form", heuristic: "swingMax", title: "One judgment call swings the score", test: "A non-critical criterion moves the score by more than {swingMax} points (its category weight divided by the criteria in the category).",
      action: "Split {criterion} into more specific criteria or lower {category}'s weight; one mark moves the score {points} points." },
    focus: { severity: "info", group: "form", title: "Criterion with no focus tag", test: "A criterion is not tagged as customer outcome, compliance or process, so the form's mix cannot be shown in full.",
      action: "Tag the {count} untagged criteria with what they measure, starting with {first}." },
    reliability: { severity: "high", group: "calibration", title: "Scores not reliable", test: "A measure's interval lies below 0.667, where Krippendorff advises discarding the data.",
      action: "Do not use {measure} for coaching or pay yet. Reword the flagged criteria, brief evaluators on the definitions and calibrate again." },
    inconclusive: { severity: "medium", group: "calibration", title: "Reliability inconclusive", test: "A measure's interval crosses a band line, so the session is too small to place it.",
      action: "Score more calls in the next session; {measure} sits between {low} and {high} on this sample." },
    tentative: { severity: "medium", group: "calibration", title: "Reliability tentative", test: "A measure's interval lies between 0.667 and 0.800.",
      action: "Treat {measure} as tentative. Reword the flagged criteria and calibrate again before scores drive coaching or pay." },
    itemAgreement: { severity: "medium", group: "calibration", heuristic: "itemAgreementMin", title: "Evaluators read a criterion differently", test: "Fewer than {itemAgreementMin} of evaluator pairs mark a criterion the same way across the calibration calls.",
      action: "Reword the definition of {criterion}: evaluator pairs agreed {agreement} of the time. Disagreement concentrated on one criterion usually points to its wording." },
    bias: { severity: "medium", group: "calibration", heuristic: "biasMax", title: "Evaluator scores harder or softer", test: "An evaluator scores more than {biasMax} points above or below the others on the same calls, on average.",
      action: "Review {evaluator}'s marks against the definitions in the calibration session; they score {points} points {direction} than the others on average." },
    spread: { severity: "medium", group: "calibration", heuristic: "spreadMax", title: "Wide spread on a call", test: "An evaluator's score sits more than {spreadMax} points from the call's average.",
      action: "Walk through call {call} together; scores ran from {low} to {high}." },
    reference: { severity: "medium", group: "calibration", heuristic: "itemAgreementMin", title: "Evaluator differs from the reference", test: "When a reference evaluator is named, an evaluator matches fewer than {itemAgreementMin} of the reference's marks.",
      action: "Go through the marks where {evaluator} differs from the reference; they matched {agreement} of them." },
    criticalLoad: { severity: "medium", group: "calibration", heuristic: "criticalLoadMax", title: "Critical fails decide most scores", test: "More than {criticalLoadMax} of calibration evaluations end in a critical fail, so the weighted score rarely matters.",
      action: "Check whether every critical criterion needs to auto-fail; {share} of evaluations in this session did." },
    notGraded: { severity: "info", group: "calibration", heuristic: "minCalls", title: "Too few calls to grade", test: "A session with fewer than {minCalls} calls reports its measures but grades none of them.",
      action: "Score at least {minCalls} calls in the next session to grade reliability." },
  },
  limits: [
    "Form checks read how the form is built. They cannot tell whether a criterion measures what matters to your customers; only outcome data can, which is why the next step is FCR Leakage.",
    "Calibration measures agreement between the evaluators who took part, on the calls they scored. Evaluators can agree and all be wrong; name a reference evaluator to measure accuracy as well.",
    "A small session gives wide intervals. The method reports that width instead of hiding it, and grades nothing below the minimum number of calls.",
    "Submission codes are not encrypted. Blind scoring holds because the tool compares nothing until every evaluator has scored every call, and because each evaluator sees only their own code.",
    "The thresholds marked heuristic have no published source. They are starting points; set your program's own.",
  ],
  next: { tool: "fcr-leakage" },
  templates: {
    general: { name: "General Inbound", categories: [
      { name: "Opening + Authentication", weight: 10, criteria: [
        { text: "Proper greeting and identification", critical: false, focus: "process", def: "Agent greets the customer and gives their own name and the company name in the opening." },
        { text: "Customer verified per policy", critical: true, reason: "security", focus: "compliance", def: "Agent completes every identity check the verification policy requires before discussing or changing the account." },
      ]},
      { name: "Active Listening + Discovery", weight: 20, criteria: [
        { text: "Acknowledged customer concern", critical: false, focus: "process", def: "Agent names or restates the customer's concern before moving to solve it." },
        { text: "Asked clarifying questions", critical: false, focus: "process", def: "Agent asks at least one question that narrows the issue before proposing a fix, unless the customer has already stated it in full." },
        { text: "Restated issue to confirm understanding", critical: false, focus: "process", def: "Agent summarizes the issue back and the customer confirms it." },
      ]},
      { name: "Knowledge + Accuracy", weight: 25, criteria: [
        { text: "Provided correct information", critical: true, reason: "harm", focus: "outcome", def: "Every fact, policy or instruction the agent gives is correct against the current knowledge base." },
        { text: "Used appropriate resources", critical: false, focus: "process", def: "Agent uses the knowledge base articles or tools the process names for this contact type." },
        { text: "Did not guess or provide unverified info", critical: true, reason: "harm", focus: "outcome", def: "Agent states nothing as fact that they have not confirmed; when unsure, they say so and check." },
      ]},
      { name: "Resolution + Ownership", weight: 25, criteria: [
        { text: "Resolved the issue or set clear next steps", critical: false, focus: "outcome", def: "The issue is resolved on the contact, or the customer leaves knowing the next step, who owns it and when it happens." },
        { text: "Took ownership (no unnecessary transfers)", critical: false, focus: "outcome", def: "Agent resolves what is within their authority and transfers only when the process requires it." },
        { text: "Set expectations for follow-up", critical: false, focus: "outcome", def: "Where follow-up is needed, agent states what happens next and by when." },
      ]},
      { name: "Closing + Compliance", weight: 20, criteria: [
        { text: "Summarized resolution and next steps", critical: false, focus: "process", def: "Agent recaps what was done and what happens next before closing." },
        { text: "Required disclosures were provided", critical: true, reason: "regulatory", focus: "compliance", def: "Every disclosure the script or regulation requires for this contact is given in full." },
        { text: "Professional closing", critical: false, focus: "process", def: "Agent checks whether anything else is needed and closes courteously." },
      ]},
    ]},
    billing: { name: "Billing Dispute", categories: [
      { name: "Authentication + Security", weight: 15, criteria: [
        { text: "Full identity verification completed", critical: true, reason: "security", focus: "compliance", def: "Agent completes every identity check the policy requires before discussing charges." },
        { text: "Account access validated", critical: true, reason: "security", focus: "compliance", def: "Agent confirms the caller is authorized on the account before making any change." },
      ]},
      { name: "Issue Understanding", weight: 20, criteria: [
        { text: "Charge identified and explained clearly", critical: false, focus: "outcome", def: "Agent identifies the disputed charge and explains what it is and why it was billed." },
        { text: "Customer billing history reviewed", critical: false, focus: "process", def: "Agent reviews recent statements and prior disputes before deciding." },
        { text: "Root cause of dispute identified", critical: false, focus: "outcome", def: "Agent states why the dispute arose: a billing error, a policy, usage or a misunderstanding." },
      ]},
      { name: "Resolution Authority", weight: 30, criteria: [
        { text: "Applied correct adjustment policy", critical: true, reason: "harm", focus: "compliance", def: "Any credit or adjustment follows the current adjustment policy and its limits." },
        { text: "Credit/refund processed accurately", critical: true, reason: "harm", focus: "outcome", def: "The credit or refund amount and account are correct, and the transaction is confirmed to the customer." },
        { text: "Escalated appropriately when outside authority", critical: false, focus: "process", def: "A request beyond the agent's authority goes through the named escalation path; the agent neither refuses it outright nor promises it." },
      ]},
      { name: "Documentation", weight: 20, criteria: [
        { text: "Dispute documented per compliance requirements", critical: true, reason: "regulatory", focus: "compliance", def: "The dispute is recorded with every field the compliance requirement names." },
        { text: "Case notes are complete and actionable", critical: false, focus: "process", def: "Notes let the next agent act without calling the customer back to ask." },
      ]},
      { name: "Customer Experience", weight: 15, criteria: [
        { text: "Empathy demonstrated for billing frustration", critical: false, focus: "process", def: "Agent acknowledges the customer's frustration in words before explaining the charge." },
        { text: "Proactive prevention advice offered", critical: false, focus: "outcome", def: "Agent tells the customer how to avoid the same charge or dispute next time." },
      ]},
    ]},
    techSupport: { name: "Technical Support", categories: [
      { name: "Troubleshooting Approach", weight: 30, criteria: [
        { text: "Followed structured diagnostic process", critical: false, focus: "process", def: "Agent follows the diagnostic steps the troubleshooting guide sets for this issue, in order." },
        { text: "Isolated the issue systematically", critical: false, focus: "process", def: "Agent tests one cause at a time and rules each in or out." },
        { text: "Did not skip steps or assume the problem", critical: false, focus: "process", def: "Agent completes each required step even when the cause seems obvious." },
        { text: "Tested the fix before closing", critical: true, reason: "harm", focus: "outcome", def: "Agent confirms with the customer that the fix works before ending the contact." },
      ]},
      { name: "Technical Accuracy", weight: 25, criteria: [
        { text: "Diagnosis was correct", critical: true, reason: "harm", focus: "outcome", def: "The cause the agent names matches the cause confirmed by the fix or by review." },
        { text: "Solution was appropriate for the problem", critical: true, reason: "harm", focus: "outcome", def: "The fix addresses the confirmed cause and follows the supported method." },
        { text: "Used correct tools and resources", critical: false, focus: "process", def: "Agent uses the tools and articles the guide names for this issue." },
      ]},
      { name: "Communication", weight: 20, criteria: [
        { text: "Explained technical concepts in customer terms", critical: false, focus: "outcome", def: "Agent explains what is happening without jargon the customer has to ask about." },
        { text: "Set time expectations during holds", critical: false, focus: "process", def: "Before any hold or long test, agent says how long it will take." },
        { text: "Kept customer informed during troubleshooting", critical: false, focus: "process", def: "Agent tells the customer what each step is for as it happens." },
      ]},
      { name: "Resolution + Prevention", weight: 15, criteria: [
        { text: "Issue fully resolved or escalation path clear", critical: false, focus: "outcome", def: "The issue is resolved, or the customer knows the escalation, its owner and its timeline." },
        { text: "Root cause addressed, not just symptom", critical: false, focus: "outcome", def: "The fix removes the cause of the problem as well as the symptom the customer reported." },
      ]},
      { name: "Documentation", weight: 10, criteria: [
        { text: "Troubleshooting steps documented for future reference", critical: false, focus: "process", def: "Notes list each step tried and its result." },
        { text: "Known issue flagged if pattern detected", critical: false, focus: "process", def: "When the issue matches a known pattern, agent flags it through the named channel." },
      ]},
    ]},
  },
};
