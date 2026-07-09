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

/** The defensible default. Never default a tool to headcount reduction. */
export const MECH_DEFAULT = "hiring";

export default MECH;
