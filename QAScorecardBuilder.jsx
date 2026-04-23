import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const TEMPLATES = {
  general: { name: "General Inbound", categories: [
    { name: "Opening + Authentication", weight: 10, criteria: [{ text: "Proper greeting and identification", critical: false }, { text: "Customer verified per policy", critical: true }] },
    { name: "Active Listening + Discovery", weight: 20, criteria: [{ text: "Acknowledged customer concern", critical: false }, { text: "Asked clarifying questions", critical: false }, { text: "Restated issue to confirm understanding", critical: false }] },
    { name: "Knowledge + Accuracy", weight: 25, criteria: [{ text: "Provided correct information", critical: true }, { text: "Used appropriate resources", critical: false }, { text: "Did not guess or provide unverified info", critical: true }] },
    { name: "Resolution + Ownership", weight: 25, criteria: [{ text: "Resolved the issue or set clear next steps", critical: false }, { text: "Took ownership (no unnecessary transfers)", critical: false }, { text: "Set expectations for follow-up", critical: false }] },
    { name: "Closing + Compliance", weight: 20, criteria: [{ text: "Summarized resolution and next steps", critical: false }, { text: "Required disclosures were provided", critical: true }, { text: "Professional closing", critical: false }] },
  ]},
  billing: { name: "Billing Dispute", categories: [
    { name: "Authentication + Security", weight: 15, criteria: [{ text: "Full identity verification completed", critical: true }, { text: "Account access validated", critical: true }] },
    { name: "Issue Understanding", weight: 20, criteria: [{ text: "Charge identified and explained clearly", critical: false }, { text: "Customer billing history reviewed", critical: false }, { text: "Root cause of dispute identified", critical: false }] },
    { name: "Resolution Authority", weight: 30, criteria: [{ text: "Applied correct adjustment policy", critical: true }, { text: "Credit/refund processed accurately", critical: true }, { text: "Escalated appropriately when outside authority", critical: false }] },
    { name: "Documentation", weight: 20, criteria: [{ text: "Dispute documented per compliance requirements", critical: true }, { text: "Case notes are complete and actionable", critical: false }] },
    { name: "Customer Experience", weight: 15, criteria: [{ text: "Empathy demonstrated for billing frustration", critical: false }, { text: "Proactive prevention advice offered", critical: false }] },
  ]},
  techSupport: { name: "Technical Support", categories: [
    { name: "Troubleshooting Approach", weight: 30, criteria: [{ text: "Followed structured diagnostic process", critical: false }, { text: "Isolated the issue systematically", critical: false }, { text: "Did not skip steps or assume the problem", critical: false }, { text: "Tested the fix before closing", critical: true }] },
    { name: "Technical Accuracy", weight: 25, criteria: [{ text: "Diagnosis was correct", critical: true }, { text: "Solution was appropriate for the problem", critical: true }, { text: "Used correct tools and resources", critical: false }] },
    { name: "Communication", weight: 20, criteria: [{ text: "Explained technical concepts in customer terms", critical: false }, { text: "Set time expectations during holds", critical: false }, { text: "Kept customer informed during troubleshooting", critical: false }] },
    { name: "Resolution + Prevention", weight: 15, criteria: [{ text: "Issue fully resolved or escalation path clear", critical: false }, { text: "Root cause addressed, not just symptom", critical: false }] },
    { name: "Documentation", weight: 10, criteria: [{ text: "Troubleshooting steps documented for future reference", critical: false }, { text: "Known issue flagged if pattern detected", critical: false }] },
  ]},
};

