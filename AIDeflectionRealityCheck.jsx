import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import { MECH, MECH_ORDER, MECH_DEFAULT } from "./src/lib/mech";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, VIOLET = "#7C6FE8";
const WRAP = { maxWidth: 980, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmt = (v) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(n(v))).toLocaleString();
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



const ENV0 = { monthlyContacts: 80000, costPerContact: 7, marginalPerContact: 4.2 };
const VENDOR0 = { grossDeflection: 40, botLeakage: 15, containmentFailure: 12, escalationPenalty: 25, botPlatformCost: 8000, qaCost: 2000, tuningHours: 40, tuningRate: 65, knowledgeMaintHours: 20, knowledgeRate: 55 };
const VENDORB0 = { grossDeflection: 32, botLeakage: 9, containmentFailure: 9, escalationPenalty: 18, botPlatformCost: 5000, qaCost: 1200, tuningHours: 25, tuningRate: 65, knowledgeMaintHours: 12, knowledgeRate: 55 };

// Per-vendor engine. env (volume + cost) is shared; v is the vendor's claimed
// performance + operating cost. Returns the full reality picture incl. dual
// realization, closed-form break-even thresholds, and a 12-month ramp.
function compute(env, v, mechKey, rampMonths, rampOn) {
  const M = n(env.monthlyContacts), cpc = n(env.costPerContact);
  const marg = n(env.marginalPerContact) > 0 ? n(env.marginalPerContact) : cpc * 0.6;
  // Freed capacity converts to cash only through a committed action. "none" is 0.
  // Operating cost and escalation premium are real cash and are never scaled by sf.
  const sf = MECH[mechKey].f;
  const Gp = n(v.grossDeflection), G = Gp / 100, L = n(v.botLeakage) / 100, F = n(v.containmentFailure) / 100, esc = n(v.escalationPenalty) / 100;
  const keep = (1 - L) * (1 - F), ret = 1 - keep;

  const grossDeflected = M * G, netDeflected = M * G * keep, returned = M * G * ret;
  const netDeflectionRate = M > 0 ? netDeflected / M * 100 : 0;
  const opex = n(v.botPlatformCost) + n(v.qaCost) + n(v.tuningHours) * n(v.tuningRate) + n(v.knowledgeMaintHours) * n(v.knowledgeRate);
  const escalationPremium = returned * marg * esc;
  const vendorClaim = grossDeflected * cpc;

  // Net savings per unit gross fraction (excl. fixed opex): K·G − opex reconciles exactly.
  const K = marg * M * (keep * sf - ret * esc);
  const realSaving = netDeflected * marg * sf;
  const netSavings = K * G - opex;
  const realizedDollarsPct = vendorClaim > 0 ? netSavings / vendorClaim * 100 : 0;     // financial lens
  const realizedDeflectionPct = Gp > 0 ? netDeflectionRate / Gp * 100 : 0;              // operational lens

  // Break-even thresholds (closed form): what would have to be true.
  const beGrossPct = K > 0 ? (opex / K) * 100 : Infinity;          // min claimed deflection to break even
  const platformHeadroom = netSavings;                            // opex can rise this much before net=0
  let leakTolPct = null;                                           // max leakage before net=0
  if (marg * M * G > 0 && (sf + esc) > 0) { const kStar = (esc + opex / (marg * M * G)) / (sf + esc); const Lstar = 1 - kStar / (1 - F); leakTolPct = Math.max(0, Math.min(100, Lstar * 100)); }

  // 12-month ramp: deflection climbs to target over rampMonths (bot tuning curve).
  const monthly = [];
  let year1 = 0;
  for (let m = 1; m <= 12; m++) { const gm = G * (rampOn ? Math.min(1, m / Math.max(1, rampMonths)) : 1); const nm = K * gm - opex; monthly.push(nm); year1 += nm; }
  const steadyAnnual = 12 * netSavings;

  const waterfall = [
    { label: "Vendor claim (gross × loaded cost)", value: vendorClaim, type: "positive" },
    { label: "Loaded → marginal (fixed cost doesn't fall)", value: -grossDeflected * (cpc - marg), type: "negative" },
    { label: "Bot leakage (abandon bot, call in)", value: -M * G * L * marg, type: "negative" },
    { label: "Containment failure (false resolution)", value: -M * G * (1 - L) * F * marg, type: "negative" },
    { label: `Capacity not converted to cash (${MECH[mechKey].label})`, value: -netDeflected * marg * (1 - sf), type: "negative" },
    { label: "Escalation premium (post-bot calls cost more)", value: -escalationPremium, type: "negative" },
    { label: "Operating cost (platform, QA, tuning, KM)", value: -opex, type: "negative" },
  ];

  return { M, cpc, marg, sf, Gp, grossDeflected, netDeflected, returned, netDeflectionRate, opex, escalationPremium, vendorClaim, realSaving, netSavings, realizedDollarsPct, realizedDeflectionPct, beGrossPct, platformHeadroom, leakTolPct, monthly, year1, steadyAnnual, waterfall };
}

