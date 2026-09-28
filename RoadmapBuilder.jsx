import { useState, useEffect, useRef } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, numInput, selectStyle, optionCss } from "./src/lib/frameKit.jsx";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { trackRoadmap } from "./src/lib/track";

/* A status is a word on the page; nothing is colour-coded. */
const PHASES = [
  { name: "Phase 1: Foundation (Days 1 to 30)", desc: "Measure where you start, get the stakeholders agreed, and define what success looks like.", milestones: [
    { id: "m1", text: "Current-state assessment complete", owner: "CX Ops", deps: [] },
    { id: "m2", text: "Stakeholder alignment meeting held", owner: "Executive Sponsor", deps: [] },
    { id: "m3", text: "Success metrics and KPIs defined", owner: "CX Ops + Analytics", deps: ["m1"] },
    { id: "m4", text: "Vendor shortlist finalized (if applicable)", owner: "IT + CX", deps: ["m1"] },
    { id: "m5", text: "Budget and resource allocation confirmed", owner: "Finance + Exec", deps: ["m2", "m3"] },
    { id: "m6", text: "Risk register created", owner: "Program Lead", deps: ["m1"] },
  ]},
  { name: "Phase 2: Design & Pilot (Days 31 to 60)", desc: "Design the target state, build the integrations, and pilot with a small, controlled group.", milestones: [
    { id: "m7", text: "Target-state architecture documented", owner: "IT / Arch", deps: ["m4"] },
    { id: "m8", text: "Integration requirements scoped", owner: "IT / Arch", deps: ["m7"] },
    { id: "m9", text: "Pilot group selected and briefed", owner: "CX Ops", deps: ["m7"] },
    { id: "m10", text: "Agent training materials developed", owner: "Training + CX", deps: ["m7"] },
    { id: "m11", text: "Pilot launched with monitoring plan", owner: "Program Lead", deps: ["m8", "m9", "m10"] },
    { id: "m12", text: "First pilot checkpoint and adjustments", owner: "Program Lead", deps: ["m11"] },
  ]},
  { name: "Phase 3: Scale & Optimize (Days 61 to 90)", desc: "Roll out to everyone, measure the outcomes, and set up governance that lasts beyond the project.", milestones: [
    { id: "m13", text: "Pilot results reviewed and the decision to proceed or stop made", owner: "Exec + Program Lead", deps: ["m12"] },
    { id: "m14", text: "Full deployment plan finalized", owner: "Program Lead", deps: ["m13"] },
    { id: "m15", text: "Agent rollout and training complete", owner: "Training + CX Ops", deps: ["m14"] },
    { id: "m16", text: "Production monitoring and QA active", owner: "CX Ops + Analytics", deps: ["m15"] },
    { id: "m17", text: "30-day post-launch review scheduled", owner: "Program Lead", deps: ["m16"] },
    { id: "m18", text: "Governance model and ongoing ownership confirmed", owner: "Exec Sponsor", deps: ["m16", "m17"] },
  ]},
];

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "at-risk", label: "At Risk" },
  { value: "blocked", label: "Blocked" },
  { value: "complete", label: "Complete" },
];

const TOOL_ID = "roadmap-builder";
const ROUTE = "/tools/roadmap-builder";
export const DEFAULTS = { statuses: {}, notes: {}, initiative: "" };
/* Every milestone given a status, cycling through the options. The floor harness
   renders it to prove the roadmap summary and its PDF content build without a gate. */
export const SAMPLE = { statuses: Object.fromEntries(PHASES.flatMap(p => p.milestones).map((m, i) => [m.id, STATUS_OPTIONS[i % STATUS_OPTIONS.length].value])), notes: {}, initiative: "Sample initiative" };
/* A status is kept only for a real milestone and a real status; text is trimmed to
   a sane length, because a link can carry anything. */
