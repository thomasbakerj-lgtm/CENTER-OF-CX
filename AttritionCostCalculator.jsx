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
  backfill: "The share of departures you actually replace. Avoided recruiting and training is only real cash savings for seats you would have refilled. If the center is shrinking or freezing hiring, crediting full replacement savings overstates the case, so backfill scales both the burden and the realizable value.",
  marginalCash: "Cash out the door is spend that genuinely disappears when a backfilled departure is avoided: recruiting, training wages, sign-on, and overtime premium. It is credited at 100 percent in savings because you simply stop spending it.",
  capacity: "Capacity is recovered agent and supervisor time, not cash. It only becomes money if you act on it, so it is gated by a realization mechanism. With no mechanism committed, recovered capacity is worth zero in hard savings.",
  denominator: "Attrition here is separations divided by average headcount over the year. Define it before you trust it: voluntary only or total, regrettable or all, and a rolling twelve-month actual rather than a bad month annualized. Annualizing one rough month is the most common way centers accidentally inflate their own rate.",
  early: "The share of departures that leave before reaching full productivity, often inside the first ninety days. Their recruiting and training cash is mostly sunk with near-zero productive return, which makes early attrition the highest-waste and most recoverable segment of the problem.",
  nesting: "Nesting is supervised live production right after classroom training, where the new hire handles real contacts at reduced output. The loss is the unproductive share of fully-paid time during that period.",
  ramp: "Ramp is the post-nesting stretch before a new hire reaches tenured-agent parity on AHT, QA, and FCR, not merely the point they finish training. Default to fully-productive parity, which is months not days, and value only the shortfall against full output. Ramp starts after nesting so the two never overlap.",
  vacancyMode: "Incremental to staffed plan charges only the overtime premium, because the empty seat's base wage is not being paid. Gross coverage spend charges the full overtime cost and should be used only when the departed agent's stopped payroll is credited somewhere else, or you will double count.",
  mech: "How recovered capacity converts to money. None means you keep the slack and realize zero. Avoid or slow hiring (the default) is the most common honest lever. Reduce headcount realizes the most but is the hardest commitment to make.",
  confidence: "Directional uses default costs, an uncommitted mechanism, or an undefined backfill basis. Planning-grade uses your real HR figures, a committed lever, and a stated backfill. Finance-grade also requires finance-confirmed inputs and a result inside the published frontline benchmark.",
};

