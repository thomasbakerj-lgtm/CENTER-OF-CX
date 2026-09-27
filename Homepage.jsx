// Homepage.jsx
//
// Redesign Phase 5, to the approved homepage design (canvas "Phase 1 designs": Homepage, desktop and phone).
// Hero beside the stack; step 1, five doors; step 2, the door's question and one route card; the evidence mark
// explained; proof from the registries. Every figure comes from src/lib/home.js, which derives it;
// this file types no count. Tokens only. Events are taxonomy 1.1: door_select, route_select, route_start and
// layer_select (surface home). The initial state is fixed, so the prerendered page and the first client render agree.

import React, { useState } from "react";
import { HOUSE, PILLARS, LAYERS, RADIUS, TOUCH, FONT_SANS, TYPE_SCALE, alpha, LINE } from "./src/lib/tokens.js";
import { Door, RouteCard, Stack, EvidenceMark, GradeBadge } from "./src/lib/ui.jsx";
import { Icon } from "./src/lib/Icon.jsx";
import { DOORS, LAYER_INFO, PROOFS } from "./src/lib/home.js";
import { trackHome } from "./src/lib/track.js";

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
const WRAP = { maxWidth: 1280, margin: "0 auto", padding: "0 20px", boxSizing: "border-box" };
const LABEL = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

const CSS = `.cx-home-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:48px;align-items:center}
.cx-home-doors{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.cx-home-step2{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px;align-items:start}
.cx-home-opts{display:grid;gap:10px}
.cx-home-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.cx-home-opt:focus-visible,.cx-home a:focus-visible{outline:2px solid ${HOUSE.electric};outline-offset:2px}
@media (max-width:1100px){.cx-home-doors{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:900px){.cx-home-hero,.cx-home-step2{grid-template-columns:minmax(0,1fr)}.cx-home-stack{display:none}.cx-home-three{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.cx-home-doors{grid-template-columns:minmax(0,1fr)}.cx-home-doors>button{min-height:0 !important}.cx-home-opts{grid-template-columns:minmax(0,1fr) !important}}`;

/** The panel beside the stack: the chosen layer, or what the current route touches. */
function LayerPanel({ layer, door }) {
  if (door.soon) {
    return <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: HOUSE.body }}>{PILLARS[door.pillar].name} is coming. The stack lights up again when you choose a door that is open today.</p>;
  }
  if (door.page) {
    return <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: HOUSE.body }}>{PILLARS[door.pillar].name} covers the whole market, so no single layer lights up. Choose a door with routes to see the layers it tests.</p>;
  }
  if (!layer) {
    return (
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{door.pillar === "industries" ? "All seven layers, for your sector" : "The stack every contact center runs on"}</div>
        <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.55, color: HOUSE.body }}>Seven layers, from customer data to governance. Choose a layer to see what it does and the tool that tests it.</p>
      </div>
    );
  }
  const L = LAYER_BY_ID[layer], info = LAYER_INFO[layer];
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}><span style={{ color: L.color }}>L{L.n}</span> {L.name}</div>
      <p style={{ margin: "6px 0 10px", fontSize: 14, lineHeight: 1.55, color: HOUSE.body }}>{info.what} {info.technical}.</p>
      <div style={{ display: "flex", columnGap: 20, flexWrap: "wrap" }}>
        <a href={info.tool.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: PILLARS.diagnostics.onDark, textDecoration: "none" }}>Test it: {info.tool.name}<Icon name="next" size={16} /></a>
        <a href={info.category.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: PILLARS.vendors.onDark, textDecoration: "none" }}>{info.category.name}<Icon name="next" size={16} /></a>
      </div>
    </div>
  );
}

