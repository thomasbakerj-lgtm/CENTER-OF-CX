// src/lib/metrics.js
// The Center of CX - shared metric contract for the cross-tool data rail.
//
// Why this exists: a tool once published fcr as 80 (a percent) onto a rail whose
// contract is a fraction (0.80). Downstream that produced a 6500% FCR ceiling and
// repeat volume above total volume. Naked primitives without a unit contract are how
// a suite rots. This module is the single source of truth for what each shared metric
// MEANS, and it normalizes at the door so bad units cannot travel.
//
// The contract rule, stated once: every RATE on the rail is a FRACTION in [0, 1].
// A metric that is genuinely 1% must be published as 0.01, never as 1. Values above 1
// (and up to 100) are treated as a percent and auto-corrected to a fraction. Above 100
// or below 0 is invalid and is never published.
//
// Integration is two lines per tool:
//   Publisher:  publishToolResult(id, normalizeForPublish(primitives, { sourceTool: id }).clean)
//   Puller:     const { value, flag, confidenceImpact } = normalizeOnPull("fcr", getPrimitive("fcr"))
// The registry does not import toolData, so there is no circular dependency. toolData
// can later call normalizeForPublish internally to make the whole rail self-healing.

const RATE = { kind: "rate", canonicalUnit: "fraction", displayUnit: "percent", validRange: [0, 1] };
const CURRENCY = { kind: "currency", canonicalUnit: "currency", validRange: [0, Infinity] };
const COUNT = { kind: "count", canonicalUnit: "count", validRange: [0, Infinity], integer: true };
const PASS = { kind: "passthrough" };

// Canonical primitives that flow between tools. Add here, not ad hoc in tools.
export const metricRegistry = {
  // Rates (fraction canonical, percent auto-corrected)
  fcr: { ...RATE, label: "First contact resolution" },
  targetFCR: { ...RATE, label: "Target FCR" },
  realisticDeflectionRate: { ...RATE, label: "Realistic deflection rate" },
  repeatContactShare: { ...RATE, label: "Repeat contact share of volume" },
  containmentRate: { ...RATE, label: "Self-service containment" },
  attritionRate: { ...RATE, label: "Agent attrition rate" },
  occupancy: { ...RATE, label: "Agent occupancy" },
  shrinkage: { ...RATE, label: "Shrinkage" },
  adherence: { ...RATE, label: "Schedule adherence" },
  transferRate: { ...RATE, label: "Transfer rate" },
  abandonRate: { ...RATE, label: "Abandon rate" },

  // Currency (marginal is the savings basis; loaded is a unit metric only)
  costPerContact: { ...CURRENCY, label: "Cost per contact (loaded)" },
  loadedCPC: { ...CURRENCY, label: "Loaded cost per contact" },
  marginalPerContact: { ...CURRENCY, label: "Marginal cost per contact" },
  marginalCPC: { ...CURRENCY, label: "Marginal cost per contact", alias: "marginalPerContact" },
  marginalPerMin: { ...CURRENCY, label: "Marginal cost per agent-minute" },
  costPerResolution: { ...CURRENCY, label: "Cost per resolution" },
  agentHourly: { ...CURRENCY, label: "Agent hourly wage" },
  repeatContactBurden: { ...CURRENCY, label: "Repeat contact burden (annual)" },
  controllableRepeatBurden: { ...CURRENCY, label: "Controllable repeat burden (annual)" },
  cashRealizableSavings: { ...CURRENCY, label: "Cash realizable savings (annual)" },
  repeatDemandBurdenMonthly: { ...CURRENCY, label: "Repeat demand burden (monthly)" },

  // Counts
  agents: { ...COUNT, label: "Agent seat count" },
  monthlyContacts: { ...COUNT, label: "Monthly contacts" },
  annualContacts: { ...COUNT, label: "Annual contacts" },
  repeatContactsMonthly: { ...COUNT, label: "Repeat contacts (monthly)" },

  // Enums / strings (no numeric normalization, passed through untouched)
  analystRead: { ...PASS, label: "Analyst read headline" },
  confidence: { ...PASS, label: "Confidence label" },
  grade: { ...PASS, label: "Confidence grade" },
  capacityAction: { ...PASS, label: "Capacity mechanism" },
};

