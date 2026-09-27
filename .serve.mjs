// Static server for dist/ that follows vercel.json: a path serves dist/<path>/index.html when it exists,
// a file serves itself, anything else without a dot serves spa.html.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const DIST = process.argv[2], PORT = +process.argv[3] || 4173;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf", ".json": "application/json" };
createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  else if (!existsSync(f) && existsSync(join(DIST, p, "index.html"))) f = join(DIST, p, "index.html");
  if (!existsSync(f)) { if (!extname(p)) f = join(DIST, "spa.html"); else { res.writeHead(404); return res.end(); } }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
}).listen(PORT, () => console.log("serving", DIST, "on", PORT));
