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
// The numeric reader below matches the local n() in each adopting tool exactly,
// so moving a tool onto this module changes no arithmetic.

const guardNum = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
/* Rounded to six places so a stored 1.15 records as 115, not 114.99999999999999. */
const toDisplay = (x, factor) => Math.round(x * factor * 1e6) / 1e6;

export function createGuards() {
  const guards = [];
  const guard = (label, raw, min, max, unit) => {
    const v = guardNum(raw);
    const c = Math.max(min, max === null ? v : Math.min(max, v));
    if (c !== v) guards.push({ label, entered: v, used: c, unit: unit || "" });
    return c;
  };
  const scaled = (label, raw, min, max, unit, factor) => {
    const v = guardNum(raw);
    const lo = min === null ? -Infinity : min / factor, hi = max === null ? Infinity : max / factor;
    const c = Math.max(lo, Math.min(hi, v));
    if (c !== v) guards.push({ label, entered: toDisplay(v, factor), used: toDisplay(c, factor), unit: unit || "" });
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
  if (g.unit !== "$") return `${v}${g.unit}`;
  return (v < 0 ? "-$" : "$") + Math.abs(v);
};

export const guardLine = (g) => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`;
