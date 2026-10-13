// Reference.jsx
//
// The reference library (TB, 13 Oct 2026, open item 2): /reference, one page per metric at /reference/<id>, the glossary
// at /reference/glossary and the Erlang C explainer at /reference/erlang-c. Content from src/lib/reference.js; formulas
// read from the published method models (src/lib/rubrics), published figures from comparisons.js, the Erlang C table
// computed by the shipped engine (src/lib/adherence.js). Computes nothing of its own. Tokens only.
import { useParams } from "react-router-dom";
import { HOUSE, PILLARS, alpha, LINE } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { SEO_MAP } from "./src/lib/seo.js";
import { CATEGORIES } from "./src/lib/verticals.js";
import { GRADE_MEANING } from "./src/lib/confidence.js";
import { FIXTURES, FIXTURE_KIND } from "./src/lib/fixtures.js";
import { erlangC, serviceLevel, asa } from "./src/lib/adherence.js";
import { PublishedFigures } from "./src/lib/HowOthersReport.jsx";
import { METRICS, ERLANG, GLOSSARY } from "./src/lib/reference.js";

const ACCENT = PILLARS.research.onDark;
const CSS = `.cx-ref p,.cx-ref li,.cx-ref dd,.cx-ref td,.cx-ref code{overflow-wrap:anywhere}`;
const list = { margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 };
const wrap = { maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 };
const h1 = { margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist };
const formulaBox = { ...K.body, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: 15, display: "block", margin: "4px 0" };

/** The published formula a metric names, read from its method model. */
export function formulaOf([method, name]) {
  const m = RUBRICS[method];
  const f = m && (m.formulas || []).find((x) => x.name === name);
  return f ? { method, title: m.title, version: m.version, ...f } : null;
}
const toolName = (id) => (SEO_MAP[`/tools/${id}`] ? SEO_MAP[`/tools/${id}`].title.split(" | ")[0] : id);
export const metricById = (id) => METRICS.find((m) => m.id === id);

function Page({ crumbs, kicker = "Reference", title, children }) {
  return (
    <div className="cx-ref" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={crumbs} />
      <div style={wrap}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>{kicker}</span>
          <h1 style={h1}>{title}</h1>
        </header>
        {children}
      </div>
    </div>
  );
}

