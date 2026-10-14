// src/lib/BenchmarkContribute.jsx
//
// "Add your figure to the reader benchmark" (open item 10, TB 14 Oct 2026). Shown on four tools once the reader's own
// figure differs from the one the page opened with, and never on a void. The reader sees exactly what would be sent,
// chooses an industry and a size band, ticks the consent box and presses the button; nothing is sent before that. The
// figure is rounded in the browser (benchmarkExchange.js) and sent once, with a random id made for that one event
// (track.js trackContribution). Tokens through the frame kit.
import { useEffect, useId, useRef, useState } from "react";
import { HOUSE } from "./tokens.js";
import { K, selectStyle, optionCss } from "./frameKit.jsx";
import { Button } from "./ui.jsx";
import { METRICS, INDUSTRIES, SIZE_BANDS, MIN_GROUP, QUARTILES_FROM, REPEAT_DAYS, contribution, roundValue, inRange, show, limitKey, mayContribute } from "./benchmarkExchange.js";
import { trackContribution } from "./track.js";

const readLast = (metric) => { try { return Number(window.localStorage.getItem(limitKey(metric))) || null; } catch { return null; } };
const dateOf = (ms) => new Date(ms).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

export default function BenchmarkContribute({ metric, value, voided = false }) {
  const m = METRICS[metric];
  const ids = { ind: useId(), size: useId(), ok: useId() };
  /* The figure the page opened with (defaults, or a value restored on arrival). A contribution needs the reader's own. */
  const first = useRef(roundValue(metric, value));
  const rounded = roundValue(metric, value);
  const [last, setLast] = useState(null);
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState("");
  useEffect(() => { setLast(readLast(metric)); }, [metric]);

  if (!m || voided || !inRange(metric, rounded) || rounded === first.current) return null;
  const now = Date.now();
  const blocked = !mayContribute(last, now) && state !== "sent";
  const c = contribution(metric, value, industry, size);

  const send = () => {
    if (!c || !agree) return;
    if (trackContribution(c)) {
      try { window.localStorage.setItem(limitKey(metric), String(Date.now())); } catch { /* the limit is a courtesy */ }
      setState("sent");
    } else setState("off");
  };

  return (
    <section aria-labelledby={ids.ok + "h"} data-benchmark={metric} style={K.panel}>
      <style>{optionCss("cx-bx-select")}</style>
      <span style={K.kicker}>Reader benchmark</span>
      <h2 id={ids.ok + "h"} style={{ ...K.h2, margin: "6px 0 8px" }}>Add your figure to the reader benchmark</h2>
      {state === "sent" ? (
        <p role="status" style={K.body}>Added. Thank you. Your rounded figure joins the pool; a group is published once it has {MIN_GROUP} contributions.</p>
      ) : blocked ? (
        <p style={K.body}>This browser added a {m.label.toLowerCase()} figure on {dateOf(last)}. You can add one again from {dateOf(last + REPEAT_DAYS * 86400000)}.</p>
      ) : (
        <>
          <p style={K.body}>Other readers can compare against your number, and you against theirs. What would be sent: <strong style={K.strong}>{m.label}, {show(metric, rounded)}</strong> (rounded), the industry and the size you choose below. No name, email, company or other figure.</p>
          <div style={{ ...K.grid(220), marginTop: 12 }}>
            <label htmlFor={ids.ind} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Industry
              <select id={ids.ind} className="cx-bx-select" value={industry} onChange={(e) => setIndustry(e.target.value)} style={selectStyle}>
                <option value="">Choose one</option>
                {INDUSTRIES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label htmlFor={ids.size} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Agents in your operation
              <select id={ids.size} className="cx-bx-select" value={size} onChange={(e) => setSize(e.target.value)} style={selectStyle}>
                <option value="">Choose one</option>
                {SIZE_BANDS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
          </div>
          <label htmlFor={ids.ok} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "14px 0", fontSize: 14, lineHeight: "22px", color: HOUSE.body, cursor: "pointer" }}>
            <input id={ids.ok} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, flex: "none" }} />
            <span>Send this rounded figure, industry and size, with no name, email or company, to build the reader benchmark.</span>
          </label>
          <Button kind="secondary" onClick={send} disabled={!c || !agree}>Add my figure</Button>
          {state === "off" && <p role="alert" style={{ ...K.body, marginTop: 10 }}>Nothing was sent: analytics are switched off or blocked in this browser, so there is no way to add the figure from here.</p>}
          <p style={{ ...K.small, marginTop: 12 }}>It goes to our analytics service, PostHog, with a random id used only for this, so it cannot be tied to anything else you do on the site. We publish pooled groups only: from {MIN_GROUP} contributions the median and the count, from {QUARTILES_FROM} the middle half too, never a single reader's figure. One figure per tool every {REPEAT_DAYS} days from this browser. Figures are reported by readers and not verified. <a href="/privacy" style={K.link}>Privacy Policy</a></p>
        </>
      )}
    </section>
  );
}
