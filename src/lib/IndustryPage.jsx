// IndustryPage.jsx
//
// One page for every industry (redesign Phase 8 part 2). Each industry file keeps its own content as data (segments,
// failure modes, the seven-layer map, benchmarks, the outsourcing question, platforms, next step) and passes it here;
// this component only renders. Text with [[claim]] tokens renders through ClaimText and every source is listed once
// through ClaimSources, so claim markers and sources are unchanged. Platforms appear as names with an introduction and,
// for researched vendors, their tags; no vendor carries a blurb of ours, a rank or a recommendation. Tokens only; colour
// never marks a figure or a verdict alone.
import ClaimText, { ClaimSources } from "./ClaimText.jsx";
import { plain, claim, claimIds } from "./claims.js";
import { Crumbs, HEADER_HEIGHT } from "./Shell.jsx";
import { HOUSE, PILLARS, LAYERS, RADIUS } from "./tokens.js";
import { FONT } from "./type.js";
import { K } from "./frameKit.jsx";
import { Button } from "./ui.jsx";
import { VendorIntroLink } from "./VendorIntro.jsx";
import { Tags } from "./VendorTags.jsx";
import { CCAAS_RESEARCH } from "./researchStatus.js";
import { CCAAS_INDEXED_INDUSTRIES } from "./verticals.js";

const ACCENT = PILLARS.industries.onDark;
const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28 };
const CSS = `.cx-ind2 p,.cx-ind2 li,.cx-ind2 a,.cx-ind2 td{overflow-wrap:anywhere}`;
const layerOf = (n) => LAYERS.find((l) => l.n === n) || null;
const slugOf = (href) => { const m = typeof href === "string" && href.match(/^\/vendors\/([a-z0-9-]+)$/); return m ? m[1] : null; };
/* A stat that carries its own source line shows the claim's plain value beside that source (linked to the claim's own
   source when the stat names no url); any other stat shows its claim marker. Labels may carry claim tokens too. */
const statUrl = (s) => { if (s.url) return s.url; const ids = claimIds([s.n || ""]); const c = ids.length === 1 ? claim(ids[0]) : null; return c && c.source && /^https:\/\//.test(c.source.url || "") ? c.source.url : null; };

function Head({ kicker, title, intro, id }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={K.kicker}>{kicker}</span>
      <h2 id={id} style={{ ...K.h2, fontSize: 22, lineHeight: "30px", margin: 0 }}>{title}</h2>
      {intro && <p style={{ ...K.body, maxWidth: 760 }}><ClaimText text={intro} /></p>}
    </div>
  );
}

