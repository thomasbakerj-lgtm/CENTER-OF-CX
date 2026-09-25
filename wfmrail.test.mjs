/* wfmrail.test.mjs
 *
 * The Phase D rail step. AHT Decomposition, the Shrinkage Planner and the Occupancy Risk
 * Simulator publish handle time, total shrinkage and the target occupancy with origin grades;
 * the Staffing Calculator reads them once at mount, labels each field with its source, and
 * grades a pulled driver no higher than its origin while the field still holds it. A scenario
 * link outranks the rail. Staffing's solver now starts at floor(A) + 1, proven on 20,000
 * queues to differ from the old start only where the first count above the load already
 * meets the target.
 */
const mem = new Map();
globalThis.window = { sessionStorage: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) } };
globalThis.__COC_RAIL_DEBUG__ = false;
import { readFileSync } from "node:fs";
const { publishToolResult, getExternalWithSource, resetRail } = await import("./src/lib/toolData.js");
const { BENCH, benchmark } = await import("./src/lib/benchmarks.js");
const { emitGrades, voidResult, isVoid, railEvidence, weakerStream } = await import("./src/lib/confidence.js");
const { createGuards } = await import("./src/lib/guards.js");

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
const clear = () => { if (typeof resetRail === "function") resetRail(); mem.clear(); };

const AHT = readFileSync("./AHTDecomposition.jsx", "utf8"), SHR = readFileSync("./ShrinkagePlanner.jsx", "utf8"), OCC = readFileSync("./OccupancyRiskSimulator.jsx", "utf8"), STF = readFileSync("./StaffingCalculator.jsx", "utf8");

section("1. The publishers");
ok("AHT Decomposition publishes today's handle time with an origin grade", AHT.includes('publishToolResult("aht-decomposition", { aht: R.total }, { aht: ahtOrigin })'));
ok("its origin is Directional on an example profile or a corrected input, Planning-grade otherwise", /const ahtOrigin = guards\.length \|\| Object\.values\(PRESETS\)\.some\(\(p\) => AHT_COMPONENTS\.every\(\(c\) => p\[c\] === v\.values\[c\]\)\) \? "Directional" : "Planning-grade";/.test(AHT));
ok("the handle time after levers never goes to the rail", !/publishToolResult\([^)]*combinedNew/.test(AHT));
ok("the Shrinkage Planner publishes total shrinkage as a fraction with an origin grade", SHR.includes('publishToolResult("shrinkage-planner", { shrinkage: R.totalPct / 100 }, { shrinkage: shrinkOrigin })'));
ok("its origin is Directional while every category is the example or an input was corrected", /const shrinkOrigin = guards\.length \|\| \[\.\.\.SHRINK_PLANNED, \.\.\.SHRINK_UNPLANNED\]\.every\(\(\[k\]\) => v\[k\] === DEFAULTS\[k\]\) \? "Directional" : "Planning-grade";/.test(SHR));
ok("the Occupancy Risk Simulator publishes its target as Staffing's occupancy ceiling with an origin grade", OCC.includes('publishToolResult("occupancy-risk", { occupancyCap: v.target / 100 }, { occupancyCap: capOrigin })'));
ok("its origin is Directional at the default target or a corrected one", /const capOrigin = guards\.some\(\(g\) => \/Target occupancy\/\.test\(g\.label\)\) \|\| v\.target === DEFAULTS\.target \? "Directional" : "Planning-grade";/.test(OCC));
ok("Forecast Accuracy and Schedule Adherence publish nothing to Staffing", !/publishToolResult/.test(readFileSync("./ForecastAccuracyTracker.jsx", "utf8")) && !/publishToolResult/.test(readFileSync("./ScheduleAdherenceCalculator.jsx", "utf8")));
ok("no publisher claims Finance-grade", ![AHT, SHR, OCC].some((s) => /"Finance-grade"/.test(s)));

