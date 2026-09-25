import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { PLATFORM_DECISION as MODEL } from "./src/lib/rubrics/platformDecision";
import { scoreRenewal, renewalNeeds, renewalVars } from "./src/lib/renewal";

/* Platform Decision: the renewal gate. The rules, thresholds and outcomes live in the
   published model (src/lib/rubrics/platformDecision.js) and the engine
   (src/lib/renewal.js); this file only presents them. */

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const LAYER_COLOR = { 7: "#1a5276", 6: "#1a6b8a", 5: "#1a7f9e", 4: "#0e8c7f", 3: "#0e7a5e", 2: "#1a6b4a", 1: "#2c5f3f" };
const RATING_COLOR = { 1: RED, 2: "#DC6B00", 3: AMBER, 4: "#7CB342", 5: GREEN, unknown: SLATE };
const SEV_STYLE = { critical: { label: "Critical", color: RED }, high: { label: "High", color: "#C2410C" }, medium: { label: "Medium", color: "#B45309" }, info: { label: "Note", color: SLATE } };
const OUTCOME_COLOR = { renew: "#047857", conditions: "#B45309", specialist: "#C2410C", market: "#B91C1C" };
const GATE_COLOR = { renew: "#047857", conditions: "#B45309", evaluate: "#B91C1C" };
const TV = renewalVars(MODEL);
const fill = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (TV[k] === undefined ? "" : String(TV[k])));
const outcomeOf = (id) => MODEL.outcomes.find((o) => o.id === id);
const gateOf = (id) => MODEL.gates.find((g) => g.id === id);
const toolOf = (id) => (JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null);
const NEEDS = renewalNeeds(MODEL);

const TOOL_ID = "platform-decision";
const ROUTE = "/tools/platform-decision";
export const DEFAULTS = { scores: {}, need: {}, evidence: {}, clock: {} };
/* A complete sample that reaches every layer outcome: mixed ratings, some needs marked
   nice-to-have or not needed, some ratings on the vendor's word, some unknown, and a clock
   with the exit terms unknown. The floor harness renders it to prove the results and the
   PDF build without a gate and without a missing field. */
export const SAMPLE = {
  scores: Object.fromEntries(NEEDS.map((n, i) => [n.key, i % 11 === 4 ? "unknown" : n.layer === 6 && i % 5 < 3 ? 2 : n.layer === 4 && i % 5 < 3 ? 1 : ((n.layer + i) % 5) + 1])),
  need: Object.fromEntries(NEEDS.filter((_, i) => i % 7 === 3 || i % 13 === 5).map((n, i) => [n.key, i % 2 ? "none" : "nice"])),
  evidence: Object.fromEntries(NEEDS.filter((_, i) => i % 6 === 2).map((n) => [n.key, "vendor"])),
  clock: { monthsToNotice: 5, termYears: 3, exitKnown: false },
};

/* A link can carry any shape. A rating is kept only as a whole number from 1 to 5 or the
   word "unknown"; a need level and an evidence basis only from the published lists; the
   clock only as numbers in range and a true or false. Anything else opens unanswered. */
const cleanState = (sc) => {
  const src = sc && typeof sc === "object" ? sc : {};
  const keep = (m, ok) => Object.fromEntries(Object.entries(m && typeof m === "object" ? m : {}).filter(([k, v]) => NEEDS.some((n) => n.key === k) && ok(v)));
  const c = src.clock && typeof src.clock === "object" ? src.clock : {};
  const inRange = (v, lo, hi) => (typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi ? Math.round(v) : undefined);
  return {
    scores: keep(src.scores, (v) => (Number.isInteger(v) && v >= 1 && v <= 5) || v === MODEL.unknown.value),
    need: keep(src.need, (v) => MODEL.needLevels.some((x) => x.id === v)),
    evidence: keep(src.evidence, (v) => MODEL.evidence.some((x) => x.id === v)),
    clock: Object.fromEntries(Object.entries({ monthsToNotice: inRange(c.monthsToNotice, 0, 120), termYears: inRange(c.termYears, 1, 10), exitKnown: typeof c.exitKnown === "boolean" ? c.exitKnown : undefined }).filter(([, v]) => v !== undefined)),
  };
};

