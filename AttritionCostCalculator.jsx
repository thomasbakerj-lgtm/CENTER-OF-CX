import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import InfoDot from "./src/lib/InfoDot";

const NAVY = COLORS.navy, ELECTRIC = COLORS.electric, GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, MUTED = COLORS.muted;
const DEEP = "#061325", LIGHT = "#00AAFF", WARM = "#F8FAFB", SLATE = "#3A4F6A", BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const fmtK = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${Math.round(v)}`;
const fmt$ = v => "$" + Math.round(v).toLocaleString();

const DEFS = {
  benefitsLoad: "The percentage added to base wage for employer-paid benefits, payroll taxes, and overhead. The tool loads wage-paid time at this rate because you really do pay salary plus benefits while a new hire trains or ramps, not just base wage.",
  backfill: "The share of departures you actually replace. Replacement cost only exists for seats you refill: no hire means no recruiting, training, ramp, or coverage spend. Backfill therefore scales the entire replacement cycle. Seats you do not refill are a capacity decision, not a replacement cost, and are handled separately below.",
  unbackfill: "What happens to the seats you do not refill. Intended downsizing means the capacity reduction is deliberate, so it is not a turnover cost. Forced under-staffing means you are losing output you still need; that lost capacity is real but is valued in Staffing and Occupancy, not invented here, so this tool routes it rather than guessing a number.",
  marginalCash: "Cash out the door is spend that genuinely disappears when a backfilled departure is avoided: recruiting, training wages, sign-on, and overtime premium. It is credited at 100 percent in savings because you simply stop spending it.",
  capacity: "Capacity is recovered agent and supervisor time, not cash. It only becomes money if you act on it, so it is gated by a realization mechanism. With no mechanism committed, recovered capacity is worth zero in hard savings.",
  denominator: "Attrition here is separations divided by average headcount over the year. Define it before you trust it: voluntary only or total, regrettable or all, and a rolling twelve-month actual rather than a bad month annualized. Annualizing one rough month is the most common way centers accidentally inflate their own rate.",
  early: "The share of new hires who wash out before reaching productive output, usually inside the first ninety days. Their recruiting and training cash is mostly sunk with near-zero return, which makes early attrition the highest-waste and most recoverable segment. It is measured against hires, not all departures, so it can never exceed the replacement cash it is drawn from.",
  nesting: "Nesting is supervised live production right after classroom training, where the new hire handles real contacts at reduced output. The loss is the unproductive share of fully-paid time during that period.",
  ramp: "Ramp is the post-nesting stretch before a new hire reaches tenured-agent parity on AHT, QA, and FCR, not merely the point they finish training. Default to fully-productive parity, which is months not days, and value only the shortfall against full output. Ramp starts after nesting so the two never overlap.",
  vacancyMode: "Incremental to staffed plan charges only the overtime premium, because the empty seat's base wage is not being paid. Gross coverage spend charges the full overtime cost and should be used only when the departed agent's stopped payroll is credited somewhere else, or you will double count.",
  mech: "How recovered capacity converts to money. None means you keep the slack and realize zero. Avoid or slow hiring (the default) is the most common honest lever. Reduce headcount realizes the most but is the hardest commitment to make.",
  confidence: "Confidence is split into two axes. Cost basis asks whether the per-departure cost inputs are validated: estimated, from HR data, or finance-confirmed and inside the frontline band. Realization asks whether the savings can be booked: a mechanism like Reduce Overtime or Reduce Headcount makes capacity bankable, while None or Absorb Growth keeps it as planning value only. The export headlines the weaker of the two, and any hard integrity flag forces both to Directional.",
  sensitivity: "The all-in figure multiplies six uncertain inputs, and multiplying uncertainty compounds it, so the true cost is a range, not a point. The planning band tightens as you confirm inputs: about plus or minus 25 percent on estimates, 15 percent on HR data, 10 percent on finance-confirmed figures. This exists for CFO alignment: a finance team trusts a defensible range far more than a single exact number, and a lone precise figure invites a vendor or budget owner to attack one input and dismiss the whole model. The band is how the number survives scrutiny.",
  costToAchieve: "Realizable savings are shown gross, before the money you spend to actually cut attrition: pay adjustments, coaching, scheduling tools, better hiring. This exists for CFO alignment because no CFO will book a savings number without the cost to capture it. Enter the annual cost per point of reduction and the tool nets it out and shows the return, turning a scary gross figure into a fundable business case. Real programs cost more per point as you push lower (diminishing returns), so treat deep cuts as the optimistic end.",
};

const MECH_OPTS = [
  { v: 0, label: "None: keep the slack" },
  { v: 25, label: "Absorb volume growth" },
  { v: 60, label: "Reduce overtime" },
  { v: 75, label: "Avoid / slow hiring" },
  { v: 90, label: "Reduce vendor / outsourcing" },
  { v: 100, label: "Reduce headcount" },
];
const BACKFILL_OPTS = [
  { v: 100, label: "Replace all departures" },
  { v: 75, label: "Replace most (75%)" },
  { v: 50, label: "Replace some (50%)" },
  { v: 0, label: "Do not backfill" },
];
const INTENT_OPTS = [
  { v: "forced", label: "Forced under-staffing (lost capacity)" },
  { v: "downsizing", label: "Intended downsizing (deliberate)" },
];

function NumField({ label, value, onChange, suffix, hint, step = 1, min = 0, info, infoTitle, pulled }) {
  const valRef = useRef(value);
  const holdRef = useRef(null);
  useEffect(() => { valRef.current = value; }, [value]);
  const bump = dir => { const next = Math.max(min, +(Number(valRef.current) + dir * step).toFixed(4)); valRef.current = next; onChange(next); };
  const start = dir => { bump(dir); let delay = 280; const tick = () => { bump(dir); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); }; holdRef.current = setTimeout(tick, delay); };
  const stop = () => { clearTimeout(holdRef.current); holdRef.current = null; };
  const btn = { width: 26, height: 30, border: `1px solid ${BORDER}`, background: "#fff", color: SLATE, fontSize: 15, lineHeight: "1", cursor: "pointer", flexShrink: 0, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        {label}{info && <InfoDot text={info} title={infoTitle || label} />}
        {pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, letterSpacing: 0.5, padding: "1px 5px", borderRadius: 3, background: "rgba(0,136,221,0.1)" }}>PULLED</span>}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button style={{ ...btn, borderRadius: "6px 0 0 6px" }} onMouseDown={() => start(-1)} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>−</button>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 0, background: "#fff", color: NAVY, outline: "none", textAlign: "center" }} onFocus={e => e.target.style.borderColor = ELECTRIC} onBlur={e => e.target.style.borderColor = BORDER} />
        <button style={{ ...btn, borderRadius: "0 6px 6px 0" }} onMouseDown={() => start(1)} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>+</button>
        {suffix && <span style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}
function Select({ label, value, onChange, opts, info, infoTitle, align }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>{label}{info && <InfoDot text={info} title={infoTitle || label} align={align} />}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "9px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );
}
function LogoMark({ size = 34 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

export default function AttritionCostCalculator() {
  const [d, setD] = useState({
    agents: 200, attritionRate: 35, avgSalary: 38000, benefitsLoadPct: 28,
    backfillRate: 100, unbackfillIntent: "forced", earlyWashoutRate: 25,
    recruitingCost: 2500, screeningHours: 8, hrLoadedRate: 48,
    trainingWeeks: 6, trainerLoadedRate: 45, classSize: 12, signOnBonus: 0,
    nestingWeeks: 4, nestingProductivity: 50,
    rampMonths: 3, rampProductivity: 75,
    supervisorHoursPerNew: 10, supLoadedRate: 55,
    overtimePremium: 50, vacancyDays: 30, vacancyCoverageFraction: 60, vacancyMode: "incremental",
    mech: 75, evidence: "estimate", costPerPoint: 0,
  });
  const [pulled, setPulled] = useState({});
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const n = v => Number(v) || 0;

  useEffect(() => {
    const pa = getPrimitive && getPrimitive("agents");
    const ph = getPrimitive && getPrimitive("agentHourly");
    const next = {}, badge = {};
    if (pa != null && !isNaN(pa)) { next.agents = Math.round(pa); badge.agents = true; }
    if (ph != null && !isNaN(ph)) { next.avgSalary = Math.round(ph * 2080); badge.avgSalary = true; }
    if (Object.keys(next).length) { setD(p => ({ ...p, ...next })); setPulled(badge); }
  }, []);

  const departures = Math.round(n(d.agents) * (n(d.attritionRate) / 100));
  const bf = n(d.backfillRate) / 100;
  const mech = n(d.mech) / 100;
  const wageHourly = n(d.avgSalary) / 2080;
  const loadedHourly = wageHourly * (1 + n(d.benefitsLoadPct) / 100);
  const downsizing = d.unbackfillIntent === "downsizing";

  // ---- PER REPLACED DEPARTURE (the replacement cycle) ----
  const recruiting = n(d.recruitingCost) + n(d.screeningHours) * n(d.hrLoadedRate);
  const trDays = n(d.trainingWeeks) * 5;
  const training = trDays * 8 * loadedHourly + trDays * 8 * n(d.trainerLoadedRate) / Math.max(1, n(d.classSize));
  const signOn = n(d.signOnBonus);
  const vacHours = n(d.vacancyDays) * 8 * (n(d.vacancyCoverageFraction) / 100);
  const vacancy = d.vacancyMode === "gross" ? vacHours * wageHourly * (1 + n(d.overtimePremium) / 100) : vacHours * wageHourly * (n(d.overtimePremium) / 100);
  const hireCash = recruiting + training + signOn; // sunk on every hire, recoverable on early washout
  const cashPerDeparture = hireCash + vacancy;

  const nestingLoss = n(d.nestingWeeks) * 5 * 8 * loadedHourly * (1 - n(d.nestingProductivity) / 100);
  const rampLoss = n(d.rampMonths) * 22 * 8 * loadedHourly * (1 - n(d.rampProductivity) / 100);
  const supervisorBurden = n(d.supervisorHoursPerNew) * n(d.supLoadedRate);
  const capacityPerDeparture = nestingLoss + rampLoss + supervisorBurden;

  const allInPerDeparture = cashPerDeparture + capacityPerDeparture;
  const pctSalary = n(d.avgSalary) > 0 ? allInPerDeparture / n(d.avgSalary) * 100 : 0;

  // ---- ANNUAL: backfill scales HIRES; everything keys off hires (consistent) ----
  const hires = Math.round(departures * bf);
  const unbackfilled = departures - hires;
  const annualCashBurden = hires * cashPerDeparture;
  const annualCapBurden = hires * capacityPerDeparture;
  const annualReplBurden = annualCashBurden + annualCapBurden; // replacement-cycle burden

  // ---- EARLY WASHOUT: measured against HIRES -> always a subset of cash burden ----
  const earlyWashouts = Math.round(hires * (n(d.earlyWashoutRate) / 100));
  const earlyWaste = earlyWashouts * hireCash;

  // ---- UNCERTAINTY BAND: point estimate of 6 multiplied inputs -> show a planning range (tightens with input quality) ----
  const uncPct = d.evidence === "finance" ? 0.10 : d.evidence === "hrdata" ? 0.15 : 0.25;
  const allInLow = allInPerDeparture * (1 - uncPct), allInHigh = allInPerDeparture * (1 + uncPct);
  const annLow = annualReplBurden * (1 - uncPct), annHigh = annualReplBurden * (1 + uncPct);

  // ---- REDUCTION SCENARIOS: realizable = avoided hires x (cash + capacity*mech); net of cost-to-achieve ----
  const costPerPoint = n(d.costPerPoint);
  const scenarios = [5, 10, 15, 20].map(redPts => {
    const newRate = Math.max(0, n(d.attritionRate) - redPts);
    const avoided = departures - Math.round(n(d.agents) * (newRate / 100));
    const cash = avoided * bf * cashPerDeparture;
    const cap = avoided * bf * capacityPerDeparture * mech;
    const gross = cash + cap;
    const achieveCost = redPts * costPerPoint;
    const net = gross - achieveCost;
    const roi = achieveCost > 0 ? gross / achieveCost : null;
    return { redPts, newRate, avoided, cash, cap, total: gross, achieveCost, net, roi };
  });

  // ---- INTEGRITY FLAGS ----
  const flags = [];
  if (pctSalary > 100) flags.push({ t: "All-in exceeds 100% of salary. That is manager-tier territory, implausible for a frontline agent. Re-check ramp loss, vacancy coverage, and double counting.", sev: "high" });
  else if (pctSalary > 60) flags.push({ t: `All-in is ${Math.round(pctSalary)}% of salary, above the typical frontline sanity band of about 40–60%. Defensible for complex or regulated centers, but validate role type and inputs.`, sev: "med" });
  else if (pctSalary > 0 && pctSalary < 30) flags.push({ t: `All-in is only ${Math.round(pctSalary)}% of salary, below the 40–60% frontline band. Plausible for offshore or BPO, but for a US onshore center it usually signals understated training, ramp, or vacancy inputs. Validate before citing.`, sev: "med" });
  const compNames = [["Recruiting + screening", recruiting], ["Training", training], ["Vacancy coverage", vacancy], ["Nesting loss", nestingLoss], ["Ramp loss", rampLoss], ["Supervisor coaching", supervisorBurden]];
  const topComp = compNames.reduce((a, b) => b[1] > a[1] ? b : a, compNames[0]);
  const trainShare = allInPerDeparture > 0 ? training / allInPerDeparture : 0;
  if (topComp[0] === "Training" && trainShare > 0.40) flags.push({ t: `Training is the dominant cost driver (${Math.round(trainShare * 100)}% of all-in, ${fmt$(training)}). ${trainShare > 0.55 ? "That is high, so " : "That can be valid for a long program, but "}validate training duration, paid hours, class size, and trainer allocation before citing.`, sev: "med" });
  else if (allInPerDeparture > 0 && topComp[1] / allInPerDeparture > 0.55) flags.push({ t: `${topComp[0]} is over 55% of all-in cost (${fmt$(topComp[1])}). A single line dominating this hard usually means an overstated duration or rate. Verify before citing.`, sev: "med" });
  if (n(d.attritionRate) < 10) flags.push({ t: "Attrition under 10% is low for a contact center. Validate the denominator (separations ÷ average headcount, rolling 12 months).", sev: "med" });
  else if (n(d.attritionRate) > 50) flags.push({ t: "Attrition over 50% is severe churn. The early-washout share is usually where the recoverable waste sits. Confirm it.", sev: "med" });
  if (unbackfilled > 0 && !downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures/yr are not replaced under forced under-staffing. That lost capacity is a real cost, but it is an output and service-level question. Quantify it in Staffing and Occupancy, not here. This tool does not zero it out as free.`, sev: "high" });
  if (unbackfilled > 0 && downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures/yr are a deliberate headcount reduction, so they carry no replacement cost. Confirm this is truly intended and not a hiring freeze in disguise.`, sev: "med" });
  if (n(d.mech) === 0) flags.push({ t: "Mechanism is None, so recovered capacity is credited at $0. The savings shown are avoided cash only, the honest floor.", sev: "med" });
  if (n(d.mech) === 100) flags.push({ t: "Reduce headcount realizes 100% of capacity but is the hardest lever to commit. Confirm leadership will hold the seats out.", sev: "med" });
  if (d.vacancyMode === "gross") flags.push({ t: "Vacancy costing is Gross coverage spend (full OT). This counts base wage you would have paid anyway and overstates incremental attrition cost unless the departed agent's stopped payroll is credited elsewhere. Use Incremental for a clean business case.", sev: "med" });

  // ---- HARD INVARIANT: a recoverable subset can never exceed its parent ----
  // Structurally guaranteed (earlyWaste = hires*rate*hireCash <= hires*cashPerDeparture),
  // but asserted defensively so any future refactor that breaks it self-reports instead of shipping a contradictory PDF.
  const invariantOk = earlyWaste <= annualCashBurden + 0.5;
  if (!invariantOk) flags.push({ t: `Integrity invariant violated: early-washout waste (${fmt$(earlyWaste)}) exceeds annual cash burden (${fmt$(annualCashBurden)}). A subset cannot exceed its parent. Do not cite this export. Confidence forced to Directional.`, sev: "high" });

  // ---- TWO-AXIS CONFIDENCE: cost-basis (are inputs validated?) vs realization (can savings be booked?) ----
  const bandLo = n(d.avgSalary) * 0.40, bandHi = n(d.avgSalary) * 0.60;
  const guardrailOk = pctSalary >= 30 && pctSalary <= 60;
  const inBand = pctSalary >= 40 && pctSalary <= 60;
  const RANK = { "Directional": 0, "Planning-grade": 1, "Finance-grade": 2 };
  const hardFlag = flags.some(f => f.sev === "high");

  let costBasis = "Directional";
  if (d.evidence === "hrdata") costBasis = "Planning-grade";
  if (d.evidence === "finance" && guardrailOk) costBasis = "Finance-grade";

  let realization = "Directional";
  if (mech >= 0.9) realization = "Finance-grade";      // reduce vendor / headcount, hard cash lever
  else if (mech >= 0.6) realization = "Planning-grade"; // reduce OT / avoid hiring, soft lever
  // mech 0 (none) and 0.25 (absorb growth) stay Directional, capacity not booked as cash

  if (hardFlag) { costBasis = "Directional"; realization = "Directional"; }
  const confidence = RANK[costBasis] <= RANK[realization] ? costBasis : realization; // overall = weaker axis
  const tierColor = t => t === "Finance-grade" ? GREEN : t === "Planning-grade" ? ELECTRIC : AMBER;

  const mechName = MECH_OPTS.find(m => m.v === n(d.mech))?.label || "None";
  const costBasisReason = hardFlag ? "Held at Directional by an active hard integrity flag. Resolve it first."
    : costBasis === "Finance-grade" ? "Finance-confirmed inputs with a cost basis inside the 40–60% frontline band."
    : costBasis === "Planning-grade" ? "Real HR figures, but not finance-confirmed."
    : d.evidence === "estimate" ? "Inputs are estimated or default. Replace with real figures to raise this."
    : !guardrailOk ? "Cost basis sits outside the 40–60% frontline band. Validate inputs." : "Inputs not yet confirmed.";
  const realizationReason = hardFlag ? "Held at Directional by an active hard integrity flag. Resolve it first."
    : realization === "Finance-grade" ? `"${mechName}" is a hard cash lever, so savings are bookable once committed in budget.`
    : realization === "Planning-grade" ? `"${mechName}" is a soft lever, so tie it to a budget action to book it.`
    : n(d.mech) === 0 ? "No mechanism selected, so recovered capacity is worth $0, so only avoided cash applies."
    : `"${mechName}" absorbs freed capacity into growth rather than booking cash, so this is planning value only.`;
  const bookLabel = realization === "Finance-grade" ? "Bookable if committed" : realization === "Planning-grade" ? "Soft lever, tie to budget" : "Planning only";

  useEffect(() => {
    if (publishToolResult) publishToolResult("attrition-cost", {
      agents: n(d.agents), attritionRate: n(d.attritionRate),
      attritionCashPerDeparture: Math.round(cashPerDeparture),
      attritionAllInPerDeparture: Math.round(allInPerDeparture),
      attritionAnnualReplBurden: Math.round(annualReplBurden),
      attritionUnbackfilled: unbackfilled,
      attritionConfidence: confidence,
      analystRead: `Attrition: ${fmt$(allInPerDeparture)}/replaced departure (${Math.round(pctSalary)}% salary); ${fmt$(annualReplBurden)} annual replacement burden at ${n(d.backfillRate)}% backfill; ${unbackfilled} seats/yr ${downsizing ? "shed deliberately" : "lost (route to Staffing)"}.`,
    });
  }, [cashPerDeparture, allInPerDeparture, annualReplBurden, unbackfilled, confidence]);

  const cashRows = [
    { name: "Recruiting + screening", cost: recruiting, color: "#3B82F6" },
    { name: "Training (wages + trainer)", cost: training, color: "#8B5CF6" },
    ...(signOn > 0 ? [{ name: "Sign-on bonus", cost: signOn, color: "#0EA5E9" }] : []),
    { name: "Vacancy backfill (OT)", cost: vacancy, color: "#F97316" },
  ];
  const capRows = [
    { name: "Nesting productivity loss", cost: nestingLoss, color: "#EC4899" },
    { name: "Ramp-to-proficiency loss", cost: rampLoss, color: RED },
    { name: "Supervisor coaching burden", cost: supervisorBurden, color: AMBER },
  ];
  const maxCost = Math.max(...cashRows.map(b => b.cost), ...capRows.map(b => b.cost), 1);
  const Bar = ({ b }) => (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 78px", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 12, color: SLATE }}>{b.name}</span>
      <div style={{ height: 20, background: WARM, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(b.cost / maxCost) * 100}%`, background: b.color, borderRadius: 4, transition: "width 0.3s" }} /></div>
      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, textAlign: "right" }}>{fmtK(b.cost)}</span>
    </div>
  );

  const mechLabel = MECH_OPTS.find(m => m.v === n(d.mech))?.label.toLowerCase() || "none";
  const unbackfillSentence = unbackfilled <= 0
    ? `Every departure is replaced, so the full replacement cycle applies.`
    : downsizing
      ? `${unbackfilled} of your ${departures} departures a year are a deliberate reduction, so they carry no replacement cost. Confirm that is intended and not a quiet hiring freeze.`
      : `${unbackfilled} of your ${departures} departures a year are not replaced under forced under-staffing. That is not free: you are losing output you still need. This tool does not pretend that is $0. It routes the lost-capacity value to Staffing and Occupancy, where service-level and overtime effects can be modeled honestly.`;

  const analystRead = (hires === 0)
    ? (downsizing
        ? `At 0% backfill, this model does not generate replacement cost, because the center is not refilling departures. Here that is intended downsizing: ${departures} seats a year are being shed on purpose, so there is no recruiting, training, or ramp spend to recover, and early-washout waste is correctly $0, because there are no new hires to wash out.

What this tool will not do is call that a $0 problem and move on. Confirm the reduction is genuinely planned and not a hiring freeze wearing downsizing's clothes. If the demand those seats carried has not gone away, the exposure has simply moved from replacement cost to capacity, and that belongs in Staffing and Occupancy.

The per-refill economics above still stand as the cost you would re-incur the moment you start backfilling again: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${Math.round(pctSalary)}% of salary. Treat that as the price of reversing the reduction, not as a current burden.`
        : `At 0% backfill, this model does not generate replacement cost, because the center is not replacing departures. That does not mean attrition is harmless. With no hires, there is no recruiting, training, or ramp spend, so replacement burden and early-washout waste are both correctly $0, but the economic exposure has not vanished, it has shifted.

Under forced under-staffing it moves to understaffing, occupancy, service level, backlog, burnout, and customer-impact risk. None of that is a replacement cost, so this tool deliberately does not invent a dollar for it; it routes the case to Staffing and Occupancy, where lost output, overtime on the remaining team, and SLA breach can be modeled honestly. That is also why this export is held at Directional with a hard flag: the real cost lives in a model this calculator is not.

The per-refill economics above remain valid as the cost you re-incur the moment you resume hiring: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${Math.round(pctSalary)}% of salary. Do not read the $0 replacement burden as "attrition is free."`)
    : `Attrition cost is not one number, and the honest version refuses to pretend it is. Replacing one frontline agent here runs about ${fmt$(allInPerDeparture)} all-in, roughly ${Math.round(pctSalary)}% of annual salary, which sits ${inBand ? "inside the published frontline band of 40 to 60 percent, the test that lets a CFO trust the rest of the model" : pctSalary > 60 ? "above the published frontline band of 40 to 60 percent, so validate the ramp, vacancy, and training inputs before a CFO sees it; complex or regulated centers can justify it, but it is not automatically defensible" : "below the published frontline band of 40 to 60 percent, which reads as either an efficient or offshore model or understated inputs, so confirm which before relying on it"}.

That figure is a burden, not a savings cheque. About ${fmt$(cashPerDeparture)} is cash out the door: recruiting, training wages, sign-on, and the overtime premium to cover the empty seat. The other ${fmt$(capacityPerDeparture)} is recovered capacity: nesting and ramp time you pay full wage for at partial output, plus supervisor coaching. Cash disappears when a backfilled departure is avoided; capacity becomes money only when leadership commits a mechanism. At ${n(d.backfillRate)}% backfill and a "${mechLabel}" mechanism, that is why the realizable column is smaller than the burden.

Backfill is the assumption most attrition models get wrong. Replacement cost only exists for seats you refill. ${unbackfillSentence}

The sharpest recoverable line is early washout. ${n(d.earlyWashoutRate)}% of your replacement hires, about ${earlyWashouts} a year, leave before reaching productive output, and the ${fmt$(earlyWaste)} of recruiting, screening, ${signOn > 0 ? "sign-on, " : ""}and training cash spent on them returns almost nothing. Because it is measured against hires, it can never exceed your replacement cash; it is the cleanest target on the page. The defensible business case is not "attrition costs us everything." It is "this much is cash, this much is capacity, this much we can actually realize, and this slice is near-pure waste we can attack first."`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}@media(max-width:700px){.cg{grid-template-columns:1fr 1fr!important}.cg3{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "48px 28px 36px" }}>
        <div style={WRAP}>
          <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 10px" }}>Attrition Cost Calculator</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 700 }}>The full cost of every agent departure, split into cash that actually leaves and capacity you only recover if you act. Replacement cost scales with how much you backfill; seats you do not refill are treated as a capacity decision, never as free. Benchmarked against the published 40–60% of salary band for frontline roles.</p>
        </div>
      </section>

      <section style={{ background: WARM, padding: "32px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: "0 0 14px", letterSpacing: 0.3, textTransform: "uppercase" }}>Your Operation</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Total agents" value={d.agents} onChange={v => set("agents", v)} step={5} pulled={pulled.agents} />
            <NumField label="Annual attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" info={DEFS.denominator} infoTitle="Attrition denominator" hint="Sep ÷ avg headcount" />
            <NumField label="Avg agent salary" value={d.avgSalary} onChange={v => set("avgSalary", v)} suffix="$/yr" step={1000} pulled={pulled.avgSalary} />
            <NumField label="Benefits + overhead" value={d.benefitsLoadPct} onChange={v => set("benefitsLoadPct", v)} suffix="%" info={DEFS.benefitsLoad} infoTitle="Benefits + overhead load" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
            <Select label="Backfill basis" value={d.backfillRate} onChange={v => set("backfillRate", Number(v))} opts={BACKFILL_OPTS} info={DEFS.backfill} infoTitle="Backfill basis" />
            <Select label="Un-backfilled seats are…" value={d.unbackfillIntent} onChange={v => set("unbackfillIntent", v)} opts={INTENT_OPTS} info={DEFS.unbackfill} infoTitle="Un-backfilled seats" />
            <NumField label="Early washout (new hires)" value={d.earlyWashoutRate} onChange={v => set("earlyWashoutRate", v)} suffix="%" info={DEFS.early} infoTitle="Early washout rate" hint="Leave before productivity" />
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: "22px 0 14px", letterSpacing: 0.3, textTransform: "uppercase" }}>Cash Out The Door<InfoDot text={DEFS.marginalCash} title="Cash out the door" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Recruiting cost" value={d.recruitingCost} onChange={v => set("recruitingCost", v)} suffix="$" step={250} hint="Postings, agency, referral" />
            <NumField label="Screening hours" value={d.screeningHours} onChange={v => set("screeningHours", v)} suffix="hrs" />
            <NumField label="HR loaded rate" value={d.hrLoadedRate} onChange={v => set("hrLoadedRate", v)} suffix="$/hr" />
            <NumField label="Sign-on bonus" value={d.signOnBonus} onChange={v => set("signOnBonus", v)} suffix="$" step={250} hint="0 if none" />
            <NumField label="Training duration" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="wks" />
            <NumField label="Trainer loaded rate" value={d.trainerLoadedRate} onChange={v => set("trainerLoadedRate", v)} suffix="$/hr" />
            <NumField label="Class size" value={d.classSize} onChange={v => set("classSize", v)} min={1} hint="Trainer cost ÷ class" />
            <NumField label="Overtime premium" value={d.overtimePremium} onChange={v => set("overtimePremium", v)} suffix="%" hint="Above base wage" />
            <NumField label="Vacancy days" value={d.vacancyDays} onChange={v => set("vacancyDays", v)} suffix="days" />
            <NumField label="Vacancy covered by OT" value={d.vacancyCoverageFraction} onChange={v => set("vacancyCoverageFraction", v)} suffix="%" />
            <Select label="Vacancy costing mode" value={d.vacancyMode} onChange={v => set("vacancyMode", v)} opts={[{ v: "incremental", label: "Incremental (OT premium)" }, { v: "gross", label: "Gross coverage spend" }]} info={DEFS.vacancyMode} infoTitle="Vacancy costing mode" align="right" />
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: "22px 0 14px", letterSpacing: 0.3, textTransform: "uppercase" }}>Capacity / Opportunity<InfoDot text={DEFS.capacity} title="Capacity vs cash" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Nesting duration" value={d.nestingWeeks} onChange={v => set("nestingWeeks", v)} suffix="wks" info={DEFS.nesting} infoTitle="Nesting" />
            <NumField label="Nesting productivity" value={d.nestingProductivity} onChange={v => set("nestingProductivity", v)} suffix="%" hint="Of full output" />
            <NumField label="Ramp (after nesting)" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" info={DEFS.ramp} infoTitle="Ramp-to-proficiency" />
            <NumField label="Ramp productivity" value={d.rampProductivity} onChange={v => set("rampProductivity", v)} suffix="%" hint="Avg vs tenured parity" />
            <NumField label="Supervisor hrs / new hire" value={d.supervisorHoursPerNew} onChange={v => set("supervisorHoursPerNew", v)} suffix="hrs" />
            <NumField label="Supervisor loaded rate" value={d.supLoadedRate} onChange={v => set("supLoadedRate", v)} suffix="$/hr" />
          </div>

          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cg">
            <Select label="Capacity realization mechanism" value={d.mech} onChange={v => set("mech", Number(v))} opts={MECH_OPTS} info={DEFS.mech} infoTitle="Realization mechanism" />
            <Select label="Input basis" value={d.evidence} onChange={v => set("evidence", v)} opts={[{ v: "estimate", label: "Estimated / defaults" }, { v: "hrdata", label: "From our HR data" }, { v: "finance", label: "Finance-confirmed figures" }]} info={DEFS.confidence} infoTitle="Export confidence" align="right" />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "36px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }} className="cg3">
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Cash Per Departure</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: "#fff" }}>{fmtK(cashPerDeparture)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Avoided when a refill is prevented</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Capacity Per Departure</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: "#fff" }}>{fmtK(capacityPerDeparture)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Recovered only if you act</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, #7F1D1D, #991B1B)`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>All-In Per Departure<InfoDot text={DEFS.sensitivity} title="Why a range, not a point" align="right" /></div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: "#fff" }}>{fmtK(allInPerDeparture)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>range {fmtK(allInLow)} – {fmtK(allInHigh)} (±{Math.round(uncPct * 100)}%)</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{Math.round(pctSalary)}% of salary · per refill</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }} className="cg3">
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Annual Replacement Burden</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: NAVY }}>{fmtK(annualReplBurden)}</div>
              <div style={{ fontSize: 11, color: MUTED }}>range {fmtK(annLow)} – {fmtK(annHigh)} (±{Math.round(uncPct * 100)}%)</div>
              <div style={{ fontSize: 12, color: MUTED }}>{fmtK(annualCashBurden)} cash + {fmtK(annualCapBurden)} capacity · {hires} of {departures} departures refilled</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Current-state diagnosis, not automatically recoverable.</div>
            </div>
            <div style={{ border: `1px solid ${unbackfilled > 0 && !downsizing ? RED : BORDER}`, background: unbackfilled > 0 && !downsizing ? "#FEF6F6" : "#fff", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: unbackfilled > 0 && !downsizing ? RED : SLATE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Un-backfilled Seats</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: unbackfilled > 0 && !downsizing ? RED : NAVY }}>{unbackfilled}/yr</div>
              <div style={{ fontSize: 12, color: SLATE }}>{unbackfilled === 0 ? "All departures refilled" : downsizing ? "Deliberate reduction, no replacement cost" : "Lost capacity, not free"}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{unbackfilled === 0 ? "Full replacement cycle applies." : downsizing ? "Confirm this is intended." : "Value the output loss in Staffing / Occupancy."}</div>
            </div>
            <div style={{ border: `1px solid ${AMBER}`, background: "#FFFBF4", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Early-Washout Waste</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: "#92400E" }}>{fmtK(earlyWaste)}</div>
              <div style={{ fontSize: 12, color: SLATE }}>{n(d.earlyWashoutRate)}% of replacement hires ({earlyWashouts}/yr) leave pre-productivity</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Subset of cash burden, the most recoverable slice.</div>
            </div>
          </div>

          <div style={{ marginBottom: 22, padding: "12px 14px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>Cost basis</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: tierColor(costBasis), letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: `${tierColor(costBasis)}1a` }}>{costBasis}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>Realization</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: tierColor(realization), letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: `${tierColor(realization)}1a` }}>{realization}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.5 }}><strong style={{ color: NAVY }}>Cost basis:</strong> {costBasisReason} <strong style={{ color: NAVY }}>Realization:</strong> {realizationReason}</div>
            <div style={{ fontSize: 12, color: SLATE, marginTop: 6 }}>Frontline band is 40–60% of salary ({fmtK(bandLo)}–{fmtK(bandHi)} here); the published $10–20K all-in reference assumes typical frontline wages. This result is {Math.round(pctSalary)}% / {fmtK(allInPerDeparture)}, {guardrailOk ? "within band" : pctSalary > 60 ? "above band, validate" : "below band, validate"}.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 26 }} className="cg3">
            <div><h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Cash out the door</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{cashRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
            <div><h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Capacity / opportunity</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{capRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Realizable value if you reduce attrition</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Cash in full; capacity at {Math.round(mech * 100)}% per mechanism; both scaled to {n(d.backfillRate)}% backfill. Realizable value, not the burden above.{!downsizing && unbackfilled > 0 ? " Under forced under-staffing, retained capacity carries additional value. See Staffing." : ""}{downsizing ? " Note: under intended downsizing, retaining agents slows your planned reduction, so this credits only replacement cost avoided on the seats you would refill, not a net headcount saving." : ""}</p>
          <div style={{ maxWidth: 300, marginBottom: 14 }}>
            <NumField label="Cost to achieve (per point / yr)" value={d.costPerPoint} onChange={v => set("costPerPoint", v)} suffix="$" step={5000} info={DEFS.costToAchieve} infoTitle="Cost to achieve: CFO net view" hint={costPerPoint > 0 ? "Cards show net of this spend" : "0 = show gross only"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 26 }} className="cg">
            {scenarios.map((s, i) => (
              <div key={i} style={{ background: WARM, border: `1px solid ${costPerPoint > 0 && s.net < 0 ? RED : BORDER}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>−{s.redPts} pts → {s.newRate}%</div>
                {costPerPoint > 0 ? (<>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: s.net < 0 ? RED : GREEN }}>{s.net < 0 ? "−" : ""}{fmtK(Math.abs(s.net))}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>net / yr</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{fmtK(s.total)} gross − {fmtK(s.achieveCost)} cost<br />{s.roi != null ? `${s.roi.toFixed(1)}x return · ` : ""}{s.avoided} fewer</div>
                </>) : (<>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: GREEN }}>{fmtK(s.total)}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>realizable / yr</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{fmtK(s.cash)} cash avoided + {fmtK(s.cap)} capacity value<br />{s.avoided} fewer departures</div>
                </>)}
                <div style={{ fontSize: 9, fontWeight: 700, color: tierColor(realization), letterSpacing: 0.3, textTransform: "uppercase", marginTop: 6, padding: "2px 6px", borderRadius: 3, background: `${tierColor(realization)}14`, display: "inline-block" }}>{bookLabel}</div>
              </div>
            ))}
          </div>

          {flags.length > 0 && (
            <div style={{ background: "#FFF8F0", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#92400E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Integrity Checks</h3>
              {flags.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: f.sev === "high" ? RED : AMBER, flexShrink: 0, marginTop: 2, width: 32 }}>{f.sev === "high" ? "FLAG" : "NOTE"}</span>
                  <span style={{ fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{f.t}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Analyst Read</h3>
            {analystRead.split("\n\n").map((para, i) => <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, marginBottom: 10 }}>{para}</p>)}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>What Is Driving This Attrition?</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 14 }}>At {d.attritionRate}% one or more of these is active. The rate gets fixed in these tools, not in this calculator.</p>
            {[
              { driver: "Occupancy above 85%", likelihood: n(d.attritionRate) > 35 ? "High" : "Medium", tool: "/tools/occupancy-risk", toolName: "Occupancy Risk Simulator", why: "Insufficient recovery time between contacts burns agents out. The most controllable attrition driver." },
              { driver: "Repeat contacts / rework load", likelihood: "Medium", tool: "/tools/fcr-leakage", toolName: "FCR Leakage Diagnostic", why: "New-hire error and repeat-contact cost lives here, not in this tool. Quantify the rework that frustrates agents and customers alike." },
              { driver: "Weak coaching or agent experience", likelihood: "Medium", tool: "/tools/agent-experience", toolName: "Agent Experience Diagnostic", why: "Agents who feel unsupported leave faster than agents who feel underpaid. Assess the five retention dimensions." },
              { driver: "No visible career path", likelihood: n(d.attritionRate) > 40 ? "High" : "Medium", tool: "/human-premium", toolName: "The Human Premium", why: "When agents cannot see what comes after this role, they leave to find it. New CX roles are emerging." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: item.likelihood === "High" ? RED : AMBER, padding: "2px 6px", borderRadius: 3, background: item.likelihood === "High" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", flexShrink: 0, marginTop: 2 }}>{item.likelihood}</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{item.driver}</span>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "2px 0 4px", lineHeight: 1.5 }}>{item.why}</p>
                  <a href={item.tool} style={{ fontSize: 11, fontWeight: 600, color: LIGHT, padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.12)" }}>→ {item.toolName}</a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <ReportExport toolName="Attrition Cost Analysis" subtitle={`Total Cost of Agent Turnover. Cost basis ${costBasis} · Realization ${realization}`} userName="" userEmail="" sections={[
              { title: "Confidence & Evidence", type: "findings", items: [
                `Cost-basis confidence: ${costBasis}. ${costBasisReason}`,
                `Realization confidence: ${realization}. ${realizationReason}`,
                `Backfill basis: ${n(d.backfillRate)}% of departures replaced (${hires} of ${departures}). Replacement cost scales with this; ${unbackfilled} un-backfilled seats are ${downsizing ? "a deliberate reduction with no replacement cost" : "lost capacity routed to Staffing/Occupancy, not zeroed out as free"}.`,
                `Vacancy costing: ${d.vacancyMode === "gross" ? "Gross coverage spend (full OT) that overstates incremental cost unless the vacant seat's stopped payroll is credited elsewhere. Incremental (OT premium only) is the conservative default." : "Incremental, OT premium only (the conservative default)."}`,
                `Cost basis: ${Math.round(pctSalary)}% of salary (${fmt$(allInPerDeparture)}, planning range ${fmt$(allInLow)}–${fmt$(allInHigh)} at ±${Math.round(uncPct * 100)}%) versus the 40–60% frontline band of ${fmt$(bandLo)}–${fmt$(bandHi)}. ${guardrailOk ? "Within band." : "Outside band. Verify inputs before citing."} The $10–20K all-in reference assumes typical frontline wages and is not salary-adjusted.`,
              ]},
              ...(flags.length > 0 ? [{ title: "Integrity Flags", type: "findings", items: flags.map(f => `${f.sev === "high" ? "[FLAG] " : "[NOTE] "}${f.t}`) }] : []),
              { title: "Cost Per Replaced Departure", type: "table", rows: [
                ["Recruiting + screening (cash)", fmt$(recruiting)],
                ["Training: wages + trainer (cash)", fmt$(training)],
                ...(signOn > 0 ? [["Sign-on bonus (cash)", fmt$(signOn)]] : []),
                [`Vacancy backfill: ${d.vacancyMode === "gross" ? "gross" : "OT premium"} (cash)`, fmt$(vacancy)],
                ["Nesting productivity loss (capacity)", fmt$(nestingLoss)],
                ["Ramp-to-proficiency loss (capacity)", fmt$(rampLoss)],
                ["Supervisor coaching (capacity)", fmt$(supervisorBurden)],
              ]},
              { title: "Burden vs Realizable", type: "metrics", items: [
                { label: "Cash per departure", value: fmt$(cashPerDeparture), color: ELECTRIC },
                { label: "Capacity per departure", value: fmt$(capacityPerDeparture), color: AMBER },
                { label: "All-in per departure", value: fmt$(allInPerDeparture), color: RED },
                { label: "Annual replacement burden", value: fmt$(annualReplBurden), color: RED },
                { label: "Early-washout waste", value: fmt$(earlyWaste), color: AMBER },
                { label: `Realizable −5 pts (${bookLabel})`, value: fmt$(scenarios[0].total), color: GREEN },
              ]},
              { title: "Key Findings", type: "findings", items: [
                `Each replaced departure costs ${fmt$(cashPerDeparture)} cash plus ${fmt$(capacityPerDeparture)} recovered capacity, for ${fmt$(allInPerDeparture)} all-in, about ${Math.round(pctSalary)}% of salary.`,
                `At ${n(d.backfillRate)}% backfill, ${hires} of ${departures} departures are refilled, for an annual replacement burden of ${fmt$(annualReplBurden)} (${fmt$(annualCashBurden)} cash). This is a current-state diagnosis, not recoverable savings.`,
                unbackfilled > 0 ? `${unbackfilled} departures/yr are not refilled. ${downsizing ? "Treated as a deliberate reduction with no replacement cost." : "This is lost capacity, not zero cost. Quantify the output and service-level impact in Staffing/Occupancy."}` : `All departures are refilled, so the full replacement cycle applies.`,
                `${n(d.earlyWashoutRate)}% of replacement hires wash out before productivity, wasting about ${fmt$(earlyWaste)} of recruiting, screening, ${signOn > 0 ? "sign-on, " : ""}and training cash, a subset of cash burden and the most recoverable slice.`,
                costPerPoint > 0
                  ? `Cutting attrition 5 points yields ${fmt$(scenarios[0].total)} gross; net of ${fmt$(scenarios[0].achieveCost)} to achieve it is ${fmt$(scenarios[0].net)}${scenarios[0].roi != null ? ` (${scenarios[0].roi.toFixed(1)}x return)` : ""}. Bookability: ${bookLabel.toLowerCase()}. Net is the figure to take to budget.`
                  : `Cutting attrition 5 points realizes ${fmt$(scenarios[0].total)} gross (${fmt$(scenarios[0].cash)} cash avoided + ${fmt$(scenarios[0].cap)} capacity value), gated by backfill and mechanism. Bookability: ${bookLabel.toLowerCase()}. Not booked EBITDA unless tied to a budget action, and this is before the cost to achieve the reduction.`,
              ]},
              { title: "Methodology", type: "findings", items: [
                `Cost model: per replaced departure = cash (recruiting, screening, ${signOn > 0 ? "sign-on, " : ""}training wages, trainer, vacancy OT) + capacity (nesting and ramp productivity loss, supervisor coaching). Capacity is recovered time, booked only via a realization mechanism.`,
                `Benchmark guardrail: the 40–60%-of-salary frontline sanity band is based on role-specific replacement-cost estimates (frontline ≈ 40% of salary, well below the generic 50–200% turnover figure). The $10–20K all-in reference is the published contact-center agent replacement estimate and is not salary-adjusted.`,
              ]},
              { title: "Next Steps", type: "next", items: [
                { tool: "Occupancy Risk Simulator", href: "/tools/occupancy-risk", reason: "Check whether occupancy is driving burnout-led exits" },
                { tool: "Agent Experience Diagnostic", href: "/tools/agent-experience", reason: "Identify which retention dimensions are failing" },
                { tool: "FCR Leakage Diagnostic", href: "/tools/fcr-leakage", reason: "Quantify the new-hire rework and repeat-contact cost" },
              ]},
            ]} />
            <a href="/tools/occupancy-risk" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Occupancy Risk Simulator →</a>
            <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
          </div>
        </div>
      </section>
    </div>
  );
}
