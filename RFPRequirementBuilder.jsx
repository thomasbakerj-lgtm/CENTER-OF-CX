import { useState, useEffect, useRef } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { RFP_BUILDER as MODEL } from "./src/lib/rubrics/rfpBuilder";
import { rfpRequirements, scoreRfp } from "./src/lib/rfp";

/* RFP Requirement Builder. The requirements, weights, response credits and rules live in
   the published model (src/lib/rubrics/rfpBuilder.js) and the engine (src/lib/rfp.js);
   this file only presents them. */

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };
const PRI_COLOR = { must: "#B91C1C", should: "#B45309", nice: MUTED };
const PRI_LABEL = Object.fromEntries(MODEL.priorities.map((p) => [p.id, p.label]));
const SEV_STYLE = { critical: { label: "Critical", color: "#B91C1C" }, high: { label: "High", color: "#C2410C" }, medium: { label: "Medium", color: "#B45309" }, info: { label: "Insight", color: "#1D4ED8" } };
const RESP = Object.fromEntries(MODEL.responses.map((r) => [r.id, r]));
const LAYER_COLOR = Object.fromEntries(MODEL.layers.map((l) => [l.n, l.color]));
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

const btn = (on, color) => ({ padding: "4px 9px", fontSize: 12, fontWeight: 600, borderRadius: 4, cursor: "pointer", border: `1px solid ${on ? color : BORDER}`, background: on ? color : "#fff", color: on ? "#fff" : SLATE });
const H2 = { fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, margin: "32px 0 8px" };
const P = { fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 12 };

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: SEV_STYLE[f.severity].color, padding: "2px 8px", borderRadius: 4, flexShrink: 0, minWidth: 64, textAlign: "center" }}>{SEV_STYLE[f.severity].label}</span>
      <div><div style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{f.action}</div><div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{f.title}.</div></div>
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
    { title: "Next Steps", type: "next", items: next ? [{ tool: next.name, href: next.href, reason: "Because " + NEXT_WHY[R.next] + "." }] : [] },
  ];

  const ReqRow = ({ r, edit }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderTop: `1px solid ${BORDER}`, fontSize: 13, color: SLATE, flexWrap: "wrap" }}>
      <span style={{ flex: 1, minWidth: 220 }}>{r.text}</span>
      {edit
        ? <div role="group" aria-label={`${r.text}: priority`} style={{ display: "flex", gap: 3 }}>{MODEL.priorities.map((p) => <button key={p.id} aria-pressed={r.priority === p.id} onClick={() => setReq(r.key, p.id)} style={btn(r.priority === p.id, PRI_COLOR[p.id])}>{p.label.split(" ")[0]}</button>)}</div>
        : <span style={{ fontSize: 12, fontWeight: 700, color: PRI_COLOR[r.priority] }}>{PRI_LABEL[r.priority]}</span>}
    </div>
  );
  const Groups = ({ edit }) => groups.map((g) => (
    <div key={g.n} style={{ marginBottom: 16, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: WARM }}>
        <span style={{ width: 22, height: 22, borderRadius: 4, background: g.n ? LAYER_COLOR[g.n] : GREEN, color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{g.n || "V"}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{g.n ? `L${g.n} ${g.name}` : `${g.name} requirements`}</span>
        <span style={{ fontSize: 12, color: MUTED }}>({g.reqs.length})</span>
      </div>
      {g.reqs.map((r) => <ReqRow key={r.key} r={r} edit={edit} />)}
    </div>
  ));

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="Vendor Selection" title="RFP Requirement Builder"
        intro="Build weighted requirements for your platform RFP by layer, then score each vendor's response: who meets every must-have, where the choice is actually decided, what to script in each demo, and which claims still need proof.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every requirement, weight and scoring rule is in the <a href={MODEL.methodology} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      {phase === "input" && (
        <section style={{ background: "#fff", padding: "48px 28px" }}><div style={{ ...WRAP, maxWidth: 760 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {["Environment", "Focus Areas", "Review + Customize"].map((s, i) => <button key={s} aria-pressed={step === i} onClick={() => setStep(i)} style={{ flex: 1, padding: "10px", border: "none", borderBottom: `3px solid ${step === i ? ELECTRIC : BORDER}`, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: step === i ? NAVY : MUTED }}>{s}</button>)}
          </div>
          {step === 0 && (<div>
            <h2 style={{ ...H2, marginTop: 0 }}>Your environment</h2>
            <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", margin: "12px 0 4px" }} htmlFor="rfp-vertical">Industry vertical</label>
            <select id="rfp-vertical" value={vertical} onChange={(e) => setVertical(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, color: NAVY }}><option value="">Select...</option>{MODEL.verticals.map((v) => <option key={v} value={v}>{v}</option>)}</select>
            <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", margin: "12px 0 4px" }} htmlFor="rfp-size">Operation size</label>
            <select id="rfp-size" value={size} onChange={(e) => setSize(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, color: NAVY }}><option value="">Select...</option>{MODEL.sizes.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <button onClick={() => setStep(1)} disabled={!vertical || !size} style={{ marginTop: 24, padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: vertical && size ? ELECTRIC : MUTED, color: "#fff", cursor: "pointer" }}>Next: Focus Areas</button>
          </div>)}
          {step === 1 && (<div>
            <h2 style={{ ...H2, marginTop: 0 }}>What are your focus areas?</h2>
            <p style={P}>Selected from your environment. Add or remove as needed.</p>
            <div className="pg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MODEL.tags.map((t) => { const on = activeTags.includes(t.id); return (
                <button key={t.id} aria-pressed={on} onClick={() => t.id !== "all" && toggleTag(t.id)} style={{ padding: "14px 16px", textAlign: "left", borderRadius: 8, cursor: t.id === "all" ? "default" : "pointer", border: `1px solid ${on ? ELECTRIC : BORDER}`, background: on ? `${ELECTRIC}0D` : "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{on ? "✓ " : ""}{t.label}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{t.desc}</div>
                </button>
              ); })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(0)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>Back</button>
              <button onClick={() => setStep(2)} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", cursor: "pointer" }}>Review Requirements</button>
            </div>
          </div>)}
          {step === 2 && (<div>
            <h2 style={{ ...H2, marginTop: 0 }}>Review and set priorities</h2>
            <p style={P}>{R.counts.must} must, {R.counts.should} should, {R.counts.nice} nice to have, {all.length} in all. Change any priority; your vertical's own requirements are included and start as must-haves.</p>
            <Groups edit />
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>Back</button>
              <button onClick={() => setPhase("results")} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: GREEN, color: "#fff", cursor: "pointer" }}>Generate RFP Document</button>
            </div>
          </div>)}
        </div></section>
      )}

      {phase === "results" && (
        <section style={{ background: "#fff", padding: "40px 28px 56px" }}><div style={WRAP}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#047857", letterSpacing: 2, textTransform: "uppercase" }}>Your RFP requirements are ready</span>
            <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: NAVY, margin: "8px 0" }}>{all.length} requirements across {groups.length} groups</h2>
            <p style={{ fontSize: 13, color: SLATE }}>{vertical} · {size} · {R.counts.must} must · {R.counts.should} should · {R.counts.nice} nice to have · <button onClick={() => { setPhase("input"); setStep(2); }} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", padding: 0 }}>edit</button></p>
          </div>
          <Groups />

          <h2 style={H2}>Score the vendor responses</h2>
          <p style={P}>When responses come back, add each vendor you sent the RFP to, on this site or not, and record what they answered. Only a generally available capability earns full credit; preview and roadmap earn none; an unanswered line is a question to send back, never a zero. Tick "seen" once a must-have works in the demo.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {vendors.map((v, vi) => <input key={vi} type="text" aria-label={`Vendor ${vi + 1} name`} placeholder={`Vendor ${vi + 1}`} value={v} onChange={(e) => setVendorName(vi, e.target.value)} style={{ padding: "8px 10px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, width: 150 }} />)}
            {vendors.length < MODEL.thresholds.maxVendors.value && <button onClick={addVendor} style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px dashed ${ELECTRIC}`, background: "none", color: ELECTRIC, cursor: "pointer" }}>+ Add a vendor</button>}
          </div>
          {scoring && (
            <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: 8, marginBottom: 12 }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 360 + R.vendors.length * 170 }}>
                <thead><tr><th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: NAVY, background: WARM }}>Requirement</th>{R.vendors.map((v) => <th key={v.index} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: NAVY, background: WARM }}>{v.name}</th>)}</tr></thead>
                <tbody>{all.map((r) => (
                  <tr key={r.key} style={{ borderTop: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: SLATE }}><span style={{ fontWeight: 700, color: PRI_COLOR[r.priority] }}>{PRI_LABEL[r.priority].split(" ")[0]}</span> {r.text}</td>
                    {R.vendors.map((v) => { const c = v.cells.find((x) => x.key === r.key); return (
                      <td key={v.index} style={{ padding: "6px 10px", verticalAlign: "top" }}>
                        <select aria-label={`${v.name}: ${r.text}`} value={c.response || ""} onChange={(e) => setResponse(v.index, r.key, e.target.value)} style={{ width: "100%", padding: "5px 6px", fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 4, color: NAVY }}>
                          <option value="">Not answered</option>{MODEL.responses.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                        </select>
                        {r.priority === "must" && c.response && RESP[c.response].meets && <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: SLATE, marginTop: 4 }}><input type="checkbox" checked={c.verified} onChange={(e) => setVer(v.index, r.key, e.target.checked)} /> seen in demo</label>}
                      </td>
                    ); })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {scoring && (<>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 13, color: SLATE, marginBottom: 8 }}>
              <span>Weights (defaults, set your own):</span>
              {MODEL.priorities.map((p) => <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>{p.label} <input type="number" min={0} max={10} aria-label={`${p.label} weight`} value={R.weights[p.id]} onChange={(e) => setWeights((w) => ({ ...w, [p.id]: Math.max(0, Math.min(10, Number(e.target.value) || 0)) }))} style={{ width: 52, padding: "4px 6px", border: `1px solid ${BORDER}`, borderRadius: 4 }} /></label>)}
            </div>

            <h2 style={H2}>Analyst read</h2>
            <div className="pg" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, R.vendors.length)}, 1fr)`, gap: 10, marginBottom: 16 }}>
              {R.vendors.map((v) => { const o = R.order.find((x) => x.vendor === v.index); return (
                <div key={v.index} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{v.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "4px 0" }}>{v.coverage === null ? "n/a" : v.coverage.toFixed(1) + "%"}</div>
                  <div style={{ fontSize: 12, color: SLATE }}>{o ? "Position " + o.position + (o.tied ? ", tied" : "") : "Not ordered: " + (R.notOrdered.find((x) => x.vendor === v.index) || {}).reason}</div>
                  <div style={{ fontSize: 12, color: SLATE, marginTop: 6 }}>{v.unmet.length} unmet · {v.notGA.length} not GA · {v.open.length} to clarify · {v.unverified.length} to verify</div>
                </div>
              ); })}
            </div>
            {R.findings.map((f, i) => <Finding key={i} f={f} />)}
          </>)}

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", margin: "28px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Next move</div>
            {next && <p style={{ fontSize: 15, color: "#fff", margin: "8px 0", lineHeight: 1.6 }}><a href={next.href} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>{next.name}</a>, because {NEXT_WHY[R.next]}.</p>}
            {R.next !== "vendor-match" && toolOf("vendor-match") && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}>Looking for more vendors to send this to? <a href={toolOf("vendor-match").href} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>Vendor Match</a> builds a starting list from your operation.</p>}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>Running this RFP and want help with the demos, references and negotiation? Use the review request below; your requirements and scores travel with it.</p>
          </div>

          <ReportActions
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
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: MUTED }}>Want expert eyes on this? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Connect with a consultant</a></span>
          </div>
        </div></section>
      )}
    </div>
  );
}
