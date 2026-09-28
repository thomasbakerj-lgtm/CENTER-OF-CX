// drivers.test.mjs
//
// Attrition's root-cause check (method 1.2, P6 item 17): why agents leave, rated by the reader. Proves the rubric is
// whole and in our words (every statement has its action, no figure, no retired claim); every driver names a tool on
// the journey graph or says no tool exists yet; the one rubric engine scores it (partial drivers claim nothing, answers
// off the scale are dropped, only 2 or below becomes an action, weakest driver first); the page reports no overall
// score, band or predicted rate; the unsourced High and Medium list it replaced is gone; scenario links carry the
// answers and older links open with none; and the method page publishes the check from the same object the tool scores.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
const React = require("react");
const { renderToString } = require("react-dom/server");
const { ATTRITION_DRIVERS: R, DRIVER_TOOL_NAMES } = await import("./src/lib/rubrics/attritionDrivers.js");
const { scoreRubric } = await import("./src/lib/rubric.js");
const { JOURNEY } = await import("./src/lib/journey.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");
const { ATTRITION_MODEL } = await import("./src/lib/rubrics/attritionModel.js");
const { encodeScenario, decodeScenario } = await import("./src/lib/scenarioUrl.js");
const SRC = readFileSync("./AttritionCostCalculator.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");

console.log("\n1. The rubric");
ok("six drivers in the published order", R.dims.map((d) => d.id).join() === "workload,schedule,tools,knowledge,coaching,career");
const all = R.dims.flatMap((d) => d.criteria);
ok("every statement has an action, both full sentences", all.every((c) => /^[A-Z].{20,}\.$/.test(c.text) && /^[A-Z].{20,}\.$/.test(c.action)), all.length);
ok("no figure in any statement or action (the retired thresholds had no source)", all.every((c) => !/\d/.test(c.text + c.action)));
ok("scale 1 to 5, an action at 2 or below", R.scale.min === 1 && R.scale.max === 5 && R.failAt === 2);
ok("no band: the check reports no overall position", Array.isArray(R.bands) && R.bands.length === 0);
ok("the limits say it predicts no rate, averages nothing and moves no figure",
  R.limits.some((x) => /does not estimate or predict an attrition rate/.test(x)) && R.limits.some((x) => /not averaged/.test(x)) && R.limits.some((x) => /change no figure and no grade/.test(x)));

console.log("\n2. Every driver points somewhere real");
for (const d of R.dims) {
  if (d.next) ok(`${d.name}: ${d.next} is a tool on the journey graph, named as its method page names it`, !!JOURNEY[d.next] && DRIVER_TOOL_NAMES[d.next] === RUBRICS[d.next].title);
  else ok(`${d.name}: says no tool measures it yet and links a page that exists`, /No tool on this site/.test(d.nextNote) && APP.includes(`path="${d.read.href}"`));
}

console.log("\n3. The engine");
const none = scoreRubric(R, {});
ok("no answers: no driver complete, no action", none.dims.every((d) => !d.complete) && none.checklist.length === 0);
const part = scoreRubric(R, { "workload-0": 1, "workload-1": 1 });
ok("a partly answered driver is not complete", !part.dims[0].complete);
const off = scoreRubric(R, { "workload-0": 0, "workload-1": 6, "workload-2": 2.5 });
ok("answers off the scale or not whole are dropped", off.dims[0].criteria.every((c) => c.score === null));
const mix = scoreRubric(R, { "workload-0": 3, "workload-1": 2, "workload-2": 5, "schedule-0": 1, "schedule-1": 1, "schedule-2": 1, "schedule-3": 1 });
ok("only 2 or below becomes an action", mix.checklist.map((c) => c.criterion).join() === "schedule-0,schedule-1,schedule-2,schedule-3,workload-1");
ok("weakest driver first", mix.checklist[0].dimension === "schedule");
const every = Object.fromEntries(R.dims.flatMap((d) => d.criteria.map((_, i) => [`${d.id}-${i}`, 1])));
ok("all answered at 1: every statement is an action", scoreRubric(R, every).checklist.length === all.length);

console.log("\n4. The page");
ok("the page scores the check with the one engine", /const driverScore = scoreRubric\(ATTRITION_DRIVERS, drivers\);/.test(SRC));
ok("the page reads no overall score, band or next diagnostic from it", !/driverScore\.(overall|band|secondary|nextDiagnostic)/.test(SRC));
ok("the unsourced High and Medium list is gone", !/likelihood|most controllable attrition driver|leave faster than agents who feel underpaid|New CX roles are emerging/.test(SRC));
ok("the cost engine does not read the answers", (() => { const e = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")); return !/drivers\b|driverScore|ATTRITION_DRIVERS/.test(e); })());
const r = await build({ entryPoints: ["./AttritionCostCalculator.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const m = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
const html = (answers) => renderToString(React.createElement(m.exports.DriverCheck, { answers, setAnswer: () => {}, scored: scoreRubric(R, answers) }));
const empty = html({});
ok("the check opens on the first driver's statements, with its question and no result yet", empty.includes("Why are agents leaving?") && empty.includes(R.dims[0].criteria[0].text) && /Answer every statement for a driver/.test(empty));
const answered = html({ "workload-0": 1, "workload-1": 2, "workload-2": 4, "career-0": 1, "career-1": 1, "career-2": 1, "career-3": 5 });
ok("a finished driver shows its count, actions and tool", answered.includes("2 of 3 statements at 2 or below.") && answered.includes(R.dims[0].criteria[0].action) && answered.includes('href="/tools/occupancy-risk"'));
ok("career says no tool yet and links The Human Premium", answered.includes("No tool on this site measures career paths yet") && answered.includes('href="/human-premium"'));
ok("no number beyond the counts: no average, score or rate", !/\d\.\d|%/.test(answered.replace(/<[^>]+>/g, " ")));

console.log("\n5. Scenario links");
const LD = m.exports.DEFAULTS;
ok("the link defaults are the cost inputs plus empty answers", !!LD.d && JSON.stringify(LD.drivers) === "{}");
const enc = encodeScenario("attrition-cost", { d: LD.d, drivers: { "workload-0": 2 } }, LD);
const dec = decodeScenario(`?s=${enc}`, "attrition-cost", LD) || decodeScenario(`?scenario=${enc}`, "attrition-cost", LD);
ok("a link carries the answers", !!dec && dec.drivers["workload-0"] === 2);
const oldEnc = encodeScenario("attrition-cost", { d: { ...LD.d, agents: 90 } }, { d: LD.d });
const old = decodeScenario(`?s=${oldEnc}`, "attrition-cost", LD) || decodeScenario(`?scenario=${oldEnc}`, "attrition-cost", LD);
ok("an older link opens with its inputs and no answers", !!old && old.d.agents === 90 && JSON.stringify(old.drivers) === "{}");

console.log("\n6. The method page");
ok("the published method carries the check the tool scores", ATTRITION_MODEL.checks === R && Number(ATTRITION_MODEL.version) >= 1.2);
const rp = await build({ entryPoints: ["./RubricPage.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const pm = { exports: {} };
new Function("module", "exports", "require", rp.outputFiles[0].text)(pm, pm.exports, require);
globalThis.window = globalThis.window || { scrollTo() {} };
const page = renderToString(React.createElement(pm.exports.default, { id: "attrition-cost" }));
const text = page.replace(/<!-- -->/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
ok("the method page publishes every statement, action and driver", all.every((c) => text.includes(c.text) && text.includes(c.action)) && R.dims.every((d) => page.includes(d.name)));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