section("2. Round trips through the real rail");
clear();
publishToolResult("aht-decomposition", { aht: 395 }, { aht: "Directional" });
publishToolResult("shrinkage-planner", { shrinkage: 0.33 }, { shrinkage: "Planning-grade" });
publishToolResult("occupancy-risk", { occupancyCap: 0.88 }, { occupancyCap: "Planning-grade" });
const a = getExternalWithSource("aht", "staffing-calculator"), s = getExternalWithSource("shrinkage", "staffing-calculator"), c = getExternalWithSource("occupancyCap", "staffing-calculator");
ok("Staffing reads handle time with its producer and origin", a && a.value === 395 && a.sourceTool === "aht-decomposition" && a.railOrigin === "Directional");
ok("Staffing reads shrinkage as the fraction published, with its origin", s && s.value === 0.33 && s.sourceTool === "shrinkage-planner" && s.railOrigin === "Planning-grade");
ok("Staffing reads the occupancy ceiling with its origin", c && c.value === 0.88 && c.sourceTool === "occupancy-risk" && c.railOrigin === "Planning-grade");
publishToolResult("staffing-calculator", { aht: 395, shrinkage: 0.33 });
const a2 = getExternalWithSource("aht", "cost-per-contact");
ok("Staffing restating the pulled values unchanged keeps the producer and the origin", a2.sourceTool === "aht-decomposition" && a2.railOrigin === "Directional" && getExternalWithSource("aht", "staffing-calculator") !== null);
publishToolResult("staffing-calculator", { aht: 400 });
const a3 = getExternalWithSource("aht", "cost-per-contact");
ok("an edit in Staffing makes Staffing the producer and drops the origin grade", a3.value === 400 && a3.sourceTool === "staffing-calculator" && !a3.railOrigin);
ok("and Staffing never reads its own edit back", getExternalWithSource("aht", "staffing-calculator") === null);
clear();

section("3. Staffing grades a pulled driver no higher than its origin");
const SS = readFileSync("./StaffingCalculator.jsx", "utf8");
const full = SS.slice(SS.indexOf("function erlangB("), SS.indexOf("const S = ({ label"));
const G = new Function("benchmark", "BENCH", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "createGuards",
  `${full}\nreturn { calc, modelValidity, staffingCost, gradeStaffing, PRESETS };`)(benchmark, BENCH, emitGrades, voidResult, isVoid, railEvidence, weakerStream, createGuards);
const P0 = G.PRESETS.general;
const grade = (vol, aht, shrink, pulled) => {
  const r = G.calc(vol, aht, 30, 0.8, 20, shrink / 100, null);
  return G.gradeStaffing({ r, guards: [], valid: G.modelValidity(aht, 30), cost: G.staffingCost(r.sched, 0, 0), shipped: P0, vol, aht, shrink, railOrigin: null, pulled });
};
const own = { vol: P0.volume + 7, aht: P0.aht + 13, shrink: Math.round(P0.shrink * 100) + 3 };
ok("control: own entries grade the operating stream Planning-grade", grade(own.vol, own.aht, own.shrink, {}).opsGrade === "Planning-grade");
ok("a Directional pulled handle time holds the operating stream Directional", grade(own.vol, own.aht, own.shrink, { aht: { value: own.aht, origin: "Directional", toolName: "AHT Decomposition" } }).opsGrade === "Directional");
ok("a Planning-grade pulled shrinkage lets it stand at Planning-grade", grade(own.vol, own.aht, own.shrink, { shrink: { value: own.shrink, origin: "Planning-grade", toolName: "Shrinkage Planner" } }).opsGrade === "Planning-grade");
ok("a pulled value with no origin grades Directional", grade(own.vol, own.aht, own.shrink, { aht: { value: own.aht, origin: null, toolName: "TCO Calculator" } }).opsGrade === "Directional");
ok("a Finance-grade origin never lifts the stream above Planning-grade", ["Planning-grade", "Directional"].includes(grade(own.vol, own.aht, own.shrink, { aht: { value: own.aht, origin: "Finance-grade", toolName: "x" } }).opsGrade));
ok("once the field is edited away from the pulled value, it grades as the user's entry", grade(own.vol, own.aht, own.shrink, { aht: { value: own.aht + 1, origin: "Directional", toolName: "AHT Decomposition" } }).opsGrade === "Planning-grade");
ok("a pulled value that happens to equal the profile grades by its origin, never as the profile", grade(own.vol, P0.aht, own.shrink, { aht: { value: P0.aht, origin: "Planning-grade", toolName: "AHT Decomposition" } }).opsGrade === "Planning-grade");
ok("the reason names the source tool and its origin", /handle time came from AHT Decomposition with an origin grade of Directional/i.test(grade(own.vol, own.aht, own.shrink, { aht: { value: own.aht, origin: "Directional", toolName: "AHT Decomposition" } }).gradeObj.reasons.evidence));
ok("with nothing pulled, grading is exactly as before (control over 2,000 cases)", (() => { let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }; for (let i = 0; i < 2000; i++) { const vol = 20 + Math.floor(rnd() * 400), aht = 60 + Math.floor(rnd() * 600), shrink = Math.floor(rnd() * 50); const g1 = grade(vol, aht, shrink, {}), g0 = grade(vol, aht, shrink, undefined); if (g1.opsGrade !== g0.opsGrade || JSON.stringify(g1.gradeObj) !== JSON.stringify(g0.gradeObj)) return false; } return true; })());