// Bot-performance sensitivity: hold env + claimed deflection + capacity action, vary leakage
// and containment failure across three bands. Anchored to the user's own inputs.
function buildSensitivity(env, v, mechKey, rampMonths, rampOn) {
  const bands = [
    { label: "Best case", mult: 0.5, note: "Bot performs above plan" },
    { label: "Likely (your inputs)", mult: 1.0, note: "As entered" },
    { label: "First 12 months", mult: 1.6, note: "Early-life reality" },
  ];
  return bands.map(b => {
    const vv = { ...v, botLeakage: Math.min(100, n(v.botLeakage) * b.mult), containmentFailure: Math.min(100, n(v.containmentFailure) * b.mult) };
    const r = compute(env, vv, mechKey, rampMonths, rampOn);
    return { ...b, netSavings: r.netSavings, netDeflectionRate: r.netDeflectionRate };
  });
}

function buildAnalystRead(env, v, mechKey, r) {
  const out = [];
  out.push(`Two lenses on the same pitch: operationally, the bot delivers ${r.realizedDeflectionPct.toFixed(0)}% of the deflection promised (${r.netDeflectionRate.toFixed(0)}% true vs ${r.Gp}% claimed); financially, you keep ${r.realizedDollarsPct.toFixed(0)}% of the dollar value. The gap between those two is not the vendor failing twice, it's your conservative choice to value savings at marginal cost, which a CFO should expect you to defend, not hide.`);

  if (r.cpc > 0 && r.marg / r.cpc < 0.85)
    out.push(`Savings are valued at marginal cost (${fmt(r.marg)}/contact), not loaded (${fmt(r.cpc)}). Deflecting a contact frees agent handle time, not the fixed platform and facilities cost in the loaded figure. Banking it as cash means reducing or re-deploying FTE, otherwise you've freed capacity, not cut spend.`);

  if (isFinite(r.beGrossPct)) {
    const headroom = r.Gp - r.beGrossPct;
    out.push(headroom > 20
      ? `This program breaks even at just ${r.beGrossPct.toFixed(0)}% gross deflection, you're claiming ${r.Gp}%, so it has wide headroom. The risk here isn't whether it pays back; it's whether you actually capture the freed capacity as cash. Negotiate on price and tuning support, not on whether to proceed.`
      : `Break-even sits at ${r.beGrossPct.toFixed(0)}% gross deflection against your ${r.Gp}% claim, a thin margin. If real-world deflection lands below ${r.beGrossPct.toFixed(0)}%, this is a net cost. Get the vendor to commit to a deflection floor in the contract.`);
  } else {
    out.push(`At these assumptions the program never breaks even, operating and escalation cost exceed the realistic savings at any deflection rate. The platform cost is too high for this volume, or leakage is too severe.`);
  }

  out.push(`Your true deflection rate is ${r.netDeflectionRate.toFixed(1)}%, not the ${r.Gp}% claimed, ${Math.round(r.returned).toLocaleString()} contacts/mo leak back or come back falsely resolved. That gap, plus the ${fmt(r.marg)} marginal basis, are the two numbers to take into the vendor negotiation.`);

  out.push(mechKey === "none"
    ? `You have selected no capacity action, so realized savings are $0 and the only cash moving is operating cost and escalation premium. That is the honest answer, and it is the case most business cases quietly skip. Freed handle time is capacity. It becomes money when you reduce overtime, slow hiring, cut vendor volume, or reduce headcount. Pick one, or present this as a capacity story rather than a savings story.`
    : `Freed capacity is valued at ${Math.round(MECH[mechKey].f * 100)}% under ${MECH[mechKey].label}. Operating cost and escalation premium are real cash out and are never scaled by that action, which is why "Not selected" still shows a loss rather than zero. Note what the vendor's ROI slide assumes: valuing this at full deflection means Headcount reduction, 100%. If nobody is cutting heads, the slide is not your number.`);
  return out;
}

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}

