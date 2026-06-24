import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmt = (v) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(n(v))).toLocaleString();
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };
const pctStr = (v) => (n(v) * 100).toFixed(1) + "%";

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

// Live-committing field with hold-to-accelerate steppers + PULLED badge (suite standard).
function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, factor = 1, pulled }) {
  const display = n(value) * factor;
  const [local, setLocal] = useState(String(display));
  const holdRef = useRef(null), valRef = useRef(display);
  valRef.current = display;
  useEffect(() => { setLocal(String(Math.round(display * 1000) / 1000)); /* eslint-disable-next-line */ }, [value]);
  const commit = (raw) => { const p = parseFloat(raw); onChange(isNaN(p) ? 0 : p / factor); };
  const clamp = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => { stop(); let v = clamp(n(valRef.current)); const doStep = () => { v = clamp(v + dir * step); setLocal(String(v)); onChange(v / factor); }; doStep(); let delay = 280; const tick = () => { doStep(); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); }; holdRef.current = setTimeout(tick, delay); };
  const btn = { width: 22, height: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, fontSize: 8, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}{pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local} onChange={e => { setLocal(e.target.value); commit(e.target.value); }} onBlur={() => setLocal(String(Math.round(display * 1000) / 1000))}
          style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, paddingLeft: prefix ? 26 : 12, paddingRight: 44, outline: "none" }}
          onFocus={e => e.target.style.borderColor = ELECTRIC} onBlurCapture={e => e.target.style.borderColor = BORDER} />
        {suffix && <span style={{ position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 4, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <span style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}

// Stance = how much truly-deflected capacity converts to cash (you must reduce or
// re-deploy FTE to bank it). Costs are never haircut — only the savings side.
const STANCE = {
  conservative: { label: "Conservative", f: 0.70, note: "Freed capacity is hard to bank without headcount action — heavy haircut." },
  expected: { label: "Expected", f: 0.85, note: "Realistic conversion of freed capacity to cash. The defensible default." },
  aggressive: { label: "Aggressive", f: 1.00, note: "Full capacity value, no haircut — matches the vendor ROI slide." },
};

const BASE = {
  monthlyContacts: 80000, costPerContact: 7, marginalPerContact: 4.2, grossDeflection: 40,
  botLeakage: 15, containmentFailure: 12, escalationPenalty: 25,
  qaCost: 2000, botPlatformCost: 8000, tuningHours: 40, tuningRate: 65,
  knowledgeMaintHours: 20, knowledgeRate: 55,
};

function compute(d, stanceKey) {
  const monthly = n(d.monthlyContacts);
  const cpc = n(d.costPerContact);
  const marg = n(d.marginalPerContact) > 0 ? n(d.marginalPerContact) : cpc * 0.6;
  const sf = STANCE[stanceKey].f;

  const grossDeflected = monthly * (n(d.grossDeflection) / 100);
  const leaked = grossDeflected * (n(d.botLeakage) / 100);
  const failed = (grossDeflected - leaked) * (n(d.containmentFailure) / 100);
  const netDeflected = Math.max(0, grossDeflected - leaked - failed);
  const returned = leaked + failed;
  const netDeflectionRate = monthly > 0 ? netDeflected / monthly * 100 : 0;

  const opex = n(d.botPlatformCost) + n(d.qaCost) + n(d.tuningHours) * n(d.tuningRate) + n(d.knowledgeMaintHours) * n(d.knowledgeRate);
  const escalationPremium = returned * marg * (n(d.escalationPenalty) / 100);

  const vendorClaim = grossDeflected * cpc;               // the inflated pitch (loaded cost)
  const realSaving = netDeflected * marg * sf;            // truly deflected, marginal, stance-adjusted
  const netSavings = realSaving - escalationPremium - opex;
  const realizedPct = vendorClaim > 0 ? netSavings / vendorClaim * 100 : 0;

  // Honest bridge from vendor pitch to reality. Reconciles exactly to netSavings.
  const waterfall = [
    { label: "Vendor claim (gross × loaded cost)", value: vendorClaim, type: "positive" },
    { label: "Loaded → marginal (fixed cost doesn't fall)", value: -grossDeflected * (cpc - marg), type: "negative" },
    { label: "Bot leakage (abandon bot, call in)", value: -leaked * marg, type: "negative" },
    { label: "Containment failure (false resolution)", value: -failed * marg, type: "negative" },
    { label: `Capacity-to-cash haircut (${STANCE[stanceKey].label})`, value: -netDeflected * marg * (1 - sf), type: "negative" },
    { label: "Escalation premium (post-bot calls cost more)", value: -escalationPremium, type: "negative" },
    { label: "Operating cost (platform, QA, tuning, KM)", value: -opex, type: "negative" },
  ];

  return { monthly, cpc, marg, sf, grossDeflected, leaked, failed, netDeflected, returned, netDeflectionRate, opex, escalationPremium, vendorClaim, realSaving, netSavings, realizedPct, waterfall };
}

function buildAnalystRead(d, r, stanceKey) {
  const out = [];
  out.push(`The vendor pitch of ${fmtK(r.vendorClaim)}/mo assumes ${n(d.grossDeflection)}% deflection valued at fully-loaded ${fmt(r.cpc)}/contact. After leakage, containment failure, marginal-cost reality, and operating cost, you keep ${fmtK(r.netSavings)}/mo — ${r.realizedPct.toFixed(0)}% of the slide.`);

  if (r.cpc > 0 && r.marg / r.cpc < 0.85)
    out.push(`Savings are valued at marginal cost (${fmt(r.marg)}/contact), not loaded (${fmt(r.cpc)}). Deflecting a contact frees agent handle time, not the fixed platform and facilities cost baked into the loaded figure. Banking it as cash means reducing or re-deploying FTE — otherwise you've freed capacity, not cut spend.`);

  out.push(`Your true deflection rate is ${r.netDeflectionRate.toFixed(1)}%, not the ${n(d.grossDeflection)}% claimed — ${Math.round(r.returned).toLocaleString()} contacts/mo leak back or come back falsely resolved. That gap is the number to take into vendor negotiations.`);

  if (r.netSavings < 0)
    out.push(`At these assumptions the program is a net cost of ${fmtK(Math.abs(r.netSavings))}/mo. The operating and escalation costs exceed the realistic savings. Either deflection has to rise, leakage has to fall, or the platform cost is too high for this volume.`);
  else if (r.opex > r.realSaving * 0.5)
    out.push(`Operating cost (${fmtK(r.opex)}/mo) eats ${Math.round(r.opex / r.realSaving * 100)}% of gross realized savings — the program works but is overhead-heavy. At higher volume the fixed platform cost amortizes better; at this volume it's a thin margin.`);

  out.push(`The ${STANCE[stanceKey].label} stance haircuts realized capacity to ${Math.round(r.sf * 100)}%. Operating and escalation costs are never haircut — they're real cash out — so the conservative case is appropriately the harshest.`);
  return out;
}

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}

export default function AIDeflectionRealityCheck() {
  const [d, setD] = useState(BASE);
  const [stance, setStance] = useState("expected");
  const [pulled, setPulled] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Auto-fill volume + both cost bases from TCO / Business Case via the shared contract.
  useEffect(() => {
    const next = {}, got = {};
    const mc = getPrimitive("monthlyContacts"); const ac = getPrimitive("annualContacts");
    if (mc != null && !isNaN(mc)) { next.monthlyContacts = Math.round(mc); got.monthlyContacts = true; }
    else if (ac != null && !isNaN(ac)) { next.monthlyContacts = Math.round(ac / 12); got.monthlyContacts = true; }
    const cpc = getPrimitive("costPerContact");
    if (cpc != null && !isNaN(cpc)) { next.costPerContact = cpc; got.costPerContact = true; }
    const marg = getPrimitive("marginalPerContact");
    if (marg != null && !isNaN(marg)) { next.marginalPerContact = marg; got.marginalPerContact = true; }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, stance);
  const analyst = buildAnalystRead(d, r, stance);

  // Publish the REALISTIC deflection + savings so TCO / Business Case stop modeling vendor fantasy.
  useEffect(() => {
    publishToolResult("ai-deflection", {
      grossDeflectionClaimed: n(d.grossDeflection), realisticDeflectionRate: +r.netDeflectionRate.toFixed(1),
      deflectionNetSavingsMonthly: Math.round(r.netSavings), deflectionNetSavingsAnnual: Math.round(r.netSavings * 12),
      realizedVsVendorPct: Math.round(r.realizedPct), stance, analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, stance]);

  const sendResults = () => {
    setSending(true);
    const body = new FormData();
    body.append("_subject", "AI Deflection Reality Check — Center of CX");
    body.append("source", "AI Deflection Reality Check");
    body.append("vendor_claim", fmtK(r.vendorClaim));
    body.append("net_savings_monthly", fmtK(r.netSavings));
    body.append("realistic_deflection", r.netDeflectionRate.toFixed(1) + "%");
    body.append("realized_pct", Math.round(r.realizedPct) + "%");
    body.append("stance", stance);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body, headers: { Accept: "application/json" } })
      .then(res => { if (res.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:760px){.cg{grid-template-columns:1fr 1fr!important}.wf{grid-template-columns:1fr 70px!important}.wf .wfb{display:none}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "56px 28px 36px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>AI Deflection Reality Check</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 640 }}>Your vendor says 40% deflection. This does the math the slide skips — leakage, containment failure, escalation premiums, operating cost, and the marginal-cost reality that deflection frees variable labor, not your fully-loaded cost per contact.</p>
          {Object.keys(pulled).length > 0 && (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from your TCO run.</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Editable.</span>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: WARM, padding: "32px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
            <NumField label="Loaded cost / contact" value={d.costPerContact} onChange={v => set("costPerContact", v)} prefix="$" step={0.25} min={0} pulled={pulled.costPerContact} hint="Vendor's basis" />
            <NumField label="Marginal cost / contact" value={d.marginalPerContact} onChange={v => set("marginalPerContact", v)} prefix="$" step={0.25} min={0} pulled={pulled.marginalPerContact} hint="What deflection frees" />
            <NumField label="Gross deflection" value={d.grossDeflection} onChange={v => set("grossDeflection", v)} suffix="%" step={1} min={0} max={100} hint="Vendor promise" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
            <NumField label="Bot leakage" value={d.botLeakage} onChange={v => set("botLeakage", v)} suffix="%" step={1} min={0} max={100} hint="Abandon bot, call in" />
            <NumField label="Containment failure" value={d.containmentFailure} onChange={v => set("containmentFailure", v)} suffix="%" step={1} min={0} max={100} hint="Bot says resolved, isn't" />
            <NumField label="Escalation premium" value={d.escalationPenalty} onChange={v => set("escalationPenalty", v)} suffix="%" step={1} min={0} max={200} hint="Post-bot calls cost more" />
            <NumField label="Bot platform cost" value={d.botPlatformCost} onChange={v => set("botPlatformCost", v)} prefix="$" suffix="/mo" step={500} min={0} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
            <NumField label="QA + monitoring" value={d.qaCost} onChange={v => set("qaCost", v)} prefix="$" suffix="/mo" step={250} min={0} />
            <NumField label="Tuning hours/mo" value={d.tuningHours} onChange={v => set("tuningHours", v)} suffix="hrs" step={5} min={0} />
            <NumField label="Tuning rate" value={d.tuningRate} onChange={v => set("tuningRate", v)} prefix="$" suffix="/hr" step={5} min={0} />
            <NumField label="Knowledge maint" value={d.knowledgeMaintHours} onChange={v => set("knowledgeMaintHours", v)} suffix="hrs/mo" step={5} min={0} />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "36px 28px" }}>
        <div style={WRAP}>
          {/* Stance */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 24, background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Savings stance</div><div style={{ fontSize: 12, color: MUTED }}>{STANCE[stance].note}</div></div>
            <div style={{ display: "flex", gap: 6, background: "#fff", padding: 4, borderRadius: 8, border: `1px solid ${BORDER}` }}>
              {Object.entries(STANCE).map(([k, v]) => <button key={k} onClick={() => setStance(k)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: stance === k ? ELECTRIC : "transparent", color: stance === k ? "#fff" : SLATE }}>{v.label}</button>)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Vendor Claims</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: ELECTRIC }}>{fmtK(r.vendorClaim)}<span style={{ fontSize: 14, color: MUTED }}>/mo</span></div>
              <div style={{ fontSize: 11, color: MUTED }}>{n(d.grossDeflection)}% at loaded {fmt(r.cpc)}/contact</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.netSavings > 0 ? GREEN : RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Net Savings (Reality)</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>{fmtK(r.netSavings)}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.netSavings < 0 ? "Net cost, not savings" : `${fmtK(r.netSavings * 12)}/year`}</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${r.realizedPct >= 60 ? GREEN : r.realizedPct >= 40 ? AMBER : RED}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Reality vs Claim</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: r.realizedPct >= 60 ? GREEN : r.realizedPct >= 40 ? AMBER : RED }}>{r.realizedPct.toFixed(0)}%</div>
              <div style={{ fontSize: 11, color: MUTED }}>of the pitch you actually keep</div>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Savings Waterfall: Vendor Claim → Reality</h3>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Net deflection rate: <strong style={{ color: NAVY }}>{r.netDeflectionRate.toFixed(1)}%</strong> vs the {n(d.grossDeflection)}% claimed.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
            {r.waterfall.map((w, i) => {
              const maxAbs = Math.max(...r.waterfall.map(x => Math.abs(x.value)), 1);
              const width = Math.abs(w.value) / maxAbs * 100;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "260px 1fr 90px", gap: 12, alignItems: "center", padding: "6px 0" }} className="wf">
                  <span style={{ fontSize: 12, color: SLATE }}>{w.label}</span>
                  <div className="wfb" style={{ height: 18, background: WARM, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${width}%`, background: w.type === "positive" ? GREEN : RED, borderRadius: 4, opacity: 0.75 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: w.type === "positive" ? GREEN : RED, textAlign: "right" }}>{w.value >= 0 ? "+" : ""}{fmtK(w.value)}</span>
                </div>
              );
            })}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 90px", gap: 12, alignItems: "center", padding: "10px 0", borderTop: `2px solid ${NAVY}`, marginTop: 4 }} className="wf">
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Net monthly savings</span>
              <div className="wfb" />
              <span style={{ fontSize: 15, fontWeight: 700, color: r.netSavings >= 0 ? GREEN : RED, textAlign: "right" }}>{fmtK(r.netSavings)}</span>
            </div>
          </div>

          {/* Analyst Read */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · what the vendor slide skips</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Scenario Comparison</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>True (net) deflection rate under three common projection profiles:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Vendor Optimistic", gross: 45, leakage: 5, fail: 8, note: "Typical pitch" },
                { label: "Industry Average", gross: 30, leakage: 12, fail: 15, note: "Research consensus" },
                { label: "Conservative", gross: 20, leakage: 18, fail: 20, note: "First 12 months" },
              ].map((s, i) => {
                const sNet = s.gross * (1 - s.leakage / 100) * (1 - s.fail / 100);
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: "#fff" }}>{sNet.toFixed(0)}% net</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{s.gross}% claimed · {s.note}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="/vendors/iva" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ 50 scored IVA vendors</a>
              <a href="/tools/channel-shift" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ Channel Shift Economics</a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport toolName="AI Deflection Reality Check" subtitle={`Net savings after leakage + escalation · ${STANCE[stance].label} stance`} userName="" userEmail="" sections={[
              { title: "Deflection Reality", type: "metrics", items: [
                { label: "Vendor Claim", value: fmtK(r.vendorClaim) + "/mo", color: ELECTRIC, sub: `${n(d.grossDeflection)}% at ${fmt(r.cpc)}` },
                { label: "Net Savings", value: fmtK(r.netSavings) + "/mo", color: r.netSavings > 0 ? GREEN : RED, sub: r.netSavings > 0 ? fmtK(r.netSavings * 12) + "/yr" : "net cost" },
                { label: "Realized vs Claim", value: r.realizedPct.toFixed(0) + "%", color: r.realizedPct >= 60 ? GREEN : r.realizedPct >= 40 ? AMBER : RED },
                { label: "True Deflection Rate", value: r.netDeflectionRate.toFixed(1) + "%", color: AMBER, sub: `vs ${n(d.grossDeflection)}% claimed` },
              ]},
              { title: "Vendor Claim → Reality Bridge", type: "table", rows: r.waterfall.map(w => [w.label, (w.value >= 0 ? "+" : "") + fmt(w.value)]).concat([["Net monthly savings", fmt(r.netSavings)]]) },
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Truly deflected contacts (gross minus bot leakage minus containment failure) are valued at marginal cost — the variable handle-time labor deflection frees — not the fully-loaded cost per contact the vendor uses, because fixed platform and facilities cost don't fall with volume. Realized capacity is scaled by a ${STANCE[stance].label} capacity-to-cash stance. Operating and escalation costs are real cash and are never haircut. The waterfall bridges the vendor's loaded-cost claim to the realistic net, and reconciles exactly to the net figure.` },
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