const MILESTONE_IDS = new Set(PHASES.flatMap(p => p.milestones).map(m => m.id));
const STATUS_VALUES = new Set(STATUS_OPTIONS.map(o => o.value));
const cleanState = (sc) => ({
  statuses: Object.fromEntries(Object.entries((sc && sc.statuses) || {}).filter(([k, v]) => MILESTONE_IDS.has(k) && STATUS_VALUES.has(v))),
  notes: Object.fromEntries(Object.entries((sc && sc.notes) || {}).filter(([k, v]) => MILESTONE_IDS.has(k) && typeof v === "string").map(([k, v]) => [k, v.slice(0, 500)])),
  initiative: typeof (sc && sc.initiative) === "string" ? sc.initiative.slice(0, 200) : "",
});

/* Taxonomy 1.4: one letter per milestone in the fixed order m1 to m18 (n not started, p in progress, r at risk,
   b blocked, c complete). The only thing this tool sends about what the reader entered; notes and the initiative
   name never leave the tab. */
const CODE_LETTER = { "not-started": "n", "in-progress": "p", "at-risk": "r", "blocked": "b", "complete": "c" };
export const roadmapCode = (statuses) => MILESTONES_IN_ORDER.map((m) => CODE_LETTER[(statuses && statuses[m.id]) || "not-started"] || "n").join("");
const MILESTONES_IN_ORDER = PHASES.flatMap((p) => p.milestones);