export default function QAScorecardBuilder() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [template, setTemplate] = useState("general");
  const [categories, setCategories] = useState(TEMPLATES.general.categories);
  const [evalScores, setEvalScores] = useState({});
  const [showEval, setShowEval] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const applyTemplate = (key) => { setTemplate(key); setCategories(TEMPLATES[key].categories); setEvalScores({}); setShowEval(false); };

  const updateWeight = (ci, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, weight: Number(val) || 0 } : c));
  const updateCriterion = (ci, cri, field, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: c.criteria.map((cr, j) => j === cri ? { ...cr, [field]: val } : cr) } : c));
  const addCriterion = (ci) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: [...c.criteria, { text: "New criterion", critical: false }] } : c));
  const removeCriterion = (ci, cri) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: c.criteria.filter((_, j) => j !== cri) } : c));
  const addCategory = () => setCategories(prev => [...prev, { name: "New Category", weight: 10, criteria: [{ text: "Criterion 1", critical: false }] }]);
  const removeCategory = (ci) => setCategories(prev => prev.filter((_, i) => i !== ci));
  const updateCatName = (ci, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, name: val } : c));

  const setEval = (ci, cri, val) => setEvalScores(prev => ({ ...prev, [`${ci}-${cri}`]: val }));

  const totalWeight = categories.reduce((a, c) => a + c.weight, 0);
  const weightValid = totalWeight === 100;

  // Calculate eval score
  const catScores = categories.map((cat, ci) => {
    const scored = cat.criteria.map((cr, cri) => evalScores[`${ci}-${cri}`]);
    const answered = scored.filter(s => s !== undefined);
    if (answered.length === 0) return null;
    const catPct = (answered.filter(s => s === true).length / cat.criteria.length) * 100;
    const hasCritFail = cat.criteria.some((cr, cri) => cr.critical && evalScores[`${ci}-${cri}`] === false);
    return { catPct, weighted: catPct * (cat.weight / 100), hasCritFail };
  });

  const overallScore = catScores.every(s => s !== null) ? catScores.reduce((a, s) => a + s.weighted, 0) : null;
  const anyCritFail = catScores.some(s => s && s.hasCritFail);

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "QA Scorecard Builder", _subject: "QA Scorecard Builder Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>QA Scorecard Builder</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Build weighted QA evaluation forms by contact type. Start from a template or create custom. Mark critical-fail criteria. Test your scorecard with a sample evaluation.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? GREEN : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Builder →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: 0 }}>QA Scorecard Builder</h2>
              <div style={{ display: "flex", gap: 4 }}>
                {Object.entries(TEMPLATES).map(([k, v]) => (
                  <button key={k} onClick={() => applyTemplate(k)} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${template === k ? GREEN : BORDER}`, background: template === k ? GREEN : "#fff", color: template === k ? "#fff" : MUTED, cursor: "pointer" }}>{v.name}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: weightValid ? GREEN : RED }}>Total weight: {totalWeight}%</span>
              {!weightValid && <span style={{ fontSize: 11, color: RED }}>Must equal 100%</span>}
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            {categories.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 20, background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <input type="text" value={cat.name} onChange={e => updateCatName(ci, e.target.value)} style={{ flex: 1, minWidth: 200, padding: "6px 10px", fontSize: 14, fontWeight: 600, border: `1px solid ${BORDER}`, borderRadius: 4, background: "#fff", color: NAVY }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, color: MUTED }}>Weight:</span>
                    <input type="number" value={cat.weight} onChange={e => updateWeight(ci, e.target.value)} style={{ width: 50, padding: "6px 8px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "center" }} />
                    <span style={{ fontSize: 11, color: MUTED }}>%</span>
                  </div>
                  <button onClick={() => removeCategory(ci)} style={{ fontSize: 11, color: RED, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                </div>
                <div style={{ padding: "8px 18px 14px" }}>
                  {cat.criteria.map((cr, cri) => (
                    <div key={cri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: cri < cat.criteria.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <input type="text" value={cr.text} onChange={e => updateCriterion(ci, cri, "text", e.target.value)} style={{ flex: 1, padding: "6px 10px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 4, background: "#fff" }} />
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: cr.critical ? RED : MUTED, cursor: "pointer", flexShrink: 0 }}>
                        <input type="checkbox" checked={cr.critical} onChange={e => updateCriterion(ci, cri, "critical", e.target.checked)} /> Critical
                      </label>
                      <button onClick={() => removeCriterion(ci, cri)} style={{ fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => addCriterion(ci)} style={{ fontSize: 12, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", marginTop: 6, fontWeight: 600 }}>+ Add criterion</button>
                </div>
              </div>
            ))}
            <button onClick={addCategory} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px dashed ${ELECTRIC}`, background: "transparent", color: ELECTRIC, cursor: "pointer", width: "100%", marginBottom: 28 }}>+ Add Category</button>

            {/* Test evaluation */}
            <div style={{ marginBottom: 28 }}>
              <button onClick={() => setShowEval(!showEval)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: showEval ? NAVY : GREEN, color: "#fff", cursor: "pointer" }}>
                {showEval ? "Hide Test Evaluation" : "Test This Scorecard →"}
              </button>
            </div>

            {showEval && (
              <div style={{ background: `${GREEN}05`, border: `1px solid ${GREEN}30`, borderRadius: 12, padding: "24px", marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 16 }}>Sample Evaluation</h3>
                {categories.map((cat, ci) => (
                  <div key={ci} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{cat.name} ({cat.weight}%)</div>
                    {cat.criteria.map((cr, cri) => (
                      <div key={cri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                        <span style={{ flex: 1, fontSize: 13, color: NAVY }}>{cr.critical && <span style={{ color: RED, fontWeight: 700, marginRight: 4 }}>*</span>}{cr.text}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => setEval(ci, cri, true)} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${evalScores[`${ci}-${cri}`] === true ? GREEN : BORDER}`, background: evalScores[`${ci}-${cri}`] === true ? GREEN : "#fff", color: evalScores[`${ci}-${cri}`] === true ? "#fff" : MUTED, cursor: "pointer" }}>Yes</button>
                          <button onClick={() => setEval(ci, cri, false)} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${evalScores[`${ci}-${cri}`] === false ? RED : BORDER}`, background: evalScores[`${ci}-${cri}`] === false ? RED : "#fff", color: evalScores[`${ci}-${cri}`] === false ? "#fff" : MUTED, cursor: "pointer" }}>No</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {overallScore !== null && (
                  <div style={{ background: anyCritFail ? `${RED}10` : `${GREEN}10`, border: `1px solid ${anyCritFail ? RED : GREEN}30`, borderRadius: 8, padding: "16px", marginTop: 12, textAlign: "center" }}>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: anyCritFail ? RED : overallScore >= 85 ? GREEN : overallScore >= 70 ? AMBER : RED }}>{anyCritFail ? "FAIL" : `${overallScore.toFixed(0)}%`}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>{anyCritFail ? "Critical criterion failed. Auto-fail regardless of score." : overallScore >= 85 ? "Meets quality standard" : overallScore >= 70 ? "Coaching opportunity" : "Performance concern"}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Why one scorecard fails:</strong> A password reset and a billing dispute require different evaluation criteria. Using one scorecard for all contact types means you are either evaluating too generically (missing what matters for complex calls) or too specifically (penalizing simple calls for not hitting criteria that do not apply). Build 3-5 scorecards by contact type, complexity, or risk level. Weight the dimensions that matter most for each type.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/agent-experience" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Agent Experience Diagnostic →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