section("4. Staffing reads the rail once, and a scenario link outranks it");
const mount = STF.slice(STF.indexOf("  useEffect(() => {\n    const sc = readScenario(TOOL_ID, DEFAULTS);"), STF.indexOf("  const apply = (k) =>"));
ok("the mount effect returns before any pull when a scenario link opens", /if \(sc\) \{[\s\S]*clearScenarioParam\(\);\s*return;\s*\}/.test(mount) && mount.indexOf("return;") < mount.indexOf("getExternalWithSource"));
ok("the three pulls use string literal keys and refuse self-reads", ['getExternalWithSource("aht", "staffing-calculator")', 'getExternalWithSource("shrinkage", "staffing-calculator")', 'getExternalWithSource("occupancyCap", "staffing-calculator")'].every((k) => mount.includes(k)));
ok("the effect runs once, at mount", /\n  \}, \[\]\);\s*$/.test(mount));
ok("shrinkage and the ceiling are read as fractions and shown as percent; out-of-range values are ignored", /shrinkRes\.value >= 0 && shrinkRes\.value < 1/.test(mount) && /capRes\.value > 0 && capRes\.value <= 1/.test(mount) && /\* 100\)\.toFixed\(2\)/.test(mount));
ok("each pulled field is badged and names its source until edited", /pulled=\{!!ahtFrom\}/.test(STF) && /pulled=\{!!shrinkFrom\}/.test(STF) && /pulled=\{!!capFrom\}/.test(STF) && /pulled\[key\]\.value === val \? `From \$\{pulled\[key\]\.toolName\}/.test(STF));
ok("the PDF names the source of pulled handle time and shrinkage", /\$\{ahtFrom \? `, from \$\{pulled\.aht\.toolName\}` : ""\}/.test(STF) && /\$\{shrinkFrom \? `, from \$\{pulled\.shrink\.toolName\}` : ""\}/.test(STF));

section("5. Staffing's solver starts at floor(A) + 1: A/B on 20,000 queues");
const oldCalc = new Function("benchmark", "BENCH", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "createGuards",
  `${full.replace("const minN = Math.floor(A) + 1;", "const minN = Math.ceil(A) + 1;")}\nreturn { calc };`)(benchmark, BENCH, emitGrades, voidResult, isVoid, railEvidence, weakerStream, createGuards).calc;
ok("the start line is present and the old one is gone", full.includes("const minN = Math.floor(A) + 1;") && !full.includes("Math.ceil(A) + 1"));
let seed = 20260929, differ = 0, clean = true;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
for (let i = 0; i < 20000; i++) {
  const vol = 1 + Math.floor(rnd() * 800), aht = 30 + Math.floor(rnd() * 900), intv = [15, 30, 60][Math.floor(rnd() * 3)], slT = 0.2 + rnd() * 0.75, slS = [5, 10, 20, 60, 180][Math.floor(rnd() * 5)];
  const n = G.calc(vol, aht, intv, slT, slS, 0.3, null), o = oldCalc(vol, aht, intv, slT, slS, 0.3, null);
  if (n.raw === o.raw) continue;
  differ++;
  if (!(n.raw === Math.floor(n.A) + 1 && o.raw === n.raw + 1 && n.A % 1 !== 0 && n.sl >= slT && n.met)) clean = false;
}
ok(`20,000 queues: the new start differs in ${differ} cases, each a fractional load where floor(A) + 1 already meets the target and the old start answered one more`, clean && differ > 0);
ok("an integer load is unchanged: floor(A) + 1 equals ceil(A) + 1", G.calc(100, 360, 30, 0.8, 20, 0.3, null).raw === oldCalc(100, 360, 30, 0.8, 20, 0.3, null).raw);

section("6. House rules");
ok("no dash in the touched files", [AHT, SHR, OCC, STF].every((s2) => !DASH.test(s2)));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
