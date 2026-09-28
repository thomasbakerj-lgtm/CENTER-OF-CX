import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, Choice, numInput, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { PLATFORM_DECISION as MODEL } from "./src/lib/rubrics/platformDecision";
import { scoreRenewal, renewalNeeds, renewalVars } from "./src/lib/renewal";

/* Platform Decision: the renewal gate. The rules, thresholds and outcomes live in the
   published model (src/lib/rubrics/platformDecision.js) and the engine
   (src/lib/renewal.js); this file only presents them. */

/* A severity or an outcome is a word on the page; the PDF prints its label. */
const SEV_STYLE = { critical: { label: "Critical" }, high: { label: "High" }, medium: { label: "Medium" }, info: { label: "Note" } };
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

const chip = (sv) => ({ display: "inline-block", fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: RADIUS.chip, border: `${sv === "critical" || sv === "market" || sv === "evaluate" ? 2 : 1}px ${sv === "info" ? "dashed" : "solid"} ${sv === "critical" || sv === "high" || sv === "market" || sv === "specialist" ? K.strong.color : K.firm}`, color: K.strong.color, flexShrink: 0, minWidth: 72, textAlign: "center" });
const tabStyle = (on) => ({ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${on ? K.strong.color : K.firm}`, background: "transparent", color: K.strong.color });

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
      <span style={chip(f.severity)}>{SEV_STYLE[f.severity].label}</span>
      <div>
        <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{f.action}</div>
        <div style={{ ...K.small, marginTop: 3 }}>{f.title}: {fill(MODEL.rules[f.rule].test)}</div>
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

  const result = phase === "results" && R.complete
    ? <Result label="Renewal gate" value={gateOf(R.gate).label} change={`${R.items.filter((x) => x.status === "gap").length} must-have gaps, ${R.items.filter((x) => x.status === "proof").length} proof requests.`} />
    : <Result label="Needs answered" value={`${R.answered} of ${R.total}`} change="The gate, layer outcomes and checklist appear once every need is answered." />;

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.next ? R.next.tool : null} section="Renewal Decision" name="Platform Decision" title="Should you renew your platform, add to it, or test the market?"
      lede="Decide what to do at renewal: renew as is, renew with conditions written into the contract, add a specialist for a layer, or run an evaluation. Rate 35 needs across 7 layers, say which ones matter and how you know, and check whether there is time before your notice date."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" && R.complete ? { label: "Renewal gate", value: gateOf(R.gate).label } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Nothing is averaged. A must-have rated 2 or below is a gap whatever the other ratings say. A rating you do not know becomes a request for proof. A need you mark not needed drops out.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
            <Button onClick={() => setPhase("assess")}>Start the renewal check</Button>
            <a href={MODEL.methodology} style={K.link}>See the published method: every rule, outcome and threshold</a>
          </div>
        </section>
      )}

      {phase === "assess" && (<>
        <div role="tablist" aria-label="Layers" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {layers.map((l, i) => (<button key={l.n} type="button" role="tab" aria-selected={i === currentLayer} onClick={() => setCurrentLayer(i)} style={tabStyle(i === currentLayer)}>L{l.n}{layerDone(l.n) ? " \u2713" : ""}</button>))}
          <button type="button" role="tab" aria-selected={onClockStep} onClick={() => setCurrentLayer(layers.length)} style={tabStyle(onClockStep)}>Renewal clock</button>
        </div>

        {!onClockStep && (() => { const layer = layers[currentLayer]; return (
          <Group legend={`L${layer.n} ${layer.name}`} note="For each need, say how well your current platform does it, how you know, and whether it matters for the next contract term. Anything marked not needed drops out.">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {layer.needs.map((text, i) => { const key = `${layer.n}-${i}`, it = itemOf(key), none = it.need === "none"; return (
                <div key={key} style={{ ...K.box, opacity: none ? 0.75 : 1 }}>
                  <p style={{ ...K.strong, fontSize: 15, lineHeight: "22px", margin: "0 0 10px" }}>{text}</p>
                  <Choice label={`${text}: does it matter`} options={MODEL.needLevels.map((lv) => [lv.id, lv.label])} value={it.need} onPick={(v) => setNeedOf(key, v)} />
                  {!none && (<>
                    <div style={{ marginTop: 8 }}>
                      <Choice label={`${text}: current platform`} options={[...MODEL.ratings.map((r) => [r.value, r.label]), [MODEL.unknown.value, MODEL.unknown.label]]} value={it.rating} onPick={(v) => setScore(key, v)} />
                    </div>
                    {Number.isInteger(it.rating) && (
                      <div style={{ marginTop: 8 }}>
                        <Choice label={`${text}: how you know`} options={MODEL.evidence.map((e) => [e.id, e.label])} value={it.evidence} onPick={(v) => setEvidenceOf(key, v)} />
                      </div>
                    )}
                  </>)}
                </div>
              ); })}
            </div>
          </Group>
        ); })()}

        {onClockStep && (
          <Group legend="Renewal clock" note="Optional. It shows whether there is time to negotiate conditions or run an evaluation before the notice date, the last day to tell the vendor you will not renew as is.">
            <div style={{ ...K.grid(220), marginBottom: 14 }}>
              <label style={{ ...K.strong, fontSize: 14 }}>Months until the notice deadline
                <input type="number" min={0} max={120} value={clock.monthsToNotice ?? ""} onChange={(e) => setClockField("monthsToNotice", e.target.value === "" ? undefined : Math.max(0, Math.min(120, Math.round(Number(e.target.value) || 0))))} style={numInput} />
              </label>
              <label style={{ ...K.strong, fontSize: 14 }}>Term offered, in years
                <input type="number" min={1} max={10} value={clock.termYears ?? ""} onChange={(e) => setClockField("termYears", e.target.value === "" ? undefined : Math.max(1, Math.min(10, Math.round(Number(e.target.value) || 1))))} style={numInput} />
              </label>
            </div>
            <p style={{ ...K.strong, fontSize: 14, marginBottom: 8 }}>Do you know your exit, data-export and transition terms?</p>
            <div role="group" aria-label="Are the exit, data-export and transition terms known" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[[true, "Yes"], [false, "No"], [undefined, "Not sure yet"]].map(([v, l]) => <button key={l} type="button" aria-pressed={clock.exitKnown === v} onClick={() => setClockField("exitKnown", v)} style={tabStyle(clock.exitKnown === v)}>{clock.exitKnown === v ? "\u2713 " : ""}{l}</button>)}
            </div>
          </Group>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button kind="secondary" onClick={() => setCurrentLayer(Math.max(0, currentLayer - 1))} disabled={currentLayer === 0}>Back</Button>
          <span style={K.small}>{R.answered} of {R.total} needs answered</span>
          {currentLayer < layers.length
            ? <Button onClick={() => setCurrentLayer(currentLayer + 1)}>{currentLayer < layers.length - 1 ? `Next: L${layers[currentLayer + 1].n}` : "Next: renewal clock"}</Button>
            : <Button onClick={() => setPhase("results")} disabled={!R.complete}>{R.complete ? "See the renewal gate" : "Answer every need first"}</Button>}
        </div>
      </>)}

      {phase === "results" && R.complete && (<>
        <section aria-label="Renewal gate" style={K.lead}>
          <span style={K.kicker}>Renewal gate</span>
          <div style={K.stat}>{gateOf(R.gate).label}</div>
          <p style={{ ...K.body, marginTop: 6 }}>{fill(gateOf(R.gate).test)}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {Object.keys(SEV_STYLE).map((sv) => <span key={sv} style={chip(sv)}>{R.bySeverity[sv]} {SEV_STYLE[sv].label.toLowerCase()}</span>)}
          </div>
        </section>

        <section aria-label="Layer by layer" style={K.panel}>
          <h2 style={K.h2}>Layer by layer</h2>
          {R.layers.map((l) => { const src = layers.find((x) => x.n === l.n), t = toolOf(l.tool); return (
            <div key={l.n} style={{ padding: "12px 0", borderTop: `1px solid ${K.hair}`, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ ...K.strong, fontSize: 15 }}>L{l.n} {l.name}{l.core ? " (core)" : ""}</div>
                <p style={{ ...K.small, margin: "4px 0 6px" }}>{l.must} must-haves: {l.gaps} gaps, {l.proof} need proof. {outcomeOf(l.outcome).test}</p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {t && l.outcome !== "renew" && <a href={t.href} style={K.link}>Diagnose with {t.name}</a>}
                  {(l.outcome === "specialist" || l.outcome === "market") && <a href={src.category} style={K.link}>{src.categoryLabel}</a>}
                </div>
              </div>
              <span style={{ ...chip(l.outcome), alignSelf: "center" }}>{outcomeOf(l.outcome).label}</span>
            </div>
          ); })}
        </section>

        <section aria-label="Findings" style={K.panel}>
          <h2 style={K.h2}>Findings</h2>
          {R.findings.length ? R.findings.map((f, i) => <Finding key={i} f={f} />) : <p style={K.body}>No rule raises a finding.</p>}
          {next && <p style={{ ...K.body, marginTop: 14 }}>Next diagnostic: <a href={next.href} style={K.link}>{next.name}</a>, because {NEXT_WHY[R.next.because]}.</p>}
          <p style={{ ...K.small, marginTop: 14 }}>Every rule, outcome and threshold is in the <a href={MODEL.methodology} style={K.link}>published method</a>. <button type="button" onClick={() => { setPhase("assess"); setCurrentLayer(0); }} style={{ ...K.link, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>Change your answers</button>.</p>
        </section>

        <Paper>
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
            { title: "Method", type: "text", content: MODEL.title + " " + MODEL.version + ". A must-have rated " + MODEL.thresholds.gapAt.value + " or below is a gap whatever the other ratings are. A rating you do not know becomes a request for proof and counts as no score at all. Only needs that matter count. Published at contactcentercx.com" + MODEL.methodology + "." },
          ]} />
        </Paper>
      </>)}
    </ToolFrame>
  );
}
