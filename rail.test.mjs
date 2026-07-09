// Rail contract verification. Run: node test/rail.test.mjs
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
  await import("../src/lib/toolData.js");
const { normalizeForPublish, resolveKey } = await import("../src/lib/metrics.js");

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
eq("F3  and can still read a specific tool's own record", (await import("../src/lib/toolData.js")).getToolResult("cost-per-contact").capacityAction, "overtime");

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
const { getExternalPrimitive, sourcedExternally, getToolResult } = await import("../src/lib/toolData.js");
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
