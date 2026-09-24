/* terms.js
 *
 * The engine for the contract terms model (kind "terms", src/lib/rubrics/contractRisk.js).
 * It reads the option chosen for each clause, or "don't know", and returns each clause's
 * severity, the published reading for the contract, the findings and a negotiation
 * checklist. A clause not known is an item to find, never a pass and never a severity.
 */

/* @engine-start */
const TERMS_ORDER = { critical: 0, high: 1, unknown: 2, medium: 3, low: 4 };

function scoreTerms(model, state) {
  const src = state && typeof state === "object" && state.selections && typeof state.selections === "object" ? state.selections : {};
  const own = (k) => Object.prototype.hasOwnProperty.call(src, k);
  const clauses = model.terms.map((t) => {
    const val = own(t.id) ? src[t.id] : undefined;
    const opt = t.options.find((o) => o.val === val) || null;
    const status = opt ? opt.level : val === model.unknown.val ? "unknown" : "unanswered";
    return { id: t.id, name: t.name, why: t.why, selected: opt ? opt.val : status === "unknown" ? model.unknown.val : null, status, note: opt ? opt.note : "", negotiate: opt ? opt.negotiate : "" };
  });
  const answered = clauses.filter((c) => c.status !== "unanswered").length;
  const complete = answered === clauses.length;
  const counts = Object.fromEntries(Object.keys(TERMS_ORDER).map((k) => [k, clauses.filter((c) => c.status === k).length]));

  /* The reading reads only answered clauses, so it is available as soon as one clause is
     answered; a clause not yet answered counts as not known for the reading. */
  const notKnown = counts.unknown + (clauses.length - answered);
  const reading = answered === 0 ? null
    : counts.critical ? "doNotSign" : counts.high ? "negotiate" : notKnown ? "find" : counts.medium ? "notes" : "clear";

  const findings = clauses
    .filter((c) => c.status === "critical" || c.status === "high" || c.status === "medium" || c.status === "unknown")
    .map((c) => ({ clause: c.id, name: c.name, severity: c.status, selected: c.selected,
      action: c.status === "unknown" ? "Find the " + c.name.toLowerCase() + " clause in the contract before signing." : c.negotiate || c.note,
      why: c.why }))
    .sort((a, b) => TERMS_ORDER[a.severity] - TERMS_ORDER[b.severity] || model.terms.findIndex((t) => t.id === a.clause) - model.terms.findIndex((t) => t.id === b.clause));
  const checklist = findings.filter((f) => f.severity !== "medium");

  /* The next step: add-on pricing first when it is unpriced or unknown, since it changes
     the cost; the renewal gate when renewal terms are the problem; otherwise the full
     term cost. */
  const st = (id) => (clauses.find((c) => c.id === id) || {}).status;
  const next = reading === null ? null
    : ["critical", "high", "unknown"].includes(st("addons")) ? model.next.addons
    : ["critical", "high"].includes(st("renewal")) || ["critical", "high"].includes(st("renewalPrice")) ? model.next.renewal
    : model.next.price;

  return { model: model.id, version: model.version, kind: "terms", complete, answered, total: clauses.length, clauses, counts, reading, findings, checklist, next };
}
/* @engine-end */

export { scoreTerms };
