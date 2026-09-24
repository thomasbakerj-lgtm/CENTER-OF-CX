/* shrinkage.js
 *
 * The engine for the Shrinkage Planner. Every category is entered as a percent of paid
 * hours, so the categories add: total shrinkage is their sum, capped below 100% because
 * scheduling divides by what is left. Two facts follow from the total. From the roster:
 * the agents on the queue at any moment is the roster times one minus shrinkage. From the
 * need: to keep a given number on the queue, schedule that number divided by one minus
 * shrinkage, rounded up. The paid time off the queue is priced at the loaded wage, as a
 * fact about where paid hours go; it is never a saving.
 *
 * Every constant is passed in (P), read by the caller from the registry, so the harness can
 * slice this region and run it with the same values the page shows.
 */

/* @engine-start */
const SHRINK_PLANNED = [
  ["breaks", "Breaks"],
  ["coaching", "Coaching and 1:1s"],
  ["training", "Training"],
  ["meetings", "Team meetings"],
  ["pto", "PTO and vacation"],
];
const SHRINK_UNPLANNED = [
  ["systemDown", "System downtime"],
  ["absenteeism", "Absenteeism"],
  ["lateAdherence", "Late and out of adherence"],
];

function shrinkPosition(s, R) {
  return s > R.high ? "above" : s < R.low ? "below" : "within";
}

function runShrinkage(v, P) {
  const cats = [
    ...SHRINK_PLANNED.map(([k, name]) => ({ key: k, name, type: "planned", pct: v[k] })),
    ...SHRINK_UNPLANNED.map(([k, name]) => ({ key: k, name, type: "unplanned", pct: v[k] })),
  ];
  /* Sums are rounded to a millionth of a point, far below any entered precision, so the
     order of addition can never move a total across a line (8.9 + 3.1 + ... is 35, and
     never 35.00000000000001). */
  const tidy = (x) => Math.round(x * 1e6) / 1e6;
  const plannedPct = tidy(cats.filter((c) => c.type === "planned").reduce((a, c) => a + c.pct, 0));
  const unplannedPct = tidy(cats.filter((c) => c.type === "unplanned").reduce((a, c) => a + c.pct, 0));
  const rawPct = tidy(plannedPct + unplannedPct);
  /* No plan can lose all of its paid time and still schedule anyone, so the total stops
     at the cap and the correction is disclosed by the caller. */
  const capped = rawPct > P.maxTotal;
  const totalPct = capped ? P.maxTotal : rawPct;
  const scale = rawPct > 0 ? totalPct / rawPct : 0;
  const s = totalPct / 100;
  /* What is left is taken from the entered percent, (100 − total) ÷ 100, so 780 agents at
     77.5% keep 175.5 on the queue, the value the previous tool rounded. */
  const avail = (100 - totalPct) / 100;

  const onQueue = v.agents * (100 - totalPct) / 100;
  const offQueue = v.agents * s;
  const hourValue = v.hourlyRate * P.hoursYear * P.load;
  const offQueueValue = offQueue * hourValue;
  const plannedValue = v.agents * (plannedPct * scale / 100) * hourValue;
  const unplannedValue = v.agents * (unplannedPct * scale / 100) * hourValue;
  const pointAgents = v.agents / 100;
  const pointValue = pointAgents * hourValue;

  const schedule = v.needed > 0 ? Math.ceil(v.needed / avail - 1e-9) : 0;
  const rosterGap = schedule - v.agents;
  const largest = cats.reduce((m, c) => (c.pct > m.pct ? c : m), cats[0]);

  return {
    cats, plannedPct, unplannedPct, rawPct, capped, totalPct, s, avail,
    onQueue, onQueueRounded: Math.round(onQueue), offQueue, hourValue,
    offQueueValue, plannedValue, unplannedValue, pointAgents, pointValue,
    schedule, rosterGap, largest,
    position: shrinkPosition(s, P.range),
    unplannedLarger: unplannedPct > plannedPct,
  };
}
/* @engine-end */

export { SHRINK_PLANNED, SHRINK_UNPLANNED, shrinkPosition, runShrinkage };
