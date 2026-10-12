// ResearchMethod.jsx
//
// "How we research vendors" at /research/vendor-method: the vendor research method at a high level (TB, 1 Oct 2026),
// reached by a quiet link at the foot of each researched profile and the CCaaS page. Content comes from
// src/lib/research/methodPage.js; the peer groups from classWords.js. Tokens only.
import { HOUSE, PILLARS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { PLAIN } from "./src/lib/research/classWords.js";
import { QUESTIONS, LABELS, SOURCES, STEPS, PEER_GROUPS_NOTE, VERSIONS, INDEPENDENCE } from "./src/lib/research/methodPage.js";

const ACCENT = PILLARS.vendors.onDark;
const CSS = `.cx-rm p,.cx-rm li,.cx-rm dd{overflow-wrap:anywhere}`;
const list = { margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 };

export default function ResearchMethod() {
  const groups = Object.entries(PLAIN).filter(([, g]) => !g.retired);
  return (
    <div className="cx-rm" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Vendor Intelligence", "/vendors"], ["How we research vendors"]]} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Vendor Intelligence</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist }}>How we research vendors</h1>
          <p style={K.body}>Every platform passes the demo. Our research looks at what happens after you sign: where it breaks, who runs it, what it costs in year two, and how to prove it before the contract. This page explains how that research is done.</p>
          <p style={K.small}>{INDEPENDENCE}</p>
        </header>

        <section aria-labelledby="answers" style={K.panel}>
          <h2 id="answers" style={K.h2}>What a researched profile answers</h2>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {QUESTIONS.map((x) => <div key={x.q}><dt style={K.strong}>{x.q}</dt><dd style={{ ...K.body, margin: "2px 0 0" }}>{x.a}</dd></div>)}
          </dl>
        </section>

        <section aria-labelledby="labels" style={K.panel}>
          <h2 id="labels" style={K.h2}>How each finding is labelled</h2>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {LABELS.map((x) => <div key={x.label}><dt style={K.strong}>{x.label}</dt><dd style={{ ...K.body, margin: "2px 0 0" }}>{x.meaning}</dd></div>)}
          </dl>
        </section>

        <section aria-labelledby="sources" style={K.panel}>
          <h2 id="sources" style={K.h2}>Which sources count</h2>
          <ul style={list}>{SOURCES.count.map((x) => <li key={x} style={K.body}>{x}</li>)}</ul>
          <h3 style={{ ...K.h2, fontSize: 16, marginTop: 16 }}>What never counts</h3>
          <ul style={list}>{SOURCES.never.map((x) => <li key={x} style={K.body}>{x}</li>)}</ul>
        </section>

        <section aria-labelledby="steps" style={K.panel}>
          <h2 id="steps" style={K.h2}>How a vendor is completed</h2>
          <ol style={list}>{STEPS.map((x) => <li key={x.t} style={K.body}><strong style={K.strong}>{x.t}.</strong> {x.d}</li>)}</ol>
        </section>

        <section aria-labelledby="groups" style={K.panel}>
          <h2 id="groups" style={K.h2}>Peer groups</h2>
          <p style={K.body}>{PEER_GROUPS_NOTE}</p>
          <ul style={{ ...list, marginTop: 10 }}>
            {groups.map(([id, g]) => <li key={id} style={K.body}><strong style={K.strong}>{g.name}{g.provisional ? " (provisional)" : ""}.</strong> {g.job}</li>)}
          </ul>
        </section>

        <section aria-labelledby="versions" style={K.panel}>
          <h2 id="versions" style={K.h2}>Method versions</h2>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {VERSIONS.map((x) => <div key={x.v}><dt style={K.strong}>{x.v}, from {x.from}</dt><dd style={{ ...K.body, margin: "2px 0 0" }}>{x.d}</dd></div>)}
          </dl>
        </section>

        <p style={K.small}>Found something wrong? <a href="/corrections" style={K.link}>How corrections work</a>. Browse the <a href="/vendors/ccaas" style={K.link}>researched contact center platforms</a>.</p>
      </div>
    </div>
  );
}
