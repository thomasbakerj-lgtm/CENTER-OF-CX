// Rail contract verification. Run from repo root: node rail.test.mjs
// Shim sessionStorage so the real module runs unmodified.
const mem = new Map();
globalThis.window = {
  sessionStorage: {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
  },
};
globalThis.__COC_RAIL_DEBUG__ = false; // keep console clean; flip to true to see warnings

const { publishToolResult, getPrimitive, getPrimitiveWithSource, railReport, resetRail } =
  await import("./src/lib/toolData.js");
const { normalizeForPublish, resolveKey } = await import("./src/lib/metrics.js");

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = Object.is(got, want) || (typeof got === "number" && typeof want === "number" && Math.abs(got - want) < 1e-9);
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n        got ${JSON.stringify(got)}  want ${JSON.stringify(want)}`}`);
};
const truthy = (name, got) => { got ? pass++ : fail++; console.log(`${got ? "PASS" : "FAIL"}  ${name}`); };

// ---------------------------------------------------------------- 1. Alias, write side
resetRail();
publishToolResult("cost-per-contact", { marginalCPC: 4.2 });
eq("A1  publishing marginalCPC writes canonical marginalPerContact", getPrimitive("marginalPerContact"), 4.2);
eq("A2  the deprecated key still reads back", getPrimitive("marginalCPC"), 4.2);
eq("A3  resolveKey rewrites loadedCPC to costPerContact", resolveKey("loadedCPC"), "costPerContact");

// ---------------------------------------------------------------- 2. Alias, read side
resetRail();
publishToolResult("cost-per-contact", { costPerContact: 11.0 });
eq("A4  FCR's getPrimitive('loadedCPC') now finds the published loaded cost", getPrimitive("loadedCPC"), 11.0);

// ---------------------------------------------------------------- 3. Canonical wins on collision
resetRail();
publishToolResult("x", { marginalCPC: 9.9, marginalPerContact: 4.2 });
eq("A5  canonical key wins when both spellings are published", getPrimitive("marginalPerContact"), 4.2);
resetRail();
publishToolResult("x", { marginalPerContact: 4.2, marginalCPC: 9.9 });
eq("A6  canonical wins regardless of key order", getPrimitive("marginalPerContact"), 4.2);

// ---------------------------------------------------------------- 4. Derivation
resetRail();
publishToolResult("fcr-leakage", { monthlyContacts: 300000 });
eq("B1  annualContacts derives from monthlyContacts", getPrimitive("annualContacts"), 3600000);
truthy("B2  a derived pull is flagged as derived", getPrimitiveWithSource("annualContacts").derived);
resetRail();
publishToolResult("tco-calculator", { annualContacts: 3600000 });
eq("B3  monthlyContacts derives from annualContacts", getPrimitive("monthlyContacts"), 300000);
truthy("B4  no orphan recorded when a pull is satisfied by derivation", railReport().orphanPulls.length === 0);

// ---------------------------------------------------------------- 5. Unit contract at the door
resetRail();
const r1 = publishToolResult("ai-deflection", { realisticDeflectionRate: 32 }); // the percent bug
eq("C1  a percent published as a rate is auto-corrected at the door", getPrimitive("realisticDeflectionRate"), 0.32);
truthy("C2  and the source tool is named in a flag", r1.flags.some((f) => f.includes("ai-deflection")));

resetRail();
publishToolResult("ai-deflection", { realisticDeflectionRate: 0.32 });
eq("C3  a correctly published fraction is untouched", getPrimitive("realisticDeflectionRate"), 0.32);

resetRail();
const r2 = publishToolResult("ai-deflection", { realisticDeflectionRate: -0.05 }); // bot creates net demand
eq("C4  a negative deflection rate never travels", getPrimitive("realisticDeflectionRate"), undefined);
truthy("C5  and it is reported rather than silently dropped", r2.flags.length === 1);

