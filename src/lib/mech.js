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
 *  Held at "hiring" pending tracker 1-08b. "none" is the doctrine-correct value,
 *  because under Section 5 the realization axis reads credit class directly, so
 *  "hiring" presents a Planning-grade realization earned by a default nobody chose.
 *  It does not flip as a one-line change: at "none" the cash-out-the-door costs are
 *  unscaled while freed labor credits zero, so Channel Shift renders "Do not approve
 *  yet" and AI Deflection renders a negative purchase verdict on first paint. Those
 *  read as answers to a question nobody asked, which is the 1-12 defect class in
 *  another costume. The flip ships with the unselected-state rendering, not before.
 *
 *  Never initialize a tool to headcount reduction. */
export const MECH_INITIAL = "hiring";

export default MECH;
