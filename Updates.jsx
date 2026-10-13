// Updates.jsx
//
// The Updates hub at /updates (TB, 13 Oct 2026, open item 3): every dated update the site publishes, newest week first,
// with the RSS and JSON feeds. Entries come from src/lib/updates.js (Market Watch items, researched vendor profiles,
// research corrections); the page computes nothing of its own. Tokens only.
import { HOUSE, PILLARS, RADIUS, alpha, LINE } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { longDate } from "./src/lib/methodVersions.js";
import { updateEntries, byWeek, FEED, CADENCE, TYPES } from "./src/lib/updates.js";

const ACCENT = PILLARS.marketWatch.onDark;
const CSS = `.cx-up p,.cx-up li,.cx-up h3{overflow-wrap:anywhere}`;
const tag = { alignSelf: "flex-start", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: RADIUS.chip,
  color: ACCENT, border: `1px solid ${ACCENT}`, textTransform: "uppercase" };

export default function Updates() {
  const entries = updateEntries();
  const weeks = byWeek(entries);
  return (
    <div className="cx-up" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Research", "/research"], ["Updates"]]} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Updates</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12 }}>What is new on the site</h1>
          <p style={K.body}>New Market Watch items, newly researched vendor profiles and research corrections, by week. {CADENCE}</p>
          {entries.length > 0 && <p style={K.small}>{entries.length} updates. Latest {longDate(entries[0].date)}.</p>}
        </header>

        <section aria-labelledby="follow" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 id="follow" style={{ ...K.h2, margin: 0 }}>Follow along</h2>
          <p style={K.body}>Add a feed to any feed reader: <a href={FEED.rss} style={K.link}>RSS</a> or <a href={FEED.json} style={K.link}>JSON Feed</a>. Or get the <a href="/subscribe" style={K.link}>email</a>.</p>
          <p style={K.small}>The feeds carry the same entries as this page and nothing about you: a feed reader fetches a file.</p>
        </section>

        {weeks.length === 0
          ? <section style={K.panel}><h2 style={{ ...K.h2, margin: 0 }}>No updates yet</h2></section>
          : weeks.map((w) => (
            <section key={w.week} aria-labelledby={`w-${w.week}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 id={`w-${w.week}`} style={{ ...K.h2, margin: 0 }}>Week of {longDate(w.week)}</h2>
              <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {w.entries.map((e) => (
                  <li key={e.id} style={{ ...K.panel, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                      <span style={tag}>{TYPES[e.type]}</span>
                      <span style={K.small}>{longDate(e.date)}</span>
                    </span>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}><a href={e.path} style={{ ...K.link, color: HOUSE.mist }}>{e.title}</a></h3>
                    <p style={{ ...K.body, margin: 0 }}>{e.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        <p style={{ ...K.small, borderTop: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, paddingTop: 12 }}>Changes to how our tools calculate are recorded with each method's version number on its method page.</p>
      </div>
    </div>
  );
}