// ---------------------------------------------------------------- 6. Rates that legitimately exceed 1
resetRail();
publishToolResult("attrition-cost", { attritionRate: 1.2 });
eq("D1  120% annual attrition survives the rail (v1 destroyed this: 1.2 -> 0.012)", getPrimitive("attritionRate"), 1.2);

resetRail();
publishToolResult("attrition-cost", { attritionRate: 120 });
eq("D2  attrition published as a percent is still corrected", getPrimitive("attritionRate"), 1.2);

resetRail();
publishToolResult("staffing-calculator", { occupancy: 1.05 });
eq("D3  105% occupancy survives (understaffing signal, v1 destroyed it)", getPrimitive("occupancy"), 1.05);

resetRail();
publishToolResult("staffing-calculator", { occupancy: 105 });
eq("D4  occupancy published as a percent is corrected", getPrimitive("occupancy"), 1.05);

resetRail();
publishToolResult("x", { fcr: 80 });
eq("D5  FCR ceiling stays at 1.0 (the original bug this module was built for)", getPrimitive("fcr"), 0.8);

resetRail();
const r3 = publishToolResult("x", { fcr: 250 });
eq("D6  a rate above 100 is invalid and never travels", getPrimitive("fcr"), undefined);
truthy("D7  and is flagged", r3.flags.length === 1);

// ---------------------------------------------------------------- 7. Zero and false survive
resetRail();
publishToolResult("x", { agents: 0, capacityAction: "none", occupancyCapped: false });
eq("E1  a published zero is not stripped", getPrimitive("agents"), 0);
eq("E2  an enum passes through untouched", getPrimitive("capacityAction"), "none");
eq("E3  a published false is not stripped", getPrimitive("occupancyCapped"), false);

// ---------------------------------------------------------------- 8. Provenance
resetRail();
publishToolResult("cost-per-contact", { capacityAction: "overtime" });
publishToolResult("channel-shift", { capacityAction: "hiring" });
eq("F1  last writer wins on a colliding key (unchanged behavior)", getPrimitive("capacityAction"), "hiring");
eq("F2  but the puller can now name who wrote it", getPrimitiveWithSource("capacityAction").sourceTool, "channel-shift");
eq("F3  and can still read a specific tool's own record", (await import("./src/lib/toolData.js")).getToolResult("cost-per-contact").capacityAction, "overtime");

// ---------------------------------------------------------------- 9. Orphan pull detection
resetRail();
eq("G1  an unpublished key returns undefined", getPrimitive("agentHourly"), undefined);
truthy("G2  and is recorded as an orphan pull", railReport().orphanPulls.includes("agentHourly"));
truthy("G3  railReport is the lock gate: orphanPulls must be empty", railReport().orphanPulls.length === 1);

// ---------------------------------------------------------------- 10. Idempotence
const once = normalizeForPublish({ fcr: 80, marginalCPC: 4.2, agents: 12.6 }, { sourceTool: "t" }).clean;
const twice = normalizeForPublish(once, { sourceTool: "t" }).clean;
eq("H1  normalizeForPublish is idempotent (fcr)", twice.fcr, once.fcr);
eq("H2  normalizeForPublish is idempotent (alias)", twice.marginalPerContact, 4.2);
eq("H3  counts round once and stay put", twice.agents, 13);

// ---------------------------------------------------------------- 11. The two live regressions
// Channel Shift's confidence gate: sourced = pulled.monthlyContacts && pulled.hourlyRate
resetRail();
publishToolResult("cost-per-contact", { costPerContact: 11.0, fcr: 0.75 }); // today's CPC publish payload
const beforeM = getPrimitive("monthlyContacts"), beforeH = getPrimitive("agentHourly");
truthy("I1  BEFORE the fix: Channel Shift's `sourced` gate is unreachable", !(beforeM != null && beforeH != null));

