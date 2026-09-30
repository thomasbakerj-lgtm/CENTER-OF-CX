/* readerBriefs.js
 *
 * What each reader of a report needs from one tool (TB, 30 Sep 2026: "the reports by persona all look the same").
 * The reader picker used to reorder sections by type only, with one generic line per reader for every tool. A brief
 * gives a reader two things for one tool: the sections they need first (matched by title, in this order) and the
 * questions they should put to this result before they rely on it.
 *
 * A brief never changes a figure, a grade or a section's content. Every section still prints exactly once; a brief only
 * decides what comes first and what the reader is asked to check. Questions carry no figure of their own.
 *
 * Tools without a brief keep the type order in ReportExport's AUDIENCES. Keys are the tool ids ReportActions passes.
 */

const t = (...titles) => titles.map((s) => new RegExp(s, "i"));

export const READER_BRIEFS = {
  "rfp-builder": {
    finance: { lead: t("^Vendor Responses", "^Your Evaluation Order", "^Scoring Rules", "^RFP Context"), ask: [
      "Which must-haves are met only through paid add-ons or a partner, and are those priced in every vendor's quote?",
      "Are the weights ours, and would the order change if must-haves counted differently?",
      "Which claims are still unproven until the demo, and what would it cost us if one fails?",
    ] },
    operations: { lead: t("specific Requirements", "^Layer 6", "^Layer 5", "^Layer 7", "^Analyst Read"), ask: [
      "Do the routing, channel and reporting requirements describe how our floor works today and how it should work?",
      "Which of our own requirements did we add or reword, and does every team lead agree with them?",
      "Which demo scenarios should our supervisors and agents run themselves?",
    ] },
    it: { lead: t("^Layer 1", "^Layer 2", "^Layer 3", "^Layer 4"), ask: [
      "Do the data, integration and security requirements name every system the platform must connect to?",
      "Which integrations are met natively, which through a partner, and who supports each one after go-live?",
      "Which requirements need a technical proof in our own environment before we sign?",
    ] },
    executive: { lead: t("^Your Evaluation Order", "^Analyst Read", "^RFP Context"), ask: [
      "Does any vendor meet every must-have, and if none does, which requirement are we prepared to change?",
      "Where is the choice actually decided, and who owns that decision?",
      "What must the demos prove before we commit?",
    ] },
    advisor: { lead: [], ask: [
      "Do the must-haves match the client's stated goals, or have preferences crept in as must-haves?",
      "Were any requirements reworded or removed, and does the report say why?",
      "Are unanswered lines being chased as questions rather than scored as gaps?",
    ] },
  },
  "tco-calculator": {
    finance: { lead: t("^TCO Summary", "^Cost Reconciliation", "^3-Year Projection", "^Organization Profile"), ask: [
      "Which inputs are our own figures and which are presets, and does the grade reflect that?",
      "Does the cost reconciliation tie to our general ledger for labor, technology and overhead?",
      "Which escalation and attrition assumptions drive the three-year figure most?",
    ] },
    operations: { lead: t("^Optimization Opportunities", "^Analyst Read", "^Cost Distribution"), ask: [
      "Which optimization levers can the operation actually pull, and who owns each?",
      "Do the handle time, shrinkage and attrition inputs match what our reports show?",
      "Which saving depends on an action nobody has agreed to yet?",
    ] },
    it: { lead: t("^Cost Distribution", "^Organization Profile", "^Methodology"), ask: [
      "Are platform, telephony and integration costs complete, including renewal uplifts?",
      "Which technology line would move if we changed platform or consolidated vendors?",
      "Is anything we run in house missing from the technology cost?",
    ] },
    executive: { lead: t("^TCO Summary", "^Analyst Read"), ask: [
      "What does the operation cost a year and per contact, and how sure is that figure?",
      "Which one or two levers matter most, and what would we have to decide to pull them?",
      "What would raise the grade before this goes to a budget decision?",
    ] },
    advisor: { lead: [], ask: [
      "Which inputs sit at presets, and does the client know the grade stays Directional until they change?",
      "Does the reconciliation show every cost once, with nothing double counted?",
      "Are the savings valued on the marginal load the method states?",
    ] },
  },
  "business-case-builder": {
    finance: { lead: t("^Financial Summary", "^Capacity and Cash", "^Business-as-Usual Counterfactual", "^Key Assumptions", "^Evidence and Findings"), ask: [
      "Which savings are cash out the door and which are freed capacity with no action yet?",
      "Where do the baselines come from, and would an attested system report change the grade?",
      "Does the counterfactual reflect what happens if we do nothing, including cost increases?",
    ] },
    operations: { lead: t("^Savings Breakdown", "^Capacity and Cash", "^Decision Read"), ask: [
      "Which capacity action turns freed time into value, and can the operation deliver it?",
      "Are the handle time, first contact resolution and attrition targets reachable with the change planned?",
      "What has to be true on the floor, by when, for payback to hold?",
    ] },
    it: { lead: t("^Key Assumptions", "^Methodology", "^Financial Summary"), ask: [
      "Are platform, implementation and integration costs complete, including the phasing?",
      "Which technical dependency could delay the month benefits start?",
      "Who supports the change after go-live, and is that cost in the case?",
    ] },
    executive: { lead: t("^Executive Summary", "^Financial Summary", "^Decision Read"), ask: [
      "What does the case return over three years, when does it pay back, and how sure is it?",
      "Which decision turns freed capacity into value, and who owns it?",
      "What would make this case fail, and what evidence would strengthen it before approval?",
    ] },
    advisor: { lead: [], ask: [
      "Does the attribution stance match what the client can defend?",
      "Is any freed capacity counted as cash without a named action?",
      "Do the baseline grades reflect where each number came from?",
    ] },
  },
  "staffing-calculator": {
    finance: { lead: t("^Staffing Results", "^Input Parameters"), ask: [
      "Does the annual staffing cost use our own wage and load, or the published defaults?",
      "How many agents does each point of service level cost at this volume?",
      "Which input, if wrong, moves the cost most?",
    ] },
    operations: { lead: t("^Staffing Results", "^Key Findings", "^Recommended Actions"), ask: [
      "Does the scheduled headcount cover our real shrinkage and the busiest intervals?",
      "Is the occupancy the model implies one our agents can sustain?",
      "Which action closes the gap fastest: hiring, overtime, or changing the target?",
    ] },
    it: { lead: t("^Input Parameters", "^Methodology"), ask: [
      "Do the volume and handle time come from our routing and workforce systems?",
      "Is the forecast interval the model uses the same one our workforce tool schedules to?",
      "Which report should feed these inputs next time?",
    ] },
    executive: { lead: t("^Staffing Results", "^Key Findings"), ask: [
      "How many people do we need to meet the service level we promise, and what does that cost a year?",
      "Are we staffed above or below that today?",
      "Which decision closes the gap, and when?",
    ] },
    advisor: { lead: [], ask: [
      "Does the Erlang C result account for the abandonment and pooling checks the method lists?",
      "Is shrinkage entered as the client measures it, on the same base?",
      "Were any inputs corrected, and does the report say so?",
    ] },
  },
  "cost-per-contact": {
    finance: { lead: t("^Cost Metrics", "^Three Value Layers", "^FCR Dividend"), ask: [
      "Does cost per contact include every cost we carry, or labor only?",
      "Which part of the first contact resolution dividend is cash, and which is capacity?",
      "Which capacity action, if any, has been chosen to realize the saving?",
    ] },
    operations: { lead: t("^Analyst Read", "^FCR Dividend", "^Cost Metrics"), ask: [
      "How much of our volume is repeat contact, and which reasons drive it?",
      "What would it take on the floor to lift first contact resolution?",
      "Which channel costs the most per resolved need?",
    ] },
    it: { lead: t("^Integrity Checks", "^Methodology", "^Cost Metrics"), ask: [
      "Can our systems measure repeat contacts across channels, or is resolution self-reported?",
      "Which report would give us cost per resolution each month?",
      "Are channel costs split correctly between platform and labor?",
    ] },
    executive: { lead: t("^Cost Metrics", "^Analyst Read"), ask: [
      "What does it cost to resolve a customer need, and how much of that is repeat work?",
      "What is the value of resolving more on first contact, and how sure is it?",
      "Which decision turns that value into savings?",
    ] },
    advisor: { lead: [], ask: [
      "Is first contact resolution defined the same way the client measures it?",
      "Are the three value layers kept apart, with nothing double counted?",
      "Is the realized value tied to a named capacity action?",
    ] },
  },
  "channel-shift": {
    finance: { lead: t("^Decision", "^Economics", "^Volume Bridge"), ask: [
      "Do bot fees, transition cost and payback use our quoted prices?",
      "How much of the freed time becomes cash, and through which action?",
      "What happens to the case if fewer contacts shift than planned?",
    ] },
    operations: { lead: t("^Volume Bridge", "^Adverse Selection", "^Analyst Read"), ask: [
      "Which contacts stay in voice, and are they the harder ones?",
      "How many customers come back to an agent after the digital channel, and does the model count them?",
      "What training and routing changes does the shift need?",
    ] },
    it: { lead: t("^Economics", "^Methodology", "^Integrity Checks"), ask: [
      "Can the digital channel and bot hand over context to an agent without a repeat?",
      "Are platform and bot fees priced per conversation the way our contract bills them?",
      "What must be built before the shift can start?",
    ] },
    executive: { lead: t("^Decision", "^Analyst Read"), ask: [
      "Does the shift save money once bounce-back and fees are counted, and how sure is it?",
      "Which capacity action realizes the saving, and has it been chosen?",
      "What would we need to see in a pilot before scaling?",
    ] },
    advisor: { lead: [], ask: [
      "Is adverse selection applied once, from total voice minutes, as the method states?",
      "Are validation and grades consistent with the evidence the client holds?",
      "Is the decision withheld until a capacity action is chosen?",
    ] },
  },
  "fcr-leakage": {
    finance: { lead: t("^Leakage Economics", "^Cash Conversion and Payback", "^Result Summary"), ask: [
      "How much of the leakage cost is cash, and how much is capacity?",
      "What does the payback depend on, and which capacity action is assumed?",
      "Is the practical ceiling realistic for our scope?",
    ] },
    operations: { lead: t("^Top Leakage Sources", "^30-Day Operating Test", "^Dimension Scores"), ask: [
      "Which leakage sources are in our control, and who owns each?",
      "Can we run the 30-day operating test with the teams we have?",
      "Which weak dimension should we fix first?",
    ] },
    it: { lead: t("^Definitions and Scope Used", "^Assumptions and Exclusions", "^Confidence and Risk Flags"), ask: [
      "Can our systems link a repeat contact to the first one across channels?",
      "Which data would let us measure first contact resolution directly?",
      "Which flags come from missing data we could supply?",
    ] },
    executive: { lead: t("^Result Summary", "^Leakage Economics", "^Top Leakage Sources"), ask: [
      "What do unresolved first contacts cost us, and how sure is it?",
      "Which two or three causes matter most?",
      "What will the 30-day test tell us before we invest?",
    ] },
    advisor: { lead: [], ask: [
      "Does the repeat share model match how the client counts repeats?",
      "Are exclusions stated, and do they change the result materially?",
      "Is the ceiling scoped to what the client controls?",
    ] },
  },
  "ai-deflection": {
    finance: { lead: t("^Decision", "^Vendor Claim to Reality Bridge", "^Break-Even Thresholds", "^Confidence and Evidence"), ask: [
      "What is the net saving after bot fees, repeat contacts and escalations, and which capacity action realizes it?",
      "At what resolution rate does the bot break even, and how far is that from the vendor's claim?",
      "Are the bot's costs taken from our quote or from defaults?",
    ] },
    operations: { lead: t("^The Three Rates", "^Scenarios", "^Analyst Read"), ask: [
      "How many customers does the bot fully resolve, and how many come back to an agent?",
      "Which contact types should the bot handle first?",
      "How will agents pick up conversations the bot escalates?",
    ] },
    it: { lead: t("^Rail Handoff to Downstream Tools", "^Methodology", "^Assumption set A vs B"), ask: [
      "Which systems must the bot read from and write to for it to resolve contacts?",
      "How is a resolved conversation measured, and by whom?",
      "What does the pilot need to prove technically before rollout?",
    ] },
    executive: { lead: t("^Decision", "^Analyst Read"), ask: [
      "Does the AI proposal pay for itself once real resolution is counted, and how sure is it?",
      "How far is the vendor's claim from what the model shows?",
      "What must a pilot prove before we sign?",
    ] },
    advisor: { lead: [], ask: [
      "Are coverage, apparent resolution and net automation each shown with their own denominator?",
      "Is the vendor claim reconciled step by step in the bridge?",
      "Is the decision withheld until a capacity action is chosen?",
    ] },
  },
  "license-gap": {
    finance: { lead: t("^Seat Economics", "^Commercial Exposure", "^Hidden Annual"), ask: [
      "What does a seat really cost once required modules are included?",
      "How much is committed, and what would a true-down clause save?",
      "Which modules could we drop without losing a requirement?",
    ] },
    operations: { lead: t("^Module Coverage", "^Shelfware", "^Analyst Read"), ask: [
      "Which modules do our teams actually use, and which are shelfware?",
      "Is any module we rely on missing from the quote?",
      "Who should confirm usage before renewal?",
    ] },
    it: { lead: t("^Module Coverage", "^Hidden Annual", "^Integrity Checks"), ask: [
      "Which modules overlap tools we already run?",
      "Are platform and add-on components billed the way our contract says?",
      "What usage data can we pull to check seat counts?",
    ] },
    executive: { lead: t("^Seat Economics", "^Commercial Exposure", "^Analyst Read"), ask: [
      "How far is the real seat price from the quoted one, and why?",
      "How much are we committing, and for how long?",
      "What should we negotiate before signing?",
    ] },
    advisor: { lead: [], ask: [
      "Are commercial caveats and shelfware kept as leverage, apart from the cost?",
      "Is the year-three seat price consistent with the escalation terms?",
      "Were any inputs corrected, and does the report say so?",
    ] },
  },
  "attrition-cost": {
    finance: { lead: t("^Burden vs Realizable", "^Cost Per Replaced Departure", "^Evidence Detail"), ask: [
      "Which part of the attrition cost is cash, and which is lost capacity?",
      "Do the wage and hiring costs come from our own records?",
      "What would a lower attrition rate be worth, and through which action?",
    ] },
    operations: { lead: t("^Why Agents Leave", "^Key Findings", "^Cost Per Replaced Departure"), ask: [
      "Which drivers did our answers flag, and who owns fixing each?",
      "How long does a new agent take to reach full proficiency here?",
      "Which tool measures the weakest driver next?",
    ] },
    it: { lead: t("^Integrity Flags", "^Methodology", "^Evidence Detail"), ask: [
      "Can our HR and workforce systems report departures and ramp time directly?",
      "Is any tool or desktop issue among the drivers we flagged?",
      "Which data would let us refresh this each quarter?",
    ] },
    executive: { lead: t("^Burden vs Realizable", "^Key Findings"), ask: [
      "What does agent attrition cost us a year, and how sure is it?",
      "Why are agents leaving, in our own answers?",
      "Which decision would lower it, and who owns it?",
    ] },
    advisor: { lead: [], ask: [
      "Is the frontline planning band used as context rather than a target?",
      "Do the driver answers stay apart from the cost figures?",
      "Were any inputs corrected, and does the report say so?",
    ] },
  },
};

/* The reading line for a tool that produces no grade: it must not promise "how sure it is". */
export const READ_NO_GRADE = {
  finance: "Start with the result, then check every input and its source.",
  operations: "Start with the findings and actions, then the inputs you can change.",
  it: "Start with the inputs and the method, then the findings.",
  executive: "The result and the next step come first. The detail follows for whoever checks it.",
  advisor: "Every section in the order the tool produced it, with the method link for your own check.",
};

export const briefFor = (toolId, readerId) => {
  const b = toolId && Object.prototype.hasOwnProperty.call(READER_BRIEFS, toolId) ? READER_BRIEFS[toolId] : null;
  return b && Object.prototype.hasOwnProperty.call(b, readerId) ? b[readerId] : null;
};
