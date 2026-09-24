import { useEffect } from "react";
import { FONT, FONT_IMPORT_CSS, TYPE } from "./src/lib/type";
import { RUBRICS } from "./src/lib/rubrics";
import { JOURNEY } from "./src/lib/journey";
import { qaAgreement, qaThresholdVars } from "./src/lib/qa";
import { renewalVars } from "./src/lib/renewal";

/* The published rubric for a V3-Framework assessment (doctrine v1.3 Section 10.1).
   It renders from the same rubric object the scoring engine reads, so what this page
   says is exactly how the assessment scores. Nothing here is written by hand per tool. */

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF";
const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 24px" };

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const cut = (b, i, all) => (i === all.length - 1 ? `${fmt(b.min)} and above` : `${fmt(b.min)} to below ${fmt(b.max)}`);

export default function RubricPage({ id }) {
  const r = RUBRICS[id];
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  if (!r) return null;
  if (r.kind === "ownership") return <OwnershipPage r={r} />;
  if (r.kind === "qa") return <QAPage r={r} />;
  if (r.kind === "renewal") return <RenewalPage r={r} />;
  const totalWeight = r.dims.reduce((s, d) => s + d.weight, 0);
  const paired = r.kind === "paired";
  const statements = r.dims.reduce((s, d) => s + (paired ? d.pairs.length * 2 : d.criteria.length), 0);
  const sideLabel = (i) => (paired ? r.sides[i].label : "");
  const H2 = { ...TYPE.h2, color: NAVY, margin: "40px 0 12px" };
  const P = { ...TYPE.body, color: SLATE, margin: "0 0 12px" };
  const cell = { ...TYPE.cell, color: SLATE, padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "top", textAlign: "left" };

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#fff" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></a>
          <a href={r.route} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Take the assessment</a>
        </div>
      </nav>

      <header style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "56px 0 44px" }}>
        <div style={WRAP}>
          <span style={{ ...TYPE.eyebrow, color: LIGHT }}>Published rubric</span>
          <h1 style={{ ...TYPE.display, color: "#fff", margin: "10px 0 12px" }}>{r.title}: how it scores</h1>
          <p style={{ ...TYPE.body, color: "rgba(255,255,255,0.6)", maxWidth: 640 }}>{r.what}</p>
          <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.72)", marginTop: 14 }}>Rubric version {r.version}, published {r.published}. {r.dims.length} {paired ? "areas" : "dimensions"}, {statements} statements{paired ? ` in ${statements / 2} pairs` : ""}.</p>
        </div>
      </header>

      <main style={{ ...WRAP, padding: "8px 24px 72px" }}>
        <h2 style={H2}>How the score is calculated</h2>
        {paired ? (<>
          <p style={P}>Each area holds pairs of statements: one from the {sideLabel(0).toLowerCase()} and one from the {sideLabel(1).toLowerCase()}, each answered on a scale from {r.scale.min} ({r.scale.low.toLowerCase()}) to {r.scale.max} ({r.scale.high.toLowerCase()}). A pair scores the gap between its two answers. An area scores the average gap of its pairs, and the overall score is the weighted average of the areas; the weights are shown below and total {totalWeight}. Lower is closer agreement. A band is assigned only when every statement is answered, and an answer outside the scale counts as unanswered.</p>
          <p style={P}>Two kinds of pair reach your checklist. A pair whose answers are {r.gapAt} or more points apart is misaligned, and adds the alignment action. A pair answered at {r.failAt} or below on both sides is a shared weakness, and adds the build action: both sides agree the capability is missing, which a gap of zero would otherwise hide. The checklist runs from the area with the largest gap. The next diagnostic is the one named below for that area.</p>
        </>) : (<>
          <p style={P}>Each statement is answered on a scale from {r.scale.min} ({r.scale.low.toLowerCase()}) to {r.scale.max} ({r.scale.high.toLowerCase()}). A dimension scores the average of its statements. The overall score is the weighted average of the dimensions; the weights are shown below and total {totalWeight}. A band is assigned only when every statement is answered, and an answer outside the scale counts as unanswered.</p>
          <p style={P}>Every statement answered at {r.failAt} or below adds its action to your checklist, weakest dimension first. The next diagnostic is the one named below for your lowest-scoring dimension.</p>
        </>)}

        <h2 style={H2}>Bands</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={{ ...cell, ...TYPE.label, color: NAVY }}>{paired ? "Average gap" : "Overall score"}</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>Band</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>What it means</th></tr></thead>
          <tbody>{r.bands.map((b, i, all) => (
            <tr key={b.id}><td style={{ ...cell, whiteSpace: "nowrap" }}>{cut(b, i, all)}</td><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{b.label}</td><td style={cell}>{b.desc}{b.rec ? ` ${b.rec}` : ""}{b.dimFlag ? ` A dimension scoring in this band is marked "${b.dimFlag}".` : ""}</td></tr>
          ))}</tbody>
        </table>

        {r.secondaryBands && (<>
          <h2 style={H2}>{r.secondaryBands.title}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>{r.secondaryBands.bands.map((b, i, all) => (
              <tr key={b.id}><td style={{ ...cell, whiteSpace: "nowrap" }}>{cut(b, i, all)}</td><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{b.label}</td><td style={cell}>{b.desc}</td></tr>
            ))}</tbody>
          </table>
        </>)}

        <h2 style={H2}>{paired ? "Areas, paired statements and actions" : "Dimensions, statements and actions"}</h2>
        {r.dims.map((d) => (
          <section key={d.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16, background: WARM }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <h3 style={{ ...TYPE.h3, color: NAVY }}>{d.name}</h3>
              <span style={{ ...TYPE.caption, color: MUTED }}>Weight {d.weight} of {totalWeight}. {paired ? "If largest gap" : "If lowest"}, next diagnostic: {JOURNEY[d.next] ? <a href={JOURNEY[d.next].route} style={{ color: ELECTRIC, fontWeight: 600 }}>{JOURNEY[d.next].name}</a> : d.next}</span>
            </div>
            {paired ? (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead><tr><th style={{ ...cell, ...TYPE.label, color: NAVY }}>{sideLabel(0)}</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>{sideLabel(1)}</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>If {r.gapAt}+ points apart</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>If both at {r.failAt} or below</th></tr></thead>
              <tbody>{d.pairs.map((p, i) => (
                <tr key={i}><td style={cell}>{p[r.sides[0].id]}</td><td style={cell}>{p[r.sides[1].id]}</td><td style={cell}>{p.align}</td><td style={cell}>{p.build}</td></tr>
              ))}</tbody>
            </table>
            ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead><tr><th style={{ ...cell, ...TYPE.label, color: NAVY, width: "45%" }}>Statement</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>Action if answered {r.failAt} or below</th></tr></thead>
              <tbody>{d.criteria.map((c, i) => (
                <tr key={i}><td style={cell}>{c.text}</td><td style={cell}>{c.action}</td></tr>
              ))}</tbody>
            </table>
            )}
          </section>
        ))}

        <h2 style={H2}>What this assessment cannot tell you</h2>
        <ul style={{ paddingLeft: 20 }}>{r.limits.map((l, i) => <li key={i} style={{ ...P, marginBottom: 8 }}>{l}</li>)}</ul>

        <div style={{ marginTop: 36 }}>
          <a href={r.route} style={{ display: "inline-block", background: ELECTRIC, color: "#fff", ...TYPE.label, fontSize: 14, padding: "12px 22px", borderRadius: 8 }}>Take the {r.title}</a>
        </div>
      </main>
    </div>
  );
}

