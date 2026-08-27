/* run-all.mjs
 *
 * One command that answers: is the suite green, and is every tool that claims a
 * lock actually able to prove it. Run from the repo ROOT: node run-all.mjs
 *
 * Two things are checked, and the second matters more than the first.
 *
 *   1. Every harness on disk runs, and its own pass/fail counts are parsed out of
 *      its output rather than trusted from an exit code. Several harnesses call
 *      process.exit and one does not, so exit code alone is not a reliable signal.
 *      When a harness reports failures but still exits 0, that is itself reported
 *      as a defect in the harness.
 *
 *   2. Every tool in the LOCK REGISTRY below is checked for a harness. V3 lock
 *      criterion one is an engine harness that slices the live JSX at runtime. A
 *      tool recorded as locked with no harness on disk is a claim with no artifact
 *      behind it, and this runner refuses to go green while any exist.
 *
 * The registry is the point of this file. A passing suite that silently omits five
 * tools reads exactly like a passing suite that covers all of them.
 *
 * Flags:
 *   --quiet     table only, no per-harness output
 *   --no-audit  skip rail-audit.mjs
 *
 * Exit codes:
 *   0  everything green, every registered tool has a harness
 *   1  one or more assertions failed
 *   2  a registered tool has no harness, or a harness could not run
 *   3  the static rail audit found orphan pulls
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const QUIET = argv.includes("--quiet");
const NO_AUDIT = argv.includes("--no-audit");

/* ------------------------------------------------------------ lock registry */
/*
 * Every tool that publishes to the rail. `harness` is null where none exists yet.
 * `claimed` records the standard the tool was locked against, so the gap between
 * what is recorded and what is provable stays visible instead of being forgotten.
 *
 * When a harness is built, fill in the filename here. Do not remove the row.
 */
const REGISTRY = [
  { tool: "BusinessCaseBuilder.jsx",      harness: "bcb.test.mjs",      report: null,              claimed: "V3, Aug 2026" },
  { tool: "TCOCalculator.jsx",            harness: "tco.test.mjs",      report: null,              claimed: "V3, Aug 2026" },
  { tool: "StaffingCalculator.jsx",       harness: "staffing.test.mjs", report: null,              claimed: "V3, Aug 2026" },
  { tool: "AIDeflectionRealityCheck.jsx", harness: "aid.test.mjs",      report: null,              claimed: "V3, Jul 2026" },
  { tool: "FCRLeakageDiagnostic.jsx",     harness: "fcr.test.mjs",      report: "fcr.report.mjs",  claimed: "V3, Aug 2026" },
  { tool: "CostPerContactCalculator.jsx", harness: "cpc.test.mjs",      report: "cpc.report.mjs",  claimed: "V3, Aug 2026" },
  { tool: "ChannelShiftModel.jsx",        harness: "channel.test.mjs",  report: "channel.report.mjs", claimed: "V3, Aug 2026" },
  { tool: "LicenseBundleGapChecker.jsx",  harness: "licensegap.test.mjs", report: "licensegap.report.mjs", claimed: "V3, Aug 2026" },
  { tool: "AttritionCostCalculator.jsx",  harness: null,                report: null,              claimed: "V3, Jun 2026" },
];

/*
 * Rendered-output reconciliation is V3 criterion two, and until now it lived
 * outside this runner entirely: fcr.report.mjs existed on disk and nothing ran it.
 * A gate nobody executes is a gate that has already stopped working. Report
 * harnesses now run alongside their engine harness and are counted with it.
 */

/* Harnesses that verify shared infrastructure rather than one tool. */
const INFRA = [{ name: "rail.test.mjs", covers: "src/lib rail contract" }];

/* ---------------------------------------------------------------- utilities */

const C = process.stdout.isTTY
  ? { g: "\x1b[32m", r: "\x1b[31m", y: "\x1b[33m", d: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m" }
  : { g: "", r: "", y: "", d: "", b: "", x: "" };

const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

/*
 * Harness output is not uniform. Four print "N passed, N failed" and one prints
 * "PASS n FAIL n TOTAL n". Read the LAST match so a per-section line never
 * outranks the final total.
 */
function parseCounts(out) {
  const forms = [
    /(\d+)\s+passed,\s*(\d+)\s+failed/gi,
    /PASS\s+(\d+)\s+FAIL\s+(\d+)/gi,
  ];
  for (const re of forms) {
    const hits = [...out.matchAll(re)];
    if (hits.length) {
      const m = hits[hits.length - 1];
      return { passed: Number(m[1]), failed: Number(m[2]) };
    }
  }
  return null;
}

function runHarness(file) {
  if (!existsSync(join(ROOT, file))) return { status: "absent" };
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [file], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 300000,
    maxBuffer: 32 * 1024 * 1024,
  });
  const ms = Date.now() - t0;
  const out = `${r.stdout || ""}${r.stderr || ""}`;

  if (r.error) return { status: "error", ms, out, detail: String(r.error.message || r.error) };
  const counts = parseCounts(out);
  if (!counts) return { status: "unparsed", ms, out, code: r.status };
  return { status: counts.failed > 0 ? "fail" : "pass", ms, out, code: r.status, ...counts };
}

/* --------------------------------------------------------------------- run */

console.log(`${C.b}Center of CX suite runner${C.x}  ${C.d}${new Date().toISOString()}${C.x}\n`);

const results = [];

