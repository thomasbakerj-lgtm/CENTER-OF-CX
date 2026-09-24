/* forecast.js
 *
 * The engine for the Forecast Accuracy Tracker. It compares forecast and actual contacts
 * interval by interval. Every measure is arithmetic on the rows:
 *   WAPE, the contacts missed in every interval (above or below) over the actual contacts,
 *     the volume-weighted error staffing is planned on. Interval accuracy is 1 minus WAPE.
 *   MAPE, the mean of each interval's percent error, shown beside WAPE because a quiet
 *     interval weighs as much as a busy one.
 *   Total-volume accuracy, the day's total against its forecast. Interval errors in
 *     opposite directions cancel in it, so it is never the headline.
 *   Bias, the day's actual over its forecast, and the tracking signal, the running sum of
 *     errors over the mean absolute error, which says whether the errors lean one way.
 * With a handle time, contacts missed become workload hours and, per interval, the agents
 * the missed workload would have kept busy (before service level and shrinkage).
 */

/* @engine-start */
function runForecast(rows, P, aht) {
  const n = rows.length;
  const err = rows.map((r) => r.actual - r.forecast);
  const totalF = rows.reduce((a, r) => a + r.forecast, 0);
  const totalA = rows.reduce((a, r) => a + r.actual, 0);
  const absErr = err.reduce((a, e) => a + Math.abs(e), 0);

  const wape = totalA > 0 ? absErr / totalA : null;
  const withActual = rows.filter((r) => r.actual > 0);
  const mape = withActual.length ? withActual.reduce((a, r) => a + Math.abs(r.actual - r.forecast) / r.actual, 0) / withActual.length : null;
  const totalAccuracy = totalF > 0 ? 1 - Math.abs(totalA - totalF) / totalF : null;
  const bias = totalF > 0 ? (totalA - totalF) / totalF : null;

  const mad = n ? absErr / n : 0;
  const sumErr = err.reduce((a, e) => a + e, 0);
  const trackingSignal = mad > 0 ? sumErr / mad : 0;
  const lean = trackingSignal > P.tsLimit ? "above" : trackingSignal < -P.tsLimit ? "below" : "none";

  const hoursPer = aht > 0 ? aht / 3600 : 0;
  const perInterval = rows.map((r, i) => ({
    i, interval: r.interval, forecast: r.forecast, actual: r.actual, err: err[i],
    pctErr: r.forecast > 0 ? err[i] / r.forecast : null,
    hours: err[i] * hoursPer,
    agents: aht > 0 ? (err[i] * aht) / (P.intervalMin * 60) : 0,
  }));
  const worst = [...perInterval].filter((x) => x.err !== 0).sort((a, b) => Math.abs(b.err) - Math.abs(a.err) || a.i - b.i).slice(0, 5);

  return {
    n, totalF, totalA, delta: totalA - totalF, absErr,
    wape, intervalAccuracy: wape === null ? null : 1 - wape, mape, mapeExcluded: n - withActual.length,
    totalAccuracy, bias, mad, sumErr, trackingSignal, lean,
    underHours: rows.reduce((a, r) => a + Math.max(0, r.actual - r.forecast), 0) * hoursPer,
    overHours: rows.reduce((a, r) => a + Math.max(0, r.forecast - r.actual), 0) * hoursPer,
    perInterval, worst,
  };
}
/* @engine-end */

export { runForecast };
