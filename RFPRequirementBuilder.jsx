import { useState, useEffect, useRef } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, Choice, numInput, selectStyle, optionCss, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";
import { VendorIntro } from "./src/lib/VendorIntro.jsx";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { RFP_BUILDER as MODEL } from "./src/lib/rubrics/rfpBuilder";
import { rfpRequirements, scoreRfp } from "./src/lib/rfp";

/* RFP Requirement Builder. The requirements, weights, response credits and rules live in
   the published model (src/lib/rubrics/rfpBuilder.js) and the engine (src/lib/rfp.js);
   this file only presents them. */

/* A priority or a severity is a word on the page; the PDF prints its label. */
const PRI_LABEL = Object.fromEntries(MODEL.priorities.map((p) => [p.id, p.label]));
const SEV_STYLE = { critical: { label: "Critical" }, high: { label: "High" }, medium: { label: "Medium" }, info: { label: "Insight" } };
const RESP = Object.fromEntries(MODEL.responses.map((r) => [r.id, r]));
const toolOf = (id) => (JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null);

const TOOL_ID = "rfp-builder";
const ROUTE = "/tools/rfp-builder";
export const DEFAULTS = { vertical: "", size: "", activeTags: ["all"], reqs: {}, vendors: [], responses: {}, verified: {}, weights: {} };
/* A regulated enterprise case with three scored vendors, so the harness renders the
   widest requirement set, the analyst read and their PDF content. */
const sampleBase = { vertical: "Healthcare", size: "500-1000 agents", activeTags: ["all", "enterprise", "regulated"], reqs: {} };
const sampleReqs = rfpRequirements(MODEL, sampleBase);
const sampleResp = (f) => Object.fromEntries(sampleReqs.map((r, i) => [r.key, f(r, i)]).filter(([, v]) => v));
const SAMPLE_STATE = {
  ...DEFAULTS, ...sampleBase,
  vendors: ["Vendor A", "Vendor B", "Vendor C"],
  responses: {
    0: sampleResp((r, i) => (i % 9 === 0 ? "addon" : "ga")),
    1: sampleResp((r, i) => (i % 7 === 0 ? "partner" : r.layer === 3 && r.priority === "must" && i % 2 ? "roadmap" : "ga")),
    2: sampleResp((r, i) => (i === 3 ? "no" : i % 5 === 0 ? null : i % 11 === 0 ? "preview" : "ga")),
  },
  verified: { 0: Object.fromEntries(sampleReqs.filter((r) => r.priority === "must").slice(0, 8).map((r) => [r.key, true])) },
};

/* Scenario links are capped near 1,900 characters, so a link carries each vendor's
   responses as one character per requirement, in the model's fixed requirement order, and
   its demo checks as a string of 0 and 1. The page works on plain maps. */
const ALL_KEYS = [...MODEL.layers.flatMap((l) => l.reqs.map((_, i) => `${l.n}-${i}`)), ...Array.from({ length: Math.max(...Object.values(MODEL.verticalReqs).map((x) => x.length)) }, (_, i) => `v-${i}`)];
const CODE = { ga: "g", addon: "a", partner: "p", preview: "b", roadmap: "r", no: "n" };
const DECODE = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));
const packRow = (row) => ALL_KEYS.map((k) => CODE[row && row[k]] || ".").join("").replace(/\.+$/, "");
const packVer = (row) => ALL_KEYS.map((k) => (row && row[k] === true ? "1" : "0")).join("").replace(/0+$/, "");
const unpack = (m, dec) => Object.fromEntries(Object.entries(m && typeof m === "object" ? m : {}).map(([i, row]) => [i, typeof row === "string" ? Object.fromEntries([...row.slice(0, ALL_KEYS.length)].map((ch, j) => [ALL_KEYS[j], dec(ch)]).filter(([, v]) => v !== undefined)) : row]));
const packState = (st) => ({ ...st, responses: Object.fromEntries(Object.entries(st.responses).map(([i, r]) => [i, packRow(r)])), verified: Object.fromEntries(Object.entries(st.verified).map(([i, r]) => [i, packVer(r)])) });
export const SAMPLE = packState(SAMPLE_STATE);

/* A link keeps only known verticals, sizes, focus tags, priorities, response states and
   vendor names as short text. */
