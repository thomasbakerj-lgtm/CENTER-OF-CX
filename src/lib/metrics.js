// src/lib/metrics.js
// The Center of CX. Shared metric contract for the cross-tool data rail.
//
// Why this exists: a tool once published fcr as 80 onto a rail whose contract is a
// fraction (0.80). Downstream that produced a 6500% FCR ceiling and repeat volume
// above total volume. Naked primitives without a unit contract are how a suite rots.
//
// v2 changes, earned from the rail audit of 9 July 2026:
//
//   1. ALIASES ARE REAL. v1 declared `marginalCPC: { alias: "marginalPerContact" }` but
//      resolveSpec only used the alias to fetch the SPEC. Publishing marginalCPC never
//      populated marginalPerContact, and pulling marginalCPC never found it. The alias
//      was decorative. resolveKey() now rewrites the key on both publish and pull.
//
//   2. PER RATE FRACTION CEILINGS. v1 auto-corrected any rate above 1 by dividing by 100.
//      Agent attrition of 120% a year is a real, common number. Occupancy above 100% is a
//      real understaffing signal. Under v1 both were silently destroyed (1.2 became 0.012).
//      Each rate now declares the largest value that could plausibly be a true fraction.
//
//   3. DERIVATIONS. Five tools pulled `annualContacts`. No tool published it. The fallback
//      branch `else if (ac != null) monthlyContacts = ac / 12` has never once executed.
//      Rather than force every tool to publish both, the rail derives one from the other.
//
//   4. ORPHAN DETECTION. isRegistered() plus toolData's railReport() surface any pull for a
//      key that no tool publishes. A dead pull is a defect, not a graceful degradation.
//
// The contract rule, stated once: every RATE on the rail is a FRACTION. A metric that is
// genuinely 1% must be published as 0.01, never as 1. A value above the metric's own
// fractionMax (and up to 100) is treated as a percent and auto-corrected. Above 100 or
// below 0 is invalid and never travels.
//
// Integration, two lines per tool:
//   Publisher:  publishToolResult(id, primitives)          // toolData normalizes at the door
//   Puller:     const v = getPrimitive("fcr")              // toolData resolves alias + derives
//
// metrics.js does not import toolData. No circular dependency.

const rate = (fractionMax, label) => ({
  kind: "rate",
  canonicalUnit: "fraction",
  displayUnit: "percent",
  fractionMax,
  validRange: [0, fractionMax],
  label,
});
const currency = (label) => ({ kind: "currency", canonicalUnit: "currency", validRange: [0, Infinity], label });
const count = (label) => ({ kind: "count", canonicalUnit: "count", validRange: [0, Infinity], integer: true, label });
const pass = (label) => ({ kind: "passthrough", label });