// Vendor-specific input block (rendered once, or twice in A/B compare mode).
function VendorInputs({ v, onChange, compact }) {
  const f = (k) => (val) => onChange(k, val);
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }} className="cg">
      <NumField compact={compact} label="Gross deflection" value={v.grossDeflection} onChange={f("grossDeflection")} suffix="%" step={1} min={0} max={100} hint="Vendor promise" />
      <NumField compact={compact} label="Bot leakage" value={v.botLeakage} onChange={f("botLeakage")} suffix="%" step={1} min={0} max={100} hint="Abandon bot, call in" />
      <NumField compact={compact} label="Containment failure" value={v.containmentFailure} onChange={f("containmentFailure")} suffix="%" step={1} min={0} max={100} hint="Bot says resolved, isn't" />
      <NumField compact={compact} label="Escalation premium" value={v.escalationPenalty} onChange={f("escalationPenalty")} suffix="%" step={1} min={0} max={200} hint="Post-bot calls cost more" />
      <NumField compact={compact} label="Bot platform cost" value={v.botPlatformCost} onChange={f("botPlatformCost")} prefix="$" suffix="/mo" step={500} min={0} />
      <NumField compact={compact} label="QA + monitoring" value={v.qaCost} onChange={f("qaCost")} prefix="$" suffix="/mo" step={250} min={0} />
      <NumField compact={compact} label="Tuning hrs/mo" value={v.tuningHours} onChange={f("tuningHours")} suffix="hrs" step={5} min={0} />
      <NumField compact={compact} label="Tuning rate" value={v.tuningRate} onChange={f("tuningRate")} prefix="$" suffix="/hr" step={5} min={0} />
      <NumField compact={compact} label="Knowledge maint" value={v.knowledgeMaintHours} onChange={f("knowledgeMaintHours")} suffix="hrs/mo" step={5} min={0} />
      <NumField compact={compact} label="Knowledge rate" value={v.knowledgeRate} onChange={f("knowledgeRate")} prefix="$" suffix="/hr" step={5} min={0} />
    </div>
  );
}
export default function AIDeflectionRealityCheck() {
  const [env, setEnv] = useState(ENV0);
  const [vA, setVA] = useState(VENDOR0);
  const [vB, setVB] = useState(VENDORB0);
  const [mech, setMech] = useState(MECH_DEFAULT);
  const [rampOn, setRampOn] = useState(true);
  const [rampMonths, setRampMonths] = useState(6);
  const [compareMode, setCompareMode] = useState(false);
  const [pulled, setPulled] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const setE = (k, v) => setEnv(p => ({ ...p, [k]: v }));
  const setVendorA = (k, v) => setVA(p => ({ ...p, [k]: v }));
  const setVendorB = (k, v) => setVB(p => ({ ...p, [k]: v }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const next = {}, got = {};
    const mc = getPrimitive("monthlyContacts"), ac = getPrimitive("annualContacts");
    if (mc != null && !isNaN(mc)) { next.monthlyContacts = Math.round(mc); got.monthlyContacts = true; }
    else if (ac != null && !isNaN(ac)) { next.monthlyContacts = Math.round(ac / 12); got.monthlyContacts = true; }
    const cpc = getPrimitive("costPerContact");
    if (cpc != null && !isNaN(cpc)) { next.costPerContact = cpc; got.costPerContact = true; }
    const marg = getPrimitive("marginalPerContact");
    if (marg != null && !isNaN(marg)) { next.marginalPerContact = marg; got.marginalPerContact = true; }
    if (Object.keys(next).length) { setEnv(p => ({ ...p, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rA = compute(env, vA, mech, rampMonths, rampOn);
  const rB = compute(env, vB, mech, rampMonths, rampOn);
  const sens = buildSensitivity(env, vA, mech, rampMonths, rampOn);
  const analyst = buildAnalystRead(env, vA, mech, rA);
  const winner = compareMode ? (rA.netSavings >= rB.netSavings ? "A" : "B") : null;

  useEffect(() => {
    publishToolResult("ai-deflection", {
      grossDeflectionClaimed: n(vA.grossDeflection), realisticDeflectionRate: +(rA.netDeflectionRate / 100).toFixed(4),
      deflectionNetSavingsMonthly: Math.round(rA.netSavings), deflectionNetSavingsAnnual: Math.round(rA.steadyAnnual),
      deflectionYear1Net: Math.round(rA.year1), realizedDollarsPct: Math.round(rA.realizedDollarsPct),
      realizedDeflectionPct: Math.round(rA.realizedDeflectionPct), breakEvenDeflectionPct: isFinite(rA.beGrossPct) ? +rA.beGrossPct.toFixed(1) : null,
      capacityAction: mech, analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, vA, mech, rampOn, rampMonths]);

  const sendResults = () => {
    setSending(true);
    const body = new FormData();
    body.append("_subject", "AI Deflection Reality Check, Center of CX");
    body.append("source", "AI Deflection Reality Check");
    body.append("vendor_claim", fmtK(rA.vendorClaim));
    body.append("net_savings_monthly", fmtK(rA.netSavings));
    body.append("realistic_deflection", rA.netDeflectionRate.toFixed(1) + "%");
    body.append("dollars_realized", Math.round(rA.realizedDollarsPct) + "%");
    body.append("deflection_realized", Math.round(rA.realizedDeflectionPct) + "%");
    body.append("capacity_action", MECH[mech].label);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body, headers: { Accept: "application/json" } })
      .then(res => { if (res.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  const summaryCard = (label, value, sub, color, dark) => (
    <div style={{ background: dark ? `linear-gradient(135deg, ${NAVY}, ${DEEP})` : WARM, border: dark ? "none" : `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: dark ? color : MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: dark ? "#fff" : color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.4)" : MUTED }}>{sub}</div>
    </div>
  );

  const realColor = (p) => p >= 60 ? GREEN : p >= 35 ? AMBER : RED;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:760px){.cg{grid-template-columns:1fr 1fr!important}.s4{grid-template-columns:1fr 1fr!important}.s3{grid-template-columns:1fr!important}.ab{grid-template-columns:1fr!important}.wf{grid-template-columns:1fr 70px!important}.wf .wfb{display:none}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "52px 28px 32px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>AI Deflection Reality Check</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 660 }}>Your vendor says 40% deflection. This does the math the slide skips, leakage, containment failure, escalation premiums, operating cost, and the marginal-cost reality that deflection frees variable labor, not your fully-loaded cost per contact. Compare two vendors, find the break-even, and model the ramp.</p>
          {Object.keys(pulled).length > 0 && (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from your TCO run.</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Editable.</span>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: WARM, padding: "28px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase" }}>Your environment <span style={{ color: MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· shared across vendors</span></div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} style={{ width: 15, height: 15, accentColor: ELECTRIC, cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Compare two vendors (A/B)</span>
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Monthly contacts" value={env.monthlyContacts} onChange={v => setE("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
            <NumField label="Loaded cost / contact" value={env.costPerContact} onChange={v => setE("costPerContact", v)} prefix="$" step={0.25} min={0} pulled={pulled.costPerContact} hint="Vendor's basis" />
            <NumField label="Marginal cost / contact" value={env.marginalPerContact} onChange={v => setE("marginalPerContact", v)} prefix="$" step={0.25} min={0} pulled={pulled.marginalPerContact} hint="What deflection frees" />
          </div>

          {!compareMode ? (
            <div style={{ marginTop: 16 }}><VendorInputs v={vA} onChange={setVendorA} /></div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }} className="ab">
              <div style={{ background: "#fff", border: `1px solid ${ELECTRIC}`, borderRadius: 10, padding: "16px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, marginBottom: 12 }}>● Vendor A</div>
                <VendorInputs v={vA} onChange={setVendorA} compact />
              </div>
              <div style={{ background: "#fff", border: `1px solid ${VIOLET}`, borderRadius: 10, padding: "16px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: VIOLET, marginBottom: 12 }}>● Vendor B</div>
                <VendorInputs v={vB} onChange={setVendorB} compact />
              </div>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: "#fff", padding: "32px 28px" }}>
        <div style={WRAP}>
          {/* Capacity action + ramp */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24, background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Capacity action</div>
              <div style={{ fontSize: 12, color: mech === "none" ? AMBER : MUTED }}>{MECH[mech].note}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                This moves the money, not the bot. Net savings, dollars realized, and break-even all respond.
                True deflection rate and Deflection Realized will not: those are properties of the bot, and no
                accounting choice changes how many contacts it actually resolves.
              </div>
            </div>
            <div style={{ flex: "0 1 280px" }}>
              <select value={mech} onChange={e => setMech(e.target.value)} style={{ width: "100%", fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 7, border: `1px solid ${mech === "none" ? AMBER : BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>
                {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : "  (0%)"}</option>)}
              </select>
              {mech === "headcount" && (
                <div style={{ fontSize: 11, color: AMBER, marginTop: 6, lineHeight: 1.5 }}>
                  This is the assumption behind most vendor ROI slides. If nobody is cutting heads, this is not your number.
                </div>
              )}
            </div>
          </div>

          {/* A/B comparison */}
          {compareMode && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Vendor A vs Vendor B <span style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>· same environment, {MECH[mech].label.toLowerCase()}</span></h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ab">
                {[{ k: "A", r: rA, c: ELECTRIC }, { k: "B", r: rB, c: VIOLET }].map(({ k, r, c }) => (
                  <div key={k} style={{ background: winner === k ? `${c}0D` : "#fff", border: `2px solid ${winner === k ? c : BORDER}`, borderRadius: 12, padding: "20px 22px", position: "relative" }}>
                    {winner === k && <span style={{ position: "absolute", top: -10, right: 16, background: c, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 10, letterSpacing: 0.5 }}>HIGHER NET</span>}
                    <div style={{ fontSize: 12, fontWeight: 700, color: c, marginBottom: 10 }}>● Vendor {k} <span style={{ color: MUTED, fontWeight: 400 }}>· claims {r.Gp}%</span></div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: r.netSavings >= 0 ? GREEN : RED }}>{fmtK(r.netSavings)}<span style={{ fontSize: 13, color: MUTED }}>/mo net</span></div>
                    <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
                      <div><div style={{ fontSize: 10, color: MUTED }}>True deflection</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{r.netDeflectionRate.toFixed(1)}%</div></div>
                      <div><div style={{ fontSize: 10, color: MUTED }}>Dollars realized</div><div style={{ fontSize: 15, fontWeight: 600, color: realColor(r.realizedDollarsPct) }}>{r.realizedDollarsPct.toFixed(0)}%</div></div>
                      <div><div style={{ fontSize: 10, color: MUTED }}>Break-even</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{isFinite(r.beGrossPct) ? r.beGrossPct.toFixed(0) + "%" : "n/a"}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: SLATE, marginTop: 12, lineHeight: 1.55, background: WARM, borderRadius: 8, padding: "10px 14px" }}>
                {Math.abs(rA.netSavings - rB.netSavings) < Math.max(rA.netSavings, rB.netSavings) * 0.1
                  ? `Near tie on net savings, but Vendor ${rA.realizedDollarsPct >= rB.realizedDollarsPct ? "A" : "B"} realizes more of its pitch (${Math.max(rA.realizedDollarsPct, rB.realizedDollarsPct).toFixed(0)}% vs ${Math.min(rA.realizedDollarsPct, rB.realizedDollarsPct).toFixed(0)}%). The higher-claim vendor isn't delivering more value; decide on price, tuning burden, and contract terms.`
                  : `Vendor ${winner} nets ${fmtK(Math.abs(rA.netSavings - rB.netSavings))}/mo more. Note whether that's from a higher deflection claim (riskier) or lower operating cost (more durable) before you let the headline decide.`}
              </p>
            </div>
          )}

          {/* Primary (Vendor A) headline: dual realization */}
          {compareMode && <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Vendor A: full reality breakdown</h3>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 28 }} className="s4">
            {summaryCard("Vendor Claims", fmtK(rA.vendorClaim) + "/mo", `${rA.Gp}% at loaded ${fmt(rA.cpc)}`, ELECTRIC)}
            {summaryCard("Net Savings (Reality)", fmtK(rA.netSavings) + "/mo", rA.netSavings < 0 ? "net cost" : `${fmtK(rA.netSavings * 12)}/yr steady`, rA.netSavings > 0 ? GREEN : RED, true)}
            {summaryCard("Deflection Realized", rA.realizedDeflectionPct.toFixed(0) + "%", `${rA.netDeflectionRate.toFixed(0)}% true of ${rA.Gp}% claimed`, realColor(rA.realizedDeflectionPct))}
            {summaryCard("Dollars Realized", rA.realizedDollarsPct.toFixed(0) + "%", "of the pitch's $ value", realColor(rA.realizedDollarsPct))}
          </div>

          {/* Waterfall */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Savings Waterfall: Vendor Claim → Reality</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>True deflection: <strong style={{ color: NAVY }}>{rA.netDeflectionRate.toFixed(1)}%</strong> vs {rA.Gp}% claimed.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
            {rA.waterfall.map((w, i) => {
              const maxAbs = Math.max(...rA.waterfall.map(x => Math.abs(x.value)), 1);
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "260px 1fr 90px", gap: 12, alignItems: "center", padding: "6px 0" }} className="wf">
                  <span style={{ fontSize: 12, color: SLATE }}>{w.label}</span>
                  <div className="wfb" style={{ height: 18, background: WARM, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.abs(w.value) / maxAbs * 100}%`, background: w.type === "positive" ? GREEN : RED, borderRadius: 4, opacity: 0.75 }} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: w.type === "positive" ? GREEN : RED, textAlign: "right" }}>{w.value >= 0 ? "+" : ""}{fmtK(w.value)}</span>
                </div>
              );
            })}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 90px", gap: 12, alignItems: "center", padding: "10px 0", borderTop: `2px solid ${NAVY}`, marginTop: 4 }} className="wf">
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Net monthly savings</span><div className="wfb" />
              <span style={{ fontSize: 15, fontWeight: 700, color: rA.netSavings >= 0 ? GREEN : RED, textAlign: "right" }}>{fmtK(rA.netSavings)}</span>
            </div>
          </div>

          {/* Break-even */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Break-Even: What Would Have to Be True</h3>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>The thresholds to take into the negotiation, where this stops paying off.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="s3">
              {[
                { l: "Break-even deflection", v: isFinite(rA.beGrossPct) ? rA.beGrossPct.toFixed(1) + "%" : "never", s: `you claim ${rA.Gp}%`, c: isFinite(rA.beGrossPct) && rA.beGrossPct < rA.Gp * 0.6 ? GREEN : AMBER },
                { l: "Max leakage tolerated", v: rA.leakTolPct != null ? rA.leakTolPct.toFixed(0) + "%" : "n/a", s: `you're at ${n(vA.botLeakage)}%`, c: rA.leakTolPct != null && rA.leakTolPct > n(vA.botLeakage) * 1.5 ? GREEN : AMBER },
                { l: "Operating-cost headroom", v: fmtK(rA.platformHeadroom) + "/mo", s: "before net hits $0", c: rA.platformHeadroom > 0 ? GREEN : RED },
              ].map((t, i) => (
                <div key={i} style={{ background: WARM, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{t.l}</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: t.c }}>{t.v}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{t.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ramp */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: 0 }}>First-Year Ramp</h3>
                <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>Deflection climbs to target as the bot is tuned, year 1 is not steady-state.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={rampOn} onChange={e => setRampOn(e.target.checked)} style={{ width: 14, height: 14, accentColor: ELECTRIC }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Model ramp</span>
                </label>
                {rampOn && <div style={{ width: 130 }}><NumField compact label="Ramp to full (mo)" value={rampMonths} onChange={setRampMonths} min={1} max={12} step={1} /></div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 11, color: MUTED }}>Year 1 {rampOn ? `(ramped ${rampMonths}mo)` : "(full)"}</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: rA.year1 >= 0 ? GREEN : RED }}>{fmtK(rA.year1)}</div></div>
              <div><div style={{ fontSize: 11, color: MUTED }}>Steady-state annual</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: NAVY }}>{fmtK(rA.steadyAnnual)}</div></div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
                  {rA.monthly.map((m, i) => { const mx = Math.max(...rA.monthly.map(Math.abs), 1); return <div key={i} title={`Mo ${i + 1}: ${fmtK(m)}`} style={{ flex: 1, height: `${Math.max(4, Math.abs(m) / mx * 100)}%`, background: m >= 0 ? GREEN : RED, opacity: 0.35 + 0.65 * (i / 11), borderRadius: 2 }} />; })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: MUTED, marginTop: 3 }}><span>Mo 1</span><span>net savings / mo</span><span>Mo 12</span></div>
              </div>
            </div>
          </div>

          {/* Analyst Read */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · what the vendor slide skips</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
          </div>

          {/* Sensitivity (anchored to inputs) */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Bot-Performance Sensitivity</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Your volume, cost, claimed deflection, and capacity action held fixed. Only leakage and containment failure vary. This is the risk if the bot doesn't perform as promised.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="s3">
              {sens.map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px", border: `1px solid ${i === 1 ? "rgba(0,170,255,0.4)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: s.netSavings >= 0 ? "#fff" : RED }}>{fmtK(s.netSavings)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.netDeflectionRate.toFixed(1)}% true defl · {s.note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="/vendors/iva" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ 50 scored IVA vendors</a>
              <a href="/tools/channel-shift" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ Channel Shift Economics</a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport toolName="AI Deflection Reality Check" subtitle={`Net savings after the fine print · capacity action: ${MECH[mech].label}`} userName="" userEmail="" sections={[
              { title: "Deflection Reality", type: "metrics", items: [
                { label: "Vendor Claim", value: fmtK(rA.vendorClaim) + "/mo", color: ELECTRIC, sub: `${rA.Gp}% at ${fmt(rA.cpc)}` },
                { label: "Net Savings", value: fmtK(rA.netSavings) + "/mo", color: rA.netSavings > 0 ? GREEN : RED, sub: rA.netSavings > 0 ? fmtK(rA.steadyAnnual) + "/yr" : "net cost" },
                { label: "Deflection Realized", value: rA.realizedDeflectionPct.toFixed(0) + "%", color: realColor(rA.realizedDeflectionPct), sub: "operational" },
                { label: "Dollars Realized", value: rA.realizedDollarsPct.toFixed(0) + "%", color: realColor(rA.realizedDollarsPct), sub: "financial" },
              ]},
              { title: "Vendor Claim → Reality Bridge", type: "table", rows: rA.waterfall.map(w => [w.label, (w.value >= 0 ? "+" : "") + fmt(w.value)]).concat([["Net monthly savings", fmt(rA.netSavings)]]) },
              { title: "Break-Even Thresholds", type: "table", rows: [
                ["Break-even deflection", isFinite(rA.beGrossPct) ? rA.beGrossPct.toFixed(1) + "% (claim " + rA.Gp + "%)" : "never breaks even"],
                ["Max leakage tolerated", rA.leakTolPct != null ? rA.leakTolPct.toFixed(0) + "% (at " + n(vA.botLeakage) + "%)" : "n/a"],
                ["Operating-cost headroom", fmtK(rA.platformHeadroom) + "/mo before net $0"],
                ["Year 1 (ramped " + rampMonths + "mo)", fmtK(rA.year1) + " vs steady " + fmtK(rA.steadyAnnual)],
              ]},
              ...(compareMode ? [{ title: "Vendor A vs Vendor B", type: "table", rows: [
                ["Vendor A net (claims " + rA.Gp + "%)", fmtK(rA.netSavings) + "/mo · " + rA.realizedDollarsPct.toFixed(0) + "% realized"],
                ["Vendor B net (claims " + rB.Gp + "%)", fmtK(rB.netSavings) + "/mo · " + rB.realizedDollarsPct.toFixed(0) + "% realized"],
                ["Higher net", "Vendor " + winner],
              ]}] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Truly deflected contacts (gross minus bot leakage minus containment failure) are valued at marginal cost, the variable handle-time labor deflection frees, not the fully-loaded cost per contact the vendor uses, because fixed platform and facilities cost don't fall with volume. Freed handle time is capacity, not cash, until an action converts it. Realized capacity is scaled by the selected capacity action (${MECH[mech].label}, ${Math.round(MECH[mech].f * 100)}%), and "Not selected" realizes $0. Operating cost and escalation premium are real cash out and are never scaled by that action, which is why no action still shows a loss rather than zero. Valuing deflection at 100% is Headcount reduction, which is the assumption most vendor ROI slides make silently. Deflection Realized is the operational lens (true rate ÷ claimed); Dollars Realized is the financial lens (net cash ÷ the vendor's loaded-cost claim). Break-even thresholds are solved in closed form. The waterfall reconciles exactly to net savings.` },
              { title: "Next Steps", type: "next", items: [
                { tool: "TCO Calculator", reason: "Feed the realistic deflection rate into your total cost model", href: "/tools/tco-calculator" },
                { tool: "Channel Shift Economics", reason: "Model the staffing impact of moving volume off voice", href: "/tools/channel-shift" },
                { tool: "Business Case Builder", reason: "Turn realistic net savings into a board-ready case", href: "/tools/business-case" },
              ]},
            ]} />
            <button onClick={sendResults} disabled={sending} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer" }}>{sent ? "Sent ✓" : sending ? "Sending..." : "Send Results & Request Review"}</button>
            <a href="/tools/cost-per-contact" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Cost per Contact →</a>
            <a href="/research/iva-buyer-guide" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>IVA Buyer Guide →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
