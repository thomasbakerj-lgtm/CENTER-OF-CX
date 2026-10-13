// Compare.jsx
//
// Peer group comparison at /vendors/ccaas/compare/<group> and "alternatives to" at /vendors/<slug>/alternatives (TB,
// 13 Oct 2026, open item 9). Truth surface: Vendor Intelligence; presentation only. Reads the derived compare and
// category indexes (src/lib/research/compareView.js, categoryView.js), the tags (ccaasTags.js) and the plain group words
// (classWords.js). Every statement is the research's own words, labelled by its kind; vendors are listed A to Z and
// nothing here ranks, scores or orders them by merit. Tokens only.
import { useParams } from "react-router-dom";
import { HOUSE, PILLARS, alpha, LINE } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { VendorIntroLink } from "./src/lib/VendorIntro.jsx";
import { Tags, TagNotes } from "./src/lib/VendorTags.jsx";
import { CCAAS_RESEARCH, fmtDate } from "./src/lib/researchStatus";
import { PLAIN, readableIds } from "./src/lib/research/classWords.js";
import { DECISION_KINDS, classSlug, classBySlug, comparePath, alternativesPath } from "./src/lib/research/compareView.js";
import CAT from "./src/data/research/ccaas/category.json";
import CMP from "./src/data/research/ccaas/compare.json";

const ACCENT = PILLARS.vendors.onDark;
const CSS = `.cx-cmp p,.cx-cmp li,.cx-cmp h2,.cx-cmp h3{overflow-wrap:anywhere}`;
const list = { margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 };
const wrap = { maxWidth: 920, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 };
const h1 = { margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist };
const hair = alpha(HOUSE.mist, LINE.hair);

export const KIND_WORDS = { best: "Strong fit when", caution: "Be careful if", eliminate: "Rule it out if" };
export const NO_ORDER = "Listed A to Z. Nothing on this page ranks, scores or orders one platform over another.";

const SLUG_OF = Object.fromEntries(Object.entries(CCAAS_RESEARCH.complete).map(([slug, r]) => [r.vendorId, slug]));
const CLASSES = CAT.classes;
const words = (t) => readableIds(t, CLASSES);
const group = (id) => CLASSES.find((c) => c.id === id) || null;
export const groupVendors = (id) => CMP.vendors.filter((v) => v.klass === id);
export const secondVendors = (id) => CMP.vendors.filter((v) => v.also === id && v.klass !== id);
export const vendorBySlug = (slug) => (CCAAS_RESEARCH.complete[slug] ? CMP.vendors.find((v) => v.id === CCAAS_RESEARCH.complete[slug].vendorId) || null : null);