const cleanState = (sc) => {
  const src = sc && typeof sc === "object" ? sc : {};
  const vertical = MODEL.verticals.includes(src.vertical) ? src.vertical : "";
  const size = MODEL.sizes.includes(src.size) ? src.size : "";
  const tags = Array.isArray(src.activeTags) ? src.activeTags.filter((t) => MODEL.tags.some((f) => f.id === t)) : [];
  const pri = new Set(MODEL.priorities.map((p) => p.id));
  const reqs = Object.fromEntries(Object.entries(src.reqs && typeof src.reqs === "object" ? src.reqs : {}).filter(([k, v]) => /^(\d+|v)-\d+$/.test(k) && pri.has(v)));
  const vendors = (Array.isArray(src.vendors) ? src.vendors : []).slice(0, MODEL.thresholds.maxVendors.value).map((v) => (typeof v === "string" ? v.replace(/[<>]/g, "").slice(0, 60) : ""));
  const perVendor = (m, ok) => Object.fromEntries(Object.entries(m && typeof m === "object" ? m : {}).filter(([i]) => /^\d$/.test(i) && +i < vendors.length)
    .map(([i, row]) => [i, Object.fromEntries(Object.entries(row && typeof row === "object" ? row : {}).filter(([k, v]) => /^(\d+|v)-\d+$/.test(k) && ok(v)))]));
  const responses = perVendor(unpack(src.responses, (ch) => DECODE[ch]), (v) => !!RESP[v]);
  const verified = perVendor(unpack(src.verified, (ch) => (ch === "1" ? true : undefined)), (v) => v === true);
  const weights = Object.fromEntries(Object.entries(src.weights && typeof src.weights === "object" ? src.weights : {}).filter(([k, v]) => pri.has(k) && typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10));
  return { vertical, size, activeTags: tags.includes("all") ? tags : ["all", ...tags], reqs, vendors, responses, verified, weights };
};

