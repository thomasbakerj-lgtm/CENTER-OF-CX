/* aht.js
 *
 * The engine for AHT Decomposition. Handle time is the sum of its components: talk, hold,
 * after-call work, transfer, knowledge search and system time. That is arithmetic. On top of
 * it the tool models initiative levers. Each lever removes a share of the components it
 * targets; the shares are labelled heuristics the buyer edits, and a lever counts toward the
 * combined figure only when the buyer turns it on. Two levers on the same component combine
 * multiplicatively (each removes its share of what the other leaves), so no component can
 * fall below zero and no second of it is counted twice.
 *
 * Seconds saved become agent hours only with a volume, and agent hours are capacity. They
 * become cash only through an action such as fewer hires or less overtime, which this tool
 * does not choose.
 */

/* @engine-start */
const AHT_COMPONENTS = ["talk", "hold", "wrap", "transfer", "search", "admin"];
const AHT_LEVERS = [
  { id: "summarization", name: "Automatic call summaries", targets: ["wrap"] },
  { id: "knowledge", name: "Knowledge surfaced in the contact", targets: ["search", "hold"] },
  { id: "desktop", name: "One agent desktop", targets: ["admin", "hold"] },
  { id: "routing", name: "Right agent first time", targets: ["transfer", "talk"] },
];

function runAHT(v) {
  const t = v.values;
  const total = AHT_COMPONENTS.reduce((a, c) => a + t[c], 0);
  const share = (x) => (total > 0 ? x / total : 0);
  const shares = Object.fromEntries(AHT_COMPONENTS.map((c) => [c, share(t[c])]));
  const nonTalk = total - t.talk;
  const hoursPerSecond = (v.contacts * 12) / 3600;

  const levers = AHT_LEVERS.map((L) => {
    const cfg = v.levers[L.id];
    const saved = L.targets.reduce((a, c) => a + t[c] * (cfg[c] / 100), 0);
    return {
      id: L.id, name: L.name, targets: L.targets, on: cfg.on, pcts: Object.fromEntries(L.targets.map((c) => [c, cfg[c]])),
      saved, newAHT: total - saved, savedPct: share(saved), hours: saved * hoursPerSecond,
    };
  });

  /* Combined: each component keeps the product of what every selected lever leaves of it. */
  const left = Object.fromEntries(AHT_COMPONENTS.map((c) => [c, 1]));
  for (const L of levers) if (L.on) for (const c of L.targets) left[c] *= 1 - L.pcts[c] / 100;
  const combinedNew = AHT_COMPONENTS.reduce((a, c) => a + t[c] * left[c], 0);
  const combinedSaved = total - combinedNew;
  const selected = levers.filter((L) => L.on).length;

  return {
    total, shares, talkShare: shares.talk, nonTalk, nonTalkShare: share(nonTalk),
    levers, selected, combinedNew, combinedSaved, combinedSavedPct: share(combinedSaved),
    combinedHours: combinedSaved * hoursPerSecond, left,
    largestNonTalk: AHT_COMPONENTS.filter((c) => c !== "talk").reduce((m, c) => (t[c] > t[m] ? c : m), "hold"),
  };
}
/* @engine-end */

export { AHT_COMPONENTS, AHT_LEVERS, runAHT };