function Page({ crumbs, title, kicker, children }) {
  return (
    <div className="cx-cmp" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
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

function VendorCard({ v, note }) {
  const slug = SLUG_OF[v.id];
  return (
    <li style={{ listStyle: "none", borderTop: `1px solid ${hair}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}><a href={`/vendors/${slug}`} style={{ ...K.link, color: HOUSE.mist }}>{v.name}</a></h3>
      {note && <p style={K.small}>{note}</p>}
      <Tags vendorId={v.id} />
      <TagNotes vendorId={v.id} />
      {v.decisions.best.length
        ? <ul style={list}>{v.decisions.best.map((d) => <li key={d.id} style={K.body}><strong style={K.strong}>{KIND_WORDS.best}:</strong> {words(d.statement)}</li>)}</ul>
        : <p style={K.small}>The research publishes no fit statement for {v.name} yet.</p>}
      <p style={K.small}>
        <a href={`/vendors/${slug}`} style={K.link}>Full research</a>{" · "}
        <a href={alternativesPath(slug)} style={K.link}>Alternatives to {v.name}</a>{" · "}
        <VendorIntroLink slug={slug} name={v.name} from="compare" surface="category" color={ACCENT} />{" · "}Validated {fmtDate(v.validated)}
      </p>
    </li>
  );
}

function OtherGroups({ except }) {
  const others = CLASSES.filter((c) => !except.includes(c.id));
  if (!others.length) return null;
  return (
    <section aria-labelledby="other" style={K.panel}>
      <h2 id="other" style={K.h2}>If the job is different</h2>
      <ul style={list}>
        {others.map((c) => <li key={c.id} style={K.body}><a href={comparePath(c.id)} style={K.link}>{PLAIN[c.id].name}</a>: {PLAIN[c.id].job}</li>)}
      </ul>
      <p style={{ ...K.small, marginTop: 8 }}>Every researched platform, by job: <a href="/vendors/ccaas" style={K.link}>contact center platforms</a>. How the research is done: <a href="/research/vendor-method" style={K.link}>how we research vendors</a>.</p>
    </section>
  );
}

export function ClassCompare({ id }) {
  const c = group(id);
  if (!c) return <Missing />;
  const p = PLAIN[id];
  const main = groupVendors(id), second = secondVendors(id), all = [...main, ...second].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Page crumbs={[["Vendor Intelligence", "/vendors"], ["Contact center platforms", "/vendors/ccaas"], [`Compare: ${p.name}`]]} kicker="Compare a peer group" title={`Compare ${p.name.toLowerCase()}`}>
      <p style={{ ...K.body, fontSize: 18 }}>{p.job}</p>
      <section aria-labelledby="about" style={K.panel}>
        <h2 id="about" style={K.h2}>What this group is</h2>
        <p style={K.body}>{p.compared}</p>
        <p style={K.small}>Research class: {c.name}. {c.definition}</p>
        {c.buyer && <p style={K.small}>Typical buyer, as the research states it: {c.buyer}</p>}
        {c.boundary && <p style={K.small}>How the research compares this class, in its own words: {c.boundary}</p>}
        {c.draft && <p style={K.small}>This peer group is provisional.</p>}
        <p style={{ ...K.small, marginTop: 8 }}>{NO_ORDER}</p>
      </section>

      <section aria-labelledby="who" style={K.panel}>
        <h2 id="who" style={K.h2}>The platforms in this group</h2>
        <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {main.map((v) => <VendorCard key={v.id} v={v} />)}
          {second.map((v) => <VendorCard key={v.id} v={v} note={`Also compared here. Its main group is ${PLAIN[v.klass].name.toLowerCase()}.`} />)}
        </ul>
      </section>

      {DECISION_KINDS.map(([k]) => (
        <section key={k} aria-labelledby={`k-${k}`} style={K.panel}>
          <h2 id={`k-${k}`} style={K.h2}>{KIND_WORDS[k]}</h2>
          <p style={{ ...K.small, marginBottom: 8 }}>Each platform's own statements from the research, side by side.</p>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {all.map((v) => (
              <div key={v.id}>
                <dt style={K.strong}>{v.name}</dt>
                <dd style={{ margin: "4px 0 0" }}>
                  {v.decisions[k].length
                    ? <ul style={list}>{v.decisions[k].map((d) => <li key={d.id} style={K.body}>{words(d.statement)}</li>)}</ul>
                    : <p style={K.small}>None published.</p>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <OtherGroups except={[id]} />
    </Page>
  );
}

export function Alternatives({ slug }) {
  const v = vendorBySlug(slug);
  if (!v) return <Missing />;
  const p = PLAIN[v.klass], peers = groupVendors(v.klass).filter((x) => x.id !== v.id);
  const second = v.also && PLAIN[v.also] ? [...groupVendors(v.also), ...secondVendors(v.also)].filter((x) => x.id !== v.id) : [];
  return (
    <Page crumbs={[["Vendor Intelligence", "/vendors"], ["Contact center platforms", "/vendors/ccaas"], [v.name, `/vendors/${slug}`], ["Alternatives"]]} kicker="Alternatives" title={`Alternatives to ${v.name}`}>
      <p style={{ ...K.body, fontSize: 18 }}>
        The research places {v.name} in the {p.name.toLowerCase()} peer group: {p.job.charAt(0).toLowerCase() + p.job.slice(1)} The platforms below were researched for the same job.
      </p>
      <p style={K.small}>{NO_ORDER} An alternative is a platform compared for the same job; the research does not say one is better.</p>

      <section aria-labelledby="look" style={K.panel}>
        <h2 id="look" style={K.h2}>When to look beyond {v.name}</h2>
        {v.decisions.eliminate.length + v.decisions.caution.length === 0
          ? <p style={K.body}>The research publishes no caution or rule-out statement for {v.name} yet. Its <a href={`/vendors/${slug}`} style={K.link}>full research</a> shows where it breaks.</p>
          : <>
            {[["eliminate"], ["caution"]].map(([k]) => v.decisions[k].length > 0 && (
              <div key={k} style={{ marginBottom: 10 }}>
                <h3 style={{ ...K.strong, fontSize: 16, margin: "0 0 4px" }}>{KIND_WORDS[k]}</h3>
                <ul style={list}>{v.decisions[k].map((d) => <li key={d.id} style={K.body}>{words(d.statement)}</li>)}</ul>
              </div>
            ))}
            <p style={K.small}>The research's own statements about {v.name}, validated {fmtDate(v.validated)}.</p>
          </>}
      </section>

      <section aria-labelledby="peers" style={K.panel}>
        <h2 id="peers" style={K.h2}>Researched for the same job</h2>
        {peers.length
          ? <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>{peers.map((x) => <VendorCard key={x.id} v={x} />)}</ul>
          : <p style={K.body}>No other platform is researched in this group yet.</p>}
        <p style={{ ...K.small, marginTop: 10 }}><a href={comparePath(v.klass)} style={K.link}>Compare the whole group side by side</a></p>
      </section>

      {second.length > 0 && (
        <section aria-labelledby="also" style={K.panel}>
          <h2 id="also" style={K.h2}>Also compared with {PLAIN[v.also].name.toLowerCase()}</h2>
          <p style={K.small}>{PLAIN[v.also].job}</p>
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>{second.map((x) => <VendorCard key={x.id} v={x} />)}</ul>
        </section>
      )}

      <OtherGroups except={[v.klass, v.also].filter(Boolean)} />
    </Page>
  );
}

function Missing() {
  return (
    <Page crumbs={[["Contact center platforms", "/vendors/ccaas"]]} kicker="Compare" title="No comparison here">
      <p style={K.body}>Comparisons exist for researched platforms only. See <a href="/vendors/ccaas" style={K.link}>contact center platforms by job</a>.</p>
    </Page>
  );
}

export function CompareRoute() {
  const { group: g } = useParams();
  return <ClassCompare id={classBySlug(g)} />;
}

export function AlternativesRoute() {
  const { slug } = useParams();
  return <Alternatives slug={slug} />;
}

/* Every page this file serves, for the sitemap and metadata tests. */
export const comparePages = () => CLASSES.map((c) => comparePath(c.id));
export const alternativesPages = () => CMP.vendors.map((v) => alternativesPath(SLUG_OF[v.id]));
export { classSlug };