const chip = (sv) => ({ display: "inline-block", fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: RADIUS.chip, border: `${sv === "critical" ? 2 : 1}px ${sv === "info" ? "dashed" : "solid"} ${sv === "critical" || sv === "high" ? K.strong.color : K.firm}`, color: K.strong.color, flexShrink: 0, minWidth: 72, textAlign: "center" });
const tabStyle = (on) => ({ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${on ? K.strong.color : K.firm}`, background: "transparent", color: K.strong.color });
const cellSelect = { ...selectStyle, fontSize: 13, padding: "0 8px" };

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
      <span style={chip(f.severity)}>{SEV_STYLE[f.severity].label}</span>
      <div><div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{f.action}</div><div style={{ ...K.small, marginTop: 3 }}>{f.title}.</div></div>
    </div>
  );
}

export default function RFPRequirementBuilder() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { fromLink: !!sc, ...cleanState(sc) }; });
  const [phase, setPhase] = useState(() => (init.fromLink && init.vertical && init.size ? "results" : "input"));
  const [step, setStep] = useState(0);
  const [vertical, setVertical] = useState(init.vertical);
  const [size, setSize] = useState(init.size);
  const [activeTags, setActiveTags] = useState(init.activeTags);
  const [reqs, setReqs] = useState(init.reqs);
  const [vendors, setVendors] = useState(init.vendors);
  const [responses, setResponses] = useState(init.responses);
  const [verified, setVerified] = useState(init.verified);
  const [weights, setWeights] = useState(init.weights);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const toggleTag = (id) => setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  const setReq = (key, p) => setReqs((prev) => ({ ...prev, [key]: p }));
  const setResponse = (vi, key, v) => setResponses((prev) => { const row = { ...(prev[vi] || {}) }; if (v) row[key] = v; else delete row[key]; return { ...prev, [vi]: row }; });
  const setVer = (vi, key, v) => setVerified((prev) => ({ ...prev, [vi]: { ...(prev[vi] || {}), [key]: v } }));
  const setVendorName = (vi, name) => setVendors((prev) => prev.map((x, i) => (i === vi ? name.replace(/[<>]/g, "").slice(0, 60) : x)));
  const addVendor = () => setVendors((prev) => (prev.length < MODEL.thresholds.maxVendors.value ? [...prev, ""] : prev));

  const isEnterprise = size.includes("500") || size.includes("1000") || size.includes("5000");
  const isRegulated = ["Healthcare", "Financial Services", "Government", "Insurance"].includes(vertical);
  /* Auto-select focus areas from the environment. The first run is skipped so the areas a
     scenario link carries are not overwritten on arrival. */
  const firstTagRun = useRef(true);
  useEffect(() => {
    if (firstTagRun.current) { firstTagRun.current = false; return; }
    const auto = ["all"];
    if (isEnterprise) auto.push("enterprise");
    if (isRegulated) auto.push("regulated");
    setActiveTags(auto);
  }, [vertical, size]);

  const state = { vertical, size, activeTags, reqs, vendors, responses, verified, weights };
  const R = scoreRfp(MODEL, state);
  const all = R.requirements;
  const groups = [...new Set(all.map((r) => r.layer))].map((n) => ({ n, name: all.find((r) => r.layer === n).layerName, reqs: all.filter((r) => r.layer === n) }));
  const next = toolOf(R.next);
  const NEXT_WHY = { "vendor-match": "you have no vendors in the scorer yet, and a starting list is the first step", "platform-decision": "no vendor covers a whole layer, and that is a specialist question before it is a vendor question", "license-gap": "some vendors meet requirements through paid add-ons, and those change the real price", "contract-risk": "the contract is where the conditions and commitments you need get written down", "tco-calculator": "the next question is what each option costs over the full term" };
  const scoring = R.vendors.length > 0;

  const reportSections = [
    { title: "RFP Context", type: "table", rows: [["Vertical", vertical || "Not specified"], ["Size", size || "Not specified"], ["Focus areas", activeTags.filter((t) => t !== "all").map((t) => (MODEL.tags.find((f) => f.id === t) || {}).label || t).join(", ") || "Core only"], ["Requirements", all.length + " (" + R.counts.must + " must, " + R.counts.should + " should, " + R.counts.nice + " nice)"]] },
    ...groups.map((g) => ({ title: g.n ? `Layer ${g.n}: ${g.name}` : g.name + " Requirements", type: "table", rows: g.reqs.map((r) => [r.text, PRI_LABEL[r.priority]]) })),
    ...(scoring ? [
      { title: "Vendor Responses", type: "table", rows: R.vendors.map((v) => [v.name, (v.coverage === null ? "No answered requirement" : v.coverage.toFixed(1) + "% weighted coverage") + "; " + (v.status === "unmet" ? "misses " + v.unmet.length + " must-have" + (v.unmet.length > 1 ? "s" : "") : v.status === "clarify" ? v.openMust + " must-haves to clarify" : v.status === "conditional" ? v.notGA.length + " must-haves not generally available" : "meets every must-have") + "; " + v.unverified.length + " must-have claims to verify"]) },
      { title: "Your Evaluation Order", type: "table", rows: R.order.length ? R.order.map((o) => ["Position " + o.position + (o.tied ? " (tied)" : ""), o.name + ", " + o.coverage.toFixed(1) + "%"]).concat(R.notOrdered.map((n) => ["Not ordered", n.name + ": " + n.reason])) : [["Not ordered yet", "No vendor meets every must-have with every must-have answered."]] },
      { title: "Analyst Read", type: "actions", items: R.findings.map((f) => ({ action: f.action, detail: SEV_STYLE[f.severity].label + ". " + f.title + ": " + MODEL.rules[f.rule].test.replace("{tieMargin}", MODEL.thresholds.tieMargin.value), priority: f.severity === "critical" || f.severity === "high" ? "high" : "medium" })) },
    ] : []),
    { title: "Scoring Rules", type: "text", content: MODEL.weightsNote + " Credit: " + MODEL.responses.map((r) => r.label.toLowerCase() + " " + r.credit).join(", ") + ". Unanswered requirements are left out of the score and listed to clarify. A must-have claim is settled only when it is seen working in the demo." },
    { title: "What This Tool Cannot Tell You", type: "findings", items: MODEL.limits },
    { title: "Method", type: "text", content: MODEL.title + " " + MODEL.version + ". Published at contactcentercx.com" + MODEL.methodology + "." },
  ];

  const ReqRow = ({ r, edit }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${K.hair}`, flexWrap: "wrap" }}>
      <span style={{ ...K.body, flex: 1, minWidth: 200 }}>{r.text}</span>
      {edit
        ? <Choice label={`${r.text}: priority`} options={MODEL.priorities.map((p) => [p.id, p.label.split(" ")[0]])} value={r.priority} onPick={(v) => setReq(r.key, v)} />
        : <span style={{ ...K.strong, fontSize: 13, fontWeight: r.priority === "must" ? 700 : 500 }}>{PRI_LABEL[r.priority]}</span>}
    </div>
  );
  const Groups = ({ edit }) => groups.map((g) => (
    <section key={g.n} aria-label={g.n ? `L${g.n} ${g.name}` : `${g.name} requirements`} style={K.panel}>
      <h2 style={{ ...K.h2, fontSize: 17 }}>{g.n ? `L${g.n} ${g.name}` : `${g.name} requirements`} <span style={K.small}>({g.reqs.length})</span></h2>
      {g.reqs.map((r) => <ReqRow key={r.key} r={r} edit={edit} />)}
    </section>
  ));

  const met = R.vendors.filter((v) => v.status === "meets").length;
  const result = phase === "results"
    ? <Result label={scoring ? "Vendors meeting every must-have" : "Requirements"} value={scoring ? `${met} of ${R.vendors.length}` : String(all.length)} change={scoring ? `${all.length} requirements, ${R.counts.must} must-haves.` : `${R.counts.must} must, ${R.counts.should} should, ${R.counts.nice} nice to have. Add vendors to score their responses.`} />
    : <Result label="Requirements so far" value={String(all.length)} change="Set your environment and focus areas, then review the priorities." />;

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.next || null} section="Vendor Selection" name="RFP Requirement Builder" title="What should your RFP require, and how did each vendor answer?"
      lede="Build weighted requirements for your platform RFP by layer, then score each vendor's response: who meets every must-have, where the choice is actually decided, what to script in each demo, and which claims still need proof."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" ? (scoring ? { label: "Meet every must-have", value: `${met} of ${R.vendors.length}` } : { label: "Requirements", value: String(all.length) }) : null}>
      <style>{FONT_IMPORT_CSS + optionCss("rfp-sel")}</style>
      <p style={K.small}>Every requirement, weight and scoring rule is in the <a href={MODEL.methodology} style={K.link}>published method</a>.</p>

      {phase === "input" && (<>
        {init.fromLink && vendors.some((v) => v.trim()) && <p role="status" style={K.small}>Carried over: {vendors.filter((v) => v.trim()).join(", ")}. {vendors.filter((v) => v.trim()).length === 1 ? "It appears" : "They appear"} in the response scorer once your requirements are ready.</p>}
        <div role="tablist" aria-label="Steps" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Environment", "Focus Areas", "Review + Customize"].map((st, i) => <button key={st} type="button" role="tab" aria-selected={step === i} onClick={() => setStep(i)} style={tabStyle(step === i)}>{i + 1}. {st}</button>)}
        </div>
        {step === 0 && (
          <Group legend="Your environment">
            <div style={K.grid(220)}>
              <label style={{ ...K.strong, fontSize: 14 }} htmlFor="rfp-vertical">Industry vertical
                <select id="rfp-vertical" className="rfp-sel" value={vertical} onChange={(e) => setVertical(e.target.value)} style={{ ...selectStyle, marginTop: 6 }}><option value="">Select...</option>{MODEL.verticals.map((v) => <option key={v} value={v}>{v}</option>)}</select>
              </label>
              <label style={{ ...K.strong, fontSize: 14 }} htmlFor="rfp-size">Operation size
                <select id="rfp-size" className="rfp-sel" value={size} onChange={(e) => setSize(e.target.value)} style={{ ...selectStyle, marginTop: 6 }}><option value="">Select...</option>{MODEL.sizes.map((sz) => <option key={sz} value={sz}>{sz}</option>)}</select>
              </label>
            </div>
            <div style={{ marginTop: 18 }}><Button onClick={() => setStep(1)} disabled={!vertical || !size}>Next: Focus Areas</Button></div>
          </Group>
        )}
        {step === 1 && (
          <Group legend="What are your focus areas?" note="Selected from your environment. Add or remove as needed.">
            <div style={K.grid(240)}>
              {MODEL.tags.map((t) => { const on = activeTags.includes(t.id); return (
                <button key={t.id} type="button" aria-pressed={on} onClick={() => t.id !== "all" && toggleTag(t.id)} style={{ ...K.box, textAlign: "left", cursor: t.id === "all" ? "default" : "pointer", border: `${on ? 2 : 1}px solid ${on ? K.strong.color : K.hair}`, fontFamily: FONT }}>
                  <div style={{ ...K.strong, fontSize: 14 }}>{on ? "\u2713 " : ""}{t.label}</div>
                  <div style={K.small}>{t.desc}</div>
                </button>
              ); })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Button kind="secondary" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)}>Review Requirements</Button>
            </div>
          </Group>
        )}
        {step === 2 && (<>
          <section aria-label="Review and set priorities" style={K.lead}>
            <h2 style={K.h2}>Review and set priorities</h2>
            <p style={K.body}>{R.counts.must} must, {R.counts.should} should, {R.counts.nice} nice to have, {all.length} in all. Change any priority; your vertical's own requirements are included and start as must-haves.</p>
          </section>
          <Groups edit />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button kind="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setPhase("results")}>Generate RFP Document</Button>
          </div>
        </>)}
      </>)}

      {phase === "results" && (<>
        <section aria-label="Your RFP requirements" style={K.lead}>
          <span style={K.kicker}>Your RFP requirements are ready</span>
          <div style={K.stat}>{all.length} requirements across {groups.length} groups</div>
          <p style={K.small}>{vertical} · {size} · {R.counts.must} must · {R.counts.should} should · {R.counts.nice} nice to have · <button type="button" onClick={() => { setPhase("input"); setStep(2); }} style={{ ...K.link, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>edit</button></p>
        </section>
        <Groups />

        <section aria-label="Score the vendor responses" style={K.panel}>
          <h2 style={K.h2}>Score the vendor responses</h2>
          <p style={{ ...K.body, marginBottom: 12 }}>When responses come back, add each vendor you sent the RFP to, on this site or not, and record what they answered. Only a generally available capability earns full credit; preview and roadmap earn none; an unanswered line is a question to send back, never a zero. Tick "seen" once a must-have works in the demo.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {vendors.map((v, vi) => <input key={vi} type="text" aria-label={`Vendor ${vi + 1} name`} placeholder={`Vendor ${vi + 1}`} value={v} onChange={(e) => setVendorName(vi, e.target.value)} style={{ ...numInput, marginTop: 0, width: 170, fontVariantNumeric: "normal" }} />)}
            {vendors.length < MODEL.thresholds.maxVendors.value && <Button kind="secondary" onClick={addVendor}>+ Add a vendor</Button>}
          </div>
          {scoring && (
            <div role="region" aria-label="Scoring table, scrolls sideways" tabIndex={0} style={{ overflowX: "auto", border: `1px solid ${K.hair}`, borderRadius: RADIUS.field, marginBottom: 12 }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 360 + R.vendors.length * 170 }}>
                <thead><tr><th scope="col" style={{ ...K.kicker, textAlign: "left", padding: "10px 12px" }}>Requirement</th>{R.vendors.map((v) => <th key={v.index} scope="col" style={{ ...K.strong, fontSize: 13, textAlign: "left", padding: "10px 12px" }}>{v.name}</th>)}</tr></thead>
                <tbody>{all.map((r) => (
                  <tr key={r.key} style={{ borderTop: `1px solid ${K.hair}` }}>
                    <td style={{ ...K.small, padding: "8px 12px", color: K.body.color }}><strong style={{ color: K.strong.color }}>{PRI_LABEL[r.priority].split(" ")[0]}</strong> {r.text}</td>
                    {R.vendors.map((v) => { const c = v.cells.find((x) => x.key === r.key); return (
                      <td key={v.index} style={{ padding: "6px 10px", verticalAlign: "top" }}>
                        <select className="rfp-sel" aria-label={`${v.name}: ${r.text}`} value={c.response || ""} onChange={(e) => setResponse(v.index, r.key, e.target.value)} style={cellSelect}>
                          <option value="">Not answered</option>{MODEL.responses.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                        </select>
                        {r.priority === "must" && c.response && RESP[c.response].meets && <label style={{ ...K.small, display: "flex", alignItems: "center", gap: 6, marginTop: 4, minHeight: 32 }}><input type="checkbox" checked={c.verified} onChange={(e) => setVer(v.index, r.key, e.target.checked)} style={{ width: 18, height: 18 }} /> seen in demo</label>}
                      </td>
                    ); })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {scoring && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <span style={{ ...K.small, alignSelf: "center" }}>Weights (defaults, set your own):</span>
              {MODEL.priorities.map((p) => <label key={p.id} style={{ ...K.small, color: K.strong.color, width: 110 }}>{p.label}<input type="number" min={0} max={10} aria-label={`${p.label} weight`} value={R.weights[p.id]} onChange={(e) => setWeights((w) => ({ ...w, [p.id]: Math.max(0, Math.min(10, Number(e.target.value) || 0)) }))} style={numInput} /></label>)}
            </div>
          )}
        </section>

        {scoring && (
          <section aria-label="Analyst read" style={K.panel}>
            <h2 style={K.h2}>Analyst read</h2>
            <div style={{ ...K.grid(200), marginBottom: 14 }}>
              {R.vendors.map((v) => { const o = R.order.find((x) => x.vendor === v.index); return (
                <div key={v.index} style={K.box}>
                  <div style={{ ...K.strong, fontSize: 15 }}>{v.name}</div>
                  <div style={{ ...K.strong, ...K.num, fontSize: 26, margin: "4px 0" }}>{v.coverage === null ? "n/a" : v.coverage.toFixed(1) + "%"}</div>
                  <div style={K.small}>{o ? "Position " + o.position + (o.tied ? ", tied" : "") : "Not ordered: " + (R.notOrdered.find((x) => x.vendor === v.index) || {}).reason}</div>
                  <div style={{ ...K.small, marginTop: 6 }}>{v.unmet.length} unmet · {v.notGA.length} not GA · {v.open.length} to clarify · {v.unverified.length} to verify</div>
                  {(vendors[v.index] || "").trim() && <div style={{ marginTop: 8 }}><VendorIntro name={v.name} from={TOOL_ID} surface="tool" kind="text" label={`Request an introduction to ${v.name}`} /></div>}
                </div>
              ); })}
            </div>
            {R.findings.map((f, i) => <Finding key={i} f={f} />)}
          </section>
        )}

        <section aria-label="Next move" style={K.lead}>
          <span style={K.kicker}>Next move</span>
          {next && <p style={{ ...K.body, color: K.strong.color, margin: "8px 0" }}><a href={next.href} style={K.link}>{next.name}</a>, because {NEXT_WHY[R.next]}.</p>}
          {R.next !== "vendor-match" && toolOf("vendor-match") && <p style={K.small}>Looking for more vendors to send this to? <a href={toolOf("vendor-match").href} style={K.link}>Vendor Match</a> builds a starting list from your operation.</p>}
          <p style={{ ...K.small, marginTop: 6 }}>Running this RFP and want help with the demos, references and negotiation? Use the review request below; your requirements and scores travel with it.</p>
        </section>

        <Paper>
          <ReportActions next={R.next ? { to: R.next, because: "Because " + NEXT_WHY[R.next] + "." } : null}
            toolId={TOOL_ID}
            toolName="RFP Requirements Document"
            subtitle={`${vertical || "Any vertical"}, ${size || "any size"}, ${all.length} requirements${scoring ? ", " + R.vendors.length + " vendors scored" : ""}`}
            routePath={ROUTE}
            state={packState(state)}
            defaults={DEFAULTS}
            summary={[
              { label: "Requirements", value: String(all.length) },
              { label: "Must / should / nice", value: R.counts.must + " / " + R.counts.should + " / " + R.counts.nice },
              { label: "Vendors scored", value: String(R.vendors.length) },
              { label: "Meeting every must-have", value: String(R.vendors.filter((v) => v.status === "meets").length) },
            ]}
            sections={reportSections}
          />
        </Paper>
        <p style={K.small}>Want expert eyes on this? <a href="/contact" style={K.link}>Connect with a consultant</a></p>
      </>)}
    </ToolFrame>
  );
}