export default function IndustryPage({ slug, name, accent = "CX Intelligence", intro, stats = [], segments, failures, stack, benchmarks, sources, bpo, vendors, cta }) {
  return (
    <div className="cx-ind2" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh", paddingTop: HEADER_HEIGHT }}>
      <style>{CSS}</style>
      <Crumbs items={[["Industry Insights", "/industries"], [name]]} />
      <div style={WRAP}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Industry Insights</span>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 4.5vw, 46px)", fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist }}>{name} {accent}</h1>
          <p style={{ ...K.body, fontSize: 17, lineHeight: "28px", maxWidth: 760 }}><ClaimText text={intro} /></p>
        </header>

        {stats.length > 0 && (
          <section aria-label="Figures" style={K.grid(220)}>
            {stats.map((s, i) => {
              return (
                <div key={i} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ ...K.stat, fontSize: 24 }}>{s.source ? plain(s.n || `[[${s.id}]]`) : <ClaimText text={s.n || `[[${s.id}]]`} />}</p>
                  {s.label && <p style={K.small}>{s.source ? plain(s.label) : <ClaimText text={s.label} />}</p>}
                  {s.source && (statUrl(s) ? <a href={statUrl(s)} target="_blank" rel="noopener noreferrer" style={{ ...K.small, textDecoration: "underline" }}>{s.source}</a> : <p style={K.small}>{s.source}</p>)}
                </div>
              );
            })}
          </section>
        )}

        {segments && (
          <section aria-labelledby="segments" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="segments" kicker="Segments" title={segments.title} intro={segments.intro} />
            <div style={K.grid(300)}>
              {segments.items.map((sv) => (
                <a key={sv.slug} href={`/industries/${slug}/${sv.slug}`} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 6, textDecoration: "none", color: HOUSE.mist }}>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{sv.name}</span>
                  <span style={K.small}><ClaimText text={sv.desc} links={false} /></span>
                  {sv.contact && <span style={K.small}><ClaimText text={sv.contact} links={false} /></span>}
                  <span style={{ ...K.link, color: ACCENT, fontSize: 14, marginTop: 4 }}>Map your stack for {sv.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {failures && (
          <section aria-labelledby="failures" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="failures" kicker="What breaks" title={failures.title} intro={failures.intro} />
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {failures.items.map((fm, i) => (
                <li key={i} style={{ ...K.panel, borderLeft: `3px solid ${ACCENT}` }}>
                  <h3 style={{ ...K.h2, fontSize: 16, margin: "0 0 6px" }}>{fm.title}</h3>
                  <p style={K.body}><ClaimText text={fm.desc} /></p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {stack && (
          <section aria-labelledby="stack" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="stack" kicker="Technology stack" title={stack.title} intro={stack.intro} />
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {stack.items.map((sl, i) => {
                const L = layerOf(sl.layer);
                return (
                  <li key={i} style={{ ...K.panel, borderLeft: `4px solid ${L ? L.color : ACCENT}`, display: "flex", flexDirection: "column", gap: 4 }}>
                    <h3 style={{ ...K.h2, fontSize: 16, margin: 0 }}>Layer {sl.layer}: {sl.name}</h3>
                    {L && <p style={K.small}>{L.name}</p>}
                    <p style={K.body}><ClaimText text={sl.note} /></p>
                    <p style={K.small}>Vendors in this layer include {sl.vendors}.</p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {benchmarks && (
          <section aria-labelledby="benchmarks" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="benchmarks" kicker="Benchmarks" title={benchmarks.title} intro={benchmarks.intro} />
            <div style={{ overflowX: "auto", border: `1px solid ${K.hair}`, borderRadius: RADIUS.card }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 560 }}>
                <thead><tr>{["Metric", ...benchmarks.columns, "What drives it"].map((h) => <th key={h} scope="col" style={{ ...K.kicker, textAlign: "left", padding: "12px 14px", borderBottom: `1px solid ${K.firm}` }}>{h}</th>)}</tr></thead>
                <tbody>{benchmarks.rows.map((b, i) => (
                  <tr key={i} style={{ borderTop: i ? `1px solid ${K.hair}` : "none" }}>
                    <th scope="row" style={{ ...K.strong, textAlign: "left", padding: "12px 14px", verticalAlign: "top" }}>{b.metric}</th>
                    {benchmarks.keys.map((k) => <td key={k} style={{ ...K.body, color: HOUSE.mist, padding: "12px 14px", verticalAlign: "top" }}><ClaimText text={b[k]} /></td>)}
                    <td style={{ ...K.small, padding: "12px 14px", verticalAlign: "top" }}><ClaimText text={b.note} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {benchmarks.links && benchmarks.links.length > 0 && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {benchmarks.links.map(([href, label]) => <a key={href} href={href} style={K.link}>{label}</a>)}
              </div>
            )}
          </section>
        )}

        {bpo && (
          <section aria-labelledby="bpo" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="bpo" kicker="The outsourcing question" title={bpo.title} intro={bpo.intro} />
            <div style={K.grid(300)}>
              {[["Where outsourcing adds value", bpo.value], ["Where outsourcing creates risk", bpo.risk]].filter(([, l]) => l && l.length).map(([h, list]) => (
                <div key={h} style={K.panel}>
                  <h3 style={{ ...K.h2, fontSize: 16, margin: "0 0 8px" }}>{h}</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                    {list.map((item, i) => <li key={i} style={K.body}><ClaimText text={item} /></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {vendors && vendors.items.length > 0 && (
          <section aria-labelledby="platforms" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Head id="platforms" kicker="Vendor Intelligence" title={`Platforms named for ${name.toLowerCase()}`} />
            <p style={{ ...K.small, maxWidth: 760 }}>Named here, A to Z, as a place to start. The list carries no ranking or recommendation. What the research says about each researched platform is on its profile{CCAAS_INDEXED_INDUSTRIES.includes(slug) ? <>, and gathered for {name.toLowerCase()} on <a href={`/vendors/ccaas/${slug}`} style={K.link}>contact center platforms for {name}</a></> : null}.</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", ...K.grid(280) }}>
              {[...vendors.items].sort((a, b) => a.name.localeCompare(b.name)).map((v) => {
                const s = slugOf(v.href);
                const rec = s && CCAAS_RESEARCH.complete[s];
                return (
                  <li key={v.name} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 6 }}>
                    {v.href ? <a href={v.href} style={{ ...K.link, color: HOUSE.mist, fontSize: 16 }}>{v.name}</a> : <span style={K.strong}>{v.name}</span>}
                    {v.label && <span style={K.small}>{v.label}</span>}
                    {rec ? <Tags vendorId={rec.vendorId} /> : <p style={K.small}>Not yet researched under the current method.</p>}
                    <div><VendorIntroLink slug={s} name={v.name} from="industry" surface="industry" color={ACCENT} /></div>
                  </li>
                );
              })}
            </ul>
            <div><a href="/vendors/ccaas" style={K.link}>All contact center platforms</a></div>
          </section>
        )}

        {sources && sources.ids.length > 0 && (
          <section id="sources" aria-labelledby="sources-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 id="sources-h" style={{ ...K.h2, margin: 0 }}>Sources and assumptions</h2>
            <p style={K.small}>{sources.note}</p>
            <ClaimSources ids={sources.ids} color={HOUSE.body} accent={ACCENT} />
          </section>
        )}

        {cta && (
          <section aria-labelledby="next" style={{ ...K.lead, display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 id="next" style={{ ...K.h2, margin: 0 }}>{cta.title}</h2>
            <p style={K.body}><ClaimText text={cta.text} /></p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {cta.links.map(([href, label], i) => <Button key={href} kind={i ? "secondary" : "primary"} href={href}>{label}</Button>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
