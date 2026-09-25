/* ClaimText.jsx
 *
 * Renders page text that carries [[id]] claim tokens (src/lib/claims.js). Each figure shows its claim class inline:
 * a fact links its source, an assumption is labelled and links the tool that tests it, an example is marked as one,
 * and a missing benchmark says so and links the tool that measures the reader's own figure.
 * ClaimSources lists every claim on the page once, with source, date checked, reasoning and test.
 */
import { claim, tokens, TESTS, noteClaim } from "./claims.js";

/* Tags wrap: a long publisher name must never widen the page on a phone. */
const TAG = { fontSize: "0.72em", fontWeight: 600, marginLeft: 2, letterSpacing: 0.2, whiteSpace: "normal", overflowWrap: "anywhere" };

/* `links={false}` renders every tag as plain text, for claim text that sits inside a link (a card that is itself an
   <a>): a link inside a link is invalid HTML, and the browser would split the card. The page's Sources section still
   links every source. */
function Mark({ c, links = true }) {
  if (c.research === "pending") return <sup style={{ ...TAG, color: "#B45309" }}>source pending</sup>;
  if (c.kind === "fact") {
    const s = c.source;
    if (!links) return <sup style={TAG}><span title={`${s.publisher}, ${s.title}, ${s.year}`} style={{ opacity: 0.75 }}>{s.publisher} {s.year}</span></sup>;
    return <sup style={TAG}><a href={s.url} target="_blank" rel="noopener noreferrer" title={`${s.publisher}, ${s.title}, ${s.year}`} aria-label={`Source: ${s.publisher}, ${s.title}, ${s.year}`} style={{ color: "inherit", textDecoration: "underline", opacity: 0.75 }}>{s.publisher} {s.year}</a></sup>;
  }
  if (c.kind === "assumption") {
    const t = TESTS[c.test];
    return <sup style={TAG}><span title={c.rationale} style={{ opacity: 0.75 }}>planning assumption</span>{t && links && <> · <a href={t.href} aria-label={`Test this with your numbers in ${t.label}`} style={{ color: "inherit", textDecoration: "underline", opacity: 0.75 }}>test yours</a></>}</sup>;
  }
  if (c.kind === "example") return <sup style={TAG}><span title={c.rationale} style={{ opacity: 0.75 }}>example</span></sup>;
  return null;
}

export function Claim({ id, links = true }) {
  const c = claim(id);
  noteClaim(id);
  if (c.kind === "none") {
    const t = TESTS[c.test];
    return <span><span style={{ opacity: 0.75 }}>No public benchmark</span>{t && links && <sup style={TAG}><a href={t.href} aria-label={`Measure yours in ${t.label}`} style={{ color: "inherit", textDecoration: "underline", opacity: 0.75 }}>measure yours</a></sup>}</span>;
  }
  return <span>{c.kind === "example" && c.text ? c.text : c.value}<Mark c={c} links={links} /></span>;
}

export default function ClaimText({ text, links = true }) {
  return <>{tokens(text).map((p, i) => (p.id ? <Claim key={i} id={p.id} links={links} /> : <span key={i}>{p.text}</span>))}</>;
}

const KIND_LABEL = { fact: "Published figures", assumption: "Planning assumptions", example: "Worked examples", none: "No public benchmark" };

export function ClaimSources({ ids, color = "#475569", accent = "#0088DD" }) {
  const groups = ["fact", "assumption", "example", "none"].map((k) => [k, ids.map((id) => [id, claim(id)]).filter(([, c]) => c.kind === k)]).filter(([, l]) => l.length);
  if (!groups.length) return null;
  return (
    <div style={{ fontSize: 13, color, lineHeight: 1.6 }}>
      {groups.map(([k, list]) => (
        <div key={k} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>{KIND_LABEL[k]}</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {list.map(([id, c]) => {
              const t = TESTS[c.test];
              return (
                <li key={id} style={{ marginBottom: 6 }}>
                  <strong>{c.kind === "none" ? c.label : `${c.value}: ${c.label}`}</strong>
                  {c.research === "pending" && <>. Source pending: {c.lead}.</>}
                  {c.kind === "fact" && !c.research && <>. <a href={c.source.url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}>{c.source.publisher}, {c.source.title}, {c.source.year}</a>. Checked {c.checked}.</>}
                  {c.kind !== "fact" && !c.research && <>. {c.kind === "none" ? c.reason : c.rationale}</>}
                  {t && <> <a href={t.href} style={{ color: accent }}>{c.kind === "none" ? "Measure yours" : "Test with your numbers"} in {t.label}</a>.</>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
