// Search.jsx
//
// Site search at /search (TB, 1 Oct 2026: matches the words people search, not only exact text). The index is the
// static file the prerender writes (dist/search-index.json, src/lib/search.js); matching runs in the browser and the
// query never leaves it (no event carries it). The query sits in the address (?q=) so a search can be shared or kept.
// Noindex: a results page is not a page of its own. Tokens only.
import { useEffect, useMemo, useState } from "react";
import { HOUSE, alpha, LINE, RADIUS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { search } from "./src/lib/search.js";

/* Starting points when the box is empty: words readers use for the site's main jobs. */
export const SUGGESTIONS = ["cost per contact", "staffing", "CCaaS vendors", "AI deflection", "WFM", "contract renewal", "healthcare", "first call resolution"];

const readQuery = () => { try { return new URLSearchParams(window.location.search).get("q") || ""; } catch { return ""; } };

export default function Search() {
  const [q, setQ] = useState("");
  const [docs, setDocs] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setQ(readQuery());
    let live = true;
    fetch("/search-index.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => { if (live) setDocs(j.docs || []); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (q.trim()) url.searchParams.set("q", q); else url.searchParams.delete("q");
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
    } catch { /* no address to update */ }
  }, [q]);

  const found = useMemo(() => (docs && q.trim() ? search(docs, q) : null), [docs, q]);
  const field = { width: "100%", boxSizing: "border-box", minHeight: 52, padding: "0 16px", fontSize: 17, fontFamily: FONT, color: HOUSE.mist, background: HOUSE.ink, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, borderRadius: RADIUS.field };

  return (
    <div style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <Crumbs items={[["Home", "/"], ["Search"]]} share={false} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12 }}>Search the site</h1>
        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="cx-search" style={{ ...K.small, display: "block", marginBottom: 6 }}>Tools, methods, vendors, industries and research. Acronyms and other names work: try WFM, AHT or call center.</label>
          <input id="cx-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" spellCheck="false" style={field} />
        </form>

        {failed && <p role="alert" style={K.body}>The search index did not load. Browse the <a href="/tools" style={K.link}>tools</a>, <a href="/vendors" style={K.link}>vendors</a> or <a href="/industries" style={K.link}>industries</a> instead.</p>}
        {!failed && !docs && q.trim() && <p style={K.small}>Loading the index.</p>}

        {!q.trim() && (
          <section aria-labelledby="try">
            <h2 id="try" style={K.h2}>Try</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <li key={s}><button type="button" onClick={() => setQ(s)} style={{ minHeight: 44, padding: "0 14px", borderRadius: RADIUS.field, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, color: HOUSE.mist, fontFamily: FONT, fontSize: 14, cursor: "pointer" }}>{s}</button></li>
              ))}
            </ul>
          </section>
        )}

        {found && (
          <section aria-labelledby="results">
            <h2 id="results" style={K.h2} aria-live="polite">
              {found.results.length === 0 ? "No page matches" : `${found.results.length === 50 ? "50 or more" : found.results.length} ${found.results.length === 1 ? "page" : "pages"}`}
            </h2>
            {found.partial && <p style={{ ...K.small, marginBottom: 12 }}>No page matches every word, so these match some of them.</p>}
            {found.results.length === 0 && <p style={K.body}>Try fewer words, or browse the <a href="/tools" style={K.link}>tools</a>, <a href="/vendors" style={K.link}>vendors</a> or <a href="/industries" style={K.link}>industries</a>.</p>}
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {found.results.map(({ doc }) => (
                <li key={doc.p} style={{ ...K.panel, padding: 16, overflowWrap: "anywhere" }}>
                  <span style={{ ...K.kicker, fontSize: 11, display: "block", marginBottom: 4 }}>{doc.k}</span>
                  <a href={doc.p} style={{ ...K.link, fontSize: 17 }}>{doc.t}</a>
                  <p style={{ ...K.body, marginTop: 4 }}>{doc.d}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
