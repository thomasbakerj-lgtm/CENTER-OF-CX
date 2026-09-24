/* rfp.js
 *
 * The engine for the RFP model (kind "rfp", src/lib/rubrics/rfpBuilder.js). It builds the
 * active requirement set from the buyer's vertical, size, focus areas and priorities, then
 * scores each vendor's responses under the published rules and writes the analyst read:
 * which vendors meet every must-have, where the choice is decided, what to verify in each
 * demo, and what to clarify. It orders only the vendors the buyer entered, on the buyer's
 * data, and shows a tie wherever the score cannot decide.
 */

/* @engine-start */
const RFP_SEVERITY = { critical: 0, high: 1, medium: 2, info: 3 };

function rfpFill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : String(vars[k])));
}

/* The focus tags in force: the ones chosen, plus the vertical's own tag, plus "all". The
   vertical tag is derived, so a link never loses the requirements its vertical adds. */
function rfpTags(model, state) {
  const chosen = Array.isArray(state.activeTags) ? state.activeTags.filter((t) => model.tags.some((f) => f.id === t)) : [];
  const v = state.vertical === "Healthcare" ? ["healthcare"] : state.vertical === "Government" ? ["government"] : [];
  return [...new Set(["all", ...chosen, ...v])];
}

function rfpRequirements(model, state) {
  const tags = rfpTags(model, state);
  const pri = state.reqs && typeof state.reqs === "object" ? state.reqs : {};
  const ok = (p) => model.priorities.some((x) => x.id === p);
  const out = [];
  for (const l of model.layers) l.reqs.forEach((r, i) => {
    if (!r.tags.some((t) => tags.includes(t))) return;
    const key = `${l.n}-${i}`;
    out.push({ key, layer: l.n, layerName: l.name, text: r.text, priority: Object.prototype.hasOwnProperty.call(pri, key) && ok(pri[key]) ? pri[key] : r.priority });
  });
  (model.verticalReqs[state.vertical] || []).forEach((text, i) => {
    const key = `v-${i}`;
    out.push({ key, layer: 0, layerName: (state.vertical || "") + " specific", text, priority: Object.prototype.hasOwnProperty.call(pri, key) && ok(pri[key]) ? pri[key] : "must" });
  });
  return out;
}

