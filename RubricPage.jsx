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
  const totalWeight = r.dims.reduce((s, d) => s + d.weight, 0);
  const statements = r.dims.reduce((s, d) => s + d.criteria.length, 0);
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
          <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.72)", marginTop: 14 }}>Rubric version {r.version}, published {r.published}. {r.dims.length} dimensions, {statements} statements.</p>
        </div>
      </header>

      <main style={{ ...WRAP, padding: "8px 24px 72px" }}>
        <h2 style={H2}>How the score is calculated</h2>
        <p style={P}>Each statement is answered on a scale from {r.scale.min} ({r.scale.low.toLowerCase()}) to {r.scale.max} ({r.scale.high.toLowerCase()}). A dimension scores the average of its statements. The overall score is the weighted average of the dimensions; the weights are shown below and total {totalWeight}. A band is assigned only when every statement is answered, and an answer outside the scale counts as unanswered.</p>
        <p style={P}>Every statement answered at {r.failAt} or below adds its action to your checklist, weakest dimension first. The next diagnostic is the one named below for your lowest-scoring dimension.</p>

        <h2 style={H2}>Bands</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={{ ...cell, ...TYPE.label, color: NAVY }}>Overall score</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>Band</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>What it means</th></tr></thead>
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

        <h2 style={H2}>Dimensions, statements and actions</h2>
        {r.dims.map((d) => (
          <section key={d.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", marginBottom: 16, background: WARM }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <h3 style={{ ...TYPE.h3, color: NAVY }}>{d.name}</h3>
              <span style={{ ...TYPE.caption, color: MUTED }}>Weight {d.weight} of {totalWeight}. If lowest, next diagnostic: {JOURNEY[d.next] ? <a href={JOURNEY[d.next].route} style={{ color: ELECTRIC, fontWeight: 600 }}>{JOURNEY[d.next].name}</a> : d.next}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead><tr><th style={{ ...cell, ...TYPE.label, color: NAVY, width: "45%" }}>Statement</th><th style={{ ...cell, ...TYPE.label, color: NAVY }}>Action if answered {r.failAt} or below</th></tr></thead>
              <tbody>{d.criteria.map((c, i) => (
                <tr key={i}><td style={cell}>{c.text}</td><td style={cell}>{c.action}</td></tr>
              ))}</tbody>
            </table>
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
