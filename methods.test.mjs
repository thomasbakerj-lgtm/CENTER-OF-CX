/* methods.test.mjs
 *
 * The rail calculators' published method pages. Each rail tool's engine lives inside its
 * JSX file, so its method page carries worked examples as pins. This harness slices each
 * engine the same way the tool's own harness does and recomputes every pin, so a method page
 * cannot drift from its calculator. It also checks each page is registered, routed, in the
 * sitemap, linked from its tool, and reads every constant from the registry.
 */
import { readFileSync } from "node:fs";
const { BENCH, benchmark, BENCHMARK_SOURCES } = await import("./src/lib/benchmarks.js");
const conf = await import("./src/lib/confidence.js");
const { createGuards } = await import("./src/lib/guards.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;
const APP = readFileSync("./App.jsx", "utf8"), MAP = readFileSync("./public/sitemap.xml", "utf8"), SEO = readFileSync("./src/lib/seo.js", "utf8");

function common(id, toolFile) {
  const M = RUBRICS[id];
  ok(`[${id}] registered as a calc method`, !!M && M.kind === "calc" && M.methodology === "/methodology/" + id);
  ok(`[${id}] routed, in the sitemap and titled`, APP.includes(`<Route path="/methodology/${id}" element={<RubricPage id="${id}" />} />`) && MAP.includes(`/methodology/${id}<`) && SEO.includes(`"/methodology/${id}": {`));
  ok(`[${id}] every constant on the page is a registry entry with its source`, M.constants().length > 0 && M.constants().every((c) => BENCHMARK_SOURCES[c.id] && c.value === BENCHMARK_SOURCES[c.id].value && c.source === BENCHMARK_SOURCES[c.id].source));
  ok(`[${id}] the tool links its published method`, readFileSync("./" + toolFile, "utf8").includes(`/methodology/${id}`));
  const text = JSON.stringify({ ...M, constants: M.constants() });
  ok(`[${id}] no dash, float noise, NaN or undefined on the page`, !DASH.test(text) && !NOISE.test(text) && !/NaN|undefined|Infinity/.test(text));
  return M;
}

section("Staffing Requirement Calculator");
{
  const { STAFFING_PINS: P } = await import("./src/lib/rubrics/staffingModel.js");
  common("staffing-calculator", "StaffingCalculator.jsx");
  const SS = readFileSync("./StaffingCalculator.jsx", "utf8");
  const full = SS.slice(SS.indexOf("function erlangB("), SS.indexOf("const S = ({ label"));
  const G = new Function("benchmark", "BENCH", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "createGuards",
    `${full}\nreturn { calc, staffingCost, PRESETS };`)(benchmark, BENCH, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, createGuards);
  const d = P.defaults, g = G.PRESETS.general;
  ok("the opening case is the tool's own general profile", g.volume === d.volume && g.aht === d.aht && g.slT === d.slT && g.slS === d.slS && g.shrink === d.shrink && benchmark("staffing.default.intv") === d.interval);
  const r = G.calc(d.volume, d.aht, d.interval, d.slT, d.slS, d.shrink, null), c = G.staffingCost(r.sched, 0, 0);
  ok("opening case: load, base agents and FTE equal the engine", r.A === d.load && r.raw === d.base && r.sched === d.fte);
  ok("opening case: service level, speed of answer and occupancy equal the engine", near(r.sl, d.sl, 5e-6) && near(r.asa, d.asa, 0.005) && near(r.occ, d.occ, 5e-6));
  ok("opening case: cost per agent and annual cost equal the engine to the dollar", near(c.perAgentMonth, d.perAgentMonth, 0.005) && Math.round(c.annual) === d.annual && !c.sourced);
  const n = P.nextiva, x = G.calc(n.volume, n.aht, n.interval, n.slT, n.slS, n.shrink, n.cap);
  ok("published case: 68 base agents, 98 FTE, 84.0% occupancy, set by the ceiling", x.raw === n.base && x.sched === n.fte && (x.occ * 100).toFixed(1) === "84.0" && x.capped === n.capped && near(x.A, n.load, 0.005));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
