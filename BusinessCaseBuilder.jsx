import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult } from "./src/lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 880, margin: "0 auto", padding: "0 28px" };
const CAPTURE_ENDPOINT = "https://formspree.io/f/mjgjwzwz";

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmtK = (v) => v >= 1000000 ? "$" + (v / 1000000).toFixed(2) + "M" : v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : "$" + Math.round(v).toLocaleString();
const fmtFull = (v) => "$" + Math.round(v).toLocaleString();

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

/* Field is module-scope so it keeps a stable identity across renders. The custom
   steppers use refs (valRef tracks the live value, accRef accumulates during a hold)
   so a press-and-hold accelerates without stale-closure drift, and because Card/H are
   also module-scope now, the input element is never remounted mid-press. */
function Field({ label, value, onChange, prefix, suffix, hint, step = 1, min, max }) {
  const holdRef = useRef(null);
  const valRef = useRef(value);
  valRef.current = value;
  const accRef = useRef(0);

  const clamp = (x) => {
    if (min != null && x < min) x = min;
    if (max != null && x > max) x = max;
    return Math.round(x * 100) / 100;
  };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => {
    stop();
    accRef.current = clamp(n(valRef.current));
    const doStep = () => { accRef.current = clamp(accRef.current + dir * step); onChange(String(accRef.current)); };
    doStep();
    let delay = 280;
    const tick = () => { doStep(); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); };
    holdRef.current = setTimeout(tick, delay);
  };

  const btn = { width: 22, height: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 8, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 3 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="number" value={value} step={step} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", paddingLeft: prefix ? 22 : 12, paddingRight: suffix ? 58 : 32, fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none" }} />
        {suffix && <span style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 4, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" aria-label="Increase" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" aria-label="Decrease" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function Card({ children, accent }) {
  return <div style={{ background: "#fff", border: `1px solid ${accent ? accent + "40" : BORDER}`, borderRadius: 10, padding: "24px 22px", marginBottom: 16 }}>{children}</div>;
}
function H({ children, color }) {
  return <h3 style={{ fontSize: 13, fontWeight: 700, color: color || ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{children}</h3>;
}

const STANCE = {
  aggressive: { label: "Aggressive", c: 1.00, h: 1.00, f: 1.00, a: 1.00, note: "Full modeled savings, no discount — matches typical vendor ROI tools." },
  expected: { label: "Expected", c: 0.85, h: 0.90, f: 0.80, a: 0.65, note: "Each lever discounted for real-world attribution. The defensible default." },
  conservative: { label: "Conservative", c: 0.70, h: 0.80, f: 0.65, a: 0.50, note: "Heavy haircut on soft levers — the floor you can commit to." },
};

/* De-overlapped model: every contact-based saving runs on the HANDLED pool
   (post-deflection); ACW is a disjoint slice of AHT; FCR repeats are on handled
   volume. Confidence weighting turns gross into a stance-adjusted net. */
function computeCase(d, stanceKey, rampOn) {
  const loaded = n(d.avgHourly) * (1 + n(d.benefitsPct) / 100);
  const annual = n(d.monthlyContacts) * 12;
  const deflected = annual * (n(d.containment) / 100);
  const handled = Math.max(0, annual - deflected);

  const acw = Math.min(n(d.currentACW), n(d.currentAHT));
  const talkHold = Math.max(0, n(d.currentAHT) - acw);
  const secSaved = talkHold * (n(d.htReduction) / 100) + acw * (n(d.acwReduction) / 100);
  const handleTime = handled * secSaved / 3600 * loaded;

  const containment = deflected * n(d.costPerContact);

  const oldRepeat = 1 - n(d.currentFCR) / 100;
  const newRepeat = 1 - Math.min(100, n(d.currentFCR) + n(d.fcrImprovement)) / 100;
  const avoidedRepeats = handled * Math.max(0, oldRepeat - newRepeat);
  const fcr = avoidedRepeats * n(d.costPerContact);

  const newAtt = n(d.currentAttrition) * (1 - n(d.attritionReduction) / 100);
  const avoidedTurnover = n(d.agents) * (n(d.currentAttrition) - newAtt) / 100;
  const perHire = n(d.recruitCostPerHire) + n(d.trainingDays) * 8 * loaded;
  const attrition = avoidedTurnover * perHire;

  const buckets = { containment, handleTime, fcr, attrition };
  const gross = containment + handleTime + fcr + attrition;
  const cf = STANCE[stanceKey];
  const net = containment * cf.c + handleTime * cf.h + fcr * cf.f + attrition * cf.a;

  const recurring = n(d.newPlatformPerAgentMo) * n(d.agents) * 12;
  const impl = n(d.implementationCost);
  const tco3 = impl + recurring * 3;

  // Monthly cash flow with a savings ramp. During the migration window, savings are
  // ~0 while the new platform is already being paid; after go-live they phase up
  // linearly to full over the ramp window. This turns an idealized instant payback
  // into an honest J-curve. With rampOn=false it collapses to the old instant model.
  const M = Math.max(0, Math.min(36, n(d.migrationMonths)));
  const R = Math.max(1, n(d.rampMonths));
  const monthlyFull = net / 12;
  const monthlyPlatform = recurring / 12;
  const factor = (t) => {
    if (!rampOn) return 1;
    if (t <= M) return 0;
    if (t <= M + R) return (t - M) / R;
    return 1;
  };
  const cumFlow = [-impl];
  let cum = -impl, savings3 = 0, year1 = 0, payback = 0;
  for (let t = 1; t <= 36; t++) {
    const s = factor(t) * monthlyFull;
    savings3 += s;
    if (t <= 12) year1 += s;
    cum += s - monthlyPlatform;
    cumFlow.push(cum);
    if (payback === 0 && cum >= 0) payback = t;
  }
  const roi3 = tco3 > 0 ? ((savings3 - tco3) / tco3 * 100) : 0;
  const netValue3 = savings3 - tco3;

  return { loaded, annual, handled, deflected, buckets, gross, net, haircut: gross - net, recurring, tco3, roi3, payback, netValue3, avoidedTurnover, avoidedRepeats, cumFlow, savings3, year1, M, R, monthlyFull, monthlyPlatform, rampOn };
}

function caseInsights(r, d, stanceKey) {
  const flags = [];
  // Input plausibility — the assumptions a CFO rejects on sight. These lead the read.
  if (n(d.containment) > 25) flags.push(`Your ${n(d.containment)}% self-service containment is above the 10–25% most centers actually achieve. Without a pilot proving it, model 15–20% as the defensible case — it's ${Math.round(r.buckets.containment / r.gross * 100)}% of your savings, so the board challenges it first.`);
  if (n(d.htReduction) > 15) flags.push(`A ${n(d.htReduction)}% handle-time reduction is aggressive — 8–15% is typical even with AI assist. Treat anything above 15% as upside, not base case.`);
  if (n(d.attritionReduction) > 25) flags.push(`${n(d.attritionReduction)}% attrition reduction is optimistic (15–25% is realistic) and the hardest lever to attribute to a platform. Discount it heavily or footnote it.`);
  const perAgentImpl = n(d.agents) > 0 ? n(d.implementationCost) / n(d.agents) : 0;
  if (perAgentImpl > 0 && perAgentImpl < 2000) flags.push(`Implementation of ${fmtFull(n(d.implementationCost))} for ${n(d.agents)} agents is ~${fmtFull(perAgentImpl)}/agent — low for a platform transformation (typical $3–8K/agent). An understated investment is the fastest way to lose board trust; a complete figure lengthens payback but survives diligence.`);
  if (r.payback === 0) flags.push(`At this platform cost, monthly savings never exceed monthly platform spend within three years — the case does not pay back as modeled. Revisit platform cost, targets, or stance before presenting.`);
  else if (r.payback > 0 && r.payback < 3) flags.push(`A ${r.payback}-month payback reads as too-good-to-be-true and invites scrutiny. Confirm the investment captures professional services, change management, and internal time before you present it.`);

  const out = [...flags.slice(0, 2)];

  const sorted = Object.entries(r.buckets).sort((a, b) => b[1] - a[1]);
  const [topName, topVal] = sorted[0];
  const labelMap = { containment: "self-service containment", handleTime: "handle-time reduction", fcr: "FCR improvement", attrition: "attrition reduction" };
  const topShare = Math.round(topVal / r.gross * 100);
  out.push(`${topShare}% of your case rests on ${labelMap[topName]}. ${topName === "containment" ? "A board probes deflection hardest — bring a pilot result or vendor benchmark." : topName === "attrition" ? "That's the softest, least-attributable lever — expect the most pushback there." : "It's a relatively defensible lever, which strengthens the case."}`);

  if (r.rampOn && r.payback > 0) {
    const instMonthly = r.monthlyFull - r.monthlyPlatform;
    const instPay = instMonthly > 0 ? Math.ceil(n(d.implementationCost) / instMonthly) : 0;
    if (instPay > 0 && r.payback > instPay)
      out.push(`Phasing savings over your ${r.M}-month migration and ${r.R}-month ramp moves payback from an idealized ${instPay} months to a realistic ${r.payback}. The phased figure is the one a CFO will trust — lead with it.`);
  } else if (!r.rampOn) {
    out.push(`Savings phasing is off, so this assumes 100% of savings land on day one — an idealized payback. Turn on phasing for the board-defensible number that accounts for migration and ramp.`);
  }

  out.push(`The ${stanceKey} stance applies a ${fmtK(r.haircut)} haircut to gross savings. Presenting gross ${fmtK(r.gross)} and net ${fmtK(r.net)} side by side signals you've already stress-tested your own numbers.`);

  return out;
}

const DEFAULTS = {
  agents: 200, avgHourly: 18, benefitsPct: 30, monthlyContacts: 120000, currentAHT: 420, currentACW: 45,
  currentFCR: 72, currentAttrition: 35, costPerContact: 7, recruitCostPerHire: 3500, trainingDays: 21,
  htReduction: 12, acwReduction: 30, fcrImprovement: 8, attritionReduction: 20, containment: 15,
  implementationCost: 750000, newPlatformPerAgentMo: 135, migrationMonths: 9, rampMonths: 6,
};

export default function BusinessCaseBuilder() {
  const [d, setD] = useState(DEFAULTS);
  const [stance, setStance] = useState("expected");
  const [rampOn, setRampOn] = useState(true);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const [capOpen, setCapOpen] = useState(false);
  const [capName, setCapName] = useState(""), [capCompany, setCapCompany] = useState(""), [capEmail, setCapEmail] = useState("");
  const [capState, setCapState] = useState("idle");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const r = computeCase(d, stance, rampOn);
  const insights = caseInsights(r, d, stance);

  // J-curve: cumulative cash flow over 36 months. Dips during migration, climbs as
  // savings ramp, crosses zero at payback.
  const spark = (() => {
    const W = 600, H = 88, pad = 8;
    const arr = r.cumFlow;
    const minV = Math.min(...arr), maxV = Math.max(...arr), span = (maxV - minV) || 1;
    const x = i => pad + (i / (arr.length - 1)) * (W - 2 * pad);
    const y = v => pad + (1 - (v - minV) / span) * (H - 2 * pad);
    const pts = arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return { W, H, pts, y0: y(0), pbx: r.payback > 0 ? x(r.payback) : null, end: arr[arr.length - 1] };
  })();
  const paybackLabel = r.payback > 0 ? `${r.payback} mo` : ">36 mo";

  useEffect(() => {
    publishToolResult("business-case-builder", {
      agents: n(d.agents), annualContacts: r.annual, grossSavings: Math.round(r.gross),
      netSavings: Math.round(r.net), stance, paybackMonths: r.payback, threeYearROI: Math.round(r.roi3),
      implementationCost: n(d.implementationCost), year1Savings: Math.round(r.year1), rampOn,
      migrationMonths: r.M, rampMonths: r.R, analystRead: insights[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, stance, rampOn]);

  const submitCapture = async () => {
    if (!capEmail.includes("@") || capState === "sending") return;
    setCapState("sending");
    try {
      await fetch(CAPTURE_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: capEmail, name: capName, company: capCompany, tool: "Business Case Builder", stance, net: fmtK(r.net), gross: fmtK(r.gross), payback: r.payback + "mo", roi: Math.round(r.roi3) + "%", _subject: `Business Case (${stance}): ${fmtK(r.net)} net — ${capCompany || capName || capEmail}` }),
      });
      setCapState("sent");
    } catch { setCapState("error"); }
  };

  const bucketRows = [
    { label: "Self-service containment", key: "containment", val: r.buckets.containment },
    { label: "Handle-time reduction (talk + ACW)", key: "handleTime", val: r.buckets.handleTime },
    { label: "FCR improvement (avoided repeats)", key: "fcr", val: r.buckets.fcr },
    { label: "Attrition reduction", key: "attrition", val: r.buckets.attrition },
  ].sort((a, b) => b.val - a.val);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: WARM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}@media(max-width:700px){.bc-grid{grid-template-columns:1fr!important}.bc-sum{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      <section style={{ padding: "40px 28px 80px" }}>
        <div style={WRAP}>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: NAVY, margin: "6px 0 6px" }}>Business Case Builder</h2>
          <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 26, maxWidth: 660 }}>Model the ROI of a CX transformation on your real numbers — live, no sign-up. Savings are de-overlapped (no double-counting), then haircut by a confidence stance so the case survives a CFO's scrutiny.</p>

          <Card>
            <H>Current State</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <Field label="Agent Count" value={d.agents} onChange={v => set("agents", v)} step={5} min={1} />
              <Field label="Avg Agent Hourly Rate" value={d.avgHourly} onChange={v => set("avgHourly", v)} prefix="$" step={0.5} min={0} />
              <Field label="Benefits & Burden" value={d.benefitsPct} onChange={v => set("benefitsPct", v)} suffix="%" hint="Typically 25–35%" min={0} max={100} />
              <Field label="Monthly Contact Volume" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} />
              <Field label="Current AHT (sec)" value={d.currentAHT} onChange={v => set("currentAHT", v)} step={5} min={1} hint={`${(n(d.currentAHT) / 60).toFixed(1)} min total`} />
              <Field label="Current ACW (sec)" value={d.currentACW} onChange={v => set("currentACW", v)} step={5} min={0} hint="After-call work — part of AHT" />
              <Field label="Current FCR" value={d.currentFCR} onChange={v => set("currentFCR", v)} suffix="%" min={0} max={100} />
              <Field label="Annual Attrition" value={d.currentAttrition} onChange={v => set("currentAttrition", v)} suffix="%" min={0} max={100} />
              <Field label="Cost per Contact" value={d.costPerContact} onChange={v => set("costPerContact", v)} prefix="$" step={0.5} min={0} hint="Fully loaded" />
              <Field label="Recruiting Cost / Hire" value={d.recruitCostPerHire} onChange={v => set("recruitCostPerHire", v)} prefix="$" step={100} min={0} />
              <Field label="New Hire Training Days" value={d.trainingDays} onChange={v => set("trainingDays", v)} min={0} />
            </div>
          </Card>

          <Card accent={GREEN}>
            <H color={GREEN}>Target Improvements</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <Field label="Handle-time Reduction (talk/hold)" value={d.htReduction} onChange={v => set("htReduction", v)} suffix="%" min={0} max={100} hint="Applied to AHT minus ACW" />
              <Field label="ACW Reduction" value={d.acwReduction} onChange={v => set("acwReduction", v)} suffix="%" min={0} max={100} hint="Auto-summary. Applied to ACW only" />
              <Field label="FCR Improvement" value={d.fcrImprovement} onChange={v => set("fcrImprovement", v)} suffix="pts" min={0} max={100} hint="Industry: 5–10 pt lift" />
              <Field label="Attrition Reduction" value={d.attritionReduction} onChange={v => set("attritionReduction", v)} suffix="%" min={0} max={100} hint="Industry: 15–25%" />
              <Field label="Self-Service Containment" value={d.containment} onChange={v => set("containment", v)} suffix="%" min={0} max={100} hint="Industry: 10–25%" />
            </div>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>ACW is modeled as a slice of AHT, so handle-time and ACW reductions never double-count the same minutes. Containment removes contacts from the handled pool before any per-contact saving is applied.</p>
          </Card>

          <Card accent={AMBER}>
            <H color={AMBER}>Investment</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="bc-grid">
              <Field label="Implementation (one-time)" value={d.implementationCost} onChange={v => set("implementationCost", v)} prefix="$" step={5000} min={0} hint="PS, migration, integration" />
              <Field label="New Platform / Agent / Mo" value={d.newPlatformPerAgentMo} onChange={v => set("newPlatformPerAgentMo", v)} prefix="$" step={5} min={0} hint="Recurring solution cost" />
              <Field label="Migration Timeline" value={d.migrationMonths} onChange={v => set("migrationMonths", v)} suffix="mo" min={1} max={36} hint="Build phase — ~0% savings" />
              <Field label="Ramp to Full Savings" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" min={1} max={24} hint="Post-go-live climb to 100%" />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={rampOn} onChange={e => setRampOn(e.target.checked)} style={{ width: 15, height: 15, accentColor: ELECTRIC, cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Phase in savings over migration + ramp <span style={{ color: MUTED, fontWeight: 400 }}>(recommended — honest payback)</span></span>
            </label>
          </Card>

          {/* Stance selector */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>Case stance</div>
                <div style={{ fontSize: 12, color: MUTED }}>{STANCE[stance].note}</div>
              </div>
              <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                {Object.entries(STANCE).map(([k, v]) => (
                  <button key={k} onClick={() => setStance(k)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: stance === k ? ELECTRIC : "transparent", color: stance === k ? "#fff" : SLATE }}>{v.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "32px 28px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Business Case Summary <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>· {STANCE[stance].label} stance</span></h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }} className="bc-sum">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: GREEN }}>{fmtK(r.net)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Net Annual Savings <span style={{ opacity: 0.6 }}>· run-rate</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `year 1 ${fmtK(r.year1)} after ramp` : `gross ${fmtK(r.gross)} − ${fmtK(r.haircut)} haircut`}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: r.payback && r.payback <= 12 ? GREEN : (r.payback && r.payback <= 18) ? AMBER : RED }}>{paybackLabel}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Payback Period</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `phased: ${r.M}mo build + ${r.R}mo ramp` : "idealized — phasing off"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: r.roi3 > 100 ? GREEN : r.roi3 > 0 ? AMBER : RED }}>{Math.round(r.roi3)}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>3-Year ROI</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>on {fmtK(r.tco3)} 3-yr TCO</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bucketRows.map((item, i) => {
                const pct = r.gross > 0 ? item.val / r.gross * 100 : 0;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, minWidth: 70, textAlign: "right" }}>{fmtK(item.val)}</span>
                    <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: GREEN, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30 }}>{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>

            {rampOn && (
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>Cumulative Cash Flow · 36 months</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{r.payback > 0 ? `Breaks even month ${r.payback}` : "No breakeven in 3 yrs"} · ends {fmtK(spark.end)}</span>
                </div>
                <svg viewBox={`0 0 ${spark.W} ${spark.H}`} width="100%" height="88" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                  <line x1="0" y1={spark.y0} x2={spark.W} y2={spark.y0} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  {spark.pbx != null && <line x1={spark.pbx} y1="0" x2={spark.pbx} y2={spark.H} stroke={GREEN} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
                  <polyline points={spark.pts} fill="none" stroke={LIGHT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  {spark.pbx != null && <circle cx={spark.pbx} cy={spark.y0} r="3.5" fill={GREEN} />}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  <span>Month 0 · −{fmtK(Math.abs(r.cumFlow[0]))}</span>
                  <span>Migration {r.M}mo</span>
                  <span>Month 36</span>
                </div>
              </div>
            )}
          </div>

          {/* Analyst Read — the defensibility layer */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · how this survives the boardroom</div>
            {insights.map((t, i) => (
              <p key={i} style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>
            ))}
          </div>

          {/* Optional capture */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            {capState === "sent" ? (
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ Sent — the full business case is on its way to your inbox.</div>
            ) : !capOpen ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: SLATE }}>Want this business case emailed to you?</span>
                <button onClick={() => setCapOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "transparent", border: `1px solid ${ELECTRIC}`, borderRadius: 7, padding: "9px 16px", cursor: "pointer" }}>Email me this case</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Name" value={capName} onChange={e => setCapName(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <input placeholder="Company" value={capCompany} onChange={e => setCapCompany(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="email" placeholder="you@company.com" value={capEmail} onChange={e => setCapEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitCapture()} style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <button onClick={submitCapture} disabled={!capEmail.includes("@") || capState === "sending"} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: capEmail.includes("@") ? ELECTRIC : MUTED, border: "none", borderRadius: 6, padding: "10px 18px", cursor: "pointer" }}>{capState === "sending" ? "Sending…" : "Send"}</button>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Optional. We send this case once. No list, no spam.</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport
              toolName="Business Case"
              subtitle={`CX Transformation ROI · ${STANCE[stance].label} stance`}
              userName={capName}
              userEmail={capEmail}
              sections={[
                { title: "Executive Summary", type: "text", content: `Modeled on ${n(d.agents)} agents handling ${(r.annual / 1e6).toFixed(2)}M contacts annually, this CX transformation reaches ${fmtK(r.net)} in net annual savings at full run-rate (${STANCE[stance].label} stance) against a ${fmtFull(n(d.implementationCost))} one-time investment and ${fmtFull(r.recurring)}/yr platform cost. ${rampOn ? `Savings are phased over a ${r.M}-month migration and ${r.R}-month ramp — year one delivers ${fmtK(r.year1)} as the program ramps — producing ` : `Assuming savings land at full run-rate immediately, this produces `}a ${r.payback > 0 ? `${r.payback}-month` : "beyond-3-year"} payback and ${Math.round(r.roi3)}% three-year ROI on ${fmtK(r.tco3)} total cost of ownership. Savings are de-overlapped (no double-counted minutes or contacts) and discounted for attribution risk, so the figures are presented to survive financial scrutiny rather than to maximize a headline.` },
                { title: "Financial Summary", type: "metrics", items: [
                  { label: "Net Annual Savings", value: fmtFull(r.net), color: GREEN, sub: `${STANCE[stance].label} · run-rate` },
                  { label: rampOn ? "Year 1 (ramped)" : "Gross (pre-haircut)", value: rampOn ? fmtFull(r.year1) : fmtFull(r.gross), color: rampOn ? ELECTRIC : MUTED, sub: rampOn ? `${r.M}mo build + ${r.R}mo ramp` : `Haircut ${fmtFull(r.haircut)}` },
                  { label: "One-time Investment", value: fmtFull(n(d.implementationCost)), color: RED },
                  { label: "Annual Platform Cost", value: fmtFull(r.recurring), color: AMBER },
                  { label: "Payback Period", value: r.payback > 0 ? `${r.payback} months` : ">36 months", color: ELECTRIC, sub: rampOn ? "phased" : "idealized" },
                  { label: "3-Year ROI", value: `${Math.round(r.roi3)}%`, color: GREEN, sub: `on ${fmtFull(r.tco3)} TCO` },
                ]},
                { title: "Savings Breakdown", type: "table", rows: bucketRows.map(b => [b.label, fmtFull(b.val) + ` (${Math.round(r.gross > 0 ? b.val / r.gross * 100 : 0)}% of gross)`]) },
                { title: "Analyst Read", type: "findings", items: insights },
                { title: "Key Assumptions", type: "table", rows: [
                  ["Loaded hourly rate", fmtFull(r.loaded) + `/hr (${n(d.avgHourly)} + ${n(d.benefitsPct)}% burden)`],
                  ["Annual contacts", (r.annual).toLocaleString()],
                  ["Contacts deflected (containment)", Math.round(r.deflected).toLocaleString() + ` (${n(d.containment)}%)`],
                  ["Handled pool (post-deflection)", Math.round(r.handled).toLocaleString()],
                  ["Handle-time saved per contact", `${(((n(d.currentAHT) - Math.min(n(d.currentACW), n(d.currentAHT))) * n(d.htReduction) / 100) + (Math.min(n(d.currentACW), n(d.currentAHT)) * n(d.acwReduction) / 100)).toFixed(0)}s`],
                  ["Avoided repeat contacts (FCR)", Math.round(r.avoidedRepeats).toLocaleString()],
                  ["Avoided turnover (attrition)", `${r.avoidedTurnover.toFixed(1)} agents/yr`],
                  ["Savings phasing", rampOn ? `${r.M}-mo migration (0% savings) + ${r.R}-mo linear ramp to full` : "Off — full savings assumed from day one"],
                  ...(rampOn ? [["Year 1 savings (ramped)", fmtFull(r.year1) + ` of ${fmtFull(r.net)} run-rate`]] : []),
                  ["Confidence weighting", `containment ${Math.round(STANCE[stance].c * 100)}%, handle-time ${Math.round(STANCE[stance].h * 100)}%, FCR ${Math.round(STANCE[stance].f * 100)}%, attrition ${Math.round(STANCE[stance].a * 100)}%`],
                ]},
                { title: "Recommended Next Steps", type: "next", items: [
                  { tool: "TCO Calculator", reason: "Validate the platform cost assumptions behind this case", href: "/tools/tco-calculator" },
                  { tool: "Transformation Readiness", reason: "Confirm the organization can actually deliver these targets", href: "/tools/transformation-readiness" },
                  { tool: "Contract Risk Scanner", reason: "Pressure-test vendor pricing before it enters the case", href: "/tools/contract-risk" },
                ]},
                { title: "Methodology", type: "text", content: "Savings are computed on the post-deflection handled pool so deflected contacts are never also credited with handle-time or FCR savings. After-call work is treated as a disjoint slice of AHT, so handle-time and ACW reductions cannot double-count the same minutes. Each lever is then weighted by an attribution-confidence factor (the stance) to produce net savings. Savings are phased over a monthly cash-flow model: zero during the migration build, then a linear ramp to full run-rate over the ramp window, so payback reflects the real J-curve rather than assuming benefits land on day one. ROI is calculated against three-year total cost of ownership (one-time implementation plus recurring platform cost). This is deliberately conservative: the goal is a number a CFO will approve, not the largest possible headline." },
              ]}
            />
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8 }}>Connect with a Consultant →</a>
            <a href="/tools/tco-calculator" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8 }}>TCO Calculator →</a>
            <a href="/how-to-choose" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8 }}>All Tools</a>
          </div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "40px 28px 28px" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={24} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX</span>
        <div style={{ display: "flex", gap: 16 }}><a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a><a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a></div></div></div></footer>
    </div>
  );
}