const MECH_OPTS = [
  { v: 0, label: "None — keep the slack" },
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
  { v: 0, label: "Do not backfill (shrinking)" },
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
    agents: 200, attritionRate: 35, avgSalary: 38000, benefitsLoadPct: 28, backfillRate: 100, earlyAttritionShare: 40,
    recruitingCost: 2500, screeningHours: 8, hrLoadedRate: 48,
    trainingWeeks: 6, trainerLoadedRate: 45, classSize: 12, signOnBonus: 0,
    nestingWeeks: 4, nestingProductivity: 50,
    rampMonths: 3, rampProductivity: 75,
    supervisorHoursPerNew: 10, supLoadedRate: 55,
    overtimePremium: 50, vacancyDays: 30, vacancyCoverageFraction: 60, vacancyMode: "incremental",
    mech: 75, evidence: "estimate",
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

  // CASH OUT THE DOOR (per backfilled departure)
  const recruiting = n(d.recruitingCost) + n(d.screeningHours) * n(d.hrLoadedRate);
  const trDays = n(d.trainingWeeks) * 5;
  const training = trDays * 8 * loadedHourly + trDays * 8 * n(d.trainerLoadedRate) / Math.max(1, n(d.classSize));
  const signOn = n(d.signOnBonus);
  const vacHours = n(d.vacancyDays) * 8 * (n(d.vacancyCoverageFraction) / 100);
  const vacancy = d.vacancyMode === "gross" ? vacHours * wageHourly * (1 + n(d.overtimePremium) / 100) : vacHours * wageHourly * (n(d.overtimePremium) / 100);
  const cashPerDeparture = recruiting + training + signOn + vacancy;

  // CAPACITY / OPPORTUNITY (per backfilled departure)
  const nestingLoss = n(d.nestingWeeks) * 5 * 8 * loadedHourly * (1 - n(d.nestingProductivity) / 100);
  const rampLoss = n(d.rampMonths) * 22 * 8 * loadedHourly * (1 - n(d.rampProductivity) / 100);
  const supervisorBurden = n(d.supervisorHoursPerNew) * n(d.supLoadedRate);
  const capacityPerDeparture = nestingLoss + rampLoss + supervisorBurden;

  const allInPerDeparture = cashPerDeparture + capacityPerDeparture;
  const pctSalary = n(d.avgSalary) > 0 ? allInPerDeparture / n(d.avgSalary) * 100 : 0;

  // ANNUAL BURDEN (backfill-scaled current-state diagnosis — NOT savings)
  const backfilled = departures * bf;
  const annualCashBurden = backfilled * cashPerDeparture;
  const annualCapBurden = backfilled * capacityPerDeparture;
  const annualAllInBurden = annualCashBurden + annualCapBurden;

  // EARLY ATTRITION (diagnostic overlay — subset lens, not additive)
  const earlyDepartures = Math.round(departures * (n(d.earlyAttritionShare) / 100));
  const earlyWaste = earlyDepartures * (recruiting + training + signOn);

  // REDUCTION SCENARIOS — REALIZABLE (backfill + mechanism gated)
  const scenarios = [5, 10, 15, 20].map(redPts => {
    const newRate = Math.max(0, n(d.attritionRate) - redPts);
    const avoided = departures - Math.round(n(d.agents) * (newRate / 100));
    const cash = avoided * bf * cashPerDeparture;
    const cap = avoided * bf * capacityPerDeparture * mech;
    return { redPts, newRate, avoided, cash, cap, total: cash + cap };
  });

  // INTEGRITY FLAGS
  const flags = [];
  if (pctSalary > 100) flags.push({ t: "All-in exceeds 100% of salary — manager-tier territory, implausible for a frontline agent. Re-check ramp loss, vacancy coverage, and double counting.", sev: "high" });
  else if (pctSalary > 60) flags.push({ t: `All-in is ${Math.round(pctSalary)}% of salary, above the typical frontline sanity band of about 40–60%. Defensible for complex or regulated centers, but validate role type and inputs.`, sev: "med" });
  if (allInPerDeparture < 10000) flags.push({ t: "All-in is below the ~$10K McKinsey floor for a US onshore agent. Expected only for offshore, BPO, or low-cost geography — otherwise inputs are likely understated.", sev: "med" });
  if (n(d.attritionRate) < 10) flags.push({ t: "Attrition under 10% is low for a contact center — validate the denominator (separations ÷ average headcount, rolling 12 months).", sev: "med" });
  else if (n(d.attritionRate) > 50) flags.push({ t: "Attrition over 50% is severe churn. Model early attrition separately — the first-90-day share is usually where the recoverable waste sits.", sev: "high" });
  if (bf < 1) flags.push({ t: `Backfill is ${n(d.backfillRate)}%: cost and savings scale down accordingly. Departures you do not replace defer a capacity question to Staffing — they are not free.`, sev: "med" });
  if (n(d.mech) === 0) flags.push({ t: "Mechanism is None, so recovered capacity is credited at $0. The savings shown are avoided cash only — the honest floor.", sev: "med" });
  if (n(d.mech) === 100) flags.push({ t: "Reduce headcount realizes 100% of capacity but is the hardest lever to commit. Confirm leadership will hold the seats out.", sev: "med" });

  // CONFIDENCE
  let confidence = "Directional";
  const guardrailOk = pctSalary <= 60 && allInPerDeparture >= 10000;
  if (d.evidence === "hrdata" && mech >= 0.6) confidence = "Planning-grade";
  if (d.evidence === "finance" && mech >= 0.6 && guardrailOk) confidence = "Finance-grade";
  const confColor = confidence === "Finance-grade" ? GREEN : confidence === "Planning-grade" ? ELECTRIC : AMBER;

  useEffect(() => {
    if (publishToolResult) publishToolResult("attrition-cost", {
      agents: n(d.agents), attritionRate: n(d.attritionRate),
      attritionCashPerDeparture: Math.round(cashPerDeparture),
      attritionAllInPerDeparture: Math.round(allInPerDeparture),
      attritionAnnualCashBurden: Math.round(annualCashBurden),
      attritionAnnualAllInBurden: Math.round(annualAllInBurden),
      attritionConfidence: confidence,
      analystRead: `Attrition: ${fmt$(cashPerDeparture)} cash + ${fmt$(capacityPerDeparture)} capacity per departure (${Math.round(pctSalary)}% of salary), ${fmt$(annualAllInBurden)} annual burden at ${n(d.backfillRate)}% backfill.`,
    });
  }, [cashPerDeparture, allInPerDeparture, annualCashBurden, annualAllInBurden, confidence]);

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
  const analystRead = `Attrition cost is not one number, and the honest version refuses to pretend it is. Replacing one frontline agent here runs about ${fmt$(allInPerDeparture)} all-in, roughly ${Math.round(pctSalary)}% of annual salary — inside the published frontline band of 40 to 60 percent, which is the test that lets a CFO trust the rest of the model.

That figure is a burden, not a savings cheque. About ${fmt$(cashPerDeparture)} is cash out the door: recruiting, training wages, sign-on, and the overtime premium to cover the empty seat. The other ${fmt$(capacityPerDeparture)} is recovered capacity — nesting and ramp time you pay full wage for at partial output, plus supervisor coaching. Cash disappears when a backfilled departure is avoided; capacity becomes money only when leadership commits a mechanism. At ${n(d.backfillRate)}% backfill and a "${mechLabel}" mechanism, that is why the realizable column is smaller than the burden.

The sharpest line in this model is early attrition. ${n(d.earlyAttritionShare)}% of your departures — about ${earlyDepartures} agents a year — leave before reaching full productivity, and the ${fmt$(earlyWaste)} of recruiting and training spent on them returns almost nothing. That is the most recoverable money on the page. The defensible business case is not "attrition costs us everything." It is "this much is cash, this much is capacity, this much we can actually realize, and this slice is near-pure waste we can attack first."`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}@media(max-width:700px){.cg{grid-template-columns:1fr 1fr!important}.cg3{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "48px 28px 36px" }}>
        <div style={WRAP}>
          <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 10px" }}>Attrition Cost Calculator</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 700 }}>The full cost of every agent departure, split into cash that actually leaves and capacity you only recover if you act — scaled by how much you actually backfill. The all-in is a burden estimate, not automatic savings, and it is benchmarked against the published 40–60% of salary band for frontline roles.</p>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
            <Select label="Backfill basis" value={d.backfillRate} onChange={v => set("backfillRate", Number(v))} opts={BACKFILL_OPTS} info={DEFS.backfill} infoTitle="Backfill basis" />
            <NumField label="Early attrition (pre-productivity)" value={d.earlyAttritionShare} onChange={v => set("earlyAttritionShare", v)} suffix="%" info={DEFS.early} infoTitle="Early attrition" hint="Leave before full productivity" />
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
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Real spend — saved in full</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Capacity Per Departure</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: "#fff" }}>{fmtK(capacityPerDeparture)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Recovered only if you act</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, #7F1D1D, #991B1B)`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>All-In Per Departure</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: "#fff" }}>{fmtK(allInPerDeparture)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{Math.round(pctSalary)}% of salary · burden</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }} className="cg3">
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Annual Attrition Burden</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: NAVY }}>{fmtK(annualAllInBurden)}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{fmtK(annualCashBurden)} cash + {fmtK(annualCapBurden)} capacity · {Math.round(backfilled)} of {departures} departures backfilled</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Current-state diagnosis — not automatically recoverable.</div>
            </div>
            <div style={{ border: `1px solid ${AMBER}`, background: "#FFFBF4", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Early-Attrition Waste</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: "#92400E" }}>{fmtK(earlyWaste)}</div>
              <div style={{ fontSize: 12, color: SLATE }}>{n(d.earlyAttritionShare)}% ({earlyDepartures}/yr) leave before full productivity</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Recruiting + training cash with near-zero return — the most recoverable slice.</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "10px 14px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: confColor, letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: `${confColor}1a` }}>{confidence}</span>
            <span style={{ fontSize: 12, color: SLATE }}>Frontline benchmark band is 40–60% of salary and $10–20K all-in; this result is {Math.round(pctSalary)}% / {fmtK(allInPerDeparture)}.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 26 }} className="cg3">
            <div><h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Cash out the door</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{cashRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
            <div><h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Capacity / opportunity</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{capRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Realizable value if you reduce attrition</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Cash credited in full; capacity at {Math.round(mech * 100)}% per mechanism; both scaled to {n(d.backfillRate)}% backfill. This is realizable value, not the burden above.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 26 }} className="cg">
            {scenarios.map((s, i) => (
              <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>−{s.redPts} pts → {s.newRate}%</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: GREEN }}>{fmtK(s.total)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>realizable / yr</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{fmtK(s.cash)} cash + {fmtK(s.cap)} capacity<br />{s.avoided} fewer departures</div>
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
              { driver: "Repeat contacts / rework load", likelihood: "Medium", tool: "/tools/fcr-leakage", toolName: "FCR Leakage Diagnostic", why: "New-hire error and repeat-contact cost lives here, not in this tool — quantify the rework that frustrates agents and customers alike." },
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
            <ReportExport toolName="Attrition Cost Analysis" subtitle={`Total Cost of Agent Turnover — ${confidence}`} userName="" userEmail="" sections={[
              { title: "Confidence & Evidence", type: "findings", items: [
                `Export confidence: ${confidence}. ${confidence === "Finance-grade" ? "Finance-confirmed inputs, a committed realization mechanism, and a result inside the frontline benchmark." : confidence === "Planning-grade" ? "Real HR figures and a committed mechanism, but not finance-confirmed. Treat as planning input, not a booked number." : "Default or estimated inputs, or no committed mechanism. Directional only — do not book these savings."}`,
                `Backfill basis: ${n(d.backfillRate)}% of departures replaced. Cost and savings are scaled to this rate; unreplaced seats defer a capacity question to Staffing.`,
                `Vacancy costing: ${d.vacancyMode === "gross" ? "Gross coverage spend (full OT) — valid only if departed-agent payroll savings is tracked elsewhere." : "Incremental, OT premium only (the conservative default)."}`,
                `Cost basis: ${Math.round(pctSalary)}% of salary versus the published frontline band of 40–60%. ${guardrailOk ? "Within benchmark." : "Outside benchmark — verify inputs before citing."}`,
              ]},
              { title: "Cost Per Departure", type: "table", rows: [
                ["Recruiting + screening (cash)", fmt$(recruiting)],
                ["Training: wages + trainer (cash)", fmt$(training)],
                ...(signOn > 0 ? [["Sign-on bonus (cash)", fmt$(signOn)]] : []),
                [`Vacancy backfill — ${d.vacancyMode === "gross" ? "gross" : "OT premium"} (cash)`, fmt$(vacancy)],
                ["Nesting productivity loss (capacity)", fmt$(nestingLoss)],
                ["Ramp-to-proficiency loss (capacity)", fmt$(rampLoss)],
                ["Supervisor coaching (capacity)", fmt$(supervisorBurden)],
              ]},
              { title: "Burden vs Realizable", type: "metrics", items: [
                { label: "Cash per departure", value: fmt$(cashPerDeparture), color: ELECTRIC },
                { label: "Capacity per departure", value: fmt$(capacityPerDeparture), color: AMBER },
                { label: "All-in per departure", value: fmt$(allInPerDeparture), color: RED },
                { label: "Annual all-in burden", value: fmt$(annualAllInBurden), color: RED },
                { label: "Early-attrition waste", value: fmt$(earlyWaste), color: AMBER },
                { label: "Realizable: −5 pts", value: fmt$(scenarios[0].total), color: GREEN },
              ]},
              { title: "Key Findings", type: "findings", items: [
                `Each backfilled departure costs ${fmt$(cashPerDeparture)} cash plus ${fmt$(capacityPerDeparture)} recovered capacity — ${fmt$(allInPerDeparture)} all-in, about ${Math.round(pctSalary)}% of salary.`,
                `Annual burden at ${n(d.backfillRate)}% backfill is ${fmt$(annualAllInBurden)} (${fmt$(annualCashBurden)} cash). This is a current-state diagnosis, not recoverable savings.`,
                `${n(d.earlyAttritionShare)}% of departures leave before full productivity, wasting about ${fmt$(earlyWaste)} of recruiting and training cash — the most recoverable slice.`,
                `Cutting attrition 5 points realizes ${fmt$(scenarios[0].total)} (${fmt$(scenarios[0].cash)} cash + ${fmt$(scenarios[0].cap)} capacity), gated by backfill and the chosen mechanism — not the all-in headline.`,
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
