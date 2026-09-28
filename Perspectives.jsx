// Perspectives.jsx
//
// Contributor perspectives (decision D3): the index at /perspectives, one piece at /perspectives/:slug and a
// contributor's profile at /contributors/:slug. Each view takes its data as props so the harness can render fixture
// pieces; the routes pass the published lists from src/lib/contributors.js. A piece shows its byline first, the
// Contributor perspective label, the author's declared vendor tie, when it was reviewed and its sources. Nothing here
// reads research, grades or Vendor Match, and nothing reads this. Tokens only.
import { useParams } from "react-router-dom";
import { HOUSE, PILLARS, RADIUS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { Byline, Button } from "./src/lib/ui.jsx";
import { IdeaBox } from "./src/lib/IdeaBox.jsx";
import { longDate } from "./src/lib/methodVersions.js";
import { CONTRIBUTORS, PIECES, perspectivePath, contributorPath, pieceProblems, contributorProblems } from "./src/lib/contributors.js";

const ACCENT = PILLARS.research.onDark;
const WRAP = { maxWidth: 760, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 };
const CSS = `.cx-per p,.cx-per li,.cx-per h1,.cx-per h2{overflow-wrap:anywhere}`;
const TAG = { alignSelf: "flex-start", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: RADIUS.chip, color: ACCENT, border: `1px solid ${ACCENT}` };
const since = (ym) => { const [y, m] = ym.split("-"); return longDate(`${y}-${m}-01`).replace(/^1 /, ""); };
const sorted = (list) => [...list].sort((a, b) => (a.published < b.published ? 1 : -1));
const publishable = (pieces, people) => pieces.filter((p) => pieceProblems(p, people).length === 0);

function Page({ crumbs, children }) {
  return (
    <div className="cx-per" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={crumbs} />
      <div style={WRAP}>{children}</div>
    </div>
  );
}

function Card({ piece, author }) {
  return (
    <li style={{ ...K.panel, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={TAG}>CONTRIBUTOR PERSPECTIVE</span>
      <a href={perspectivePath(piece.slug)} style={{ fontSize: 20, fontWeight: 600, color: HOUSE.mist, textDecoration: "none", lineHeight: 1.3 }}>{piece.title}</a>
      <p style={K.body}>{piece.dek}</p>
      <p style={K.small}>{author.name}, {author.role}, {author.org}. Published {longDate(piece.published)}.</p>
    </li>
  );
}

export function PerspectivesIndex({ pieces = PIECES, contributors = CONTRIBUTORS }) {
  const list = sorted(publishable(pieces, contributors));
  return (
    <Page crumbs={[["Research", "/research"], ["Contributor perspectives"]]}>
      <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ ...K.kicker, color: ACCENT }}>Research</span>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12 }}>Contributor perspectives</h1>
        <p style={K.body}>Practitioners, consultants, analysts and academics writing under their own names. Each piece is reviewed for facts, sources and disclosure, and is the author's view. None of it changes a research finding, a grade or a tool's result.</p>
      </header>
      {list.length
        ? <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>{list.map((p) => <Card key={p.slug} piece={p} author={contributors[p.author]} />)}</ul>
        : (
          <section style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ ...K.h2, margin: 0 }}>No pieces published yet</h2>
            <p style={K.body}>The rules are published and proposals are open. The first pieces appear here once they have been reviewed.</p>
            <div><Button href="/contribute">Read the rules and propose a piece</Button></div>
          </section>
        )}
      {list.length > 0 && <p style={K.body}><a href="/contribute" style={{ color: ACCENT, fontWeight: 600 }}>Write for The Center of CX</a></p>}
      <IdeaBox where="Perspectives" title="What should practitioners write about?" prompt="Name a topic you want a practitioner's view on, a question you are wrestling with at work, or a person whose experience you would like to read. You do not need to write it yourself." />
    </Page>
  );
}

function Missing({ what }) {
  return (
    <Page crumbs={[["Research", "/research"], ["Contributor perspectives", "/perspectives"]]}>
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{what} not found</h1>
      <p style={K.body}>It may have been withdrawn by its author. <a href="/perspectives" style={{ color: ACCENT, fontWeight: 600 }}>See every published perspective</a>.</p>
    </Page>
  );
}

export function PerspectiveView({ slug, pieces = PIECES, contributors = CONTRIBUTORS }) {
  const piece = pieces.find((p) => p.slug === slug);
  if (!piece || pieceProblems(piece, contributors).length) return <Missing what="Piece" />;
  const a = contributors[piece.author];
  return (
    <Page crumbs={[["Research", "/research"], ["Contributor perspectives", "/perspectives"], [piece.title]]}>
      <article style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <a href={contributorPath(piece.author)} style={{ textDecoration: "none" }}><Byline name={a.name} role={a.role} org={a.org} since={since(a.since)} tie={piece.tie} /></a>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.15 }}>{piece.title}</h1>
          <p style={{ ...K.body, fontSize: 18 }}>{piece.dek}</p>
          <p style={K.small}>Published {longDate(piece.published)}. Reviewed for facts, sources and disclosure {longDate(piece.reviewed)}. The views are the author's.</p>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {piece.body.map((b, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {b.h && <h2 style={{ ...K.h2, margin: "8px 0 0" }}>{b.h}</h2>}
              <p style={{ ...K.body, fontSize: 17, lineHeight: 1.7 }}>{b.p}</p>
            </div>
          ))}
        </div>
        {piece.sources && piece.sources.length > 0 && (
          <section aria-labelledby="sources" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 id="sources" style={{ ...K.h2, margin: 0 }}>Sources</h2>
            <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
              {piece.sources.map((s) => <li key={s.url} style={K.body}>{s.publisher}, <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>{s.title}</a></li>)}
            </ol>
          </section>
        )}
        <p style={K.small}>A contributor perspective never changes a research finding, a grade, a tool's result or a vendor's place in any list. Spot an error? <a href="/contact" style={{ color: ACCENT }}>Tell us</a>.</p>
      </article>
    </Page>
  );
}

export function ContributorView({ slug, pieces = PIECES, contributors = CONTRIBUTORS }) {
  const c = Object.prototype.hasOwnProperty.call(contributors, slug) ? contributors[slug] : null;
  if (!c || contributorProblems(c).length) return <Missing what="Contributor" />;
  const list = sorted(publishable(pieces, contributors).filter((p) => p.author === slug));
  return (
    <Page crumbs={[["Research", "/research"], ["Contributor perspectives", "/perspectives"], [c.name]]}>
      <header style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={TAG}>CONTRIBUTOR</span>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700 }}>{c.name}</h1>
        <p style={K.body}>{c.role}, {c.org}. Contributor since {since(c.since)}.</p>
        {c.bio && <p style={K.body}>{c.bio}</p>}
        {c.links && c.links.length > 0 && (
          <p style={K.body}>{c.links.map((l, i) => <span key={l.url}>{i > 0 && " · "}<a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>{l.label}</a></span>)}</p>
        )}
      </header>
      <section aria-labelledby="pieces" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 id="pieces" style={{ ...K.h2, margin: 0 }}>Published pieces</h2>
        {list.length
          ? <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>{list.map((p) => <Card key={p.slug} piece={p} author={c} />)}</ul>
          : <p style={K.body}>None yet.</p>}
      </section>
    </Page>
  );
}

export function PerspectiveRoute() { const { slug } = useParams(); return <PerspectiveView slug={slug} />; }
export function ContributorRoute() { const { slug } = useParams(); return <ContributorView slug={slug} />; }
export default function Perspectives() { return <PerspectivesIndex />; }