for (const i of INFRA) {
  const r = runHarness(i.name);
  results.push({ label: i.name, subject: i.covers, kind: "infra", ...r });
  if (!QUIET && r.out && r.status !== "pass") console.log(r.out.trimEnd() + "\n");
}

for (const row of REGISTRY) {
  if (!row.harness) {
    results.push({
      label: "(none)", subject: row.tool, kind: "tool", status: "missing", claimed: row.claimed,
    });
    continue;
  }
  const r = runHarness(row.harness);
  results.push({ label: row.harness, subject: row.tool, kind: "tool", claimed: row.claimed, ...r });
  if (!QUIET && r.out && r.status !== "pass") console.log(r.out.trimEnd() + "\n");

  if (row.report) {
    const rr = runHarness(row.report);
    results.push({ label: row.report, subject: row.tool + " (rendered)", kind: "report", claimed: row.claimed, ...rr });
    if (!QUIET && rr.out && rr.status !== "pass") console.log(rr.out.trimEnd() + "\n");
  }
}

/* ------------------------------------------------------------------- table */

const w = { s: 34, h: 20, r: 10, p: 7, f: 6, t: 8 };
const rule = "-".repeat(w.s + w.h + w.r + w.p + w.f + w.t + 5);

console.log(
  `${C.b}${pad("SUBJECT", w.s)} ${pad("HARNESS", w.h)} ${pad("RESULT", w.r)} ` +
  `${lpad("PASS", w.p)} ${lpad("FAIL", w.f)} ${lpad("MS", w.t)}${C.x}`
);
console.log(C.d + rule + C.x);

const badge = {
  pass: `${C.g}pass${C.x}`,
  fail: `${C.r}FAIL${C.x}`,
  missing: `${C.r}NO HARNESS${C.x}`,
  absent: `${C.r}FILE GONE${C.x}`,
  error: `${C.r}ERROR${C.x}`,
  unparsed: `${C.y}UNPARSED${C.x}`,
};

let totalPass = 0, totalFail = 0;
let failed = 0, missing = 0, broken = 0, silentFailures = [];

for (const r of results) {
  if (r.status === "pass" || r.status === "fail") {
    totalPass += r.passed; totalFail += r.failed;
    /* A harness that reports failures but exits 0 will read as green to CI. */
    if (r.failed > 0 && r.code === 0) silentFailures.push(r.label);
  }
  if (r.status === "fail") failed++;
  if (r.status === "missing" || r.status === "absent") missing++;
  if (r.status === "error" || r.status === "unparsed") broken++;

  const raw = { pass: "pass", fail: "FAIL", missing: "NO HARNESS", absent: "FILE GONE", error: "ERROR", unparsed: "UNPARSED" }[r.status];
  console.log(
    `${pad(r.subject, w.s)} ${pad(r.label, w.h)} ` +
    `${badge[r.status]}${" ".repeat(Math.max(0, w.r - raw.length))} ` +
    `${lpad(r.passed ?? "-", w.p)} ${lpad(r.failed ?? "-", w.f)} ${lpad(r.ms ?? "-", w.t)}`
  );
}

console.log(C.d + rule + C.x);
console.log(
  `${pad("TOTAL", w.s)} ${pad("", w.h)} ${pad("", w.r)} ` +
  `${lpad(totalPass, w.p)} ${lpad(totalFail, w.f)}`
);

/* ------------------------------------------------------------- rail audit */

let auditCode = 0;
if (!NO_AUDIT && existsSync(join(ROOT, "rail-audit.mjs"))) {
  const a = spawnSync(process.execPath, ["rail-audit.mjs"], {
    cwd: ROOT, encoding: "utf8", timeout: 120000, maxBuffer: 32 * 1024 * 1024,
  });
  auditCode = a.status ?? 0;
  const clean = auditCode === 0;
  console.log(
    `\n${C.b}RAIL AUDIT${C.x}  ` +
    (clean ? `${C.g}clean, no orphan pulls${C.x}` : `${C.r}${auditCode} orphan pull(s)${C.x}`)
  );
  if (!clean && !QUIET) console.log((a.stdout || "").trimEnd());
}

/* ---------------------------------------------------------------- verdict */

console.log("");

if (silentFailures.length) {
  console.log(`${C.y}warning${C.x}  these harnesses report failures but exit 0, so CI would read them as green:`);
  for (const f of silentFailures) console.log(`         ${f}`);
  console.log("");
}

if (missing) {
  const gaps = results.filter((r) => r.status === "missing" || r.status === "absent");
  console.log(`${C.r}${C.b}LOCK GATE FAILED${C.x}  ${missing} tool(s) claim a lock with no harness on disk:`);
  for (const g of gaps) console.log(`         ${pad(g.subject, 34)} recorded as ${g.claimed || "locked"}`);
  console.log(`\n         V3 criterion one is a Node harness that slices the live engine.`);
  console.log(`         Until these exist, those locks are recorded but not provable.`);
}

if (failed) console.log(`${C.r}${C.b}${totalFail} ASSERTION(S) FAILED${C.x} across ${failed} harness(es).`);
if (broken) console.log(`${C.r}${C.b}${broken} HARNESS(ES) COULD NOT RUN OR PARSE.${C.x}`);

if (!failed && !missing && !broken && !auditCode) {
  console.log(`${C.g}${C.b}SUITE GREEN${C.x}  ${totalPass} assertions, every registered tool covered.`);
}

process.exit(failed ? 1 : (missing || broken) ? 2 : auditCode ? 3 : 0);