// Canonical primitives that cross tools. Add here, never ad hoc inside a tool.
// Only register what actually crosses. An unregistered key passes through untouched,
// which is the correct behavior for a tool's private outputs.
export const metricRegistry = {
  // ---- Rates. Canonical unit is a fraction. fractionMax is the largest value that
  // could honestly be a fraction rather than a mis-published percent.
  fcr: rate(1, "First contact resolution"),
  targetFCR: rate(1, "Target FCR"),
  // Share of TOTAL contact volume the bot removes. The headline deflection number.
  realisticDeflectionRate: rate(1, "Realistic deflection rate"),
  // Share of BOT-ROUTED volume that resolves in the bot. NOT the same number, and not
  // interchangeable with the one above. Channel Shift sizes its human pool from this one.
  // Publishing realisticDeflectionRate into a resolution-rate field understates bot
  // performance by a factor of the gross deflection rate. Register it so the rail can
  // enforce the unit, because an unregistered rate is a rate nobody is guarding.
  botResolutionRate: rate(1, "Bot resolution rate (of bot-routed contacts)"),
  repeatContactShare: rate(1, "Repeat contact share of volume"),
  containmentRate: rate(1, "Self-service containment"),
  transferRate: rate(1, "Transfer rate"),
  abandonRate: rate(1, "Abandon rate"),
  shrinkage: rate(1, "Shrinkage"),
  adherence: rate(1, "Schedule adherence"),
  // Annualized attrition above 100% is routine in BPO and entry-level operations.
  // 200% is the outer edge of plausibility. Above that, assume a percent was published.
  attritionRate: rate(2, "Agent attrition rate"),
  // Occupancy above 100% means the offered load exceeds staffed capacity. That is a
  // real and important signal. It must survive the rail.
  occupancy: rate(1.5, "Agent occupancy"),

  // ---- Currency. Marginal is the savings basis. Loaded is a unit metric only.
  // `costPerContact` IS the loaded figure. `loadedCPC` is a deprecated spelling of it.
  costPerContact: currency("Cost per contact (loaded)"),
  loadedCPC: { ...currency("Loaded cost per contact"), alias: "costPerContact" },
  marginalPerContact: currency("Marginal cost per contact"),
  marginalCPC: { ...currency("Marginal cost per contact"), alias: "marginalPerContact" },
  marginalPerMin: currency("Marginal cost per agent-minute"),
  costPerResolution: currency("Cost per resolution"),
  agentHourly: currency("Agent hourly wage"),
  repeatContactBurden: currency("Repeat contact burden (annual)"),
  controllableRepeatBurden: currency("Controllable repeat burden (annual)"),
  cashRealizableSavings: currency("Cash realizable savings (annual)"),
  repeatDemandBurdenMonthly: currency("Repeat demand burden (monthly)"),

  // ---- Counts
  agents: count("Agent seat count"),
  monthlyContacts: count("Monthly contacts"),
  annualContacts: count("Annual contacts"),
  repeatContactsMonthly: count("Repeat contacts (monthly)"),

  // ---- Enums and strings. No numeric normalization.
  analystRead: pass("Analyst read headline"),
  confidence: pass("Confidence label"),
  grade: pass("Confidence grade"),
  capacityAction: pass("Capacity mechanism"),
};

/** Resolve a possibly-deprecated key to its canonical name. This is the v2 fix.
 *  resolveKey("marginalCPC") === "marginalPerContact" */
export function resolveKey(key) {
  const spec = metricRegistry[key];
  return spec && spec.alias ? spec.alias : key;
}

/** Resolve a key to its canonical spec. */
export function resolveSpec(key) {
  const canonical = resolveKey(key);
  return metricRegistry[canonical] || null;
}

export function isRegistered(key) {
  return !!metricRegistry[key];
}

// ---- Derivations. A pull that can be computed from a published sibling is not a dead pull.
// Keep this list short and arithmetically exact. Never derive something that requires an
// assumption. Contacts per year is contacts per month times twelve. That is arithmetic.
// Marginal cost is not derivable from loaded cost. That would be an assumption, so it is absent.
export const derivations = {
  annualContacts: { from: "monthlyContacts", apply: (v) => v * 12 },
  monthlyContacts: { from: "annualContacts", apply: (v) => v / 12 },
};

/** Derive a canonical key from a flat snapshot. Returns undefined when not derivable. */
export function deriveFrom(key, snapshot) {
  const canonical = resolveKey(key);
  const d = derivations[canonical];
  if (!d || !snapshot) return undefined;
  const src = snapshot[d.from];
  if (src == null || !Number.isFinite(Number(src))) return undefined;
  const res = normalizeMetric(canonical, d.apply(Number(src)), "rail");
  return res.status === "invalid" ? undefined : res.value;
}

const invalid = (label, why) => ({ value: null, status: "invalid", flag: `${label} ${why}.`, confidenceImpact: "block" });

function normalizeRate(raw, source, spec) {
  const label = spec.label;
  const num = Number(raw);
  const max = spec.fractionMax;
  // A metric whose fraction can honestly reach 2.0 (attrition) can honestly be published
  // as the percent 200. The percent ceiling must scale with the fraction ceiling, or the
  // rail rejects a true 120% attrition rate as impossible. v1 hardcoded 100 and did exactly that.
  const percentMax = max * 100;
  if (!Number.isFinite(num)) return invalid(label, "is not numeric");
  if (num < 0) return invalid(label, "is negative and cannot be a rate");
  if (num > percentMax) return invalid(label, `is ${num}, which is above the ${percentMax} ceiling for this metric and cannot be a rate`);
  if (num > max) {
    const fraction = num / 100;
    if (fraction > max) return invalid(label, `is ${num}, which is implausible as either a fraction or a percent`);
    return {
      value: fraction,
      status: source === "rail" ? "autocorrected_rail" : "normalized_user",
      flag:
        source === "rail"
          ? `${label} arrived from the rail as ${num}, above the ${max} ceiling for a fraction, and was read as ${(fraction * 100).toFixed(1)}%. The publishing tool is emitting a percent. Fix it at the source.`
          : `${label} was entered as a percent (${num}) and read as ${(fraction * 100).toFixed(1)}%.`,
      confidenceImpact: source === "rail" ? "cap_planning" : null,
    };
  }
  return { value: num, status: "valid", flag: null, confidenceImpact: null };
}