function Formulas({ items, heading = "How it is calculated" }) {
  const fs = items.map(formulaOf).filter(Boolean);
  return (
    <section aria-labelledby="calc" style={K.panel}>
      <h2 id="calc" style={K.h2}>{heading}</h2>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {fs.map((f) => (
          <div key={f.method + f.name}>
            <dt style={K.strong}>{f.name}</dt>
            <dd style={{ margin: "2px 0 0" }}>
              <code style={formulaBox}>{f.formula}</code>
              {f.note && <span style={{ ...K.small, display: "block" }}>{f.note}</span>}
              <span style={{ ...K.small, display: "block" }}>As published in the <a href={`/methodology/${f.method}`} style={K.link}>{f.title} method</a>, version {f.version}.</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Tools({ ids }) {
  return (
    <section aria-labelledby="tools" style={K.panel}>
      <h2 id="tools" style={K.h2}>Measure yours</h2>
      <ul style={list}>
        {ids.map((id) => <li key={id} style={K.body}><a href={`/tools/${id}`} style={K.link}>{toolName(id)}</a>{RUBRICS[id] ? <> (<a href={`/methodology/${id}`} style={K.link}>method</a>)</> : null}</li>)}
      </ul>
    </section>
  );
}

function Hub() {
  return (
    <Page crumbs={[["Home", "/"], ["Reference"]]} title="Contact center metrics, defined">
      <p style={K.body}>What each common contact center measure means, how it is calculated, where people go wrong comparing it, and what publishers report. Every formula is the one our tools use, read from their published methods.</p>
      <section aria-labelledby="metrics" style={K.panel}>
        <h2 id="metrics" style={K.h2}>Metrics</h2>
        <ul style={{ ...list, paddingLeft: 0, listStyle: "none" }}>
          {METRICS.map((m) => <li key={m.id}><a href={`/reference/${m.id}`} style={{ ...K.link, fontWeight: 600 }}>{m.name}</a><span style={{ ...K.body, display: "block" }}>{m.what}</span></li>)}
        </ul>
      </section>
      <section aria-labelledby="more" style={K.panel}>
        <h2 id="more" style={K.h2}>Also here</h2>
        <ul style={list}>
          <li style={K.body}><a href="/reference/erlang-c" style={K.link}>Erlang C, explained</a>: the queueing model behind staffing, with a worked table.</li>
          <li style={K.body}><a href="/reference/glossary" style={K.link}>Glossary</a>: {GLOSSARY.length} terms in plain words.</li>
        </ul>
      </section>
    </Page>
  );
}

function Metric({ m }) {
  return (
    <Page crumbs={[["Reference", "/reference"], [m.name]]} title={m.short ? `${m.name} (${m.short})` : m.name}>
      <p style={{ ...K.body, fontSize: 18 }}>{m.what}</p>
      {m.also.length > 0 && <p style={K.small}>Also called: {m.also.join(", ")}.</p>}
      <section aria-labelledby="why" style={K.panel}>
        <h2 id="why" style={K.h2}>Why it matters</h2>
        <p style={K.body}>{m.why}</p>
      </section>
      <Formulas items={m.formulas} />
      <section aria-labelledby="careful" style={K.panel}>
        <h2 id="careful" style={K.h2}>Before you compare</h2>
        <ul style={list}>{m.careful.map((c) => <li key={c} style={K.body}>{c}</li>)}</ul>
      </section>
      <PublishedFigures groupIds={m.groups} />
      {m.groups.length === 0 && <p style={K.small}>No published figure for this measure passes our source rules, so none is shown.</p>}
      <Tools ids={m.tools} />
      <section aria-labelledby="related" style={K.panel}>
        <h2 id="related" style={K.h2}>Related</h2>
        <ul style={list}>
          {m.related.map((r) => r === "erlang-c"
            ? <li key={r} style={K.body}><a href="/reference/erlang-c" style={K.link}>Erlang C</a></li>
            : <li key={r} style={K.body}><a href={`/reference/${r}`} style={K.link}>{metricById(r).name}</a></li>)}
          <li style={K.body}><a href="/reference/glossary" style={K.link}>Glossary</a></li>
        </ul>
      </section>
    </Page>
  );
}

/** The worked table, from the shipped engine. */
export function erlangRows({ load, aht, threshold, agents }) {
  return agents.map((n) => ({ n, wait: erlangC(n, load), sl: serviceLevel(n, load, threshold, aht), asa: asa(n, load, aht), occ: load / n }));
}

function Erlang() {
  const c = ERLANG.case;
  const rows = erlangRows(c);
  const fx = ERLANG.fixtures.map((id) => FIXTURES.find((f) => f.id === id));
  const td = { ...K.body, padding: "8px 10px", textAlign: "right", fontVariantNumeric: "tabular-nums" };
  return (
    <Page crumbs={[["Reference", "/reference"], ["Erlang C"]]} title="Erlang C, explained">
      <p style={{ ...K.body, fontSize: 18 }}>{ERLANG.what}</p>
      <p style={K.small}>{ERLANG.history}</p>
      <section aria-labelledby="assumes" style={K.panel}>
        <h2 id="assumes" style={K.h2}>What the model assumes</h2>
        <ul style={list}>{ERLANG.assumes.map((x) => <li key={x} style={K.body}>{x}</li>)}</ul>
      </section>
      <Formulas items={ERLANG.formulas} heading="The formulas" />
      <section aria-labelledby="worked" style={K.panel}>
        <h2 id="worked" style={K.h2}>A worked example</h2>
        <p style={K.body}>A load of {c.load} Erlangs, for example 200 calls an hour at {c.aht} seconds each, with a target of answering within {c.threshold} seconds. Each row adds one agent. Computed by the same engine the Schedule Adherence tool runs.</p>
        <div tabIndex={0} role="region" aria-label="Erlang C worked example" style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
            <thead><tr>{["Agents", "Chance a caller waits", `Answered in ${c.threshold} s`, "Average wait", "Occupancy"].map((h) => <th key={h} scope="col" style={{ ...K.strong, padding: "8px 10px", textAlign: "right", fontSize: 14 }}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.n} style={{ borderTop: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>
                  <td style={td}>{r.n}</td><td style={td}>{r.wait.toFixed(4)}</td><td style={td}>{(r.sl * 100).toFixed(1)}%</td>
                  <td style={td}>{r.asa === null ? "No limit" : `${r.asa.toFixed(1)} s`}</td><td style={td}>{(r.occ * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...K.small, marginTop: 10 }}>Adding agents brings the wait down fast at first and then slowly, while occupancy falls with every agent added. That trade is the staffing decision.</p>
      </section>
      <section aria-labelledby="checked" style={K.panel}>
        <h2 id="checked" style={K.h2}>Checked against</h2>
        <ul style={list}>{fx.map((f) => <li key={f.id} style={K.body}><strong style={K.strong}>{f.title}.</strong> {f.case} Expected: {f.expected}. {FIXTURE_KIND[f.kind]}; {f.source}</li>)}</ul>
        <p style={{ ...K.small, marginTop: 8 }}>Our test suite computes each case with the shipped engine and fails if any answer differs.</p>
      </section>
      <section aria-labelledby="limits" style={K.panel}>
        <h2 id="limits" style={K.h2}>Where it falls short</h2>
        <ul style={list}>{ERLANG.limits.map((x) => <li key={x} style={K.body}>{x}</li>)}</ul>
      </section>
      <Tools ids={ERLANG.tools} />
    </Page>
  );
}

function Glossary() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <Page crumbs={[["Reference", "/reference"], ["Glossary"]]} title="Contact center glossary">
      <p style={K.body}>Terms used across the tools, methods and research, in plain words. Where a term has its own page, the link opens it.</p>
      <dl style={{ ...K.panel, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((g) => {
          const metric = g.link && g.link.startsWith("/reference/") ? metricById(g.link.slice(11)) : null;
          const def = g.grade ? `A grade on our results. ${GRADE_MEANING[g.grade]}` : g.def || (metric ? metric.what : g.link === "/reference/erlang-c" ? ERLANG.what : "");
          const cat = g.category ? CATEGORIES[g.category] : null;
          return (
            <div key={g.term} id={g.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <dt style={K.strong}>{g.term}{g.also ? <span style={{ ...K.small, fontWeight: 400 }}> ({g.also})</span> : null}</dt>
              <dd style={{ ...K.body, margin: "2px 0 0" }}>
                {def}
                {g.link && <> <a href={g.link} style={K.link}>{g.link.startsWith("/tools/") ? "Open the tool" : "Read more"}</a></>}
                {cat && <> <a href={cat.page} style={K.link}>{cat.name} vendors</a></>}
              </dd>
            </div>
          );
        })}
      </dl>
    </Page>
  );
}

function NotFound() {
  return (
    <Page crumbs={[["Reference", "/reference"]]} title="No reference page here">
      <p style={K.body}>Try the <a href="/reference" style={K.link}>reference library</a> or the <a href="/reference/glossary" style={K.link}>glossary</a>.</p>
    </Page>
  );
}

export function ReferencePage({ id }) {
  if (!id) return <Hub />;
  if (id === "glossary") return <Glossary />;
  if (id === "erlang-c") return <Erlang />;
  const m = metricById(id);
  return m ? <Metric m={m} /> : <NotFound />;
}

export default function Reference() {
  const { id } = useParams();
  return <ReferencePage id={id} />;
}
