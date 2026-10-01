// src/lib/ToolFrame.jsx
//
// The tool frame (redesign Phase 4, Brand Guide page pattern "tool page"). Every tool renders in it (Phase 6);
// the old ToolShell.jsx and the rail tools' own headers are retired. Three parts on a desktop:
//   the route rail: this tool and the next steps the journey graph takes from it (routeFrom), so the rail and
//     the page's one next step always name the same tool; a way to change route; what happens to the numbers;
//   the work: a breadcrumb row with the method stamp and the report action, the question as the page's one h1,
//     and the tool's own inputs;
//   the result: sticky beside the work.
// On a phone it is one column (work, result, then the rail) with the headline pinned to the bottom of the screen and a jump
// to the full result. The frame computes nothing and reads no engine: a tool passes its own nodes. Tokens only
// (tokens.test.mjs refuses a colour literal here); checked by toolframe.test.mjs.

import React from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH, FONT_SANS, FONT_MONO, TYPE_SCALE, alpha, LINE, onFill } from "./tokens.js";
import { HEADER_HEIGHT } from "./Shell.jsx";
import { routeFrom } from "./journey.js";
import { Icon } from "./Icon.jsx";
import { trackTool } from "./track.js";

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
const D = PILLARS.diagnostics;
export const RESULT_ID = "cx-result";
export const PRIVACY = "Your numbers stay in this browser tab unless you ask for a review or share a scenario link.";
/* A tool that sends any part of what the reader entered says exactly what, on its own page (taxonomy 1.4). */
export const PRIVACY_BY_TOOL = {
  "roadmap-builder": "Your notes and initiative name stay in this browser tab. When you open the summary we record the status you set for each of the 18 milestones, with no text, to learn where 90-day plans stall.",
};
export const privacyFor = (toolId) => PRIVACY_BY_TOOL[toolId] || PRIVACY;

const CSS = `.cx-tf{display:grid;grid-template-columns:232px minmax(0,1fr) 360px;gap:32px;align-items:start}
.cx-tf-rail ol{flex-direction:column}
.cx-tf-result{position:sticky;top:${HEADER_HEIGHT + 16}px}
.cx-tf-pin{display:none}
@media (max-width:1180px){.cx-tf{grid-template-columns:minmax(0,1fr) 340px}.cx-tf-rail{grid-column:1/-1}.cx-tf-rail ol{flex-direction:row;flex-wrap:wrap}}
@media (max-width:760px){.cx-tf{grid-template-columns:minmax(0,1fr);gap:24px}.cx-tf-result{position:static}.cx-tf-rail{order:3}
.cx-tf-rail ol{flex-direction:column}.cx-tf-pin{display:flex}.cx-tf-pad{height:${TOUCH + 32}px}}`;

/** The route rail. `choice` is the engine's next step, the same value the tool passes to ReportActions. */
export function RouteRail({ toolId, choice = null }) {
  const steps = routeFrom(toolId, choice);
  if (!steps.length) return null;
  return (
    <aside aria-label="Your route" className="cx-tf-rail" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted }}>Your route</span>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 8 }}>
        {steps.map((s, i) => {
          const here = i === 0;
          const inner = (
            <>
              <span aria-hidden="true" style={{ width: 26, height: 26, flexShrink: 0, borderRadius: RADIUS.pill, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontSize: 13,
                background: here ? D.fill : "transparent", color: here ? onFill(D.fill) : HOUSE.body, border: here ? "none" : `1px solid ${soft}` }}>{i + 1}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: here ? 600 : 500, color: here ? HOUSE.mist : HOUSE.body }}>{s.name}</span>
                <span style={{ fontSize: 13, color: HOUSE.muted }}>{here ? "You are here" : i === 1 ? "Next" : "Then"}</span>
              </span>
            </>
          );
          const box = { display: "flex", alignItems: "center", gap: 12, minHeight: TOUCH, padding: "6px 10px", borderRadius: RADIUS.field, textDecoration: "none",
            background: here ? alpha(D.fill, 0.12) : "transparent", border: `1px solid ${here ? alpha(D.fill, 0.4) : hair}` };
          return (
            <li key={s.to}>
              {here ? <div aria-current="step" style={box}>{inner}</div> : <a href={s.href} style={box} onClick={() => trackTool.nextStep(toolId, s.to)}>{inner}</a>}
            </li>
          );
        })}
      </ol>
      <a href="/tools" style={{ display: "flex", alignItems: "center", gap: 6, minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: D.onDark, textDecoration: "none" }}>
        Change route<Icon name="next" size={16} />
      </a>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: HOUSE.muted }}>{privacyFor(toolId)}</p>
    </aside>
  );
}

/** The row above the question: where the tool sits, the published method, and the report action. */
function FrameCrumbs({ section, method, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 16, borderBottom: `1px solid ${hair}` }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: HOUSE.muted, flexWrap: "wrap" }}>
        <a href="/tools" style={{ color: HOUSE.body, textDecoration: "none", minHeight: TOUCH, display: "flex", alignItems: "center" }}>Diagnostics</a>
        {section && <><span aria-hidden="true">/</span><span>{section}</span></>}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {method && method.href && (
          <a href={method.href} style={{ fontSize: 13, color: HOUSE.body, minHeight: TOUCH, display: "flex", alignItems: "center", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Method {method.version}{method.date ? `, ${method.date}` : ""}
          </a>
        )}
        {actions}
      </div>
    </div>
  );
}

/** The headline pinned to the bottom of a phone screen, with a jump to the full result. */
export function PinnedResult({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="cx-tf-pin" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 900, background: HOUSE.navy, borderTop: `1px solid ${soft}`,
      padding: "10px 16px", alignItems: "center", justifyContent: "space-between", gap: 12, fontFamily: FONT_SANS }}>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: 12, color: HOUSE.muted }}>{label}</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </span>
      <a href={`#${RESULT_ID}`} style={{ display: "flex", alignItems: "center", gap: 6, minHeight: TOUCH, padding: "0 14px", borderRadius: RADIUS.field, background: HOUSE.action, color: HOUSE.paper, fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
        See the result
      </a>
    </div>
  );
}

/** The frame. The tool's inputs are its children; `result` is its result column; `pinned` its phone headline. */
export function ToolFrame({ toolId, section, name, title, lede, method, actions, choice = null, result, pinned, children }) {
  return (
    <div style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT_SANS, minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
      <style>{CSS}</style>
      <div className="cx-tf" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 64px", boxSizing: "border-box" }}>
        <RouteRail toolId={toolId} choice={choice} />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          <FrameCrumbs section={section} method={method} actions={actions} />
          <div>
            {name && <span style={{ display: "block", fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: D.onDark, marginBottom: 10 }}>{name}</span>}
            <h1 style={{ margin: 0, fontSize: `clamp(30px, 4vw, ${TYPE_SCALE.h1.size}px)`, fontWeight: TYPE_SCALE.h1.weight, letterSpacing: TYPE_SCALE.h1.tracking, lineHeight: TYPE_SCALE.h1.line, color: HOUSE.mist }}>{title}</h1>
            {lede && <p style={{ margin: "12px 0 0", fontSize: TYPE_SCALE.body.size, lineHeight: TYPE_SCALE.body.line, color: HOUSE.body, maxWidth: 640 }}>{lede}</p>}
          </div>
          {children}
        </div>
        <section id={RESULT_ID} aria-label="Result" className="cx-tf-result" style={{ minWidth: 0 }}>{result}</section>
      </div>
      <div className="cx-tf-pad" aria-hidden="true" />
      {pinned && <PinnedResult {...pinned} />}
    </div>
  );
}
