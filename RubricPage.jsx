import { useEffect } from "react";
import { FONT, FONT_IMPORT_CSS, TYPE } from "./src/lib/type";
import { RUBRICS } from "./src/lib/rubrics";
import { JOURNEY } from "./src/lib/journey";

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
