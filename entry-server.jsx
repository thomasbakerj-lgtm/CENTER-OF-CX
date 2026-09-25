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

export function render(url) {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({ write(chunk, _enc, cb) { html += chunk.toString(); cb(); } });
    sink.on("finish", () => resolve(html));
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
