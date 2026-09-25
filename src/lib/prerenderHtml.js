/* prerenderHtml.js
 *
 * Pure helpers for the build-time prerender (prerender.mjs) and its harness (prerender.test.mjs).
 */

/* React's server renderer HTML-escapes text inside <style> (quotes and & in a font URL become entities), but the
   browser reads <style> content as raw text, so the client would see "&#x27;" where it renders "'" and the page would
   fail hydration. The CSS is the site's own static source, so decode it back to the raw text React renders on the
   client. Throws on a decoded block that could close its own element. */
export function rawStyles(html) {
  return html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (_, open, css, close) => {
    const raw = css
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    if (/<\/style/i.test(raw)) throw new Error("a <style> block would close itself after decoding");
    return open + raw + close;
  });
}

/* A link inside a link is invalid HTML: the browser closes the outer link early, the page's structure differs from
   what React rendered, and hydration fails. Returns the number of <a> tags opened inside another <a>. */
export function nestedLinks(html) {
  let depth = 0, nested = 0;
  for (const m of html.matchAll(/<(\/?)a(?=[\s>])/gi)) {
    if (m[1]) depth = Math.max(0, depth - 1);
    else { if (depth > 0) nested++; depth++; }
  }
  return nested;
}

/* Visible text of an HTML fragment, without style and script content. */
export function visibleText(html) {
  return html
    .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