function resolveSpec(key) {
  const spec = metricRegistry[key];
  if (!spec) return null;
  return spec.alias ? metricRegistry[spec.alias] || spec : spec;
}

const invalid = (label, why) => ({ value: null, status: "invalid", flag: `${label} ${why}.`, confidenceImpact: "block" });

function normalizeRate(raw, source, label) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return invalid(label, "is not numeric");
  if (num < 0) return invalid(label, "is negative and cannot be a rate");
  if (num > 100) return invalid(label, `is ${num}, which is above 100 and cannot be a rate`);
  if (num > 1) {
    const fraction = num / 100;
    return {
      value: fraction,
      status: source === "rail" ? "autocorrected_rail" : "normalized_user",
      flag: source === "rail"
        ? `${label} arrived from the rail as a whole number (${num}) and was auto-corrected to ${(fraction * 100).toFixed(1)}%. The publishing tool is emitting a percent, not a fraction. Fix it at the source.`
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

// Normalize one metric to its canonical unit.
// source: "rail" (pulled from another tool) or "user" (entered or published locally).
export function normalizeMetric(key, value, source = "rail") {
  const spec = resolveSpec(key);
  if (!spec) return { value, status: "unregistered", flag: null, confidenceImpact: null };
  if (value == null || value === "") return { value: null, status: "empty", flag: null, confidenceImpact: null };
  if (spec.kind === "rate") return normalizeRate(value, source, spec.label);
  if (spec.kind === "currency") return normalizeCurrency(value, spec.label);
  if (spec.kind === "count") return normalizeCount(value, spec.label);
  return { value, status: "passthrough", flag: null, confidenceImpact: null }; // strings/enums
}

// Publisher wrapper. Cleans an entire primitives object to canonical units before it
// touches the rail. Invalid values are dropped (never published) and reported in flags.
// Wrapping Cost per Contact's publish in this would have auto-fixed the fcr bug on its own,
// but fix the source line too, do not rely only on the net.
export function normalizeForPublish(primitives, { sourceTool } = {}) {
  const clean = {};
  const flags = [];
  for (const [k, v] of Object.entries(primitives || {})) {
    const res = normalizeMetric(k, v, "user");
    if (res.status === "invalid") { flags.push(`[${sourceTool || "publish"}] ${res.flag}`); continue; }
    if (res.status === "empty") { continue; }
    clean[k] = res.value;
    if (res.flag) flags.push(`[${sourceTool || "publish"}] ${res.flag}`);
  }
  return { clean, flags };
}

// Puller wrapper. Returns the canonical value plus any integrity flag and a confidence
// signal ("cap_planning" when a rail value had to be auto-corrected, "block" when invalid).
export function normalizeOnPull(key, rawValue, source = "rail") {
  return normalizeMetric(key, rawValue, source);
}

// Render a canonical value for display (fraction rate -> "80%", currency -> "$4.28").
export function displayValue(key, canonicalValue) {
  const spec = resolveSpec(key);
  if (!spec || canonicalValue == null) return String(canonicalValue ?? "");
  if (spec.kind === "rate") return (canonicalValue * 100).toFixed(1).replace(/\.0$/, "") + "%";
  if (spec.kind === "currency") return "$" + Number(canonicalValue).toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (spec.kind === "count") return Math.round(canonicalValue).toLocaleString();
  return String(canonicalValue);
}

// Optional richer publish object carrying unit and provenance, so pullers get metadata,
// not a naked number. Forward-looking, adopt as tools are next touched.
export function enrichForPublish(key, value, { sourceTool, confirmed = false, definition = null } = {}) {
  const spec = resolveSpec(key);
  const res = normalizeMetric(key, value, "user");
  return {
    key,
    value: res.value,
    unit: spec ? spec.canonicalUnit : "unknown",
    displayValue: displayValue(key, res.value),
    sourceTool: sourceTool || null,
    confirmed,
    definition,
    status: res.status,
  };
}

export function describe(key) {
  const spec = resolveSpec(key);
  if (!spec) return null;
  return { label: spec.label, kind: spec.kind, canonicalUnit: spec.canonicalUnit, validRange: spec.validRange };
}
