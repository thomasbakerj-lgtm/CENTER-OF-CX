import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import { scoreOwnership } from "./src/lib/ownership";
import { GOVERNANCE as MODEL } from "./src/lib/rubrics/governance";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

/* The roles, decisions, common owners, required functions and finding rules live in the
   published model; this file only presents them. See governance and MODEL.methodology. */
const ROLES = MODEL.roles.map(r => r.label);
const ROLE_COLORS = [ELECTRIC, GREEN, "#7C3AED", AMBER, "#3B82F6", "#475569"];
const DOMAINS = MODEL.domains.map(d => ({ name: d.name, items: d.items.map(it => it.text) }));
const SEV_STYLE = { critical: { label: "Critical", color: RED }, high: { label: "High", color: "#C2410C" }, medium: { label: "Medium", color: "#B45309" }, info: { label: "Confirm", color: SLATE } };
/* The line under each finding: the rule's test, or for a missing function whether the
   decision is one of the five that carry control or budget risk. */
const whyOf = (f) => f.rule === "involve" ? (f.severity === "high" ? "Function missing on a decision that carries control or budget risk." : "Function missing: this decision usually needs it.") : f.title + ": " + MODEL.rules[f.rule].test;
const toolOf = (id) => JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null;

const TOOL_ID = "governance-model";
const ROUTE = "/tools/governance-model";
export const DEFAULTS = { primary: {}, secondary: {} };
/* Ownership assigned to every item, rotating through the roles, with a different
   supporting role. The floor harness renders it to prove the results page and its
   PDF content build without a gate and without a missing field. */
export const SAMPLE = {
  primary: Object.fromEntries(DOMAINS.flatMap((d, di) => d.items.map((_, ii) => [`${di}-${ii}`, (di + ii) % ROLES.length]))),
  secondary: Object.fromEntries(DOMAINS.flatMap((d, di) => d.items.map((_, ii) => [`${di}-${ii}`, (di + ii + 1) % ROLES.length]))),
};
/* An assignment is kept only for a real item and a real role. A supporting role
   needs an owner and cannot be the owner. */
const MIN_ASSIGNED = MODEL.minAssigned;
const validKey = (k) => { const m = /^(\d+)-(\d+)$/.exec(k); return !!m && !!DOMAINS[+m[1]] && +m[2] < DOMAINS[+m[1]].items.length; };
const validRole = (v) => Number.isInteger(v) && v >= 0 && v < ROLES.length;
const cleanMap = (m) => Object.fromEntries(Object.entries(m && typeof m === "object" ? m : {}).filter(([k, v]) => validKey(k) && validRole(v)));
const cleanState = (sc) => {
  const primary = cleanMap(sc && sc.primary);
  const secondary = Object.fromEntries(Object.entries(cleanMap(sc && sc.secondary)).filter(([k, v]) => primary[k] !== undefined && primary[k] !== v));
  return { primary, secondary };
};

