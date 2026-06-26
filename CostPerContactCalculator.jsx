import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const money = (v) => { const x = n(v); return (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2); };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, factor = 1, pulled, compact }) {
  const display = n(value) * factor;
  const [local, setLocal] = useState(String(display));
  const holdRef = useRef(null), valRef = useRef(display);
  valRef.current = display;
  useEffect(() => { setLocal(String(Math.round(display * 1000) / 1000)); /* eslint-disable-next-line */ }, [value]);
  const commit = (raw) => { const p = parseFloat(raw); onChange(isNaN(p) ? 0 : p / factor); };
  const clamp = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => { stop(); let v = clamp(n(valRef.current)); const doStep = () => { v = clamp(v + dir * step); setLocal(String(v)); onChange(v / factor); }; doStep(); let delay = 280; const tick = () => { doStep(); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); }; holdRef.current = setTimeout(tick, delay); };
  const btn = { width: 20, height: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, fontSize: 7, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}{pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local} onChange={e => { setLocal(e.target.value); commit(e.target.value); }} onBlur={() => setLocal(String(Math.round(display * 1000) / 1000))}
          style={{ width: "100%", padding: compact ? "8px 10px" : "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, paddingLeft: prefix ? 24 : (compact ? 10 : 12), paddingRight: 40, outline: "none" }}
          onFocus={e => e.target.style.borderColor = ELECTRIC} onBlurCapture={e => e.target.style.borderColor = BORDER} />
        {suffix && <span style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 3, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}

// Capacity action drives realization. Freed handle time is not cash until you commit to a
// mechanism; "none" credits nothing. Each carries an honest cashability ceiling.
const MECH = {
  none: { label: "Not selected", f: 0.00, cred: "none", note: "No capacity action — realizable savings stay $0 until you commit to one." },
  growth: { label: "Absorb growth / backlog", f: 0.25, cred: "capacity", note: "Capacity value, not cash this cycle." },
  overtime: { label: "Reduce overtime", f: 0.60, cred: "finance", note: "Finance-creditable." },
  hiring: { label: "Avoid hiring / attrition freeze", f: 0.75, cred: "finance", note: "Finance-creditable over the cycle. The defensible default." },
  vendor: { label: "Vendor / BPO volume reduction", f: 0.90, cred: "cash", note: "Often highly cashable." },
  headcount: { label: "Headcount reduction", f: 1.00, cred: "cash", note: "Fully cashable, but the highest change and CSAT risk." },
};
const MECH_ORDER = ["none", "growth", "overtime", "hiring", "vendor", "headcount"];

const VBENCH = [
  { vert: "Financial Services", cpc: "$8.50–$12", cpr: "$11–$16", fcr: "72%" },
  { vert: "Healthcare", cpc: "$9–$14", cpr: "$13–$20", fcr: "71%" },
  { vert: "Retail & eCommerce", cpc: "$5–$8", cpr: "$6–$10", fcr: "78%" },
];

const BASE = {
  monthlyContacts: 50000, denominator: "handled", fcrRate: 72, contactsPerUnresolved: 2.4,
  loadedCPC: 7, marginalCPC: 4.2, validated: false,
  agentHourly: 18, overheadMultiplier: 1.35, productiveHoursPerFTE: 140,
  voicePct: 60, chatPct: 25, emailPct: 15,
  voiceAHT: 7, chatAHT: 9, emailAHT: 5,
  voiceConcurrency: 1, chatConcurrency: 2.5, emailConcurrency: 1,
};

function compute(d, mechKey) {
  const fcr = Math.min(1, n(d.fcrRate) / 100), Mu = Math.max(1, n(d.contactsPerUnresolved));
  const loaded = n(d.loadedCPC), marg = n(d.marginalCPC) > 0 ? n(d.marginalCPC) : loaded * 0.6;
  const mf = MECH[mechKey].f;

  const C = fcr * 1 + (1 - fcr) * Mu;        // total contacts per resolved issue
  const gapPct = (C - 1) * 100;
  const cprLoaded = loaded * C;

  // Volume denominator: handled contacts (default) or resolved issues. The repeat
  // math differs, so the basis must be explicit — another place a tool can lie by accident.
  const vol = n(d.monthlyContacts);
  let handled, resolutions, repeatContacts;
  if (d.denominator === "issues") { resolutions = vol; handled = vol * C; repeatContacts = vol * (C - 1); }
  else { handled = vol; resolutions = vol / C; repeatContacts = vol - resolutions; }
  repeatContacts = Math.max(0, repeatContacts);
  const repeatShare = handled > 0 ? repeatContacts / handled : 0;

  // Baseline pool — the marginal cost of ALL repeat demand. A burden and a ceiling,
  // NOT a savings figure and NOT "created." Realization does not apply here.
  const burden = repeatContacts * marg;
  const burdenLoaded = repeatContacts * loaded;   // accounting view

  // Channel handle economics (labor only) + blended effective minutes for FTE math.
  const laborLoadedPerMin = n(d.agentHourly) * n(d.overheadMultiplier) / 60;
  const chDefs = [
    { name: "Voice", pct: n(d.voicePct), aht: n(d.voiceAHT), conc: Math.max(0.1, n(d.voiceConcurrency)), color: ELECTRIC },
    { name: "Chat", pct: n(d.chatPct), aht: n(d.chatAHT), conc: Math.max(0.1, n(d.chatConcurrency)), color: GREEN },
    { name: "Email", pct: n(d.emailPct), aht: n(d.emailAHT), conc: Math.max(0.1, n(d.emailConcurrency)), color: AMBER },
  ];
  const channels = chDefs.map(ch => { const effAHT = ch.aht / ch.conc; return { ...ch, effAHT, handleCPC: laborLoadedPerMin * effAHT, volume: Math.round(handled * ch.pct / 100), spend: handled * (ch.pct / 100) * laborLoadedPerMin * effAHT }; });
  const chPctTotal = channels.reduce((s, c) => s + c.pct, 0) || 100;
  const blendedHandle = channels.reduce((s, c) => s + (c.pct / chPctTotal) * c.handleCPC, 0);
  const blendedEffMin = channels.reduce((s, c) => s + (c.pct / chPctTotal) * c.effAHT, 0) || 5.5;

  const pHrs = Math.max(1, n(d.productiveHoursPerFTE) || 140);
  const fteBurden = (repeatContacts * blendedEffMin / 60) / pHrs;

  // FCR dividend: capacity RELEASED is scenario-incremental; realizable applies the mechanism.
  const realism = { 5: "Operational", 10: "Root-cause work", 15: "Transformation" };
  const dividend = [5, 10, 15].map(p => {
    const f1 = Math.min(1, fcr + p / 100); const C1 = f1 + (1 - f1) * Mu;
    const avoided = Math.max(0, resolutions * (C - C1));
    const released = avoided * marg;
    return { p, newFCR: f1 * 100, avoided, released, realizable: released * mf, fte: (avoided * blendedEffMin / 60) / pHrs, tier: realism[p] };
  });

  const flags = [];
  if (loaded > 0 && marg >= loaded) flags.push({ sev: "warn", t: "Marginal cost is not below loaded. Marginal must be the lower, variable cost — eliminating a contact can't recover the fixed platform and facilities in the loaded figure. Check the cost basis." });
  if (chPctTotal !== 100) flags.push({ sev: "warn", t: `Channel mix sums to ${chPctTotal}%, not 100%. Channel spend is scaled to volume, but blended handle cost reads true only at 100%.` });
  if (repeatShare > 0.25) flags.push({ sev: "info", t: `Repeat demand is ${(repeatShare * 100).toFixed(0)}% of all contacts — a resolution problem, not a price problem. Cutting contact cost won't fix it; raising FCR will.` });
  if (fcr < 0.70 && Mu < 1.3) flags.push({ sev: "warn", t: `Low FCR (${n(d.fcrRate)}%) paired with shallow non-FCR depth (M=${Mu}) likely understates the repeat burden. Validate reopened cases, callbacks, transfers, and follow-ups — real M is usually higher than 1.3.` });
  if (mechKey === "none") flags.push({ sev: "warn", t: "No capacity action selected — realizable savings are $0. Pick a mechanism (overtime, hiring avoidance, vendor reduction, or headcount) before presenting any savings number." });
  if (mechKey === "headcount") flags.push({ sev: "info", t: "Headcount reduction is fully cashable but carries the highest change and CSAT risk — confirm the FCR gain is durable before committing to it." });

  return { C, gapPct, cprLoaded, loaded, marg, mf, handled: Math.round(handled), resolutions: Math.round(resolutions), repeatContacts: Math.round(repeatContacts), repeatShare, burden, burdenLoaded, channels, blendedHandle, blendedEffMin, chPctTotal, fteBurden, dividend, flags };
}

function buildAnalystRead(d, r, mechKey) {
  const out = [];
  const unit = d.denominator === "issues" ? "resolved issue" : "handled contact";
  out.push(`Your cost per contact is ${money(r.loaded)}, but your cost per resolution is ${money(r.cprLoaded)} — a ${r.gapPct.toFixed(0)}% premium. The gap is repeat demand: ${(r.repeatShare * 100).toFixed(0)}% of every handled contact is a repeat tied to an unresolved issue. The contact price isn't the problem; the repeat rate is. That's the 2026 move from cost-per-contact to resolution-cost thinking.`);

  out.push(`Your repeat-demand capacity burden is ${fmtK(r.burden)}/mo (${r.fteBurden.toFixed(1)} FTE of handling) — the marginal cost of all repeat contacts. Read it as a ceiling, not a savings figure: you can't release all of it, because FCR never reaches 100%. The realistic releases come from the FCR improvements below.`);

  const d10 = r.dividend.find(x => x.p === 10);
  if (d10) out.push(`Lifting FCR 10 points to ${d10.newFCR.toFixed(0)}% releases ${fmtK(d10.released)}/mo of that burden (capacity released, not yet cash). At your selected action — ${MECH[mechKey].label}${mechKey !== "none" ? ` (${Math.round(r.mf * 100)}%)` : ""} — ${fmtK(d10.realizable)}/mo is realizable this cycle. ${mechKey === "none" ? "Right now that's $0 because no capacity action is selected." : "Realization depends entirely on that action — change it and the number changes."} A +10 point FCR move is root-cause work, not a quick toggle; treat +15 as a transformation case, not a base case.`);

  out.push(`Reported cost-per-contact and cost-per-resolution are full loaded cost — correct for unit-cost metrics. Capacity burden and released figures are marginal. Realizable is marginal scaled by the capacity action. Those are four different numbers and the report keeps them separate on purpose — most CX ROI decks blur them, which is how bad automation gets justified.`);
  return out;
}

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}
export default function CostPerContactCalculator() {
  const [d, setD] = useState(BASE);
  const [mech, setMech] = useState("hiring");
  const [pulled, setPulled] = useState({});
  const [showMath, setShowMath] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const next = {}, got = {};
    const mc = getPrimitive("monthlyContacts"), ac = getPrimitive("annualContacts");
    if (mc != null && !isNaN(mc)) { next.monthlyContacts = Math.round(mc); got.monthlyContacts = true; }
    else if (ac != null && !isNaN(ac)) { next.monthlyContacts = Math.round(ac / 12); got.monthlyContacts = true; }
    const fcr = getPrimitive("fcr");
    if (fcr != null && !isNaN(fcr)) { next.fcrRate = fcr <= 1 ? Math.round(fcr * 100) : Math.round(fcr); got.fcrRate = true; }
    const cpc = getPrimitive("costPerContact");
    if (cpc != null && !isNaN(cpc)) { next.loadedCPC = +cpc.toFixed(2); got.loadedCPC = true; }
    const marg = getPrimitive("marginalPerContact");
    if (marg != null && !isNaN(marg)) { next.marginalCPC = +marg.toFixed(2); got.marginalCPC = true; }
    const ah = getPrimitive("agentHourly");
    if (ah != null && !isNaN(ah)) { next.agentHourly = ah; got.agentHourly = true; }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, mech);
  const analyst = buildAnalystRead(d, r, mech);

  // Finance-grade requires sourced cost basis AND a capacity mechanism AND a data attestation.
  const sourced = ["monthlyContacts", "loadedCPC", "marginalCPC"].filter(k => pulled[k]).length === 3;
  const mechSelected = mech !== "none";
  const grade = (sourced && mechSelected && d.validated) ? "Finance-grade" : (sourced || mechSelected) ? "Planning-grade" : "Directional";
  const gradeColor = grade === "Finance-grade" ? GREEN : grade === "Planning-grade" ? AMBER : MUTED;
  const gradeWhy = grade === "Finance-grade" ? "cost basis sourced, mechanism set, data validated" : grade === "Planning-grade" ? "partial rigor — for Finance-grade: source the cost basis, select a mechanism, validate FCR/M" : "default inputs — set your numbers";

  useEffect(() => {
    publishToolResult("cost-per-contact", {
      costPerContact: +r.loaded.toFixed(2), costPerResolution: +r.cprLoaded.toFixed(2),
      contactsPerResolution: +r.C.toFixed(2), repeatDemandSharePct: +(r.repeatShare * 100).toFixed(1), fcr: n(d.fcrRate),
      repeatContactsMonthly: r.repeatContacts, repeatDemandBurdenMonthly: Math.round(r.burden), fteBurden: +r.fteBurden.toFixed(1),
      capacityAction: mech, capacityRealizationPct: Math.round(r.mf * 100), grade, analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, mech]);

  const sendResults = () => {
    setSending(true);
    const body = new FormData();
    body.append("_subject", "Cost per Contact / Resolution — Center of CX");
    body.append("source", "Cost per Contact Calculator");
    body.append("cost_per_contact", money(r.loaded));
    body.append("cost_per_resolution", money(r.cprLoaded));
    body.append("repeat_demand_share", (r.repeatShare * 100).toFixed(0) + "%");
    body.append("repeat_burden", fmtK(r.burden) + "/mo");
    body.append("capacity_action", MECH[mech].label);
    body.append("grade", grade);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body, headers: { Accept: "application/json" } })
      .then(res => { if (res.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  const cprColor = r.gapPct > 40 ? RED : r.gapPct > 20 ? AMBER : GREEN;
  const tierColor = (t) => t === "Operational" ? GREEN : t === "Root-cause work" ? AMBER : RED;
  const volLabel = d.denominator === "issues" ? "Monthly resolved issues" : "Monthly handled contacts";
  const seg = (active) => ({ flex: 1, fontSize: 11, fontWeight: 600, padding: "7px 8px", borderRadius: 5, border: "none", cursor: "pointer", background: active ? ELECTRIC : "transparent", color: active ? "#fff" : SLATE });
  const mathRow = (label, val) => <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 12 }}><span style={{ color: SLATE, fontFamily: "monospace" }}>{label}</span><span style={{ color: NAVY, fontWeight: 600, textAlign: "right" }}>{val}</span></div>;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:760px){.cg{grid-template-columns:1fr 1fr!important}.s4{grid-template-columns:1fr 1fr!important}.s3{grid-template-columns:1fr!important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "52px 28px 32px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Cost per Contact vs Cost per Resolution</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 680 }}>A $7 call that takes three contacts to resolve is a $21 resolution. This separates handle cost from resolution cost and keeps four things distinct that most ROI decks blur: cost reported, repeat-demand burden, capacity released, and savings realized.</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {Object.keys(pulled).length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from your TCO run.</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Editable.</span>
              </div>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: gradeColor }} />
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{grade}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{gradeWhy}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: WARM, padding: "28px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase" }}>Volume & resolution</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: MUTED }}>Volume is:</span>
              <div style={{ display: "flex", gap: 3, background: "#fff", padding: 3, borderRadius: 7, border: `1px solid ${BORDER}`, width: 230 }}>
                <button onClick={() => set("denominator", "handled")} style={seg(d.denominator === "handled")}>Handled contacts</button>
                <button onClick={() => set("denominator", "issues")} style={seg(d.denominator === "issues")}>Resolved issues</button>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label={volLabel} value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
            <NumField label="FCR rate" value={d.fcrRate} onChange={v => set("fcrRate", v)} suffix="%" step={1} min={0} max={100} pulled={pulled.fcrRate} hint="First contact resolution" />
            <NumField label="Non-FCR contacts to resolution (M)" value={d.contactsPerUnresolved} onChange={v => set("contactsPerUnresolved", v)} step={0.1} min={1} hint="TOTAL contacts when not resolved first time, incl. the first. 1 first + 2 follow-ups = 3.0" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase", margin: "18px 0 12px" }}>Cost basis <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: MUTED }}>· pulled from TCO when available</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Loaded cost / contact" value={d.loadedCPC} onChange={v => set("loadedCPC", v)} prefix="$" step={0.25} min={0} pulled={pulled.loadedCPC} hint="Fully-loaded unit cost" />
            <NumField label="Marginal cost / contact" value={d.marginalCPC} onChange={v => set("marginalCPC", v)} prefix="$" step={0.25} min={0} pulled={pulled.marginalCPC} hint="Variable handle cost" />
            <NumField label="Agent hourly" value={d.agentHourly} onChange={v => set("agentHourly", v)} prefix="$" suffix="/hr" step={0.5} min={0} pulled={pulled.agentHourly} hint="For channel view" />
            <NumField label="Productive hrs / FTE / mo" value={d.productiveHoursPerFTE} onChange={v => set("productiveHoursPerFTE", v)} suffix="hrs" step={5} min={1} hint="After shrinkage (~140)" />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "32px 28px" }}>
        <div style={WRAP}>
          {/* Capacity action */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 24, background: WARM, border: `1px solid ${mech === "none" ? AMBER : BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Capacity action <span style={{ fontWeight: 400, color: MUTED }}>· how freed time becomes value</span></div>
              <div style={{ fontSize: 12, color: mech === "none" ? AMBER : MUTED }}>{MECH[mech].note}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <select value={mech} onChange={e => setMech(e.target.value)} style={{ fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>
                {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : ""}</option>)}
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={d.validated} onChange={e => set("validated", e.target.checked)} style={{ width: 14, height: 14, accentColor: ELECTRIC }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: NAVY }}>FCR & M validated from data</span>
              </label>
            </div>
          </div>

          {/* Summary — burden is a ceiling, not a savings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 12 }} className="s4">
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Cost per Contact</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: ELECTRIC }}>{money(r.loaded)}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>fully-loaded</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: cprColor, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Cost per Resolution</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>{money(r.cprLoaded)}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{r.C.toFixed(2)} contacts/issue · +{r.gapPct.toFixed(0)}%</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${AMBER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Repeat Demand Share</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: AMBER }}>{(r.repeatShare * 100).toFixed(0)}%</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>{r.repeatContacts.toLocaleString()} repeats/mo</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${RED}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Repeat-Demand Burden</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: RED }}>{fmtK(r.burden)}<span style={{ fontSize: 13, color: MUTED }}>/mo</span></div>
              <div style={{ fontSize: 10.5, color: MUTED }}>marginal ceiling · {r.fteBurden.toFixed(1)} FTE</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: SLATE, marginBottom: 28, background: `${RED}06`, border: `1px solid ${RED}20`, borderRadius: 8, padding: "10px 14px", lineHeight: 1.5 }}>
            The <strong>burden</strong> is a ceiling — the marginal cost of all repeat demand, not a savings figure. You can't release all of it (FCR never hits 100%). Realistic releases from FCR improvement, and what's actually realizable given your capacity action, are below.
          </p>

          {/* Integrity */}
          <div style={{ border: `1px solid ${r.flags.some(f => f.sev === "warn") ? AMBER : BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, background: r.flags.some(f => f.sev === "warn") ? `${AMBER}06` : WARM }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: r.flags.some(f => f.sev === "warn") ? AMBER : GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: r.flags.length ? 10 : 0 }}>{r.flags.length ? "⚠ Integrity checks" : "✓ Integrity checks passed"}</div>
            {r.flags.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: i ? 8 : 0 }}>
                <span style={{ color: f.sev === "warn" ? AMBER : ELECTRIC, fontWeight: 700, fontSize: 13 }}>{f.sev === "warn" ? "!" : "i"}</span>
                <span style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5 }}>{f.t}</span>
              </div>
            ))}
            {!r.flags.length && <span style={{ fontSize: 12.5, color: SLATE }}>Marginal below loaded, channel mix at 100%, M consistent with FCR, capacity action set. Numbers are internally consistent.</span>}
          </div>

          {/* FCR dividend: released vs realizable */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>FCR Improvement: Capacity Released → Realizable</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Released is incremental capacity at marginal cost ({money(r.marg)}). Realizable applies your capacity action ({MECH[mech].label}{mech !== "none" ? `, ${Math.round(r.mf * 100)}%` : ""}).</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="s3">
            {r.dividend.map((s, i) => (
              <div key={i} style={{ background: `${GREEN}0A`, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5, textTransform: "uppercase" }}>FCR +{s.p} → {s.newFCR.toFixed(0)}%</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: tierColor(s.tier), background: `${tierColor(s.tier)}15`, padding: "2px 6px", borderRadius: 4 }}>{s.tier}</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>Released</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: SLATE }}>{fmtK(s.released * 12)}/yr</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Realizable ({Math.round(r.mf * 100)}%)</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: GREEN }}>{fmtK(s.realizable * 12)}/yr</div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3 }}>{Math.round(s.avoided).toLocaleString()} avoided/mo · {s.fte.toFixed(1)} FTE</div>
              </div>
            ))}
          </div>

          {/* Channel */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Channel Handle Economics</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Handle-labor only — concurrency is why chat undercuts voice. Blended: <strong style={{ color: NAVY }}>{money(r.blendedHandle)}</strong>/contact. Averages hide complexity; shift only resolvable, low-complexity volume — model it in Channel Shift.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="s3">
            {r.channels.map((ch, i) => (
              <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ch.color }}>{ch.name}</span>
                  <span style={{ fontSize: 11, color: MUTED }}>{ch.pct}% of volume</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><div style={{ fontSize: 10, color: MUTED }}>AHT</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{ch.aht}m</div></div>
                  <div><div style={{ fontSize: 10, color: MUTED }}>Effective (÷{ch.conc})</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{ch.effAHT.toFixed(1)}m</div></div>
                  <div><div style={{ fontSize: 10, color: MUTED }}>Handle cost</div><div style={{ fontSize: 14, fontWeight: 600, color: ch.color }}>{money(ch.handleCPC)}</div></div>
                  <div><div style={{ fontSize: 10, color: MUTED }}>Handle spend</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{fmtK(ch.spend)}</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Analyst */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · cost reported ≠ capacity created ≠ savings realized</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
          </div>

          {/* Calculation drawer */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
            <button onClick={() => setShowMath(s => !s)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: WARM, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: NAVY }}>
              <span>Show the math — every formula, every value</span><span style={{ color: MUTED }}>{showMath ? "−" : "+"}</span>
            </button>
            {showMath && (
              <div style={{ padding: "16px 20px" }}>
                {mathRow("Contacts per resolution  C = FCR + (1−FCR) × M", `${(r.C - (1 - n(d.fcrRate) / 100) * n(d.contactsPerUnresolved)).toFixed(2)} + ${(1 - n(d.fcrRate) / 100).toFixed(2)}×${n(d.contactsPerUnresolved)} = ${r.C.toFixed(3)}`)}
                {mathRow(`Denominator = ${d.denominator}`, d.denominator === "issues" ? `handled = issues × C = ${r.handled.toLocaleString()}` : `resolutions = contacts / C = ${r.resolutions.toLocaleString()}`)}
                {mathRow("Repeat contacts = handled − resolutions", `${r.handled.toLocaleString()} − ${r.resolutions.toLocaleString()} = ${r.repeatContacts.toLocaleString()}`)}
                {mathRow("Repeat demand share = repeats / handled", `${(r.repeatShare * 100).toFixed(1)}%`)}
                {mathRow("Cost per resolution = loaded × C", `${money(r.loaded)} × ${r.C.toFixed(3)} = ${money(r.cprLoaded)}`)}
                {mathRow("Repeat-demand burden = repeats × marginal", `${r.repeatContacts.toLocaleString()} × ${money(r.marg)} = ${fmtK(r.burden)}/mo (ceiling)`)}
                {mathRow("Released (+10 FCR) = issues × (C − C₁) × marginal", `${fmtK((r.dividend.find(x => x.p === 10) || {}).released)}/mo`)}
                {mathRow(`Realizable = released × ${Math.round(r.mf * 100)}% (${MECH[mech].label})`, `${fmtK((r.dividend.find(x => x.p === 10) || {}).realizable)}/mo`)}
                {mathRow("FTE burden = repeats × blended eff. min / 60 / prod hrs", `${r.fteBurden.toFixed(1)}`)}
                <p style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.5 }}>M = total contacts an unresolved issue takes (incl. the first). Reported CPC/CPR are loaded; burden and released are marginal; realizable applies the capacity action. FTE is a capacity equivalent, not a headcount cut.</p>
              </div>
            )}
          </div>

          {/* Benchmarks */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Vertical Benchmarks <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>· illustrative ranges, FCR validated 2026</span></h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }} className="s3">
              {VBENCH.map((b, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{b.vert}</div>
                  <div style={{ fontSize: 12, color: "#fff" }}>CPC: {b.cpc}</div>
                  <div style={{ fontSize: 12, color: "#fff" }}>CPR: {b.cpr}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Avg FCR: {b.fcr}</div>
                </div>
              ))}
            </div>
            {n(d.fcrRate) < 78 && <a href="/tools/fcr-leakage" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", display: "inline-block" }}>→ Run FCR Leakage Diagnostic to find why resolution fails</a>}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport toolName="Cost per Contact / Resolution" subtitle={`Handle vs resolution cost · ${grade} · action: ${MECH[mech].label}`} userName="" userEmail="" sections={[
              { title: "Cost Metrics", type: "metrics", items: [
                { label: "Cost per Contact", value: money(r.loaded), color: ELECTRIC, sub: "loaded" },
                { label: "Cost per Resolution", value: money(r.cprLoaded), color: cprColor, sub: `${r.C.toFixed(2)} contacts/issue` },
                { label: "Repeat Demand Share", value: (r.repeatShare * 100).toFixed(0) + "%", color: AMBER, sub: `${r.repeatContacts.toLocaleString()}/mo` },
                { label: "Repeat-Demand Burden", value: fmtK(r.burden) + "/mo", color: RED, sub: `ceiling · ${r.fteBurden.toFixed(1)} FTE` },
              ]},
              { title: "Three Value Layers (don't conflate)", type: "table", rows: [
                ["Repeat-demand burden (baseline ceiling, marginal)", fmtK(r.burden) + "/mo"],
                ["Capacity released — FCR +10pts (incremental, marginal)", fmtK((r.dividend.find(x => x.p === 10) || {}).released) + "/mo"],
                [`Realizable this cycle (${MECH[mech].label}, ${Math.round(r.mf * 100)}%)`, fmtK((r.dividend.find(x => x.p === 10) || {}).realizable) + "/mo"],
                ["Burden, loaded (accounting only — not savings)", fmtK(r.burdenLoaded) + "/mo"],
              ]},
              { title: "FCR Dividend — Released → Realizable", type: "table", rows: r.dividend.map(s => ["FCR +" + s.p + " → " + s.newFCR.toFixed(0) + "% (" + s.tier + ")", "released " + fmtK(s.released * 12) + "/yr · realizable " + fmtK(s.realizable * 12) + "/yr"]) },
              ...(r.flags.length ? [{ title: "Integrity Checks", type: "findings", items: r.flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `A resolved issue averages C = FCR + (1 - FCR) x M contacts, where M is the TOTAL contacts an issue takes when not resolved on first contact (including the first). Volume basis: ${d.denominator === "issues" ? "resolved issues (handled contacts derived as issues x C)" : "handled contacts (resolutions derived as contacts / C)"}. Cost per resolution = loaded x C; reported CPC/CPR are fully loaded (correct for unit-cost metrics). The repeat-demand burden is the marginal cost of all repeat contacts — a baseline ceiling, not a savings figure and not "created." Capacity released is the scenario-incremental marginal value of a specific FCR improvement; realizable applies the selected capacity action (${MECH[mech].label}, ${Math.round(r.mf * 100)}%), because freed capacity is not cash until taken as overtime reduction, hiring avoidance, vendor reduction, or headcount. Report grade: ${grade} — ${gradeWhy}.` },
              { title: "Next Steps", type: "next", items: [
                { tool: "FCR Leakage Diagnostic", reason: "Decompose repeat demand by root cause and friction type", href: "/tools/fcr-leakage" },
                { tool: "Channel Shift Economics", reason: "Move resolvable volume to cheaper channels by issue type", href: "/tools/channel-shift" },
                { tool: "Business Case Builder", reason: "Add implementation cost, ramp, and payback to realizable savings", href: "/tools/business-case" },
              ]},
            ]} />
            <button onClick={sendResults} disabled={sending} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer" }}>{sent ? "Sent ✓" : sending ? "Sending..." : "Send Results & Request Review"}</button>
            <a href="/tools/tco-calculator" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>TCO Calculator →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