const btn = (on, color) => ({ padding: "6px 8px", fontSize: 12, fontWeight: 600, borderRadius: 4, cursor: "pointer", border: `1px solid ${on ? color : BORDER}`, background: on ? color : "#fff", color: on ? "#fff" : SLATE });
const H2 = { fontFamily: FONT, fontSize: 22, fontWeight: 600, color: NAVY, margin: "0 0 10px" };

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: SEV_STYLE[f.severity].color, padding: "2px 8px", borderRadius: 4, flexShrink: 0, minWidth: 64, textAlign: "center" }}>{SEV_STYLE[f.severity].label}</span>
      <div>
        <div style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{f.action}</div>
        <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{f.title}: {fill(MODEL.rules[f.rule].test)}</div>
      </div>
    </div>
  );
}

export default function PlatformDecisionMatrix() {
  const [init] = useState(() => cleanState(readScenario(TOOL_ID, DEFAULTS)));
  const [scores, setScores] = useState(init.scores);
  const [need, setNeed] = useState(init.need);
  const [evidence, setEvidence] = useState(init.evidence);
  const [clock, setClock] = useState(init.clock);
  const state = { scores, need, evidence, clock };
  const R = scoreRenewal(MODEL, state);
  const [phase, setPhase] = useState(() => (scoreRenewal(MODEL, init).complete ? "results" : "intro"));
  const [currentLayer, setCurrentLayer] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const set = (setter) => (key, v) => setter((prev) => ({ ...prev, [key]: v }));
  const setScore = set(setScores), setNeedOf = set(setNeed), setEvidenceOf = set(setEvidence);
  const setClockField = (k, v) => setClock((prev) => { const n = { ...prev }; if (v === undefined) delete n[k]; else n[k] = v; return n; });
  const itemOf = (key) => R.items.find((x) => x.key === key);
  const layerDone = (n) => R.items.filter((x) => x.layer === n).every((x) => x.status !== "unanswered");
  const layers = MODEL.layers;
  const onClockStep = currentLayer === layers.length;
  const next = R.next ? toolOf(R.next.tool) : null;
  const NEXT_WHY = { exit: "the exit and data terms are not known yet, and the negotiation depends on them", evaluate: "the gate says run an evaluation, which starts from your requirements", conditions: "the conditions have to be written into the contract terms", renew: "renewing is the call, so price it against the full term" };

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />

      {phase !== "intro" && <ToolHero compact wrap={WRAP} eyebrow="Renewal Decision" title="Platform Decision" />}
      {phase === "intro" && (
        <ToolHero fill wrap={WRAP} eyebrow="Renewal Decision" title="Platform Decision"
          intro="Decide what to do at renewal: renew as is, renew with conditions written into the contract, add a specialist for a layer, or run an evaluation. Rate 35 needs across 7 layers, say which ones matter and how you know, and check whether there is time before your notice date.">
          <ToolStart label="Start Renewal Check" onStart={() => setPhase("assess")} methodHref={MODEL.methodology} methodLabel="See the published method: every rule, outcome and threshold" />
        </ToolHero>
      )}

      {phase === "assess" && (<section style={{ background: "#fff", padding: "40px 28px 60px" }}><div style={{ ...WRAP, maxWidth: 760 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {layers.map((l, i) => (<button key={l.n} aria-pressed={i === currentLayer} onClick={() => setCurrentLayer(i)} style={btn(i === currentLayer, LAYER_COLOR[l.n])}>L{l.n}{layerDone(l.n) ? " ✓" : ""}</button>))}
          <button aria-pressed={onClockStep} onClick={() => setCurrentLayer(layers.length)} style={btn(onClockStep, NAVY)}>Renewal clock</button>
        </div>

        {!onClockStep && (() => { const layer = layers[currentLayer]; return (<div>
          <h2 style={H2}>L{layer.n} {layer.name}</h2>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>For each need: how well your current platform does it, how you know, and whether it matters for the next contract term. Mark anything you do not need as not needed; it drops out.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {layer.needs.map((text, i) => { const key = `${layer.n}-${i}`, it = itemOf(key), none = it.need === "none"; return (
              <div key={key} style={{ background: WARM, border: `1px solid ${it.status !== "unanswered" ? LAYER_COLOR[layer.n] + "40" : BORDER}`, borderRadius: 8, padding: "14px 16px", opacity: none ? 0.7 : 1 }}>
                <p style={{ fontSize: 14, color: NAVY, margin: "0 0 10px", fontWeight: 600 }}>{text}</p>
                <div role="group" aria-label={`${text}: does it matter`} style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                  {MODEL.needLevels.map((lv) => <button key={lv.id} aria-pressed={it.need === lv.id} onClick={() => setNeedOf(key, lv.id)} style={btn(it.need === lv.id, NAVY)}>{lv.label}</button>)}
                </div>
                {!none && (<>
                  <div role="group" aria-label={`${text}: current platform`} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {MODEL.ratings.map((r) => <button key={r.value} aria-pressed={it.rating === r.value} onClick={() => setScore(key, r.value)} style={{ ...btn(it.rating === r.value, RATING_COLOR[r.value]), flex: 1, minWidth: 84 }}>{r.label}</button>)}
                    <button aria-pressed={it.rating === "unknown"} onClick={() => setScore(key, MODEL.unknown.value)} style={{ ...btn(it.rating === "unknown", RATING_COLOR.unknown), flex: 1, minWidth: 84 }}>{MODEL.unknown.label}</button>
                  </div>
                  {Number.isInteger(it.rating) && (
                    <div role="group" aria-label={`${text}: how you know`} style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      {MODEL.evidence.map((e) => <button key={e.id} aria-pressed={it.evidence === e.id} onClick={() => setEvidenceOf(key, e.id)} style={btn(it.evidence === e.id, SLATE)}>{e.label}</button>)}
                    </div>
                  )}
                </>)}
              </div>
            ); })}
          </div>
        </div>); })()}

        {onClockStep && (<div>
          <h2 style={H2}>Renewal clock</h2>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>Optional, and it changes what you can do: whether there is time to negotiate conditions or run an evaluation before the notice date.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }} className="pg">
            <label style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>Months until the notice deadline
              <input type="number" min={0} max={120} value={clock.monthsToNotice ?? ""} onChange={(e) => setClockField("monthsToNotice", e.target.value === "" ? undefined : Math.max(0, Math.min(120, Math.round(Number(e.target.value) || 0))))} style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 10px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6 }} />
            </label>
            <label style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>Term offered, in years
              <input type="number" min={1} max={10} value={clock.termYears ?? ""} onChange={(e) => setClockField("termYears", e.target.value === "" ? undefined : Math.max(1, Math.min(10, Math.round(Number(e.target.value) || 1))))} style={{ display: "block", width: "100%", marginTop: 6, padding: "8px 10px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6 }} />
            </label>
          </div>
          <div role="group" aria-label="Are the exit, data-export and transition terms known" style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 600, marginRight: 6 }}>Do you know your exit, data-export and transition terms?</span>
            {[[true, "Yes"], [false, "No"], [undefined, "Not sure yet"]].map(([v, l]) => <button key={l} aria-pressed={clock.exitKnown === v} onClick={() => setClockField("exitKnown", v)} style={btn(clock.exitKnown === v, NAVY)}>{l}</button>)}
          </div>
        </div>)}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => setCurrentLayer(Math.max(0, currentLayer - 1))} disabled={currentLayer === 0} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: currentLayer === 0 ? "default" : "pointer", opacity: currentLayer === 0 ? 0.5 : 1 }}>Back</button>
          <span style={{ fontSize: 12, color: SLATE }}>{R.answered} of {R.total} needs answered</span>
          {currentLayer < layers.length
            ? <button onClick={() => setCurrentLayer(currentLayer + 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: NAVY, color: "#fff", cursor: "pointer" }}>{currentLayer < layers.length - 1 ? `Next: L${layers[currentLayer + 1].n}` : "Next: renewal clock"}</button>
            : <button onClick={() => setPhase("results")} disabled={!R.complete} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: R.complete ? GREEN : MUTED, color: "#fff", cursor: R.complete ? "pointer" : "default" }}>{R.complete ? "See the renewal gate" : "Answer every need first"}</button>}
        </div>
      </div></section>)}

      {phase === "results" && R.complete && (<section style={{ background: "#fff", padding: "40px 28px 60px" }}><div style={WRAP}>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "28px", marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Renewal gate</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", margin: "6px 0" }}>{gateOf(R.gate).label}</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{fill(gateOf(R.gate).test)}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {Object.keys(SEV_STYLE).map((sv) => <span key={sv} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: R.bySeverity[sv] ? SEV_STYLE[sv].color : "rgba(255,255,255,0.14)", padding: "4px 10px", borderRadius: 6 }}>{R.bySeverity[sv]} {SEV_STYLE[sv].label.toLowerCase()}</span>)}
          </div>
        </div>

        <h2 style={H2}>Layer by layer</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {R.layers.map((l) => { const src = layers.find((x) => x.n === l.n), t = toolOf(l.tool); return (
            <div key={l.n} style={{ background: WARM, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${LAYER_COLOR[l.n]}`, borderRadius: 10, padding: "16px 18px", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>L{l.n} {l.name}{l.core ? " (core)" : ""}</div>
                <p style={{ fontSize: 12, color: SLATE, margin: "4px 0 6px" }}>{l.must} must-haves: {l.gaps} gaps, {l.proof} need proof. {outcomeOf(l.outcome).test}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
                  {t && l.outcome !== "renew" && <a href={t.href} style={{ color: ELECTRIC, fontWeight: 600 }}>Diagnose with {t.name}</a>}
                  {(l.outcome === "specialist" || l.outcome === "market") && <a href={src.category} style={{ color: ELECTRIC, fontWeight: 600 }}>{src.categoryLabel}</a>}
                </div>
              </div>
              <div style={{ alignSelf: "center", padding: "6px 12px", borderRadius: 6, background: OUTCOME_COLOR[l.outcome], color: "#fff", fontSize: 12, fontWeight: 700 }}>{outcomeOf(l.outcome).label}</div>
            </div>
          ); })}
        </div>

        <h2 style={H2}>Findings</h2>
        <div style={{ marginBottom: 20 }}>{R.findings.length ? R.findings.map((f, i) => <Finding key={i} f={f} />) : <p style={{ fontSize: 14, color: "#047857", fontWeight: 600 }}>No rule raises a finding.</p>}</div>
        {next && <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 24 }}>Next diagnostic: <a href={next.href} style={{ color: ELECTRIC, fontWeight: 600 }}>{next.name}</a>, because {NEXT_WHY[R.next.because]}.</p>}
        <p style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>Every rule, outcome and threshold is in the <a href={MODEL.methodology} style={{ color: ELECTRIC, fontWeight: 600 }}>published method</a>. <button onClick={() => { setPhase("assess"); setCurrentLayer(0); }} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Change your answers</button>.</p>

        <ReportActions next={R.next ? { to: R.next.tool, because: "Because " + NEXT_WHY[R.next.because] + "." } : null} toolId={TOOL_ID} toolName="Platform Decision" subtitle="Renewal Gate" routePath={ROUTE} state={state} defaults={DEFAULTS}
          summary={[
            { label: "Renewal gate", value: gateOf(R.gate).label },
            { label: "Must-have gaps", value: String(R.items.filter((x) => x.status === "gap").length) },
            { label: "Proof requests", value: String(R.items.filter((x) => x.status === "proof").length) },
            { label: "Months to notice", value: R.clock.months === null ? "Not entered" : String(R.clock.months) },
          ]}
          sections={[
            { title: "Renewal Gate", type: "text", content: gateOf(R.gate).label + ". " + fill(gateOf(R.gate).test) },
            { title: "Layer Outcomes", type: "table", rows: R.layers.map((l) => ["L" + l.n + " " + l.name + (l.core ? " (core)" : ""), outcomeOf(l.outcome).label + ": " + l.gaps + " of " + l.must + " must-haves are gaps, " + l.proof + " need proof"]) },
            { title: "Negotiation Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c) => ({ action: c.action, detail: SEV_STYLE[c.severity].label + ". " + MODEL.rules[c.rule].title + ": " + fill(MODEL.rules[c.rule].test), priority: c.severity === "critical" || c.severity === "high" ? "high" : "medium" })) : [{ action: "Nothing to negotiate or prove on these answers.", detail: "Confirm the ratings with the people who run the platform day to day before relying on them.", priority: "medium" }] },
            { title: "Every Need", type: "table", rows: R.items.map((x) => ["L" + x.layer + " " + x.text, x.need === "none" ? "Not needed" : (x.rating === "unknown" ? MODEL.unknown.label : MODEL.ratings.find((r) => r.value === x.rating).label + ", " + MODEL.evidence.find((e) => e.id === x.evidence).label.toLowerCase()) + ", " + MODEL.needLevels.find((n) => n.id === x.need).label.toLowerCase()]) },
            { title: "Renewal Clock", type: "table", rows: [["Months to notice", R.clock.months === null ? "Not entered" : String(R.clock.months)], ["Term offered", R.clock.years === null ? "Not entered" : R.clock.years + " years"], ["Exit and data terms known", R.clock.exitKnown === null ? "Not sure yet" : R.clock.exitKnown ? "Yes" : "No"]] },
            { title: "What This Tool Cannot Tell You", type: "findings", items: MODEL.limits },
            { title: "Method", type: "text", content: MODEL.title + " " + MODEL.version + ". A must-have rated " + MODEL.thresholds.gapAt.value + " or below is a gap whatever the other ratings are; a rating you do not know is a proof request, never a low score; only needs that matter count. Published at contactcentercx.com" + MODEL.methodology + "." },
          ]} />
      </div></section>)}
    </div>
  );
}