function normalizeCurrency(raw, label) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return invalid(label, "is not numeric");
  if (num < 0) return invalid(label, "is negative");
  return { value: num, status: "valid", flag: null, confidenceImpact: null };
}

function normalizeCount(raw, label) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return invalid(label, "is not numeric");
  if (num < 0) return invalid(label, "is negative");
  return { value: Math.round(num), status: "valid", flag: null, confidenceImpact: null };
}

/** Normalize one metric to canonical units. Returns the CANONICAL KEY alongside the value,
 *  because an alias must be rewritten, not merely understood.
 *  source: "rail" (arrived from another tool) or "user" (entered or computed locally). */
export function normalizeMetric(key, value, source = "rail") {
  const canonicalKey = resolveKey(key);
  const spec = resolveSpec(key);
  if (!spec) return { key: canonicalKey, value, status: "unregistered", flag: null, confidenceImpact: null };
  if (value == null || value === "") return { key: canonicalKey, value: null, status: "empty", flag: null, confidenceImpact: null };

  let res;
  if (spec.kind === "rate") res = normalizeRate(value, source, spec);
  else if (spec.kind === "currency") res = normalizeCurrency(value, spec.label);
  else if (spec.kind === "count") res = normalizeCount(value, spec.label);
  else res = { value, status: "passthrough", flag: null, confidenceImpact: null };

  return { key: canonicalKey, ...res };
}

/** Publisher wrapper. Cleans an entire primitives object to canonical KEYS and canonical
 *  UNITS before it touches the rail. Invalid values are dropped and reported.
 *  Idempotent: running it twice on the same object is a no-op on the second pass. */
export function normalizeForPublish(primitives, { sourceTool } = {}) {
  const clean = {};
  const flags = [];
  for (const [k, v] of Object.entries(primitives || {})) {
    const res = normalizeMetric(k, v, "user");
    if (res.status === "invalid") { flags.push(`[${sourceTool || "publish"}] ${res.flag}`); continue; }
    if (res.status === "empty") continue;
    if (res.key !== k && clean[res.key] !== undefined) {
      flags.push(`[${sourceTool || "publish"}] ${k} and ${res.key} were both published. ${res.key} wins.`);
      continue;
    }
    clean[res.key] = res.value;
    if (res.flag) flags.push(`[${sourceTool || "publish"}] ${res.flag}`);
  }
  return { clean, flags };
}

/** Puller wrapper. Canonical value plus integrity flag plus a confidence signal.
 *  "cap_planning" when a rail value had to be auto-corrected. "block" when invalid. */
export function normalizeOnPull(key, rawValue, source = "rail") {
  return normalizeMetric(key, rawValue, source);
}

/** Render a canonical value. Rate fraction becomes "80%". Currency becomes "$4.28". */
export function displayValue(key, canonicalValue) {
  const spec = resolveSpec(key);
  if (!spec || canonicalValue == null) return String(canonicalValue ?? "");
  if (spec.kind === "rate") return (canonicalValue * 100).toFixed(1).replace(/\.0$/, "") + "%";
  if (spec.kind === "currency") return "$" + Number(canonicalValue).toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (spec.kind === "count") return Math.round(canonicalValue).toLocaleString();
  return String(canonicalValue);
}

export function describe(key) {
  const spec = resolveSpec(key);
  if (!spec) return null;
  return {
    key: resolveKey(key),
    label: spec.label,
    kind: spec.kind,
    canonicalUnit: spec.canonicalUnit,
    validRange: spec.validRange,
    fractionMax: spec.fractionMax,
  };
}