resetRail();
publishToolResult("cost-per-contact", { costPerContact: 11.0, fcr: 0.75, monthlyContacts: 300000, agentHourly: 22.5, marginalPerContact: 6.5 });
const afterM = getPrimitive("monthlyContacts"), afterH = getPrimitive("agentHourly");
truthy("I2  AFTER the fix: `sourced` is reachable, so Finance-grade and `validated` are live", afterM != null && afterH != null);
eq("I3  AI Deflection now receives a real marginal cost, not a default", getPrimitive("marginalPerContact"), 6.5);
eq("I4  and its loaded cost still arrives", getPrimitive("costPerContact"), 11.0);
truthy("I5  Channel Shift's annualContacts fallback is now live via derivation", getPrimitive("annualContacts") === 3600000);
truthy("I6  zero orphan pulls across the CPC -> AI Deflection -> Channel Shift chain", railReport().orphanPulls.length === 0);

// ---------------------------------------------------------------- 12. Self-credentialing
const { getExternalPrimitive, sourcedExternally, getToolResult } = await import("./src/lib/toolData.js");
resetRail();
publishToolResult("cost-per-contact", { costPerContact: 7.0, marginalPerContact: 4.2, monthlyContacts: 250000 });
eq("J1  CPC re-reads its own costPerContact via getPrimitive (auto-fill: fine)", getPrimitive("costPerContact"), 7.0);
eq("J2  but getExternalPrimitive refuses it (confidence: not fine)", getExternalPrimitive("costPerContact", "cost-per-contact"), undefined);
truthy("J3  CPC's `sourced` gate is FALSE against its own prior run", !sourcedExternally(["monthlyContacts", "costPerContact", "marginalPerContact"], "cost-per-contact"));

publishToolResult("fcr-leakage", { marginalPerContact: 6.5, monthlyContacts: 300000 });
truthy("J4  still false: costPerContact is still self-published", !sourcedExternally(["monthlyContacts", "costPerContact", "marginalPerContact"], "cost-per-contact"));
truthy("J5  Channel Shift, a different tool, IS externally sourced by the same rail", sourcedExternally(["monthlyContacts", "marginalPerContact"], "channel-shift"));

// ---------------------------------------------------------------- 13. Derived provenance
resetRail();
publishToolResult("fcr-leakage", { monthlyContacts: 300000 });
eq("K1  a derived annualContacts names the tool that published its source", getPrimitiveWithSource("annualContacts").sourceTool, "fcr-leakage");
eq("K2  and getExternalPrimitive respects derivation provenance", getExternalPrimitive("annualContacts", "fcr-leakage"), undefined);
eq("K3  while another tool may use it", getExternalPrimitive("annualContacts", "tco-calculator"), 3600000);