/* The published page for an ownership model (kind "ownership"): the roles, the six rules
   with their tests and severities, and every decision with its common owner and the
   functions it needs. Rendered from the same object the ownership engine reads. */
function OwnershipPage({ r }) {
  const H2 = { ...TYPE.h2, color: NAVY, margin: "40px 0 12px" };
  const P = { ...TYPE.body, color: SLATE, margin: "0 0 12px" };
  const cell = { ...TYPE.cell, color: SLATE, padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "top", textAlign: "left" };
  const th = { ...cell, ...TYPE.label, color: NAVY };
  const role = (id) => (r.roles.find((x) => x.id === id) || {}).label || id;
  const total = r.domains.reduce((s, d) => s + d.items.length, 0);
  const bottleneckAt = Math.ceil((2 * total) / r.roles.length);
  const need = (it) => (it.involve || []).map((e) => (typeof e === "string" ? role(e) : role(e.role) + (e.severity === "high" ? " (high if missing)" : ""))).join(", ");
  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#fff" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></a>
          <a href={r.route} style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>Open the tool</a>
        </div>
      </nav>
      <header style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "56px 0 44px" }}>
        <div style={WRAP}>
          <span style={{ ...TYPE.eyebrow, color: LIGHT }}>Published model</span>
          <h1 style={{ ...TYPE.display, color: "#fff", margin: "10px 0 12px" }}>{r.title}: how it reads your map</h1>
          <p style={{ ...TYPE.body, color: "rgba(255,255,255,0.78)", maxWidth: 640 }}>{r.what}</p>
          <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.78)", marginTop: 14 }}>Model version {r.version}, published {r.published}. {r.domains.length} domains, {total} decisions, {r.roles.length} roles.</p>
        </div>
      </header>
      <main style={{ ...WRAP, padding: "8px 24px 72px" }}>
        <h2 style={H2}>How the map is read</h2>
        <p style={P}>Each decision gets one accountable role and, optionally, one contributing role. The model does not score: governance quality does not average, and one unowned decision can matter more than the rest together. It raises findings under the six rules below, most serious first. Findings appear once {r.minAssigned} of the {total} decisions have an owner. The roles are {r.roles.map((x) => x.label).join(", ")}.</p>
        <h2 style={H2}>Rules and bands</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Finding</th><th style={th}>Raised when</th><th style={th}>Severity</th></tr></thead>
          <tbody>{Object.entries(r.rules).map(([id, x]) => (
            <tr key={id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{x.title}</td><td style={cell}>{id === "bottleneck" ? `${x.test} Across ${r.roles.length} roles that is ${bottleneckAt} or more.` : x.test}</td><td style={cell}>{x.severity === "info" ? "Confirm" : x.severity[0].toUpperCase() + x.severity.slice(1)}</td></tr>
          ))}</tbody>
        </table>
        <p style={{ ...P, marginTop: 12 }}>The next diagnostic is {JOURNEY[r.next.cxIt] ? <a href={JOURNEY[r.next.cxIt].route} style={{ color: ELECTRIC, fontWeight: 600 }}>{JOURNEY[r.next.cxIt].name}</a> : r.next.cxIt} when at least half of the critical and high findings sit in CX Strategy & Vision or Technology & Platforms, where CX and IT decisions meet; otherwise {JOURNEY[r.next.otherwise] ? <a href={JOURNEY[r.next.otherwise].route} style={{ color: ELECTRIC, fontWeight: 600 }}>{JOURNEY[r.next.otherwise].name}</a> : r.next.otherwise}, to sequence the fixes.</p>
        <h2 style={H2}>Decisions, common owners and required functions</h2>
        {r.domains.map((d) => (
          <section key={d.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16, background: WARM }}>
            <h3 style={{ ...TYPE.h3, color: NAVY, marginBottom: 10 }}>{d.name}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead><tr><th style={{ ...th, width: "45%" }}>Decision</th><th style={th}>Common owner</th><th style={th}>Must involve</th></tr></thead>
              <tbody>{d.items.map((it, i) => (
                <tr key={i}><td style={cell}>{it.text}</td><td style={cell}>{role(it.common)}</td><td style={cell}>{need(it) || "None required"}</td></tr>
              ))}</tbody>
            </table>
          </section>
        ))}
        <h2 style={H2}>What this assessment cannot tell you</h2>
        <ul style={{ paddingLeft: 20 }}>{r.limits.map((l, i) => <li key={i} style={{ ...P, marginBottom: 8 }}>{l}</li>)}</ul>
        <div style={{ marginTop: 36 }}>
          <a href={r.route} style={{ display: "inline-block", background: ELECTRIC, color: "#fff", ...TYPE.label, fontSize: 14, padding: "12px 22px", borderRadius: 8 }}>Map your {r.title}</a>
        </div>
      </main>
    </div>
  );
}

