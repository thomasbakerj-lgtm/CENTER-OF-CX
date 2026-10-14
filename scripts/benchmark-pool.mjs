// scripts/benchmark-pool.mjs
//
// Pools the reader benchmark (open item 10). Input: a PostHog export of the `benchmark_contribute` event, as JSON (an
// array of events, or { results: [...] }) or CSV (columns named metric, value, industry, size_band, with or without a
// "properties." prefix). The export stays outside this repository, which is public: the script refuses a file inside
// it. Output: src/data/benchmarks/readers.json, the pooled groups only (benchmarkExchange.js `pool`), which the tools'
// "How others report it" panel renders.
//   node scripts/benchmark-pool.mjs /path/outside/repo/export.json [--date 2026-11-01]
//   node scripts/benchmark-pool.mjs --empty     (writes the file with no contributions)
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { pool } from "../src/lib/benchmarkExchange.js";

export const OUT = "src/data/benchmarks/readers.json";
const FIELDS = ["metric", "value", "industry", "size_band"];

/** Rows from an export's text. */
export function parseExport(text) {
  const t = text.trim();
  if (t.startsWith("[") || t.startsWith("{")) {
    const j = JSON.parse(t);
    const list = Array.isArray(j) ? j : j.results || [];
    return list.map((e) => { const p = (e && (e.properties || e)) || {}; return Object.fromEntries(FIELDS.map((f) => [f, f === "value" ? Number(p[f]) : p[f]])); });
  }
  const lines = t.split(/\r?\n/).filter(Boolean);
  const split = (l) => { const out = []; let cur = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
  const head = split(lines[0]).map((h) => h.trim().replace(/^properties\./, ""));
  const at = Object.fromEntries(FIELDS.map((f) => [f, head.indexOf(f)]));
  return lines.slice(1).map((l) => { const c = split(l); return Object.fromEntries(FIELDS.map((f) => [f, f === "value" ? Number(c[at[f]]) : c[at[f]]])); });
}

export const render = (rows, date) => JSON.stringify(pool(rows, date), null, 2) + "\n";

if (process.argv[1] && process.argv[1].endsWith("benchmark-pool.mjs")) {
  const args = process.argv.slice(2);
  const di = args.indexOf("--date");
  const date = di >= 0 ? args[di + 1] : new Date().toISOString().slice(0, 10);
  let rows = [];
  if (!args.includes("--empty")) {
    const file = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--date");
    if (!file) { console.error("usage: node scripts/benchmark-pool.mjs <export outside the repo> [--date YYYY-MM-DD] | --empty"); process.exit(2); }
    const repo = realpathSync(resolve(".")) + sep;
    if (realpathSync(resolve(file)).startsWith(repo)) { console.error("refused: keep the raw export outside the repository (it is public)"); process.exit(2); }
    rows = parseExport(readFileSync(file, "utf8"));
  }
  mkdirSync("src/data/benchmarks", { recursive: true });
  const out = render(rows, args.includes("--empty") ? null : date);
  writeFileSync(OUT, out);
  const p = JSON.parse(out);
  console.log(`benchmark-pool: ${rows.length} rows, ${p.dropped.invalid} dropped; groups: ${Object.entries(p.metrics).map(([m, x]) => `${m} ${x.groups.length}`).join(", ")}`);
}