/** An industry's figure on its route card: the published claim with its source, or no public benchmark. */
function IndustryFact({ fact }) {
  if (fact.value) {
    return (
      <div style={{ padding: 16, borderRadius: RADIUS.field, background: HOUSE.navy, border: `1px solid ${hair}` }}>
        <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: HOUSE.mist }}>{fact.value}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: HOUSE.body, marginTop: 6 }}>{fact.label}</div>
        <a href={fact.url} rel="noopener noreferrer" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 36, fontSize: 12, fontWeight: 600, color: HOUSE.mist, textDecoration: "none" }}>{fact.source}, {fact.year}<Icon name="external" size={12} /></a>
      </div>
    );
  }
  return (
    <div style={{ padding: 16, borderRadius: RADIUS.field, border: `1px dashed ${soft}` }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>No public benchmark</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: HOUSE.body, marginTop: 4 }}>{fact.label}</div>
      <a href={fact.test.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 36, fontSize: 13, fontWeight: 600, color: PILLARS.diagnostics.onDark, textDecoration: "none" }}>Measure yours<Icon name="next" size={14} /></a>
    </div>
  );
}

function Option({ route, on, pillar, onPick, compact }) {
  const p = PILLARS[pillar];
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onPick} className="cx-home-opt"
      style={{ minHeight: compact ? 54 : 72, padding: "12px 16px", borderRadius: RADIUS.field, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4,
        textAlign: "left", fontFamily: "inherit", color: HOUSE.mist, background: on ? alpha(p.fill, 0.16) : "transparent", border: on ? `1.5px solid ${p.fill}` : `1px solid ${soft}` }}>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{route.label}</span>
      {route.sub && <span style={{ fontSize: 13, color: HOUSE.muted }}>{route.sub}</span>}
    </button>
  );
}