export default function GovernanceModel() {
  const [init] = useState(() => cleanState(readScenario(TOOL_ID, DEFAULTS)));
  const [phase, setPhase] = useState(() => (Object.keys(init.primary).length >= MIN_ASSIGNED ? "results" : "intro"));
  const [primary, setPrimary] = useState(init.primary); const [secondary, setSecondary] = useState(init.secondary);

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const k = (di, ii) => `${di}-${ii}`;

  const handlePrimary = (di, ii, ri) => {
    const key = k(di, ii);
    if (primary[key] === ri) { setPrimary(p => { const n = {...p}; delete n[key]; return n; }); setSecondary(p => { const n = {...p}; delete n[key]; return n; }); }
    else { setPrimary(p => ({...p, [key]: ri})); if (secondary[key] === ri) setSecondary(p => { const n = {...p}; delete n[key]; return n; }); }
  };

  const handleSecondary = (di, ii, ri) => {
    const key = k(di, ii);
    if (primary[key] === ri || primary[key] === undefined) return;
    if (secondary[key] === ri) setSecondary(p => { const n = {...p}; delete n[key]; return n; });
    else setSecondary(p => ({...p, [key]: ri}));
  };

  /* Every count, finding and the next diagnostic come from the one ownership engine, so
     the page, the PDF and the published model cannot disagree. */
  const R = scoreOwnership(MODEL, { primary, secondary });
  const totalItems = R.total;
  const assignedCount = R.assigned;
  const next = R.nextDiagnostic && toolOf(R.nextDiagnostic.tool) ? { ...toolOf(R.nextDiagnostic.tool), why: R.nextDiagnostic.tool === MODEL.next.cxIt ? "at least half of the critical and high findings sit in CX strategy or technology, where CX and IT decisions meet" : "the findings are spread across the operating model, so the next step is to sequence the fixes" } : null;
  const sevCount = (sv) => R.bySeverity[sv] || 0;

  const handleStart = () => setPhase("assign");


  const handleResults = () => setPhase("results");


  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <ToolNav wrap={WRAP} />

      {phase !== "intro" && <ToolHero compact wrap={WRAP} eyebrow="Frameworks + Planning" title="Governance & Operating Model" />}

      {phase === "intro" && (
        <ToolHero fill wrap={WRAP} eyebrow="Frameworks + Planning" title="Governance & Operating Model"
          intro="Name the accountable function, and optionally one contributor, for each of 30 CX decisions. The result is an ownership map and the findings six published rules raise: decisions nobody owns, functions a decision needs but leaves out, bottlenecks, influence without authority, fragmented domains, and owners that differ from the common pattern.">
          <ToolStart label="Start Mapping" onStart={handleStart} methodHref={MODEL.methodology} methodLabel="See the published model: every decision, rule and threshold" />
        </ToolHero>
      )}

      {phase === "assign" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Who owns what?</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Click a role to make it <strong>accountable</strong> for the decision. Then click <strong>+</strong> beside a different role to add one optional <strong>contributor</strong>. A decision left without an owner is raised as a critical finding. Findings appear once {MIN_ASSIGNED} decisions are assigned; {assignedCount} of {totalItems} so far.</p>

            {DOMAINS.map((dom, di) => (
              <div key={di} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{dom.name}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dom.items.map((item, ii) => {
                    const pri = primary[k(di, ii)];
                    const sec = secondary[k(di, ii)];
                    return (
                      <div key={ii} style={{ background: "#fff", border: `1px solid ${pri !== undefined ? ROLE_COLORS[pri] + "30" : BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 13, color: NAVY, fontWeight: 500, marginBottom: 8 }}>
                          {item}
                          {pri !== undefined && <span style={{ fontSize: 12, marginLeft: 8 }}>
                            <span style={{ color: ROLE_COLORS[pri], fontWeight: 700 }}>Accountable: {ROLES[pri]}</span>
                            {sec !== undefined && <span style={{ color: ROLE_COLORS[sec], fontWeight: 600, marginLeft: 6 }}>Contributes: {ROLES[sec]}</span>}
                          </span>}
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {ROLES.map((r, ri) => {
                            const isPri = pri === ri;
                            const isSec = sec === ri;
                            const canBeSecondary = pri !== undefined && pri !== ri;
                            return (
                              <div key={ri} style={{ display: "flex", gap: 2 }}>
                                <button onClick={() => handlePrimary(di, ii, ri)}
                                  style={{ padding: "4px 10px", fontSize: 12, fontWeight: isPri ? 700 : 500, borderRadius: 4, border: isPri ? `2px solid ${ROLE_COLORS[ri]}` : `1px solid ${BORDER}`, background: isPri ? ROLE_COLORS[ri] : "#fff", color: isPri ? "#fff" : MUTED, cursor: "pointer", whiteSpace: "nowrap" }}>
                                  {isPri ? `✓ ${r}` : r}
                                </button>
                                {canBeSecondary && (
                                  <button onClick={() => handleSecondary(di, ii, ri)}
                                    style={{ padding: "4px 6px", fontSize: 12, fontWeight: isSec ? 700 : 400, borderRadius: 4, border: isSec ? `2px solid ${ROLE_COLORS[ri]}` : `1px solid ${BORDER}`, background: isSec ? `${ROLE_COLORS[ri]}15` : "#fff", color: isSec ? ROLE_COLORS[ri] : `${MUTED}60`, cursor: "pointer" }}>
                                    {isSec ? "S" : "+"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleResults} disabled={assignedCount < MIN_ASSIGNED} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: assignedCount >= 20 ? GREEN : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: assignedCount >= 20 ? "pointer" : "default", opacity: assignedCount >= 20 ? 1 : 0.5 }}>
                {assignedCount >= 20 ? `View findings (${assignedCount}/${totalItems}) →` : `Assign at least 20 (${assignedCount}/${totalItems})`}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "44px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "34px 32px", textAlign: "center", marginBottom: 24 }}>
              <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your operating model</span>
              <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 600, color: "#fff", margin: "8px 0 14px" }}>{assignedCount} of {totalItems} decisions have an accountable owner</h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                {["critical", "high", "medium", "info"].map(sv => (
                  <span key={sv} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: sevCount(sv) ? SEV_STYLE[sv].color : "rgba(255,255,255,0.12)", padding: "6px 12px", borderRadius: 6 }}>{sevCount(sv)} {SEV_STYLE[sv].label.toLowerCase()}</span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, maxWidth: 560, margin: "14px auto 0" }}>There is no score: governance does not average, and one unowned decision can matter more than the rest together. Findings are listed most serious first.</p>
            </div>

            <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: NAVY, margin: "0 0 14px" }}>Ownership by function</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 28 }}>
              {R.counts.map((c, i) => {
                const flag = R.findings.find(f => (f.rule === "bottleneck" || f.rule === "advisory") && f.role === c.role);
                return (
                  <div key={c.role} style={{ background: "#fff", border: `1px solid ${flag ? SEV_STYLE[flag.severity].color : BORDER}`, borderRadius: 10, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: NAVY, fontFamily: FONT }}>{c.primary}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: SLATE }}>accountable{c.secondary ? `, contributes to ${c.secondary}` : ""}</div>
                    {flag && <div style={{ fontSize: 12, fontWeight: 700, color: SEV_STYLE[flag.severity].color, marginTop: 6 }}>{flag.title}</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "22px 24px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Findings and actions</h3>
              {R.findings.length === 0 ? (
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6 }}>None of the six rules raises a finding on this map.</p>
              ) : R.findings.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < R.findings.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: SEV_STYLE[f.severity].color, padding: "2px 8px", borderRadius: 4, flexShrink: 0, minWidth: 64, textAlign: "center" }}>{SEV_STYLE[f.severity].label}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>{f.action}</div>
                    <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{whyOf(f)}</div>
                  </div>
                </div>
              ))}
              {next && (
                <p style={{ marginTop: 14, fontSize: 14, color: SLATE, lineHeight: 1.6 }}>Next diagnostic: <a href={next.href} style={{ color: ELECTRIC, fontWeight: 600 }}>{next.name}</a>, because {next.why}.</p>
              )}
              <p style={{ marginTop: 10, fontSize: 12, color: SLATE, lineHeight: 1.6 }}>Scored on the <a href={MODEL.methodology} style={{ color: ELECTRIC }}>published model</a>, version {MODEL.version}. {MODEL.limits[0]} {MODEL.limits[1]}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <ReportActions toolId={TOOL_ID} toolName="Governance & Operating Model" subtitle={assignedCount + " of " + totalItems + " decisions have an accountable owner, " + R.findings.length + " findings"} routePath={ROUTE} state={{ primary, secondary }} defaults={DEFAULTS}
                summary={[{ label: "Decisions with an owner", value: assignedCount + " of " + totalItems }, { label: "Critical findings", value: String(sevCount("critical")) }, { label: "High findings", value: String(sevCount("high")) }, { label: "Medium findings", value: String(sevCount("medium")) }]}
                sections={[
                  { title: "Ownership by Function", type: "table", rows: R.counts.map(c => [c.label, c.primary + " accountable, " + c.secondary + " contributing"]) },
                  { title: "Assessment", type: "metrics", items: [
                    { label: "Owned Decisions", value: assignedCount + " / " + totalItems, color: sevCount("critical") ? RED : GREEN },
                    { label: "Critical", value: String(sevCount("critical")), color: sevCount("critical") ? RED : GREEN },
                    { label: "High", value: String(sevCount("high")), color: sevCount("high") ? AMBER : GREEN },
                  ]},
                  { title: "Findings", type: "actions", items: R.findings.length ? R.findings.map(f => ({ action: f.action, detail: SEV_STYLE[f.severity].label + ". " + whyOf(f), priority: f.severity === "critical" || f.severity === "high" ? "high" : "medium" })) : [{ action: "None of the six rules raises a finding on this map.", detail: "Confirm the map with the function owners before relying on it.", priority: "medium" }] },
                  { title: "Ownership Map", type: "table", rows: R.items.map(x => [x.domainName + ": " + x.text, x.primary === null ? "No owner" : ROLES[x.primary] + (x.secondary !== null ? ", with " + ROLES[x.secondary] : "")]) },
                  { title: "Next Steps", type: "next", items: next ? [{ tool: next.name, href: next.href, reason: "Because " + next.why + "." }] : [] },
                  { title: "What This Assessment Cannot Tell You", type: "findings", items: MODEL.limits },
                  { title: "Method", type: "text", content: MODEL.title + " model version " + MODEL.version + ", published at contactcentercx.com" + MODEL.methodology + ". Each decision has one accountable role and at most one contributing role. Six rules raise findings: an unowned decision (critical); a function the decision needs left out (high on five control and budget decisions, medium otherwise); one role accountable for " + R.bottleneckAt + " or more decisions (high); a role contributing to " + MODEL.advisoryMin + " or more and accountable for none (medium); " + MODEL.fragmentedMin + " or more owners in one domain (medium); an owner different from the common pattern (confirm). Findings appear once " + MODEL.minAssigned + " decisions are assigned." },
                ]} />
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Talk through the findings</a>
              <a href="/tools/roadmap-builder" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Roadmap Builder</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
