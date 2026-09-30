import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { scoreOwnership } from "./src/lib/ownership";
import { GOVERNANCE as MODEL } from "./src/lib/rubrics/governance";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { useScenarioHash } from "./src/lib/useScenarioHash.js";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";

/* Severity colours print in the PDF only; on the page a severity is a word. */
const SLATE = "#3A4F6A"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";

/* The roles, decisions, common owners, required functions and finding rules live in the
   published model; this file only presents them. See governance and MODEL.methodology. */
const ROLES = MODEL.roles.map(r => r.label);
const DOMAINS = MODEL.domains.map(d => ({ name: d.name, items: d.items.map(it => it.text) }));
const SEV_STYLE = { critical: { label: "Critical", color: RED }, high: { label: "High", color: "#C2410C" }, medium: { label: "Medium", color: "#B45309" }, info: { label: "Confirm", color: SLATE } };
/* The line under each finding: the rule's test, or for a missing function whether the
   decision is one of the five that carry control or budget risk. */
const whyOf = (f) => f.rule === "involve" ? (f.severity === "high" ? "Function missing on a decision that carries control or budget risk." : "Function missing: this decision usually needs its input.") : f.title + ": " + MODEL.rules[f.rule].test;
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
  /* A refresh or Back reopens the answers given so far (the report sits on a later step). */
  useScenarioHash(TOOL_ID, { primary, secondary }, DEFAULTS);

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


  const result = phase === "results"
    ? <Result label="Decisions with an accountable owner" value={`${assignedCount} of ${totalItems}`} change={`${sevCount("critical")} critical, ${sevCount("high")} high, ${sevCount("medium")} medium, ${sevCount("info")} to confirm. There is no score.`} />
    : <Result label="Decisions assigned" value={`${assignedCount} of ${totalItems}`} change={`Findings appear once ${MIN_ASSIGNED} decisions are assigned.`} />;
  const chip = (sv) => ({ display: "inline-block", fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: RADIUS.chip, border: `${sv === "critical" ? 2 : 1}px ${sv === "info" ? "dashed" : "solid"} ${sv === "critical" || sv === "high" ? K.strong.color : K.firm}`, color: K.strong.color, flexShrink: 0, minWidth: 72, textAlign: "center" });
  const roleBtn = (on) => ({ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, border: `${on ? 2 : 1}px solid ${on ? K.strong.color : K.firm}`, background: on ? K.shade(0) : "transparent", color: K.strong.color, cursor: "pointer", whiteSpace: "nowrap" });
  const secBtn = (on) => ({ minWidth: TOUCH, minHeight: TOUCH, padding: "0 8px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, border: `${on ? 2 : 1}px ${on ? "solid" : "dashed"} ${on ? K.strong.color : K.firm}`, background: "transparent", color: K.strong.color, cursor: "pointer" });

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.nextDiagnostic ? R.nextDiagnostic.tool : null} section="Frameworks + Planning" name="Governance & Operating Model" title="Who is accountable for each CX decision?"
      lede="For each of 30 CX decisions, name the function that is accountable (the one that makes the final call) and, if you like, one that contributes. You get an ownership map and the findings from six published rules: decisions nobody owns, functions a decision needs but leaves out, bottlenecks, influence without authority, domains split across too many owners, and owners that differ from the common pattern."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" ? { label: "Owned decisions", value: `${assignedCount} of ${totalItems}` } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Each decision gets one accountable function and at most one contributor. There is no score. Ownership does not average out: one unowned decision can matter more than all the others together.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
            <Button onClick={handleStart}>Start Mapping</Button>
            <a href={MODEL.methodology} style={K.link}>See the published model: every decision, rule and threshold</a>
          </div>
        </section>
      )}

      {phase === "assign" && (<>
        <section aria-label="How to assign" style={K.lead}>
          <h2 style={K.h2}>Who owns what?</h2>
          <p style={K.body}>Choose a role to make it <strong>accountable</strong> for the decision. Then choose <strong>+</strong> beside a different role to add one optional <strong>contributor</strong>. A decision left without an owner is raised as a critical finding. Findings appear once {MIN_ASSIGNED} decisions are assigned; {assignedCount} of {totalItems} so far.</p>
        </section>

        {DOMAINS.map((dom, di) => (
          <Group key={di} legend={dom.name}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dom.items.map((item, ii) => {
                const pri = primary[k(di, ii)];
                const sec = secondary[k(di, ii)];
                return (
                  <div key={ii} style={K.box}>
                    <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{item}</div>
                    <div style={{ ...K.small, margin: "4px 0 10px" }}>{pri === undefined ? "No owner yet" : `Accountable: ${ROLES[pri]}${sec !== undefined ? `. Contributes: ${ROLES[sec]}` : ""}`}</div>
                    <div role="group" aria-label={"Owner for: " + item} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {ROLES.map((r, ri) => {
                        const isPri = pri === ri;
                        const isSec = sec === ri;
                        const canBeSecondary = pri !== undefined && pri !== ri;
                        return (
                          <div key={ri} style={{ display: "flex", gap: 2 }}>
                            <button type="button" aria-pressed={isPri} onClick={() => handlePrimary(di, ii, ri)} style={roleBtn(isPri)}>
                              {isPri ? `\u2713 ${r}` : r}
                            </button>
                            {canBeSecondary && (
                              <button type="button" aria-pressed={isSec} aria-label={`${r} contributes`} onClick={() => handleSecondary(di, ii, ri)} style={secBtn(isSec)}>
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
          </Group>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleResults} disabled={assignedCount < MIN_ASSIGNED}>
            {assignedCount >= MIN_ASSIGNED ? `View findings (${assignedCount}/${totalItems})` : `Assign at least ${MIN_ASSIGNED} (${assignedCount}/${totalItems})`}
          </Button>
        </div>
      </>)}

      {phase === "results" && (<>
        <section aria-label="Your operating model" style={K.lead}>
          <span style={K.kicker}>Your operating model</span>
          <div style={K.stat}>{assignedCount} of {totalItems} decisions have an accountable owner</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
            {["critical", "high", "medium", "info"].map(sv => (
              <span key={sv} style={chip(sv)}>{sevCount(sv)} {SEV_STYLE[sv].label.toLowerCase()}</span>
            ))}
          </div>
          <p style={K.body}>There is no score. Ownership does not average out: one unowned decision can matter more than all the others together. Findings are listed most serious first.</p>
        </section>

        <section aria-label="Ownership by function" style={K.panel}>
          <h2 style={K.h2}>Ownership by function</h2>
          <div style={K.grid(150)}>
            {R.counts.map((c) => {
              const flag = R.findings.find(f => (f.rule === "bottleneck" || f.rule === "advisory") && f.role === c.role);
              return (
                <div key={c.role} style={{ ...K.box, border: `${flag ? 2 : 1}px solid ${flag ? K.strong.color : K.hair}` }}>
                  <div style={{ ...K.strong, ...K.num, fontSize: 26 }}>{c.primary}</div>
                  <div style={{ ...K.strong, fontSize: 14 }}>{c.label}</div>
                  <div style={K.small}>accountable{c.secondary ? `, contributes to ${c.secondary}` : ""}</div>
                  {flag && <div style={{ ...K.strong, fontSize: 13, marginTop: 6 }}>{SEV_STYLE[flag.severity].label}: {flag.title}</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label="Findings and actions" style={K.panel}>
          <h2 style={K.h2}>Findings and actions</h2>
          {R.findings.length === 0 ? (
            <p style={K.body}>None of the six rules raises a finding on this map.</p>
          ) : R.findings.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
              <span style={chip(f.severity)}>{SEV_STYLE[f.severity].label}</span>
              <div>
                <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{f.action}</div>
                <div style={{ ...K.small, marginTop: 3 }}>{whyOf(f)}</div>
              </div>
            </div>
          ))}
          {next && (
            <p style={{ ...K.body, marginTop: 14 }}>Next diagnostic: <a href={next.href} style={K.link}>{next.name}</a>, because {next.why}.</p>
          )}
          <p style={{ ...K.small, marginTop: 14 }}>Checked against the <a href={MODEL.methodology} style={K.link}>published model</a>, version {MODEL.version}. {MODEL.limits[0]} {MODEL.limits[1]}</p>
        </section>

        <Paper>
              <ReportActions next={R.nextDiagnostic ? { to: R.nextDiagnostic.tool, because: next ? "Because " + next.why + "." : null } : null} toolId={TOOL_ID} toolName="Governance & Operating Model" subtitle={assignedCount + " of " + totalItems + " decisions have an accountable owner, " + R.findings.length + " findings"} routePath={ROUTE} state={{ primary, secondary }} defaults={DEFAULTS}
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
                  { title: "What This Assessment Cannot Tell You", type: "findings", items: MODEL.limits },
                  { title: "Method", type: "text", content: MODEL.title + " model version " + MODEL.version + ", published at contactcentercx.com" + MODEL.methodology + ". Each decision has one accountable role and at most one contributing role. Six rules raise findings: an unowned decision (critical); a function the decision needs left out (high on five control and budget decisions, medium otherwise); one role accountable for " + R.bottleneckAt + " or more decisions (high); a role contributing to " + MODEL.advisoryMin + " or more and accountable for none (medium); " + MODEL.fragmentedMin + " or more owners in one domain (medium); an owner different from the common pattern (confirm). Findings appear once " + MODEL.minAssigned + " decisions are assigned." },
                ]} />
        </Paper>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button href="/contact">Talk through the findings</Button>
          <Button kind="secondary" href="/tools/roadmap-builder">Roadmap Builder</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
