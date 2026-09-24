/* renewal.js
 *
 * The engine for the renewal model (kind "renewal", src/lib/rubrics/platformDecision.js).
 * It reads, for each need, a capability rating (1 to 5 or "unknown"), how the rating is
 * known (production or vendor) and whether the need matters (must, nice, none), plus the
 * renewal clock, and returns each layer's outcome, the overall gate, the findings and a
 * negotiation checklist. It never averages: a must-have gap is a gap whatever the other
 * ratings are, and a need rated "unknown" is a proof request, never a low score.
 */

/* @engine-start */
const RENEWAL_SEVERITY = { critical: 0, high: 1, medium: 2, info: 3 };

function renewalFill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : String(vars[k])));
}

function renewalVars(model) {
  const v = {};
  for (const [k, t] of Object.entries(model.thresholds)) v[k] = t.value < 1 ? Math.round(t.value * 100) + "%" : t.value;
  return v;
}

/* Every need in model order, keyed `${layer.n}-${index}`. */
function renewalNeeds(model) {
  return model.layers.flatMap((l) => l.needs.map((text, i) => ({ key: `${l.n}-${i}`, layer: l.n, layerName: l.name, core: l.core, text })));
}

function scoreRenewal(model, state) {
  const T = model.thresholds, TV = renewalVars(model), R = model.rules;
  const src = state && typeof state === "object" ? state : {};
  const map = (m) => (m && typeof m === "object" ? m : {});
  const own = (m, k) => Object.prototype.hasOwnProperty.call(m, k);
  const S = map(src.scores), NEED = map(src.need), EV = map(src.evidence), C = map(src.clock);
  const levels = model.needLevels.map((x) => x.id), evs = model.evidence.map((x) => x.id);

  const items = renewalNeeds(model).map((n) => {
    const raw = own(S, n.key) ? S[n.key] : undefined;
    const rating = Number.isInteger(raw) && raw >= 1 && raw <= 5 ? raw : raw === model.unknown.value ? "unknown" : null;
    const need = own(NEED, n.key) && levels.includes(NEED[n.key]) ? NEED[n.key] : "must";
    const evidence = own(EV, n.key) && evs.includes(EV[n.key]) ? EV[n.key] : "production";
    let status = "unanswered";
    if (need === "none") status = "excluded";
    else if (rating === null) status = "unanswered";
    else if (rating === "unknown") status = need === "must" ? "proof" : "open";
    else if (rating <= T.gapAt.value) status = need === "must" ? "gap" : "niceGap";
    else if (need === "must" && evidence === "vendor") status = "proof";
    else status = "met";
    return { ...n, rating, need, evidence, status };
  });
  const answered = items.filter((x) => x.status !== "unanswered").length;
  const complete = answered === items.length;

  const findings = [];
  const push = (rule, vars, trace, extra) => findings.push({ rule, severity: R[rule].severity, title: R[rule].title, action: renewalFill(R[rule].action, { ...TV, ...vars }), trace, ...extra });

  const layers = model.layers.map((l) => {
    const mine = items.filter((x) => x.layer === l.n);
    const must = mine.filter((x) => x.need === "must" && x.status !== "unanswered");
    const gaps = must.filter((x) => x.status === "gap").length, proof = must.filter((x) => x.status === "proof").length;
    const share = must.length ? gaps / must.length : 0;
    let outcome = "renew";
    if (gaps > 0 && share >= T.specialistShare.value) outcome = l.core ? "market" : "specialist";
    else if (gaps > 0 || proof > 0) outcome = "conditions";
    return { n: l.n, name: l.name, core: l.core, tool: l.tool, must: must.length, gaps, proof, share, outcome };
  });

  let gate = null, clock = null;
  if (complete) {
    for (const x of items) {
      if (x.status === "gap") push("blocker", { need: x.text }, [x.key], { need: x.key, layer: x.layer });
      else if (x.status === "proof") push("proof", { need: x.text }, [x.key], { need: x.key, layer: x.layer });
      else if (x.status === "niceGap") push("niceGap", { need: x.text }, [x.key], { need: x.key, layer: x.layer });
    }
    for (const l of layers) {
      if (l.outcome === "market") push("market", { layer: l.name }, [String(l.n)], { layer: l.n });
      if (l.outcome === "specialist") push("specialist", { layer: l.name }, [String(l.n)], { layer: l.n });
    }
    const specialists = layers.filter((l) => l.outcome === "specialist").length;
    if (specialists >= T.sprawlLayers.value) push("sprawl", { count: specialists }, layers.filter((l) => l.outcome === "specialist").map((l) => String(l.n)));
    gate = layers.some((l) => l.outcome === "market") || specialists >= T.sprawlLayers.value ? "evaluate"
      : layers.some((l) => l.outcome !== "renew") ? "conditions" : "renew";

    /* The clock. Months and years are read only as finite numbers in range. */
    const num = (v, lo, hi) => (typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi ? v : null);
    const months = num(C.monthsToNotice, 0, 120), years = num(C.termYears, 1, 10);
    const exitKnown = C.exitKnown === true ? true : C.exitKnown === false ? false : null;
    clock = { months, years, exitKnown };
    if (months === null) push("clockMissing", {}, ["clock"]);
    else if (gate === "evaluate" && months < T.evaluationMonths.value) push("noTimeEvaluate", { months }, ["clock"]);
    else if (gate === "conditions" && months < T.negotiationMonths.value) push("noTimeNegotiate", { months }, ["clock"]);
    if (exitKnown === false) push("exitUnknown", {}, ["clock"]);
    if (years !== null && years >= T.longTermYears.value && gate !== "renew") push("longTerm", { years }, ["clock"]);
  }

  const ruleOrder = Object.keys(R);
  findings.sort((a, b) => RENEWAL_SEVERITY[a.severity] - RENEWAL_SEVERITY[b.severity] || ruleOrder.indexOf(a.rule) - ruleOrder.indexOf(b.rule));

  /* The negotiation checklist: what to write into the renewal and what to demand before
     signing, in the order the findings rank. Nice-to-have gaps and the clock note stay off it. */
  const checklist = findings.filter((f) => f.rule !== "niceGap" && f.rule !== "clockMissing").map((f) => ({ rule: f.rule, severity: f.severity, action: f.action }));

  /* The next step: the contract terms first when they are unknown, a market test when the
     gate says evaluate, otherwise pricing what staying costs against the alternative. */
  let next = null;
  if (complete) {
    const tool = clock.exitKnown === false ? model.next.contract : gate === "evaluate" ? model.next.market : gate === "conditions" ? model.next.contract : model.next.price;
    next = { tool, because: clock.exitKnown === false ? "exit" : gate };
  }

  return {
    model: model.id, version: model.version, kind: "renewal", complete, answered, total: items.length,
    items, layers, gate, clock, findings, checklist, next,
    bySeverity: Object.fromEntries(Object.keys(RENEWAL_SEVERITY).map((s) => [s, findings.filter((f) => f.severity === s).length])),
  };
}
/* @engine-end */

export { renewalVars, renewalNeeds, scoreRenewal };
