/**
 * mech.js, the capacity-action selector.
 *
 * Freed agent time is capacity, not money, until somebody acts on it. Every tool
 * that frees time must ask what action converts that capacity to cash, and must
 * be able to answer "none," which realizes zero.
 *
 * This lived as a copy-pasted constant in Cost per Contact and Channel Shift, and
 * the copies had already drifted (Channel Shift lost `cred`). AI Deflection had a
 * different mechanism entirely, a "stance" that bottomed out at a 30 percent
 * haircut and could not express zero realization at all. One definition, here.
 *
 *   f     the share of freed capacity that converts to cash
 *   cred  what finance will actually credit: none, capacity, finance, or cash
 *
 * Costs that are real cash out (platform fees, escalation premium, vendor
 * invoices) are NEVER scaled by f. Only freed labor is.
 */

export const MECH = {
  none: { label: "Not selected", f: 0.00, cred: "none", note: "No capacity action: realizable savings stay $0 until you commit to one." },
  growth: { label: "Absorb growth / backlog", f: 0.25, cred: "capacity", note: "Capacity value, not cash this cycle." },
  overtime: { label: "Reduce overtime", f: 0.60, cred: "finance", note: "Finance-creditable." },
  hiring: { label: "Avoid hiring / attrition freeze", f: 0.75, cred: "finance", note: "Finance-creditable over the cycle. The defensible default." },
  vendor: { label: "Vendor / BPO volume reduction", f: 0.90, cred: "cash", note: "Often highly cashable." },
  headcount: { label: "Headcount reduction", f: 1.00, cred: "cash", note: "Fully cashable, but the highest change and CSAT risk." },
};

export const MECH_ORDER = ["none", "growth", "overtime", "hiring", "vendor", "headcount"];

/* One constant cannot serve two opposite jobs, and MECH_DEFAULT was serving both.
   A resolver asks "what do I do when the value is unusable," and the only honest
   answer is none: a tool may never credit an action the user did not choose. A form
   asks "what does the user see before they choose," which is a different question
   with a different answer. Holding both in one name is how BusinessCaseBuilder came
   to ship "none" in the UI while its own engine signature fell back to "hiring," and
   how a harness that omits the argument tests a scenario the app cannot produce.

   Both are named now. Neither is called default. */

/** Resolver fallback. An unresolvable, unknown or hostile value lands here and
 *  realizes $0. Never raise this: a fallback that credits capacity is a tool
 *  making a management commitment on the buyer's behalf. */
export const MECH_FALLBACK = "none";

/** Initial form state, before the user selects anything.
 *
 *  "none" (F2, TB, S24; was "hiring" pending tracker 1-08b). Under Section 5 the realization axis reads the
 *  credit class directly, so opening on "hiring" presented a Planning-grade realization earned by a default
 *  nobody chose. At "none" freed labor credits zero while cash out the door stays unscaled, so the tools
 *  whose decision turns on that net (AI Deflection, Channel Shift) withhold the decision and say which choice
 *  unlocks it, instead of printing a loss verdict for a question nobody asked; every figure still shows.
 *
 *  Never initialize a tool to headcount reduction. */
export const MECH_INITIAL = "none";

/** True for the flag a tool raises while no capacity action is chosen. At "none" that is an open choice,
 *  never a defect in the reader's inputs, so pages show it as not yet known (dashed, never red) and do not
 *  count it among the issues. Takes a flag string or a { t } flag object. */
export const isNoActionFlag = (f) => /^No (capacity action|mechanism)\b/.test(typeof f === "string" ? f : (f && f.t) || "");

export default MECH;
