/* adherence.js
 *
 * The engine for the Schedule Adherence Impact Calculator. Adherence is the share of
 * scheduled time agents spend doing what the schedule says; the model takes it as the
 * share of scheduled agents on the queue at any moment. For the current adherence and each
 * point of loss below it, an Erlang C queue gives the service level and average speed of
 * answer those agents produce. Erlang C is computed through the Erlang B recurrence, the
 * same form the Staffing Calculator uses, so it stays finite at any size.
 *
 * Holding the target: the fewest agents on the queue that meet the service level target,
 * divided by adherence and rounded up, is the agents to schedule. Any agents beyond the
 * roster are priced as overtime for the open hours and days entered, at the hourly rate
 * times the overtime multiplier. The multiplier opens at its registered legal minimum and
 * arrives as an input, like every other value.
 */

/* @engine-start */
const ADH_DROPS = [0, 1, 2, 3, 4, 5, 7, 10];

function erlangC(n, A) {
  const N = Math.floor(n);
  if (N <= A || N <= 0) return 1;
  let B = 1;
  for (let k = 1; k <= N; k++) B = (A * B) / (k + A * B);
  return Math.max(0, Math.min(1, (N * B) / (N - A * (1 - B))));
}

function serviceLevel(n, A, targetSec, ahtSec) {
  const N = Math.floor(n);
  if (N <= A) return 0;
  return Math.max(0, Math.min(1, 1 - erlangC(N, A) * Math.exp(-(N - A) * targetSec / ahtSec)));
}

function asa(n, A, ahtSec) {
  const N = Math.floor(n);
  if (N <= A) return null;
  return (erlangC(N, A) * ahtSec) / (N - A);
}

/* The fewest agents on the queue that meet the target, searched upward from the first
   count above the offered load. The budget grows with the square root of the load, as
   the agents a target needs above load do; a target it cannot reach returns null. */
function requiredOnQueue(A, target, targetSec, ahtSec) {
  if (A <= 0) return 0;
  const start = Math.floor(A) + 1;
  const budget = start + Math.max(2000, Math.ceil(60 * Math.sqrt(A)));
  /* The Erlang B recurrence runs once to the first candidate, then one step per candidate,
     so the search is linear in the agents it covers. */
  let B = 1;
  for (let k = 1; k <= start; k++) B = (A * B) / (k + A * B);
  for (let n = start; n < budget; n++) {
    if (n > start) B = (A * B) / (n + A * B);
    const C = Math.max(0, Math.min(1, (n * B) / (n - A * (1 - B))));
    const sl = Math.max(0, Math.min(1, 1 - C * Math.exp(-(n - A) * targetSec / ahtSec)));
    if (sl >= target) return n;
  }
  return null;
}

function runAdherence(v) {
  const A = (v.callsPerHour * v.aht) / 3600;
  const target = v.slaTarget / 100;
  const need = requiredOnQueue(A, target, v.slaTime, v.aht);
  const otRate = v.hourlyRate * v.otMultiplier;
  const rows = ADH_DROPS.map((drop) => {
    const adh = Math.max(0, v.currentAdherence - drop);
    const onQueue = Math.round(v.agents * (adh / 100));
    const sl = serviceLevel(onQueue, A, v.slaTime, v.aht);
    const wait = asa(onQueue, A, v.aht);
    const toSchedule = need === null || adh <= 0 ? null : Math.ceil((need * 100) / adh - 1e-9);
    const extra = toSchedule === null ? null : Math.max(0, toSchedule - v.agents);
    const otHours = extra === null ? null : extra * v.hoursPerDay * v.daysPerYear;
    return {
      drop, adh, onQueue, sl, asa: wait, occ: onQueue > 0 ? Math.min(1, A / onQueue) : null,
      meets: sl >= target, toSchedule, extra, otHours, otCost: otHours === null ? null : otHours * otRate,
    };
  });
  const base = rows[0];
  for (const r of rows) r.addedCost = r.otCost === null || base.otCost === null ? null : r.otCost - base.otCost;
  const firstMiss = rows.find((r) => !r.meets) || null;
  return { A, target, need, otRate, rows, base, firstMiss, row3: rows[3] };
}
/* @engine-end */

export { ADH_DROPS, erlangC, serviceLevel, asa, requiredOnQueue, runAdherence };
