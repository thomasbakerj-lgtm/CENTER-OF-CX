// src/lib/guards.js
// The Center of CX - one input guard and one disclosure renderer for every tool.
//
// WHY THIS EXISTS
//
// Scenario links are applied to tool state with Object.assign, so any field can
// arrive carrying any value. A negative headcount or a shrinkage of 140 percent
// does not throw. It produces a fully formed document built on a physically
// impossible number. The doctrine rule is to clamp at the engine boundary, record
// what was entered beside what was used, and surface every correction in the
// document so a reader never sees a figure the engine did not run.
//
// WHY ONE MODULE
//
// Cost per Contact and Attrition carried byte-identical local copies of this
// logic, and the TCO and Staffing guard layer would have made four. Local copies
// drift: one of them once printed $-12 on screen and -12$ in the PDF for the same
// correction. Duplicated slicing logic across harnesses already cost a debt cycle.
// One definition means one rule, tested once.
//
// CONTRACT
//
// createGuards() returns a fresh guards array plus the recorders that fill it.
// guard clamps a value held in the unit it is displayed in. scaled clamps a value
// held in one unit and displayed in another, such as a share stored as 0.30 and
// shown as 30%: bounds and the record are in display units, the return value is in
// stored units. pick substitutes an enum value that is not in its table.
// A guard record is { label, entered, used, unit }. unit "$" renders as money with
// the sign leading the symbol; any other unit renders as a suffix; "" renders bare.
// guardVal renders one side of a record. guardLine renders the standard sentence.
// Every disclosure path in a tool must route through these, never through its own
// template literal.
//
// The numeric reader below matches the local n() in each adopting tool for every
// finite input, so moving a tool onto this module changes no arithmetic. It departs
// in one place: a non-finite parse (Infinity, -Infinity) reads as 0, the same as NaN,
// because no contact center quantity is infinite.
//
// SILENT SUBSTITUTION
//
// A blank, a word, a null, or a partial number such as "12abc" or "1,200" used to
// read as 0 or as a truncated value with no record when the result sat inside the
// bounds. Doctrine names zero substitution without disclosure as a defect. Every
// recorder now tests the raw value with isCleanEntry, and a value that is not a clean
// finite number is always recorded, with the raw text as entered, whether or not the
// bounds moved it. The arithmetic used for such a value is unchanged.

/* A clean entry is a finite number, or a string that is exactly one decimal number
   with an optional exponent. Hex, commas, symbols, and trailing text are not clean. */
const ENTRY = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
export const isCleanEntry = (v) => typeof v === "number" ? Number.isFinite(v)
  : typeof v === "string" && ENTRY.test(v.trim()) && Number.isFinite(Number(v.trim()));
/* How a raw value that is not clean reads in a disclosure. */
export const entryText = (v) => (v == null || (typeof v === "string" && v.trim() === "")) ? "blank"
  : typeof v === "string" ? `"${v}"` : String(v);
/* The strict parser for typed input. Thousands separators in a well-formed group are
   accepted; anything else that is not clean returns NaN so the caller can refuse it. */
const THOUSANDS = /^[-+]?\d{1,3}(,\d{3})+(\.\d*)?$/;
export const parseEntry = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v !== "string") return NaN;
  let t = v.trim();
  if (THOUSANDS.test(t)) t = t.replace(/,/g, "");
  return isCleanEntry(t) ? Number(t) : NaN;
};

const guardNum = (v) => { const p = parseFloat(v); return Number.isFinite(p) ? p : 0; };
/* Rounded to six places so a stored 1.15 records as 115, not 114.99999999999999. */
const toDisplay = (x, factor) => Math.round(x * factor * 1e6) / 1e6;

export function createGuards() {
  const guards = [];
  const guard = (label, raw, min, max, unit) => {
    const v = guardNum(raw);
    const c = Math.max(min, max === null ? v : Math.min(max, v));
    if (!isCleanEntry(raw)) guards.push({ label, entered: entryText(raw), used: c, unit: unit || "", invalid: true });
    else if (c !== v) guards.push({ label, entered: v, used: c, unit: unit || "" });
    return c;
  };
  const scaled = (label, raw, min, max, unit, factor) => {
    const v = guardNum(raw);
    const lo = min === null ? -Infinity : min / factor, hi = max === null ? Infinity : max / factor;
    const c = Math.max(lo, Math.min(hi, v));
    if (!isCleanEntry(raw)) guards.push({ label, entered: entryText(raw), used: toDisplay(c, factor), unit: unit || "", invalid: true });
    else if (c !== v) guards.push({ label, entered: toDisplay(v, factor), used: toDisplay(c, factor), unit: unit || "" });
    return c;
  };
  const pick = (label, raw, table, fallback) => {
    if (Object.prototype.hasOwnProperty.call(table, raw)) return raw;
    guards.push({ label, entered: String(raw), used: fallback, unit: "" });
    return fallback;
  };
  return { guards, guard, scaled, pick };
}

export const guardVal = (g, which) => {
  const v = g[which];
  if (which === "entered" && g.invalid) return v;
  if (g.unit !== "$") return `${v}${g.unit}`;
  return (v < 0 ? "-$" : "$") + Math.abs(v);
};

export const guardLine = (g) => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`;
