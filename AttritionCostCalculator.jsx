import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}
const fmtK = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`;

export default function AttritionCostCalculator() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({
    agents: 200, attritionRate: 35, avgSalary: 38000,
    recruitingCost: 2500, screeningHours: 8, hrRate: 35,
    trainingWeeks: 6, trainerRate: 30, classSize: 12,
    nestingWeeks: 4, nestingProductivity: 50,
    rampMonths: 3, rampProductivity: 75,
    supervisorHoursPerNew: 10, supRate: 32,
    overtimePremium: 50, vacancyDays: 30,
    qaDragPct: 15,
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = v => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Attrition Cost Calculator", _subject: "Attrition Cost Calculator Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const departures = Math.round(n(d.agents) * (n(d.attritionRate) / 100));
  const hourlyRate = n(d.avgSalary) / 2080;

  // Per-departure costs
  const recruiting = n(d.recruitingCost) + (n(d.screeningHours) * n(d.hrRate));
  const trainingDays = n(d.trainingWeeks) * 5;
  const training = (trainingDays * 8 * hourlyRate) + (trainingDays * 8 * n(d.trainerRate) / n(d.classSize));
  const nestingDays = n(d.nestingWeeks) * 5;
  const nestingLoss = nestingDays * 8 * hourlyRate * (1 - n(d.nestingProductivity) / 100);
  const rampDays = n(d.rampMonths) * 22;
  const rampLoss = rampDays * 8 * hourlyRate * (1 - n(d.rampProductivity) / 100);
  const supervisorBurden = n(d.supervisorHoursPerNew) * n(d.supRate);
  const vacancyCoverage = n(d.vacancyDays) * 8 * hourlyRate * (1 + n(d.overtimePremium) / 100);
  const qaDrag = trainingDays * 0.5 * hourlyRate * (n(d.qaDragPct) / 100) * 8;

  const costPerDeparture = recruiting + training + nestingLoss + rampLoss + supervisorBurden + vacancyCoverage + qaDrag;
  const totalAnnualCost = costPerDeparture * departures;

  const breakdown = [
    { name: "Recruiting + screening", cost: recruiting, color: "#3B82F6" },
    { name: "Training (classroom)", cost: training, color: "#8B5CF6" },
    { name: "Nesting productivity loss", cost: nestingLoss, color: "#EC4899" },
    { name: "Ramp-to-proficiency loss", cost: rampLoss, color: RED },
    { name: "Supervisor burden", cost: supervisorBurden, color: AMBER },
    { name: "Vacancy coverage (OT)", cost: vacancyCoverage, color: "#F97316" },
    { name: "QA drag (new agent errors)", cost: qaDrag, color: "#14B8A6" },
  ];
  const maxCost = Math.max(...breakdown.map(b => b.cost), 1);

  // What-if: reduce attrition
  const scenarios = [5, 10, 15, 20].map(reduction => {
    const newRate = Math.max(0, n(d.attritionRate) - reduction);
    const newDepartures = Math.round(n(d.agents) * (newRate / 100));
    const saved = (departures - newDepartures) * costPerDeparture;
    return { reduction, newRate, newDepartures, saved };
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Attrition Cost Calculator</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Quantify the full cost of every agent departure: recruiting, training, nesting, ramp-to-proficiency, supervisor burden, overtime coverage, and QA drag. Then see what reducing attrition by 5-20 points would save.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? RED : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Calculator →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Attrition Cost Calculator</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="Total agents" value={d.agents} onChange={v => set("agents", v)} />
              <Input label="Annual attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" hint="Industry avg: 30-45%" />
              <Input label="Avg agent salary" value={d.avgSalary} onChange={v => set("avgSalary", v)} suffix="$/yr" />
              <Input label="Recruiting cost" value={d.recruitingCost} onChange={v => set("recruitingCost", v)} suffix="$" hint="Job postings, agency, etc" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
              <Input label="Training duration" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="weeks" />
              <Input label="Nesting duration" value={d.nestingWeeks} onChange={v => set("nestingWeeks", v)} suffix="weeks" hint="Supervised production" />
              <Input label="Ramp to proficiency" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="months" hint="To full productivity" />
              <Input label="Vacancy days" value={d.vacancyDays} onChange={v => set("vacancyDays", v)} suffix="days" hint="Open seat duration" />
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Cost Per Departure</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: "#fff" }}>{fmtK(costPerDeparture)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>All-in cost to replace one agent</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Annual Departures</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: "#fff" }}>{departures}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{d.attritionRate}% of {d.agents} agents</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, #7F1D1D, #991B1B)`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Total Annual Attrition Cost</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: "#fff" }}>{fmtK(totalAnnualCost)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Hidden cost most teams never quantify</div>
              </div>
            </div>

            {/* Breakdown bars */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Cost Breakdown Per Departure</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
              {breakdown.map((b, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: SLATE }}>{b.name}</span>
                  <div style={{ height: 20, background: WARM, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(b.cost / maxCost) * 100}%`, background: b.color, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, textAlign: "right" }}>{fmtK(b.cost)}</span>
                </div>
              ))}
            </div>

            {/* What-if scenarios */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>What If You Reduced Attrition?</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="cg">
              {scenarios.map((s, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>-{s.reduction} pts → {s.newRate}%</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: GREEN }}>{fmtK(s.saved)}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>saved annually</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{departures - s.newDepartures} fewer departures</div>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>The number nobody puts in the budget:</strong> Most contact centers budget for recruiting and training but never quantify the productivity loss during ramp, the supervisor time diverted to new hires, or the quality drag from agents who have not yet built pattern recognition. The true cost of a departure is typically 50-75% of an agent's annual salary when all seven components are included. At 35% attrition, a 200-agent operation is spending the equivalent of 35-50 full-time salaries just replacing the people who leave.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/occupancy-risk" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Occupancy Risk Simulator →</a>
              <a href="/human-premium" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>The Human Premium →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