export default function RoadmapBuilder() {
  const [init] = useState(() => cleanState(readScenario(TOOL_ID, DEFAULTS)));
  const [phase, setPhase] = useState(() => (Object.keys(init.statuses).length > 0 ? "saved" : "intro"));
  const [statuses, setStatuses] = useState(init.statuses);
  const [notes, setNotes] = useState(init.notes);
  const [initiative, setInitiative] = useState(init.initiative);

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const setStatus = (id, val) => setStatuses(prev => ({ ...prev, [id]: val }));
  const getStatus = (id) => statuses[id] || "not-started";
  const getStatusObj = (id) => STATUS_OPTIONS.find(s => s.value === getStatus(id));

  const allMilestones = PHASES.flatMap(p => p.milestones);
  const completedCount = allMilestones.filter(m => getStatus(m.id) === "complete").length;
  const atRiskCount = allMilestones.filter(m => getStatus(m.id) === "at-risk" || getStatus(m.id) === "blocked").length;

  const handleStart = () => setPhase("build");


  const sent = useRef(null);
  const handleSave = () => {
    const code = roadmapCode(statuses);
    if (sent.current !== code) { sent.current = code; trackRoadmap.snapshot(code); }
    setPhase("saved");
  };


  const result = <Result label="Milestones complete" value={`${completedCount} of ${allMilestones.length}`} change={atRiskCount > 0 ? `${atRiskCount} at risk or blocked.` : "No milestone at risk or blocked."} />;

  return (
    <ToolFrame toolId={TOOL_ID} section="Frameworks + Planning" name="Transformation Roadmap Builder" title="What has to happen in the first 90 days, and what is stuck?"
      lede="A 90-day plan with 18 milestones in three phases: Foundation, Design & Pilot, and Scale & Optimize. Track each milestone's status, see what it depends on, flag risks, and produce a plan you can put in front of leadership."
      result={result} pinned={phase === "intro" ? null : { label: "Complete", value: `${completedCount} of ${allMilestones.length}` }}>
      <style>{FONT_IMPORT_CSS + optionCss("rm-sel")}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Mark each milestone's status. A milestone whose dependencies are not complete says what it is waiting on. This is a planner, so nothing is scored.</p>
          <div style={{ marginTop: 16 }}><Button onClick={handleStart}>Start the plan</Button></div>
        </section>
      )}

      {phase === "build" && (<>
        <section aria-label="Your initiative" style={K.lead}>
          <h2 style={K.h2}>90-Day Transformation Roadmap</h2>
          <input aria-label="Initiative name" value={initiative} onChange={e => setInitiative(e.target.value)} placeholder="Name your initiative, for example a platform migration or an AI rollout" style={{ ...numInput, fontVariantNumeric: "normal", fontWeight: 500, maxWidth: 440 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {STATUS_OPTIONS.map(s => {
              const count = allMilestones.filter(m => getStatus(m.id) === s.value).length;
              return count > 0 ? <span key={s.value} style={{ ...K.small, color: K.strong.color, fontWeight: 600, border: `1px solid ${K.firm}`, borderRadius: 6, padding: "3px 10px" }}>{count} {s.label}</span> : null;
            })}
          </div>
          <div role="img" aria-label={`${completedCount} of ${allMilestones.length} milestones complete`} style={{ height: 8, background: K.hair, borderRadius: 4, marginTop: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(completedCount / allMilestones.length) * 100}%`, background: K.shade(0), borderRadius: 4 }} />
          </div>
        </section>

        {PHASES.map((p, pi) => {
          const phaseComplete = p.milestones.filter(m => getStatus(m.id) === "complete").length;
          return (
            <Group key={pi} legend={`${p.name} · ${phaseComplete}/${p.milestones.length}`} note={p.desc}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.milestones.map(m => {
                  const st = getStatusObj(m.id);
                  const depsMet = m.deps.every(d => getStatus(d) === "complete");
                  const flagged = st.value === "at-risk" || st.value === "blocked";
                  return (
                    <div key={m.id} style={{ ...K.box, border: `${flagged ? 2 : 1}px solid ${flagged ? K.strong.color : K.hair}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ ...K.strong, fontSize: 15, flex: 1, minWidth: 200 }}>{m.text}</span>
                        <span style={K.small}>{m.owner}</span>
                        <select className="rm-sel" aria-label={`${m.text}: status`} value={getStatus(m.id)} onChange={e => setStatus(m.id, e.target.value)} style={{ ...selectStyle, width: "auto", fontSize: 14 }}>
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      {m.deps.length > 0 && !depsMet && getStatus(m.id) !== "complete" && (
                        <div style={{ ...K.small, marginTop: 6 }}><strong style={{ color: K.strong.color }}>Waiting on:</strong> {m.deps.map(d => allMilestones.find(am => am.id === d)?.text?.split(" ").slice(0, 4).join(" ")).join(", ")}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Group>
          );
        })}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleSave}>See the summary and report</Button>
        </div>
      </>)}

      {phase === "saved" && (<>
        <section aria-label="Roadmap summary" style={K.lead}>
          <span style={K.kicker}>Roadmap summary</span>
          <div style={K.stat}>{initiative ? initiative : "Your roadmap"}</div>
          <p style={{ ...K.body, marginTop: 6 }}>{completedCount}/{allMilestones.length} milestones complete. {atRiskCount > 0 ? `${atRiskCount} at risk or blocked.` : "No items at risk."} Download it or copy the scenario link below to keep it.</p>
          <button type="button" onClick={handleStart} style={{ ...K.link, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", marginTop: 8 }}>Change the statuses</button>
        </section>
        <Paper>
                <ReportActions toolId={TOOL_ID} toolName="Transformation Roadmap" subtitle={(initiative ? initiative + ", " : "") + "90-Day Planning Framework"} routePath={ROUTE} state={{ statuses, notes, initiative }} defaults={DEFAULTS}
                  summary={[{ label: "Milestones complete", value: completedCount + " of " + allMilestones.length }, { label: "At risk or blocked", value: String(atRiskCount) }]}
                  sections={[
                    { title: "Roadmap Phases", type: "table", rows: PHASES.map(p => [p.name, p.milestones.filter(m => getStatus(m.id) === "complete").length + " of " + p.milestones.length + " complete"]) },
                    { title: "At Risk or Blocked", type: "findings", items: atRiskCount ? allMilestones.filter(m => getStatus(m.id) === "at-risk" || getStatus(m.id) === "blocked").map(m => getStatusObj(m.id).label + ": " + m.text + (notes[m.id] ? " (" + notes[m.id] + ")" : "")) : ["No milestone is marked at risk or blocked."] },
                  ]} />
        </Paper>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button href="/contact">Talk to a consultant</Button>
          <Button kind="secondary" href="/tools/governance-model">Map who owns each decision</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
