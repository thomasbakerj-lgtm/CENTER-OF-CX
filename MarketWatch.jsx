// MarketWatch.jsx
//
// Market Watch v1 (TB, 27 Sep 2026): dated items about the contact center and CX technology market, newest first, each
// led by the label of the source it rests on (Brand Guide section 12). Filters narrow the list by source label and by
// kind; they never reorder it. Market Watch is kept apart from the research: nothing here changes a finding, a profile,
// a grade, a tool's result or Vendor Match. A vendor an item names offers an introduction (TB, S24). Tokens only.
import { useState } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { VendorIntroLink } from "./src/lib/VendorIntro.jsx";
import { longDate } from "./src/lib/methodVersions.js";
import { ITEMS, LABELS, LABEL_ORDER, KINDS, publishedItems, latestDate, publishedWords } from "./src/lib/marketWatch.js";

const ACCENT = PILLARS.marketWatch.onDark;
const CSS = `.cx-mw p,.cx-mw li,.cx-mw h2{overflow-wrap:anywhere}`;
const chip = (on) => ({ minHeight: TOUCH, padding: "0 14px", borderRadius: RADIUS.chip, fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, cursor: "pointer",
  color: on ? HOUSE.ink : HOUSE.mist, background: on ? ACCENT : "transparent", border: `1px solid ${on ? ACCENT : alpha(HOUSE.mist, LINE.soft)}` });
/* A source label is a word in an outlined tag; vendor-supplied is dashed so the label never rests on colour alone. */
const tag = (label) => ({ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: RADIUS.chip,
  color: ACCENT, border: `1px ${label === "vendor-supplied" ? "dashed" : "solid"} ${ACCENT}` });

function Source({ s, lead }) {
  return (
    <span>{lead} {s.publisher}, <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>{s.title}</a>, {publishedWords(s.published)}.</span>
  );
}

function Item({ it }) {
  return (
    <li style={{ ...K.panel, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }} id={it.id}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={tag(it.label)}>{LABELS[it.label].word}</span>
        <span style={K.small}>{longDate(it.date)} · {KINDS[it.kind]} · {it.who}</span>
      </div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist }}>{it.headline}</h2>
      <p style={K.body}>{it.summary}</p>
      <p style={K.small}>
        <Source s={it.source} lead="Source:" />
        {it.also && <> <Source s={it.also} lead="Also:" /></>}
        {" "}Checked {longDate(it.checked)}.
      </p>
      {it.vendors.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {it.vendors.map((v) => <VendorIntroLink key={v} name={v} from="market-watch" surface="market-watch" color={ACCENT} />)}
        </div>
      )}
    </li>
  );
}

export function MarketWatchView({ items = ITEMS }) {
  const all = publishedItems(items);
  const [label, setLabel] = useState(null);
  const [kind, setKind] = useState(null);
  const shown = all.filter((it) => (!label || it.label === label) && (!kind || it.kind === kind));
  const kinds = Object.keys(KINDS).filter((k) => all.some((it) => it.kind === k));
  const latest = latestDate(items);

  return (
    <div className="cx-mw" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Market Watch"]]} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Market Watch</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12 }}>What is new in the market</h1>
          <p style={K.body}>Launches, retirements, deals, outages and rules that touch contact center and CX technology. Each item is dated, written in our words from the page it cites, and labelled for the source it rests on.</p>
          {latest && <p style={K.small}>{all.length} items. Latest {longDate(latest)}.</p>}
        </header>

        <section aria-labelledby="labels" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="labels" style={{ ...K.h2, margin: 0 }}>What the labels mean</h2>
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {LABEL_ORDER.map((l) => (
              <li key={l} style={{ listStyle: "none", display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={tag(l)}>{LABELS[l].word}</span><span style={K.body}>{LABELS[l].text}</span>
              </li>
            ))}
          </ul>
          <p style={K.small}>Market Watch is kept apart from the research. An item never changes a research finding, a vendor profile, a grade, a tool's result or Vendor Match. A vendor new to the market gets a researched profile only once it passes the research gate.</p>
        </section>

        {all.length === 0 ? (
          <section style={{ ...K.panel }}><h2 style={{ ...K.h2, margin: 0 }}>No items yet</h2><p style={K.body}>Items appear here as they are checked.</p></section>
        ) : (
          <>
            <div role="group" aria-label="Filter by source" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" aria-pressed={!label} onClick={() => setLabel(null)} style={chip(!label)}>All sources</button>
              {LABEL_ORDER.filter((l) => all.some((it) => it.label === l)).map((l) => (
                <button key={l} type="button" aria-pressed={label === l} onClick={() => setLabel(label === l ? null : l)} style={chip(label === l)}>{LABELS[l].word}</button>
              ))}
            </div>
            <div role="group" aria-label="Filter by kind" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" aria-pressed={!kind} onClick={() => setKind(null)} style={chip(!kind)}>Everything</button>
              {kinds.map((k) => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(kind === k ? null : k)} style={chip(kind === k)}>{KINDS[k]}</button>
              ))}
            </div>
            {shown.length
              ? <ul aria-live="polite" style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>{shown.map((it) => <Item key={it.id} it={it} />)}</ul>
              : <p style={K.body}>No item matches both filters.</p>}
          </>
        )}

        <p style={K.small}>See an error, or a change we should check? <a href="/contact" style={{ color: ACCENT }}>Tell us</a>. The research on each vendor lives on its <a href="/vendors" style={{ color: ACCENT }}>profile</a>.</p>
      </div>
    </div>
  );
}

export default function MarketWatch() { return <MarketWatchView />; }
