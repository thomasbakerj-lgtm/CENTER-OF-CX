/* entry-server.jsx
 *
 * Server entry for the build-time prerender (prerender.mjs). Renders the same routes the browser renders, at one
 * URL, and waits until every lazy route chunk has resolved, so the HTML carries the page body. Nothing here runs in
 * the browser.
 */
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Writable } from "node:stream";
import { AppRoutes } from "./App.jsx";
import { CLAIMS, recordClaims, recordedClaims } from "./src/lib/claims.js";

/* Every fact the page rendered, as schema.org citations, and the latest date one was checked. */
export function citationsOf(ids) {
  const facts = ids.map((id) => CLAIMS[id]).filter((c) => c && c.kind === "fact" && c.source && c.source.url);
  const seen = new Set();
  const citation = [];
  for (const c of facts) {
    if (seen.has(c.source.url)) continue;
    seen.add(c.source.url);
    citation.push({ "@type": "CreativeWork", name: c.source.title, url: c.source.url, datePublished: String(c.source.year), publisher: { "@type": "Organization", name: c.source.publisher } });
  }
  const checked = facts.map((c) => c.checked).filter(Boolean).sort().pop() || null;
  return { citation, checked };
}

/* Renders one URL. Resolves to { html, claims }: the page body and the claim ids it rendered. */
export function render(url) {
  recordClaims();
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({ write(chunk, _enc, cb) { html += chunk.toString(); cb(); } });
    sink.on("finish", () => resolve({ html, claims: recordedClaims() }));
    const errors = [];
    const stream = renderToPipeableStream(
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>,
      {
        onAllReady() { stream.pipe(sink); },
        onShellError(err) { reject(err); },
        onError(err) { errors.push(err); },
      }
    );
    sink.on("finish", () => { if (errors.length) reject(errors[0]); });
  });
}