function scoreRfp(model, state) {
  const src = state && typeof state === "object" ? state : {};
  const reqs = rfpRequirements(model, src);
  const W = { ...model.weights };
  if (src.weights && typeof src.weights === "object") for (const p of model.priorities) {
    const w = src.weights[p.id];
    if (typeof w === "number" && Number.isFinite(w) && w >= 0 && w <= 10) W[p.id] = w;
  }
  const RESP = Object.fromEntries(model.responses.map((r) => [r.id, r]));
  /* A vendor keeps its slot index, so its responses stay attached if an earlier slot is blank. */
  const slots = (Array.isArray(src.vendors) ? src.vendors : []).slice(0, model.thresholds.maxVendors.value)
    .map((v, vi) => ({ name: typeof v === "string" ? v.trim().slice(0, 60) : "", vi })).filter((x) => x.name);
  const respOf = (vi) => (src.responses && src.responses[vi] && typeof src.responses[vi] === "object" ? src.responses[vi] : {});
  const verOf = (vi) => (src.verified && src.verified[vi] && typeof src.verified[vi] === "object" ? src.verified[vi] : {});
  const counts = Object.fromEntries(model.priorities.map((p) => [p.id, reqs.filter((r) => r.priority === p.id).length]));

  const findings = [];
  const push = (rule, vars, extra) => findings.push({ rule, severity: model.rules[rule].severity, title: model.rules[rule].title, action: rfpFill(model.rules[rule].action, { tieMargin: model.thresholds.tieMargin.value, ...vars }), ...extra });

  const vendors = slots.map(({ name, vi }) => {
    const R0 = respOf(vi), V0 = verOf(vi);
    let points = 0, possible = 0;
    const cells = reqs.map((r) => {
      const s = Object.prototype.hasOwnProperty.call(R0, r.key) && RESP[R0[r.key]] ? R0[r.key] : null;
      const verified = s !== null && RESP[s].meets && V0[r.key] === true;
      if (s !== null) { points += W[r.priority] * RESP[s].credit; possible += W[r.priority]; }
      return { key: r.key, priority: r.priority, response: s, verified };
    });
    const musts = cells.filter((c) => c.priority === "must");
    const by = (fn) => musts.filter(fn).map((c) => reqs.find((r) => r.key === c.key));
    const unmet = by((c) => c.response === "no");
    const notGA = by((c) => c.response === "preview" || c.response === "roadmap");
    const dependent = by((c) => c.response === "partner");
    const unverified = by((c) => (c.response === "ga" || c.response === "addon") && !c.verified);
    const open = cells.filter((c) => c.response === null).map((c) => reqs.find((r) => r.key === c.key));
    const addons = cells.filter((c) => c.response === "addon").length;
    const coverage = possible > 0 ? (points / possible) * 100 : null;
    const openMust = open.filter((r) => r.priority === "must").length;
    const status = unmet.length ? "unmet" : openMust ? "clarify" : notGA.length ? "conditional" : "meets";
    return { name, index: vi, cells, coverage, answered: cells.filter((c) => c.response !== null).length, unmet, notGA, dependent, unverified, open, openMust, addons, status };
  });

  for (const v of vendors) {
    for (const r of v.unmet) push("unmet", { vendor: v.name, req: r.text }, { vendor: v.index, req: r.key });
    for (const r of v.notGA) push("notGA", { vendor: v.name, req: r.text }, { vendor: v.index, req: r.key });
    for (const r of v.dependent) push("dependent", { vendor: v.name, req: r.text }, { vendor: v.index, req: r.key });
    if (v.open.length) push("clarify", { vendor: v.name, count: v.open.length, req: v.open[0].text }, { vendor: v.index });
    if (v.unverified.length) push("verify", { vendor: v.name, count: v.unverified.length, req: v.unverified[0].text }, { vendor: v.index });
    if (v.addons) push("addons", { vendor: v.name, count: v.addons }, { vendor: v.index });
  }

  /* The order: only vendors that meet or conditionally meet every answered must-have and
     have no open must-have, by weighted coverage. Neighbours within the tie margin share a
     position. Everyone else is listed with the reason they are not ordered. */
  const orderable = vendors.filter((v) => (v.status === "meets" || v.status === "conditional") && v.coverage !== null)
    .sort((a, b) => b.coverage - a.coverage || a.index - b.index);
  const order = [];
  orderable.forEach((v, i) => {
    const prev = orderable[i - 1];
    const tied = prev && prev.coverage - v.coverage <= model.thresholds.tieMargin.value;
    order.push({ vendor: v.index, name: v.name, coverage: v.coverage, position: tied ? order[i - 1].position : i + 1, tied: !!tied });
    if (tied) push("tie", { a: prev.name, b: v.name, gap: (prev.coverage - v.coverage).toFixed(1) }, { vendor: v.index });
  });
  const notOrdered = vendors.filter((v) => !orderable.includes(v)).map((v) => ({ vendor: v.index, name: v.name, reason: v.status === "unmet" ? "misses a must-have" : v.openMust ? "has must-haves to clarify" : "has no answered requirement" }));

  /* Where the choice is decided: must-haves some vendors meet with a generally available
     capability and others do not. Layers where no vendor meets every must-have. */
  const deciders = vendors.length < 2 ? [] : reqs.filter((r) => r.priority === "must").filter((r) => {
    const s = vendors.map((v) => v.cells.find((c) => c.key === r.key).response);
    const met = s.filter((x) => x === "ga" || x === "addon").length;
    return met > 0 && met < vendors.length && s.every((x) => x !== null);
  });
  if (deciders.length) push("decider", { count: deciders.length, req: deciders[0].text });
  const layerIds = [...new Set(reqs.filter((r) => r.priority === "must").map((r) => r.layer))];
  const commonGaps = vendors.length === 0 ? [] : layerIds.filter((n) => vendors.every((v) => v.cells.some((c) => c.priority === "must" && reqs.find((r) => r.key === c.key).layer === n && c.response !== null && c.response !== "ga" && c.response !== "addon")));
  for (const n of commonGaps) push("commonGap", { layer: (reqs.find((r) => r.layer === n) || {}).layerName }, { layer: n });

  const order2 = Object.keys(model.rules);
  findings.sort((a, b) => RFP_SEVERITY[a.severity] - RFP_SEVERITY[b.severity] || order2.indexOf(a.rule) - order2.indexOf(b.rule) || (a.vendor ?? -1) - (b.vendor ?? -1));

  /* The next step: before any vendor is scored, Vendor Match for a starting list; with a
     layer no vendor covers, the renewal gate's specialist view; with add-ons to price,
     License Gap; with an ordered lead, its contract; otherwise clarify and verify. */
  const next = vendors.length === 0 ? model.next.match
    : commonGaps.length ? model.next.specialist
    : vendors.some((v) => v.addons) ? model.next.addons
    : order.length ? model.next.contract : model.next.price;

  return { model: model.id, version: model.version, kind: "rfp", requirements: reqs, counts, weights: W, vendors, order, notOrdered, deciders: deciders.map((r) => r.key), commonGaps, findings, next,
    bySeverity: Object.fromEntries(Object.keys(RFP_SEVERITY).map((s) => [s, findings.filter((f) => f.severity === s).length])) };
}
/* @engine-end */

export { rfpTags, rfpRequirements, scoreRfp };