export default function Homepage() {
  const [doorIx, setDoor] = useState(0);
  const [routeIx, setRoute] = useState(0);
  const [picked, setPicked] = useState(null);
  const door = DOORS[doorIx];
  const route = door.routes ? door.routes[Math.min(routeIx, door.routes.length - 1)] : null;
  const layer = picked || (route && route.layer) || null;
  const pillar = PILLARS[door.pillar];

  const pickDoor = (i) => { setDoor(i); setRoute(0); setPicked(null); trackHome.door(DOORS[i].event); };
  const pickRoute = (i) => { setRoute(i); setPicked(null); trackHome.route(door.event, door.routes[i].id); };
  const pickLayer = (id) => { setPicked(id); if (id) trackHome.layer(id, "home"); };

  const card = route
    ? <RouteCard pillar={door.pillar} kicker={route.kicker} time={route.time} title={route.title} steps={route.steps} ending={route.ending} cta={route.cta} href={route.href}
        onStart={() => trackHome.start(door.event, route.id, route.to)}>{route.fact && <IndustryFact fact={route.fact} />}</RouteCard>
    : door.page
      ? <RouteCard pillar={door.pillar} kicker={pillar.name} time={door.page.time} title="Dated, labelled, kept apart" steps={door.page.rules.map((r) => ({ name: r }))} cta={door.page.cta} href={door.page.href} />
      : <RouteCard pillar={door.pillar} kicker={pillar.name} time="Coming soon" title="Follow it as it is built" steps={door.soon.rules.map((r) => ({ name: r }))} cta={door.soon.cta} href={door.soon.href} />;

  return (
    <main className="cx-home" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT_SANS }}>
      <style>{CSS}</style>

      <section style={{ ...WRAP, padding: "56px 20px 40px" }}>
        <div className="cx-home-hero">
          <div>
            <span style={{ ...LABEL, color: pillar.onDark, display: "block", marginBottom: 16 }}>Independent intelligence for contact center and CX technology</span>
            <h1 style={{ margin: 0, fontSize: `clamp(44px, 6.4vw, ${TYPE_SCALE.display.size}px)`, fontWeight: TYPE_SCALE.display.weight, letterSpacing: TYPE_SCALE.display.tracking, lineHeight: TYPE_SCALE.display.line }}>Diagnose before you buy.</h1>
            <p style={{ margin: "20px 0 0", fontSize: 19, lineHeight: 1.55, color: HOUSE.body, maxWidth: 620 }}>Run the numbers on your own operation, read vendor profiles, and check what your industry demands. Every figure says where it came from and how sure it is.</p>
            <p style={{ margin: "18px 0 0", fontSize: 14, color: HOUSE.muted }}>No sign in. No email. Every report free. Vendors cannot pay to appear.</p>
          </div>
          <div className="cx-home-stack"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {/* The plates draw below the component's box; the margin keeps the panel clear of the bottom layer. */}
            <div style={{ marginBottom: 56 }}><Stack active={door.routes ? layer : null} onSelect={pickLayer} width={340} /></div>
            <div style={{ width: "100%", maxWidth: 440, padding: 16, borderRadius: RADIUS.card, background: alpha(HOUSE.navy, 0.8), border: `1px solid ${hair}`, minHeight: 120, boxSizing: "border-box" }}>
              <LayerPanel layer={door.routes ? layer : null} door={door} />
            </div>
          </div></div>
        </div>
      </section>

      <section aria-labelledby="cx-step1" style={{ ...WRAP, padding: "24px 20px 16px" }}>
        <span style={LABEL}>Step 1 of 2</span>
        <h2 id="cx-step1" style={{ margin: "8px 0 20px", fontSize: TYPE_SCALE.h2.size, fontWeight: TYPE_SCALE.h2.weight }}>Where would you like to begin?</h2>
        <div role="radiogroup" aria-labelledby="cx-step1" className="cx-home-doors">
          {DOORS.map((d, i) => <Door key={d.pillar} pillar={d.pillar} number={`0${i + 1}`} line={d.line} meta={d.meta} selected={i === doorIx} onSelect={() => pickDoor(i)} />)}
        </div>
      </section>

      <section aria-labelledby="cx-step2" style={{ ...WRAP, padding: "32px 20px 56px" }}>
        <div className="cx-home-step2">
          <div>
            <span style={{ ...LABEL, color: pillar.onDark }}>{pillar.name} · Step 2 of 2</span>
            <h2 id="cx-step2" style={{ margin: "8px 0 20px", fontSize: TYPE_SCALE.h2.size, fontWeight: TYPE_SCALE.h2.weight }}>{door.question || `${pillar.name} is coming`}</h2>
            {door.routes ? (
              <div role="radiogroup" aria-labelledby="cx-step2" className="cx-home-opts" style={{ gridTemplateColumns: `repeat(${door.cols}, minmax(0, 1fr))` }}>
                {door.routes.map((r, i) => <Option key={r.id} route={r} on={r === route} pillar={door.pillar} compact={door.cols > 2} onPick={() => pickRoute(i)} />)}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: HOUSE.body, maxWidth: 620 }}>{(door.soon || door.page).body}</p>
            )}
          </div>
          {card}
        </div>
      </section>

      <section aria-labelledby="cx-sure" style={{ borderTop: `1px solid ${hair}`, background: HOUSE.navy }}>
        <div style={{ ...WRAP, padding: "48px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 32, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <EvidenceMark axes={{ evidence: "Planning-grade", realization: "Planning-grade", completeness: "Directional" }} size={110} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={LABEL}>Example</span>
              <GradeBadge grade="Directional" heldBy="completeness" />
              <span style={{ fontSize: 13, color: HOUSE.body }}>Two inputs are still our defaults.</span>
            </div>
          </div>
          <div>
            <h2 id="cx-sure" style={{ margin: 0, fontSize: TYPE_SCALE.h2.size, fontWeight: TYPE_SCALE.h2.weight }}>Every number says how sure it is.</h2>
            <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.6, color: HOUSE.body }}>Three arcs grade every result: how good the evidence is, how likely the value is to be realized, and how complete your inputs are. The weakest arc sets the grade, and the line beneath it says what would raise it. When a number cannot be trusted, we show no number.</p>
          </div>
        </div>
      </section>

      <section aria-label="What the site stands on" style={{ ...WRAP, padding: "48px 20px 64px" }}>
        <div className="cx-home-three">
          {PROOFS.map((p) => (
            <div key={p.link} style={{ padding: 24, borderRadius: RADIUS.card, border: `1px solid ${hair}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{p.n}</span>
              <span style={{ fontSize: 15, lineHeight: 1.55, color: HOUSE.body, flexGrow: 1 }}>{p.text}</span>
              <a href={p.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: HOUSE.sky2, textDecoration: "none" }}>{p.link}<Icon name="next" size={16} /></a>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