/* The published page for the QA program model (kind "qa"): the form checks, the blind
   calibration rule, the Center of CX Calibration Method with its bands, thresholds and
   sources, and the kappa paradox worked from the model's own example. Rendered from the
   same object the QA engine reads. */
function QAPage({ r }) {
  const H2 = { ...TYPE.h2, color: NAVY, margin: "40px 0 12px" };
  const P = { ...TYPE.body, color: SLATE, margin: "0 0 12px" };
  const cell = { ...TYPE.cell, color: SLATE, padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "top", textAlign: "left" };
  const th = { ...cell, ...TYPE.label, color: NAVY };
  const TV = qaThresholdVars(r);
  const fillT = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (TV[k] === undefined ? "" : String(TV[k])));
  const sev = (x) => (x.severity === "info" ? "Note" : x.severity[0].toUpperCase() + x.severity.slice(1));
  const rules = (group) => Object.entries(r.rules).filter(([, x]) => x.group === group);
  const RuleTable = ({ group }) => (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr><th style={th}>Finding</th><th style={th}>Raised when</th><th style={th}>Severity</th></tr></thead>
      <tbody>{rules(group).map(([id, x]) => (
        <tr key={id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{x.title}</td><td style={cell}>{fillT(x.test)}{x.heuristic ? " Heuristic threshold." : ""}</td><td style={cell}>{sev(x)}</td></tr>
      ))}</tbody>
    </table>
  );
  /* The paradox, computed: two evaluators, one critical item. */
  const px = r.paradox;
  const units = [...Array(px.bothPass).fill([1, 1]), ...Array(px.splitA).fill([1, 0]), ...Array(px.splitB).fill([0, 1]), ...Array(px.bothFail).fill([0, 0])];
  const g = qaAgreement(units, 2);
  const passA = (px.bothPass + px.splitA) / px.calls, passB = (px.bothPass + px.splitB) / px.calls;
  const peK = passA * passB + (1 - passA) * (1 - passB);
  const kappa = (g.pa - peK) / (1 - peK);
  const next = JOURNEY[r.next.tool];
  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#fff" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></a>
          <a href={r.route} style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>Open the tool</a>
        </div>
      </nav>
      <header style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "56px 0 44px" }}>
        <div style={WRAP}>
          <span style={{ ...TYPE.eyebrow, color: LIGHT }}>Published method</span>
          <h1 style={{ ...TYPE.display, color: "#fff", margin: "10px 0 12px" }}>{r.title}: how forms are checked and evaluators calibrated</h1>
          <p style={{ ...TYPE.body, color: "rgba(255,255,255,0.78)", maxWidth: 640 }}>{r.what}</p>
          <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.78)", marginTop: 14 }}>Model version {r.version}, published {r.published}. {r.method.name} {r.method.version}.</p>
        </div>
      </header>
      <main style={{ ...WRAP, padding: "8px 24px 72px" }}>
        <h2 style={H2}>How a form is checked</h2>
        <p style={P}>Before anyone scores against it, the form is checked for how it is built. A criterion's swing is its category's weight divided by the number of criteria in the category: the points one mark moves the score. What the form measures is shown as a share of its weight on {r.focus.map((f) => f.label.toLowerCase()).join(", ")}, as a fact with no threshold, because no source says what the right mix is. An auto-fail must name its reason: {r.reasons.map((x) => x.label.toLowerCase()).join(", ")}.</p>
        <RuleTable group="form" />
        <h2 style={H2}>Blind calibration</h2>
        <p style={P}>Each evaluator scores the same calls alone and sees only their own score. They send the QA lead a submission code, which carries their initials, the call ID, their marks and a fingerprint of the form, so a code scored on a different form is set aside. The tool compares nothing, and shows no score, bias or agreement, until every evaluator has scored every call. Until then it shows only how many evaluators have scored each call. A session needs at least {r.thresholds.minEvaluators.value} evaluators besides any reference.</p>
        <h2 style={H2}>{r.method.name}, version {r.method.version}</h2>
        <p style={P}>{r.method.summary} The method is our own combination; every statistic inside it is published and cited below.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Measure</th><th style={th}>Statistic</th></tr></thead>
          <tbody>{r.measures.map((m) => <tr key={m.id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{m.label}</td><td style={cell}>{m.stat}</td></tr>)}</tbody>
        </table>
        <p style={{ ...P, marginTop: 12 }}>Every measure carries a {Math.round(r.bootstrap.level * 100)}% bootstrap interval: the calls are resampled {r.bootstrap.resamples.toLocaleString("en-US")} times with a fixed seed, so the same session always gives the same interval. A measure is graded by where its whole interval falls. An interval that crosses a band line is inconclusive, and a session of fewer than {r.thresholds.minCalls.value} calls is shown but not graded. When every evaluator gives every mark the same value, alpha has no value to compute, because there is no variation to measure; the session reads as unanimous and is never reported as a failure. Percent agreement sits beside each measure because it is the number a supervisor reads first.</p>
        <h2 style={H2}>Rules and bands</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Band</th><th style={th}>Cut point</th><th style={th}>Meaning</th></tr></thead>
          <tbody>{r.bands.map((b, i) => <tr key={b.id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{b.label}</td><td style={cell}>{i === 0 ? `${b.min.toFixed(3)} and above` : Number.isFinite(b.min) ? `${b.min.toFixed(3)} to below ${r.bands[i - 1].min.toFixed(3)}` : `Below ${r.bands[i - 1].min.toFixed(3)}`}</td><td style={cell}>{b.desc}</td></tr>)}</tbody>
        </table>
        <p style={{ ...P, marginTop: 12 }}>The cut points are Krippendorff's (2004). Gwet publishes no fixed cut points for AC1, so the method applies the same two to it.</p>
        <RuleTable group="calibration" />
        <h2 style={H2}>Why kappa is not used for critical fails</h2>
        <p style={P}>Two evaluators score {px.calls} calls on one auto-fail criterion. Both pass {px.bothPass}; each fails {px.splitA} that the other passed; neither fails the same call. They agree on {Math.round(g.pa * 100)}% of calls. Cohen's kappa for this table is {kappa.toFixed(2)}, which reads as no agreement at all, because rare fails make chance agreement look almost certain. Gwet's AC1 for the same table is {g.ac1.toFixed(2)}. Critical fails are rare by design, so the method grades them with AC1 (Feinstein and Cicchetti 1990; Gwet 2008).</p>
        <h2 style={H2}>Thresholds</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Threshold</th><th style={th}>Value</th><th style={th}>Basis</th></tr></thead>
          <tbody>{Object.entries(r.thresholds).map(([id, t]) => <tr key={id}><td style={cell}>{t.text[0].toUpperCase() + t.text.slice(1)}</td><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{TV[id]}</td><td style={cell}>{t.kind === "heuristic" ? "Heuristic, no published source" : "Rule of the method"}</td></tr>)}</tbody>
        </table>
        <h2 style={H2}>The next step</h2>
        <p style={P}>While the form has a critical or high finding, the next step is to fix the form. Then to calibrate; then to calibrate again while any measure is not reliable, inconclusive, tentative or ungraded. Once the form passes and evaluators agree, the next step is {next ? <a href={next.route} style={{ color: ELECTRIC, fontWeight: 600 }}>{next.name}</a> : r.next.tool}, to test whether the scores track the repeat contacts they should prevent.</p>
        <h2 style={H2}>Sources</h2>
        <ul style={{ paddingLeft: 20 }}>{r.sources.map((x) => <li key={x.id} style={{ ...P, marginBottom: 8 }}>{x.text}</li>)}</ul>
        <h2 style={H2}>What this tool cannot tell you</h2>
        <ul style={{ paddingLeft: 20 }}>{r.limits.map((l, i) => <li key={i} style={{ ...P, marginBottom: 8 }}>{l}</li>)}</ul>
        <div style={{ marginTop: 36 }}>
          <a href={r.route} style={{ display: "inline-block", background: ELECTRIC, color: "#fff", ...TYPE.label, fontSize: 14, padding: "12px 22px", borderRadius: 8 }}>Build and calibrate a QA form</a>
        </div>
      </main>
    </div>
  );
}

