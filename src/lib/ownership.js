/* ownership.js
 *
 * The engine for ownership models (kind "ownership"), such as Governance & Operating
 * Model. It reads a map of accountable roles and a map of contributing roles, keyed
 * `${domainIndex}-${itemIndex}` with role indexes, and returns the findings the model's
 * published rules raise. It never scores: an operating model is not an average.
 *
 * Every finding names the rule that raised it, its severity and the decisions behind it,
 * so a reader or the harness can trace each line to the assignments that produced it.
 */

/* @engine-start */
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, info: 3 };

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : String(vars[k])));
}

function scoreOwnership(model, state) {
  const roles = model.roles;
  const validRole = (v) => Number.isInteger(v) && v >= 0 && v < roles.length;
  const src = state && typeof state === "object" ? state : {};
  const readMap = (m) => (m && typeof m === "object" ? m : {});
  const P = readMap(src.primary), S = readMap(src.secondary);

  const items = [];
  model.domains.forEach((dom, di) => dom.items.forEach((it, ii) => {
    const key = `${di}-${ii}`;
    const p = Object.prototype.hasOwnProperty.call(P, key) && validRole(P[key]) ? P[key] : null;
    const s0 = Object.prototype.hasOwnProperty.call(S, key) && validRole(S[key]) ? S[key] : null;
    const s = p !== null && s0 !== null && s0 !== p ? s0 : null;
    items.push({ key, di, ii, domain: dom.id, domainName: dom.name, text: it.text, common: it.common, involve: it.involve || [], primary: p, secondary: s });
  }));

  const assigned = items.filter((x) => x.primary !== null).length;
  const ready = assigned >= model.minAssigned;
  const counts = roles.map((r, ri) => ({
    role: r.id, label: r.label,
    primary: items.filter((x) => x.primary === ri).length,
    secondary: items.filter((x) => x.secondary === ri).length,
  }));
  const bottleneckAt = Math.ceil((2 * items.length) / roles.length);
  const roleIndex = (id) => roles.findIndex((r) => r.id === id);
  const label = (ri) => roles[ri].label;

  const findings = [];
  if (ready) {
    const R = model.rules;
    const push = (rule, vars, trace, extra) => findings.push({ rule, severity: R[rule].severity, title: R[rule].title, action: fill(R[rule].action, vars), trace, ...extra });
    for (const x of items) {
      if (x.primary === null) { push("unowned", { item: x.text }, [x.key], { domain: x.domain, item: x.key }); continue; }
      for (const entry of x.involve) {
        const need = typeof entry === "string" ? entry : entry.role;
        const ni = roleIndex(need);
        if (x.primary !== ni && x.secondary !== ni) {
          push("involve", { item: x.text, role: label(ni) }, [x.key], { domain: x.domain, item: x.key, role: need });
          if (typeof entry !== "string" && entry.severity) findings[findings.length - 1].severity = entry.severity;
        }
      }
    }
    counts.forEach((c, ri) => {
      if (c.primary >= bottleneckAt) push("bottleneck", { role: c.label, count: c.primary }, items.filter((x) => x.primary === ri).map((x) => x.key), { role: c.role });
    });
    counts.forEach((c, ri) => {
      if (c.primary === 0 && c.secondary >= model.advisoryMin) push("advisory", { role: c.label }, items.filter((x) => x.secondary === ri).map((x) => x.key), { role: c.role });
    });
    model.domains.forEach((dom) => {
      const owners = new Set(items.filter((x) => x.domain === dom.id && x.primary !== null).map((x) => x.primary));
      if (owners.size >= model.fragmentedMin) push("fragmented", { domain: dom.name }, items.filter((x) => x.domain === dom.id && x.primary !== null).map((x) => x.key), { domain: dom.id });
    });
    for (const x of items) {
      if (x.primary !== null && x.primary !== roleIndex(x.common)) push("divergence", { item: x.text, role: label(x.primary), common: label(roleIndex(x.common)) }, [x.key], { domain: x.domain, item: x.key });
    }
  }

  /* Severity first, then the order the rules are published in, then the model's order,
     so the list is deterministic and its first line is the most serious on its own terms. */
  const ruleOrder = Object.keys(model.rules);
  const pos = (f) => { const k = f.trace[0]; const x = items.find((i) => i.key === k); return x ? x.di * 100 + x.ii : 9999; };
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || ruleOrder.indexOf(a.rule) - ruleOrder.indexOf(b.rule) || pos(a) - pos(b));

  const serious = findings.filter((f) => f.severity === "critical" || f.severity === "high");
  const inMeet = serious.filter((f) => f.trace.some((k) => model.next.domains.includes(items.find((i) => i.key === k).domain))).length;
  const nextTool = !ready ? null : serious.length && inMeet * 2 >= serious.length ? model.next.cxIt : model.next.otherwise;
  const nextDiagnostic = nextTool ? { tool: nextTool, because: nextTool === model.next.cxIt ? "cx-it" : "sequence", serious: serious.length, inMeet } : null;

  return {
    model: model.id, version: model.version, kind: "ownership", ready, assigned, total: items.length,
    items, counts, bottleneckAt, findings, nextDiagnostic,
    bySeverity: Object.fromEntries(Object.keys(SEVERITY_ORDER).map((s) => [s, findings.filter((f) => f.severity === s).length])),
  };
}
/* @engine-end */

export { scoreOwnership };