// ---------------------------------------------------------------- 14. TCO attrition feed
/* TCOCalculator pulled `attrition` for its Annual Attrition field. No tool publishes that key,
   so the field never prefilled. The Attrition Cost Calculator publishes attritionRate. */
{
  const { readFileSync } = await import("fs");
  const { getExternalPrimitive: gx } = await import("./src/lib/toolData.js");
  const tco = readFileSync("TCOCalculator.jsx", "utf8");
  const mapLine = (tco.match(/const got = \{[\s\S]*?\};/) || [""])[0];
  truthy("L1  TCO pull map routes the attrition field to attritionRate", /attrition:\s*ext\(getExternalWithSource\("attritionRate", TOOL_ID\)\)/.test(mapLine));
  truthy("L2  TCO pull map no longer names the unpublished key attrition", !/\("attrition"/.test(mapLine));
  resetRail();
  publishToolResult("attrition-cost", normalizeForPublish({ agents: 180, attritionRate: 1.2 }, { sourceTool: "attrition-cost" }).clean);
  eq("L3  a 120 percent attrition from the Attrition Calculator reaches TCO intact", gx("attritionRate", "tco-calculator"), 1.2);
  eq("L4  the old key finds nothing", gx("attrition", "tco-calculator"), undefined);
  truthy("L5  and the old key is recorded as an orphan", railReport().orphanPulls.includes("attrition"));
  resetRail();
  publishToolResult("tco-calculator", normalizeForPublish({ attritionRate: 0.4 }, { sourceTool: "tco-calculator" }).clean);
  eq("L6  TCO cannot prefill attrition from its own prior publish", gx("attritionRate", "tco-calculator"), undefined);
  const { getExternalWithSource: gws } = await import("./src/lib/toolData.js");
  eq("L7  getExternalWithSource refuses the caller's own publish", gws("attritionRate", "tco-calculator"), null);
  resetRail();
  publishToolResult("attrition-cost", normalizeForPublish({ attritionRate: 0.5 }, { sourceTool: "attrition-cost" }).clean);
  const w = gws("attritionRate", "tco-calculator");
  truthy("L8  and returns another tool's value with its publisher", !!w && w.value === 0.5 && w.sourceTool === "attrition-cost");
  eq("L9  and returns null when the rail has nothing", gws("nothingHere", "tco-calculator"), null);
  resetRail();
}

// ---------------------------------------------------------------- 15. Audit dead-pull rules, mutation tested
/* Each mutant runs the real rail-audit.mjs against a scratch copy of every file it scans.
   A rule that cannot fail on its own defect is not a rule. */
{
  const fs = await import("fs");
  const { join } = await import("path");
  const { tmpdir } = await import("os");
  const { spawnSync } = await import("child_process");
  const AUDIT = fs.readFileSync("rail-audit.mjs", "utf8");
  const base = new Map();
  for (const f of fs.readdirSync(".")) if (f.endsWith(".jsx") || f === "index.html") base.set(f, fs.readFileSync(f, "utf8"));
  for (const f of fs.readdirSync("src/lib")) if (f.endsWith(".js")) base.set(join("src/lib", f), fs.readFileSync(join("src/lib", f), "utf8"));
  const run = (edits = {}, audit = AUDIT) => {
    const dir = fs.mkdtempSync(join(tmpdir(), "railaudit-"));
    fs.mkdirSync(join(dir, "src/lib"), { recursive: true });
    try { for (const [p, src] of base) fs.writeFileSync(join(dir, p), p in edits ? edits[p](src) : src); }
    catch (e) { fs.rmSync(dir, { recursive: true, force: true }); return { code: -1, out: String(e) }; }
    fs.writeFileSync(join(dir, "rail-audit.mjs"), audit);
    const r = spawnSync(process.execPath, ["rail-audit.mjs"], { cwd: dir, encoding: "utf8" });
    fs.rmSync(dir, { recursive: true, force: true });
    return { code: r.status, out: r.stdout || "" };
  };
  const sub = (a, b) => (src) => { if (src.split(a).length !== 2) throw new Error(`mutant anchor count != 1: ${a}`); return src.replace(a, b); };

  const b0 = run();
  eq("M1  baseline audit exits clean", b0.code, 0);
  truthy("M2  TCO variable-map pulls enter the consumed contract", /attritionRate\s+pulled by 2/.test(b0.out) && /shrinkage\s+pulled by 1/.test(b0.out));
  truthy("M2b occupancy is published by Staffing and pulled by no tool", !/\n\s+occupancy\s+pulled by/.test(b0.out));
  truthy("M3  a shorthand publish (Staffing aht) is read as a publisher", /aht\s+pulled by \d+\s+<-\s+published by StaffingCalculator\.jsx/.test(b0.out));

  const m1 = run({ "TCOCalculator.jsx": sub('getExternalWithSource("attritionRate", TOOL_ID)', 'getExternalWithSource("attrition", TOOL_ID)') });
  truthy("M4  reverting TCO to the dead attrition key fails the audit", m1.code > 0);
  truthy("M5  and names attrition as an orphan pulled by TCO", /\n  attrition\s+\[NOT IN REGISTRY[^\n]*\n\s+pulled by: TCOCalculator\.jsx/.test(m1.out));

  const blind = AUDIT.replace("function variablePulls(src) {", "function variablePulls(src) { return { resolved: new Set(), unresolved: new Set(), external: new Set() };");
  const m1b = run({ "TCOCalculator.jsx": sub('getExternalWithSource("attritionRate", TOOL_ID)', 'getExternalWithSource(ATTR, TOOL_ID)') });
  truthy("M6b an unreadable getExternalWithSource key fails as unresolved", m1b.code > 0 && /TCOCalculator\.jsx\s+getExternalWithSource\(ATTR\)/.test(m1b.out));
  eq("M6  control: without variable-pull resolution the same defect passes silently", run({ "TCOCalculator.jsx": sub('getExternalWithSource("attritionRate", TOOL_ID)', 'getExternalWithSource(ATTR, TOOL_ID)') }, blind).code, 0);

  const m2 = run({ "TCOCalculator.jsx": sub('getExternalWithSource("aht", TOOL_ID)', 'getExternalWithSource(pick("aht"), TOOL_ID)') });
  truthy("M7  a getter keyed by an unreadable expression fails as unresolved", m2.code > 0 && /TCOCalculator\.jsx\s+getExternalWithSource\(pick\("aht"\)\)/.test(m2.out));
  const m3 = run({ "BusinessCaseBuilder.jsx": sub('take("currentAHT", "aht");', 'take("currentAHT", ahtKey);') });
  truthy("M8  a wrapper call site with a non-literal key fails as unresolved", m3.code > 0 && /BusinessCaseBuilder\.jsx\s+getExternalPrimitive\(key\)/.test(m3.out));
  const m4 = run({ "TCOCalculator.jsx": sub("const next = {}; const got = {};", "const next = {}; const got = {}; const lone = zed; getExternalPrimitive(lone, \"tco-calculator\");") });
  truthy("M9  a bare variable pull with no map and no wrapper fails as unresolved", m4.code > 0 && /TCOCalculator\.jsx\s+getExternalPrimitive\(lone\)/.test(m4.out));

  const m5 = run({ "StaffingCalculator.jsx": sub("volume: vol, intervalMin: intv, aht, shrinkage", "volume: vol, intervalMin: intv, shrinkage") });
  truthy("M10 removing the only external aht publisher flags TCO as self-fed", m5.code > 0 && /aht\s+pulled by TCOCalculator\.jsx, which is its only publisher/.test(m5.out));
  const noShort = AUDIT.replace("else if (d === 0 && c === \",\") { shorthand(seg, k); seg = k + 1; }", "else if (d === 0 && c === \",\") { seg = k + 1; }");
  const m6 = run({}, noShort);
  truthy("M11 without shorthand reading, Staffing's aht vanishes and the self-fed rule catches it", m6.code > 0 && /aht\s+pulled by TCOCalculator\.jsx, which is its only publisher/.test(m6.out));
}

// ------------------------------------------------- 13. Origin grades and provenance (v3)
{
  const origin = (k) => railReport().origins[k] || null;

  resetRail();
  publishToolResult("tco-calculator", { agents: 200, costPerContact: 8.4 },
    { agents: "Planning-grade", costPerContact: "Directional" });
  eq("N1  a published origin grade reads back on the key", origin("agents"), "Planning-grade");
  eq("N2  each key keeps its own grade", origin("costPerContact"), "Directional");
  eq("N3  getPrimitiveWithSource returns the origin grade", getPrimitiveWithSource("agents").railOrigin, "Planning-grade");
  eq("N4  and still names the publisher", getPrimitiveWithSource("agents").sourceTool, "tco-calculator");

  resetRail();
  publishToolResult("x", { agents: 200 });
  eq("N5  publishing with no grades records no origin", origin("agents"), null);
  eq("N6  an unrecorded origin reads back as null, never as a grade", getPrimitiveWithSource("agents").railOrigin, null);

  resetRail();
  publishToolResult("x", { agents: 200 }, { agents: "Gold-plated" });
  eq("N7  a value outside the three grades is dropped, not trusted", origin("agents"), null);

  resetRail();
  publishToolResult("cost-per-contact", { marginalCPC: 4.2 }, { marginalCPC: "Planning-grade" });
  eq("N8  an origin keyed by a deprecated alias grades the canonical key", origin("marginalPerContact"), "Planning-grade");

  // Provenance does not transfer on an unchanged restatement.
  resetRail();
  publishToolResult("tco-calculator", { agents: 200 }, { agents: "Directional" });
  publishToolResult("staffing-calculator", { agents: 200 }, { agents: "Finance-grade" });
  eq("N9  restating a value unchanged leaves the producer with the key", railReport().sources.agents, "tco-calculator");
  eq("N10 and the original origin grade survives the restatement", origin("agents"), "Directional");
  eq("N11 a republish cannot launder a weak origin into a strong one", getPrimitiveWithSource("agents").railOrigin, "Directional");

  // An edited figure is a new fact. The editing tool becomes the producer.
  resetRail();
  publishToolResult("tco-calculator", { agents: 200 }, { agents: "Directional" });
  publishToolResult("staffing-calculator", { agents: 212 }, { agents: "Planning-grade" });
  eq("N12 an edited value transfers the key to the tool that changed it", railReport().sources.agents, "staffing-calculator");
  eq("N13 and carries the new origin grade", origin("agents"), "Planning-grade");
  eq("N14 and the new number is what every puller reads", getPrimitive("agents"), 212);

  // A tool republishing its own key is not a restatement by someone else.
  resetRail();
  publishToolResult("tco-calculator", { agents: 200 }, { agents: "Directional" });
  publishToolResult("tco-calculator", { agents: 200 }, { agents: "Planning-grade" });
  eq("N15 a producer may regrade its own key", origin("agents"), "Planning-grade");

  // Dropping the grade on a re-publish clears the stale one rather than keeping it.
  resetRail();
  publishToolResult("tco-calculator", { agents: 200 }, { agents: "Finance-grade" });
  publishToolResult("tco-calculator", { agents: 205 });
  eq("N16 a regraded publish with no grade clears the stale origin", origin("agents"), null);

  // Derived reads inherit the origin of the key they were derived from.
  resetRail();
  publishToolResult("tco-calculator", { monthlyContacts: 120000 }, { monthlyContacts: "Planning-grade" });
  const der = getPrimitiveWithSource("annualContacts");
  truthy("N17 a derived read is still derived", der.derived === true);
  eq("N18 and inherits the origin of the key behind it", der.railOrigin, "Planning-grade");
}

// ------------------------------------------------- 14. The shipped tools read the origin
{
  const fs = await import("node:fs");
  const has = (f, re) => re.test(fs.readFileSync(f, "utf8"));
  const consumers = ["TCOCalculator.jsx", "CostPerContactCalculator.jsx", "ChannelShiftModel.jsx",
    "FCRLeakageDiagnostic.jsx", "AIDeflectionRealityCheck.jsx"];
  for (const f of consumers) {
    truthy(`N19 ${f} carries railOrigin into its prefill record`, has(f, /railOrigin \|\| null/));
    truthy(`N20 ${f} grades the rail per field, not by one blanket origin`, has(f, /railGradeOf/) && !has(f, /const railG = railEvidence/));
  }
  truthy("N21 Staffing grades its cost basis off the key that fed it", has("StaffingCalculator.jsx", /railOrigin: costOrigin/));
  truthy("N22 TCO publishes an origin grade with its rail keys", has("TCOCalculator.jsx", /publishToolResult\("tco-calculator", normalizeForPublish\(primitives, \{ sourceTool: "tco-calculator" \}\)\.clean, originsOut\)/));
  truthy("N23 a voided TCO run publishes no origin grades", has("TCOCalculator.jsx", /if \(!G\.voided\) \{/));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
