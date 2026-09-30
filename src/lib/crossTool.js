// src/lib/crossTool.js
//
// Where two tools answer the same question with different models (enterprise audit, 30 September 2026; TB: "side by side
// and why"). Pure arithmetic for a display panel: each function takes the reader's inputs from the tool they are on and
// returns both tools' figures with the reasons they differ. Display only: no tool engine, flag, grade or rail value reads
// anything here, and each row that stands for the current tool must equal that tool's own figure (crosstool.test.mjs).

/* Repeat contacts. Cost per Contact asks for M, the contacts an unresolved issue takes in all, so every issue costs
   C = f + (1 - f) x M contacts and repeats are (C - 1) / C of handled volume. FCR Leakage picks a model instead: one
   callback (each unresolved issue comes back once, the same as M = 2) or geometric (a callback can fail too, the same as
   M = (1 + f) / f), and it prices each repeat at marginal cost times its repeat complexity multiplier. */
export const shareFromM = (f, m) => { const c = f + (1 - f) * m; return c > 0 ? Math.max(0, (c - 1) / c) : 0; };
export const shareOneCallback = (f) => (1 - f) / (2 - f);
export const shareGeometric = (f) => 1 - f;
export const geometricM = (f) => (f > 0 ? (1 + f) / f : null);

/**
 * @param {object} p fcr (0 to 1), contacts (a month, handled), marginal (per contact), mult (FCR Leakage's repeat
 *   complexity multiplier; Cost per Contact uses none), m (Cost per Contact's contacts per unresolved issue, if known),
 *   current ("cpc" or "one" or "geometric": which row is the page's own figure).
 * @returns {{ rows: Array<{ id, tool, label, m, share, repeats, yearly, own }>, reasons: string[] } | null}
 */
export function repeatSideBySide({ fcr, contacts, marginal, mult = 1, m = null, current }) {
  if (![fcr, contacts, marginal, mult].every(Number.isFinite) || fcr <= 0 || fcr > 1 || contacts < 0 || marginal < 0 || mult < 0) return null;
  const row = (id, tool, label, share, price, mm) => {
    const repeats = contacts * share;
    return { id, tool, label, m: mm, share, repeats, yearly: repeats * price * 12, own: id === current };
  };
  const rows = [];
  if (Number.isFinite(m) && m >= 1) rows.push(row("cpc", "Cost per Contact", `Your M of ${+m.toFixed(2)} contacts per unresolved issue, each repeat at marginal cost`, shareFromM(fcr, m), marginal, m));
  rows.push(row("one", "FCR Leakage", "One callback: each unresolved issue comes back once (M of 2)", shareOneCallback(fcr), marginal * mult, 2));
  const gm = geometricM(fcr);
  rows.push(row("geometric", "FCR Leakage", `Geometric: a callback can fail too (M of ${gm ? +gm.toFixed(2) : "n/a"})`, shareGeometric(fcr), marginal * mult, gm));
  const reasons = [
    "The tools agree on first contact resolution and on volume. They differ on what an unresolved issue does next: Cost per Contact asks you how many contacts it takes in all (M), and FCR Leakage picks a model, where one callback is the same as an M of 2 and geometric the same as an M of 1 plus 1 over your FCR.",
    mult === 1
      ? "Both price a repeat at your marginal cost here, because the repeat complexity multiplier is 1.0."
      : `FCR Leakage also prices each repeat at ${+mult.toFixed(2)} times marginal cost (its repeat complexity multiplier), because repeats often run longer; Cost per Contact prices every repeat at marginal cost.`,
    "Use the row whose model matches what your own data shows about repeat contacts. Neither is a saving: both are the cost of all repeat demand, and a saving needs an action that removes it.",
  ];
  return { rows, reasons };
}

/* Reaching an occupancy target. Occupancy Risk counts the agents who must be on the phone (workload over the target),
   priced at wage plus benefits. Staffing counts scheduled FTE: Erlang C agents grossed up for shrinkage (time paid but
   off the phones), priced fully loaded (benefits, supervision, seats and technology) or at your TCO figure. */

/**
 * From the Occupancy Risk page: the page's figure, then the same agents the way Staffing would count and price them
 * across the shared shrinkage planning range.
 */
export function occupancyAsStaffing({ extraAgents, wage, loadBenefits, loadFull, hoursYear, shrinkLow, shrinkHigh }) {
  if (![extraAgents, wage, loadBenefits, loadFull, hoursYear, shrinkLow, shrinkHigh].every(Number.isFinite) || extraAgents < 0 || shrinkHigh >= 1) return null;
  const own = extraAgents * wage * hoursYear * loadBenefits;
  const fteLow = extraAgents / (1 - shrinkLow), fteHigh = extraAgents / (1 - shrinkHigh);
  const perFte = wage * hoursYear * loadFull;
  return {
    own: { agents: extraAgents, yearly: own },
    staffing: { fteLow, fteHigh, yearlyLow: fteLow * perFte, yearlyHigh: fteHigh * perFte },
    reasons: occupancyReasons(loadBenefits, loadFull, shrinkLow, shrinkHigh),
  };
}

/** From the Staffing page: the page's figure, then the same added agents the way Occupancy Risk counts and prices them. */
export function staffingAsOccupancy({ deltaAgents, deltaFte, perAgentMonth, wage, loadBenefits, loadFull, hoursYear, shrink }) {
  if (![deltaAgents, deltaFte, perAgentMonth, wage, loadBenefits, hoursYear].every(Number.isFinite) || deltaAgents < 0 || deltaFte < 0) return null;
  return {
    own: { fte: deltaFte, yearly: deltaFte * perAgentMonth * 12 },
    occupancy: { agents: deltaAgents, yearly: deltaAgents * wage * hoursYear * loadBenefits },
    reasons: occupancyReasons(loadBenefits, loadFull, shrink, shrink),
  };
}

function occupancyReasons(loadBenefits, loadFull, sLow, sHigh) {
  const pct = (x) => Math.round(x * 100);
  const range = sLow === sHigh ? `${pct(sLow)}%` : `${pct(sLow)} to ${pct(sHigh)}%`;
  return [
    `Staffing counts scheduled FTE: the agents on the phone grossed up for shrinkage, the paid time agents spend off the phones (${range} here). Occupancy Risk counts only the agents who must be on the phone.`,
    `Staffing prices an FTE fully loaded at ${loadFull} times wage, or at your own TCO figure: benefits, supervision, seats and technology. Occupancy Risk prices an agent at wage plus benefits, ${loadBenefits} times wage.`,
    "Staffing sizes agents with Erlang C against your service level and then holds the occupancy ceiling; Occupancy Risk divides the workload by the target and compares it with the agents you have today, so the starting point can differ too.",
    "Use Staffing's figure for a budget, since it carries the whole cost of an added seat. Use Occupancy Risk's to see the agent time the target needs.",
  ];
}

/** "$18.6M a year": one money format for the panel, rounded to what the models can support. */
export function perYear(n) {
  if (!Number.isFinite(n)) return "n/a";
  const a = Math.abs(n);
  const s = a >= 1e6 ? `$${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `$${Math.round(a / 1e3).toLocaleString("en-US")}K` : `$${Math.round(a).toLocaleString("en-US")}`;
  return (n < 0 ? "-" : "") + s + " a year";
}