/* The published page for the renewal model (kind "renewal"): what the buyer records per
   need, the per-need rules, the layer outcomes, the gate, the clock, every threshold and
   every need by layer. Rendered from the same object the renewal engine reads. */
function RenewalPage({ r }) {
  const H2 = { ...TYPE.h2, color: NAVY, margin: "40px 0 12px" };
  const P = { ...TYPE.body, color: SLATE, margin: "0 0 12px" };
  const cell = { ...TYPE.cell, color: SLATE, padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "top", textAlign: "left" };
  const th = { ...cell, ...TYPE.label, color: NAVY };
  const TV = renewalVars(r);
  const fillT = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (TV[k] === undefined ? "" : String(TV[k])));
  const sev = (x) => (x.severity === "info" ? "Note" : x.severity[0].toUpperCase() + x.severity.slice(1));
  const total = r.layers.reduce((s, l) => s + l.needs.length, 0);
  const link = (id) => (JOURNEY[id] ? <a href={JOURNEY[id].route} style={{ color: ELECTRIC, fontWeight: 600 }}>{JOURNEY[id].name}</a> : id);
  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#fff" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></a>
          <a href={r.route} style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>Open the tool</a>
        </div>
      </nav>
      <header style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "56px 0 44px" }}>
        <div style={WRAP}>
          <span style={{ ...TYPE.eyebrow, color: LIGHT }}>Published method</span>
          <h1 style={{ ...TYPE.display, color: "#fff", margin: "10px 0 12px" }}>{r.title}: how the renewal gate reads your platform</h1>
          <p style={{ ...TYPE.body, color: "rgba(255,255,255,0.78)", maxWidth: 640 }}>{r.what}</p>
          <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.78)", marginTop: 14 }}>Model version {r.version}, published {r.published}. {r.layers.length} layers, {total} needs. {r.truthType}</p>
        </div>
      </header>
      <main style={{ ...WRAP, padding: "8px 24px 72px" }}>
        <h2 style={H2}>What you record for each need</h2>
        <p style={P}>How well your current platform does it: {r.ratings.map((x) => x.value + " " + x.label.toLowerCase()).join(", ")}, or {r.unknown.label.toLowerCase()}. How you know: {r.evidence.map((x) => x.label.toLowerCase()).join(" or ")}. Whether it matters for the next contract term: {r.needLevels.map((x) => x.label.toLowerCase()).join(", ")}. A need marked not needed drops out of every outcome. Nothing is averaged: a must-have gap is a gap whatever the other ratings are, and a rating you do not know is a request for proof, never a low score.</p>
        <h2 style={H2}>Rules and bands</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Finding</th><th style={th}>Raised when</th><th style={th}>Severity</th></tr></thead>
          <tbody>{Object.entries(r.rules).map(([id, x]) => (
            <tr key={id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{x.title}</td><td style={cell}>{fillT(x.test)}</td><td style={cell}>{sev(x)}</td></tr>
          ))}</tbody>
        </table>
        <h2 style={H2}>Layer outcomes</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Outcome</th><th style={th}>When</th></tr></thead>
          <tbody>{r.outcomes.map((o) => <tr key={o.id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{o.label}</td><td style={cell}>{fillT(o.test)}</td></tr>)}</tbody>
        </table>
        <p style={{ ...P, marginTop: 12 }}>A core layer is what the contact center platform itself is: {r.layers.filter((l) => l.core).map((l) => l.name).join(" and ")}. A gap there is not closed by adding a product beside the platform, so it calls for a market test; on the other layers a specialist can serve beside it.</p>
        <h2 style={H2}>The renewal gate</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Gate</th><th style={th}>When</th></tr></thead>
          <tbody>{r.gates.map((g) => <tr key={g.id}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{g.label}</td><td style={cell}>{fillT(g.test)}</td></tr>)}</tbody>
        </table>
        <p style={{ ...P, marginTop: 12 }}>The clock then checks whether there is time to act: fewer than {TV.evaluationMonths} months to the notice date is too little to run an evaluation, and fewer than {TV.negotiationMonths} months is little time to negotiate conditions. The next step is {link(r.next.contract)} when the exit and data terms are unknown or conditions must be written in, {link(r.next.market)} when the gate says evaluate, and {link(r.next.price)} when the call is to renew.</p>
        <h2 style={H2}>Thresholds</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Threshold</th><th style={th}>Value</th><th style={th}>Basis</th></tr></thead>
          <tbody>{Object.entries(r.thresholds).map(([id, t]) => <tr key={id}><td style={cell}>{t.text[0].toUpperCase() + t.text.slice(1)}</td><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{TV[id]}</td><td style={cell}>{t.kind === "heuristic" ? "Heuristic, no published source" : "Rule of the method"}</td></tr>)}</tbody>
        </table>
        <h2 style={H2}>Layers and needs</h2>
        {r.layers.map((l) => (
          <section key={l.n} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16, background: WARM }}>
            <h3 style={{ ...TYPE.h3, color: NAVY, marginBottom: 10 }}>L{l.n} {l.name}{l.core ? " (core)" : ""}</h3>
            <ul style={{ paddingLeft: 20 }}>{l.needs.map((n, i) => <li key={i} style={{ ...P, marginBottom: 4 }}>{n}</li>)}</ul>
          </section>
        ))}
        <h2 style={H2}>What this tool cannot tell you</h2>
        <ul style={{ paddingLeft: 20 }}>{r.limits.map((x, i) => <li key={i} style={{ ...P, marginBottom: 8 }}>{x}</li>)}</ul>
        <div style={{ marginTop: 36 }}>
          <a href={r.route} style={{ display: "inline-block", background: ELECTRIC, color: "#fff", ...TYPE.label, fontSize: 14, padding: "12px 22px", borderRadius: 8 }}>Run the renewal check</a>
        </div>
      </main>
    </div>
  );
}
