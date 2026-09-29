import { useState, useEffect, useRef } from "react";
import { HowOthersReport } from "./src/lib/HowOthersReport.jsx";
import ReportActions from "./ReportActions";
import { METHOD_VERSIONS } from "./src/lib/methodVersions";
import { FONT, FONT_IMPORT_CSS, TYPE, NUM } from "./src/lib/type";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { COLORS, BENCH, benchmark, benchmarksForTool } from "./src/lib/benchmarks";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
import { normalizeForPublish } from "./src/lib/metrics";
import { trackTool, severityBucket } from "./src/lib/track";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { createGuards, guardVal, guardLine } from "./src/lib/guards";
import { emitGrades, voidResult, railEvidence, weakerStream } from "./src/lib/confidence";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, Button, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const TOOL_ID = "tco-calculator";
const ROUTE = "/tools/tco-calculator";
const METHODOLOGY_VERSION = METHOD_VERSIONS[TOOL_ID].version;


function LogoMark({ size = 34, light = true }) {
  const arcColor = light ? "#fff" : NAVY, xColor = light ? LIGHT : ELECTRIC;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <g transform="translate(60,60)">
        <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" opacity={light ? 0.6 : 0.3}/>
        <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={arcColor} strokeWidth="3.2" strokeLinecap="round" opacity={light ? 0.8 : 0.5}/>
        <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="-14" y1="-14" x2="14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="14" y1="-14" x2="-14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

/* @engine-start
   Everything between these markers is the TCO engine and the only things it
   closes over besides the imported BENCH, createGuards, guardVal and guardLine.
   tco.test.mjs and tco.report.mjs slice this exact region out of this exact file
   at runtime and evaluate it, so the tested engine and the shipped engine cannot
   drift apart. Nothing in here is JSX. */
const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmt = (v) => "$" + Math.round(n(v)).toLocaleString();
const fmtK = (v) => { const x = n(v); return x >= 1000000 ? "$" + (x / 1000000).toFixed(1) + "M" : x >= 1000 ? "$" + (x / 1000).toFixed(0) + "K" : "$" + Math.round(x).toLocaleString(); };
const pct = (v) => (n(v) * 100).toFixed(1) + "%";
const pct0 = (v) => Math.round(n(v) * 100) + "%";
const pctD = (v) => (n(v) * 100).toFixed(1).replace(/\.0$/, "") + "%";
const mmss = (s) => `${Math.floor(n(s) / 60)}:${String(Math.round(n(s) % 60)).padStart(2, "0")}`;

const INDUSTRY = {
  general: { label: "Cross-Industry Average", agents: 200, agentHourly: benchmark("market.wage.agent"), monthlyContacts: 120000, aht: 390, fcr: 0.70, containment: 0.28, occupancy: 0.82, shrinkage: 0.30, attrition: 0.40, absenteeism: 0.08, channelMixVoice: 0.55, channelMixChat: 0.25, channelMixEmail: 0.12, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 4.1, nps: 32, transferRate: 0.15, acw: 45, ccaasSeat: 150, targetAht: 345, targetFcr: 0.76, targetContainment: 0.36, targetAttrition: 0.32 },
  financial: { label: "Financial Services", agents: 350, agentHourly: benchmark("tco.wage.financial"), monthlyContacts: 180000, aht: 360, fcr: 0.74, containment: 0.25, occupancy: 0.80, shrinkage: 0.28, attrition: 0.30, absenteeism: 0.07, channelMixVoice: 0.50, channelMixChat: 0.28, channelMixEmail: 0.14, channelMixSocial: 0.04, channelMixSelfServe: 0.04, csat: 4.0, nps: 35, transferRate: 0.12, acw: 60, ccaasSeat: 175, targetAht: 315, targetFcr: 0.8, targetContainment: 0.33, targetAttrition: 0.22 },
  healthcare: { label: "Healthcare", agents: 250, agentHourly: benchmark("tco.wage.healthcare"), monthlyContacts: 140000, aht: 450, fcr: 0.71, containment: 0.18, occupancy: 0.78, shrinkage: 0.32, attrition: 0.33, absenteeism: 0.09, channelMixVoice: 0.62, channelMixChat: 0.20, channelMixEmail: 0.12, channelMixSocial: 0.03, channelMixSelfServe: 0.03, csat: 3.9, nps: 28, transferRate: 0.18, acw: 75, ccaasSeat: 165, targetAht: 395, targetFcr: 0.77, targetContainment: 0.26, targetAttrition: 0.25 },
  retail: { label: "Retail & eCommerce", agents: 180, agentHourly: benchmark("tco.wage.retail"), monthlyContacts: 150000, aht: 300, fcr: 0.78, containment: 0.32, occupancy: 0.84, shrinkage: 0.32, attrition: 0.45, absenteeism: 0.10, channelMixVoice: 0.40, channelMixChat: 0.32, channelMixEmail: 0.15, channelMixSocial: 0.08, channelMixSelfServe: 0.05, csat: 4.2, nps: 38, transferRate: 0.14, acw: 40, ccaasSeat: 135, targetAht: 265, targetFcr: 0.84, targetContainment: 0.4, targetAttrition: 0.37 },
  telecom: { label: "Telecommunications", agents: 400, agentHourly: benchmark("tco.wage.telecom"), monthlyContacts: 250000, aht: 510, fcr: 0.66, containment: 0.25, occupancy: 0.85, shrinkage: 0.30, attrition: 0.40, absenteeism: 0.08, channelMixVoice: 0.52, channelMixChat: 0.26, channelMixEmail: 0.12, channelMixSocial: 0.06, channelMixSelfServe: 0.04, csat: 3.8, nps: 22, transferRate: 0.20, acw: 60, ccaasSeat: 155, targetAht: 450, targetFcr: 0.72, targetContainment: 0.33, targetAttrition: 0.32 },
  insurance: { label: "Insurance", agents: 300, agentHourly: benchmark("tco.wage.insurance"), monthlyContacts: 100000, aht: 510, fcr: 0.70, containment: 0.16, occupancy: 0.78, shrinkage: 0.28, attrition: 0.27, absenteeism: 0.06, channelMixVoice: 0.60, channelMixChat: 0.22, channelMixEmail: 0.13, channelMixSocial: 0.03, channelMixSelfServe: 0.02, csat: 4.0, nps: 30, transferRate: 0.16, acw: 75, ccaasSeat: 170, targetAht: 450, targetFcr: 0.76, targetContainment: 0.24, targetAttrition: 0.19 },
  bpo: { label: "BPO / Outsourcer", agents: 500, agentHourly: benchmark("tco.wage.bpo"), monthlyContacts: 300000, aht: 390, fcr: 0.68, containment: 0.28, occupancy: 0.86, shrinkage: 0.34, attrition: 0.55, absenteeism: 0.12, channelMixVoice: 0.58, channelMixChat: 0.24, channelMixEmail: 0.10, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 3.9, nps: 25, transferRate: 0.17, acw: 50, ccaasSeat: 120, targetAht: 345, targetFcr: 0.74, targetContainment: 0.36, targetAttrition: 0.47 },
};

/* Shown in-tool and in the report. Built from the registry rather than written by hand,
   so the tool can never claim a source it does not hold. The previous paragraph named
   three vendors for a containment range this tool does not model, and cited BLS for a $19
   wage that is not the BLS figure. Both claims are retired. What the tool ships now is a
   sourced list for its market entries and a plain statement that everything else is an
   internal planning value. */
const TCO_SHARED_IDS = ["load.benefits", "load.marginal", "market.wage.agent"];
const BENCHMARK_SOURCES = (() => {
  const mine = benchmarksForTool("tco-calculator");
  const shared = benchmarksForTool("shared").filter((e) => TCO_SHARED_IDS.includes(e.id));
  const market = [...mine, ...shared].filter((e) => e.kind === "market");
  const name = (e) => e.label || e.id;
  const shown = (e) => e.display || `${e.value} ${e.unit}`;
  const sourced = market.map((e) => `${name(e)}, ${shown(e)}, from ${e.source}`).join(" ");
  return `Sourced figures in this tool: ${sourced} Every other constant this tool ships is an internal planning value set by ContactCenterCX, not a published benchmark: the industry profiles (apart from the BLS wages named above), the salaried load of ${benchmark("tco.load.salaried")}x, the license renewal uplift of ${pctD(benchmark("tco.escalator.license"))}, and the plausibility checks. They exist so the tool opens on a runnable case. Any field still sitting at one grades Directional and is named as a preset in the confidence rationale. Replace them with your own figures, quotes or invoices before citing any number here.`;
})();

const BASE = { supervisors: 20, qaStaff: 5, wfmStaff: 4, trainers: 3, itSupport: 4, sites: 2, agentBenefitsPct: benchmark("load.benefits") - 1, supHourly: 30, qaHourly: 28, wfmHourly: 32, trainerHourly: 26, itHourly: 35, scheduleAdherence: 0.90, avgSpeedAnswer: 28, abandonRate: 0.06, avgHoldTime: 45, newHireTrainingDays: 21, qualityScore: 0.82, wemSeat: 45, telephonyPerMin: 0.025, ivaMonthly: 8000, agentAssistMonthly: 5000, rpaMonthly: 3000, analyticsMonthly: 6000, crmSeat: 75, ipaasMonthly: 4000, recordingMonthly: 3500, knowledgeMgmt: 2500, securityCompliance: 3000, cloudInfra: 5000, psAmortized: 8000, recruitingCostPerHire: 3500, facilitiesCost: 12000, implementationOneTime: 0, wageEscalatorPct: benchmark("tco.escalator.wage"), licenseEscalatorPct: benchmark("tco.escalator.license"), blendedEscalatorPct: benchmark("tco.escalator.blended"), useSingleEscalator: false, targetContainment: 0.30, targetFcr: 0.78, targetAht: 420, targetAttrition: 0.30, costBasis: "estimate" };

// Optimization realization confidence: how much freed capacity converts to real savings.
// "none" is first-class so the tool can honestly report $0 realized when nothing is committed.
const STANCE = {
  none: { label: "None", f: 0.00, note: "No capacity action committed yet. The freed capacity exists, and $0 is booked until you act on it." },
  conservative: { label: "Conservative", f: 0.50, note: "Books only savings you can commit to: half the value of freed capacity." },
  expected: { label: "Expected", f: 0.70, note: "A realistic share of freed capacity turned into cash. A reasonable starting point." },
  aggressive: { label: "Aggressive", f: 1.00, note: "Books the full theoretical value of freed capacity with no reduction, as vendor ROI tools usually do." },
};
/* Scenario defaults. Only fields that differ from these travel in the link, so a
   shared URL stays short. The industry preset is part of the state, so a link
   carries the vertical the sender was modelling, not just the raw numbers. */
const SCENARIO_DEFAULTS = { ...BASE, ...INDUSTRY.general, industry: "general" };

// InfoDot definition strings. Two sentences each: what it is, and why the tool uses it.
// This map is the future glossary content for the TCO tool.
const DEFS = {
  loaded: "The hourly wage plus benefits and employer costs (payroll tax, paid time off, insurance). The tool keeps loaded and marginal cost apart: loaded cost belongs in unit metrics such as cost per contact, and marginal cost is the one to value savings with.",
  marginal: "The variable cost that goes away when one contact goes away: the handle-time labor plus any per-minute telephony. Savings are valued at this cost, because technology and facilities costs stay the same when volume drops.",
  wageEsc: "The annual rate at which labor cost rises. Defaulted to 3.5 percent from current wage-growth data, and applied only to labor, since wages and contracted licenses rise at different rates.",
  licenseEsc: "The annual price increase on contracted software at renewal. Defaulted to 6 percent, an internal planning value (enter your contract's renewal cap), and applied only to licenses, since one blended rate misstates a cost base that is mostly labor.",
  stance: "How much of the freed capacity you assume becomes cash. It reduces the theoretical savings to what you expect to capture. None books $0, the right answer when nobody has committed to a capacity action.",
  costBasis: "Whether your cost inputs are estimates, vendor quotes or actual invoices. It sets the sensitivity range and the evidence grade the cost inputs can reach, since finance can book a number from an invoice far more readily than an estimate.",
  targets: "The improvement level each lever is measured against. You set them, so the opportunity reflects your own goals.",
  aht: "AHT (average handle time), the full time an agent spends on a contact: talk, hold and after-call work. It drives both the marginal cost per contact and the labor freed when you reduce it, so it is one of the largest levers in the model.",
  acw: "ACW (after-call work), the wrap-up time after the caller hangs up, counted inside AHT. The tool subtracts it from AHT to size telephony minutes: the line charge stops when the call ends, and the agent is still paid.",
  fcr: "FCR (first contact resolution), the share of issues resolved on the first contact, with no repeat. It sets cost per resolution, since a lower FCR means paying to handle the same issue more than once, and it sizes the repeat-contact savings lever.",
  containment: "The share of contacts fully handled by self-service or a bot, with no agent. It differs from FCR: containment means the customer never reached an agent, FCR means they did not have to come back. It is also an outcome, separate from the self-service channel share, which the tool models on its own. Raising it deflects volume, valued at marginal cost.",
  costPerResolution: "Total cost per issue resolved, estimated as cost per contact times the contacts each issue takes (about 2 minus FCR under the standard one-plus-repeat model). A lower FCR raises it, because more issues need a second contact. If you track an observed repeat contact rate, use that for a more precise figure.",
  occupancy: "The share of logged-in time agents spend handling contacts. The tool warns when capturing a saving by reducing headcount would push it above the caution line.",
  shrinkage: "The share of paid time agents are unavailable to handle contacts (training, breaks, meetings, absence). The tool uses it to turn 173 paid hours into productive hours. Labor cost is still computed on paid hours, because shrinkage time is paid.",
  attrition: "Annual agent turnover as a share of headcount. It sets how many replacement hires you fund each month, and with them the recruiting, training and ramp cost carried in the model.",
  seatBasis: "A monthly software fee per seat. The tool multiplies it by every licensed seat (agents plus supervisors, QA and WFM staff) and raises it at the license renewal rate in the 3-year view.",
  telephony: "Carrier cost per minute the line is open, billed on actual voice minutes. It is held flat in the 3-year projection, because usage moves with volume and carries no contracted renewal increase.",
  psAmortized: "Professional services spread as a recurring monthly line, for ongoing managed or configuration work. Keep it separate from the one-time implementation so the same project is counted once.",
  implementation: "A one-time upfront cost, added once to the 3-year total and never escalated. Set it to zero when you model a running operation with the build already behind you.",
};

// Largest-remainder allocation. Rounds each part to whole units and pushes the residual
// onto the parts with the largest fractional remainder, so the displayed line items always
// sum to the displayed total. A CFO reading a reconciliation table adds the column; if it
// does not tie to the stated total, the whole document loses authority. The adjustment is
// never more than one unit per line and always lands on the lines that were closest to
// rounding up anyway.
function reconcile(values, total) {
  const target = Math.round(total);
  const floors = values.map(v => Math.floor(v));
  let residual = target - floors.reduce((a, b) => a + b, 0);
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const out = floors.slice();
  let k = 0;
  while (residual > 0 && order.length) { out[order[k % order.length].i] += 1; residual--; k++; }
  while (residual < 0 && order.length) { out[order[order.length - 1 - (k % order.length)].i] -= 1; residual++; k++; }
  return out;
}

// Single display allocation for every rendered figure. The seven reconciliation
// rows group exactly onto the three cost buckets, so buckets are derived from
// rows rather than allocated separately. That is what keeps the reconciliation
// table, the distribution table, the stacked bar, and the analyst read from
// printing the same quantity two different ways. Percentages are derived from
// the same reconciled amounts and allocated to tenths so they read 100.0.
function buildDisplay(b, monthly) {
  const rows = reconcile([
    b.agentLabor,
    b.supLabor + b.qaLabor + b.wfmLabor + b.trainerLabor + b.itLabor,
    b.ccaas + b.wem + b.crm,
    b.aiUsage + b.analytics + b.ipaas + b.recording + b.knowledge + b.security,
    b.telephony,
    b.cloudInfra + b.psAmortized + b.facilities,
    b.attritionCost,
  ], monthly);
  const total = rows.reduce((a, x) => a + x, 0);
  const labor = rows[0] + rows[1];
  const tech = rows[2] + rows[3] + rows[4];
  const overhead = rows[5] + rows[6];
  const tenths = reconcile(
    [labor, tech, overhead].map((v) => (v / (total || 1)) * 1000),
    1000
  );
  return {
    rows, total, labor, tech, overhead,
    laborPct: tenths[0] / 1000, techPct: tenths[1] / 1000, overheadPct: tenths[2] / 1000,
    laborPctStr: (tenths[0] / 10).toFixed(1) + "%",
    techPctStr: (tenths[1] / 10).toFixed(1) + "%",
    overheadPctStr: (tenths[2] / 10).toFixed(1) + "%",
  };
}

/* Input domain. Tracker item: input guard and disclosure layer.
   A scenario link and the cross-tool rail both write straight into state, so no
   field can be trusted to hold a value the arithmetic can use. Every numeric field
   the form offers has one row here: [key, form label, min, max, display unit,
   display factor]. Bounds are in display units, so a share stored as 0.30 carries
   0 to 100 with factor 100.
   Rationale for the bounds, stated once. These are domain limits, not plausibility
   ranges. Plausibility belongs to the flags below and never corrects an input.
   Counts, times and money cannot be negative, so their floor is zero and they carry
   no ceiling. Agents and monthly contacts floor at one, because the engine divides by
   both and already substitutes one for zero. A guard at zero would print a corrected
   value the engine never ran. Shares of a whole sit in 0 to 100. Occupancy carries 0 to 150 and
   annual attrition 0 to 200 because metrics.js declares both ranges legitimate on
   the rail. The form carries the same ceilings, so a pulled 135 percent attrition
   survives a keystroke, and a guard or form narrower than the rail contract would
   repeat the v1 rail defect that destroyed a true 120 percent attrition. Target
   attrition shares the 200 ceiling so a 150 percent operation can set a real target.
   Escalators floor at minus 100, below which a later year cost turns negative.
   CSAT is a 0 to 5 scale, where 0 already means not entered. NPS is minus 100 to 100.
   Benefits carry no ceiling: a burden above 100 percent is implausible, not impossible.
   The rendered gate asserts every form field has a row here and that no row is
   narrower than the form, so the guard can never correct a value the form accepts. */
const TCO_DOMAIN = [
  ["agents", "Total Agents (FTE)", 1, null, "", 1],
  ["supervisors", "Supervisors", 0, null, "", 1],
  ["qaStaff", "QA Analysts", 0, null, "", 1],
  ["wfmStaff", "WFM Staff", 0, null, "", 1],
  ["trainers", "Trainers", 0, null, "", 1],
  ["itSupport", "IT and Tech Support", 0, null, "", 1],
  ["sites", "Sites", 0, null, "", 1],
  ["monthlyContacts", "Monthly Contacts (gross demand)", 1, null, "", 1],
  ["agentHourly", "Agent Hourly Rate", 0, null, "$", 1],
  ["agentBenefitsPct", "Benefits & Burden", 0, null, "%", 100],
  ["supHourly", "Supervisor Hourly", 0, null, "$", 1],
  ["qaHourly", "QA Analyst Hourly", 0, null, "$", 1],
  ["wfmHourly", "WFM Analyst Hourly", 0, null, "$", 1],
  ["trainerHourly", "Trainer Hourly", 0, null, "$", 1],
  ["itHourly", "IT Support Hourly", 0, null, "$", 1],
  ["recruitingCostPerHire", "Recruiting Cost per Hire", 0, null, "$", 1],
  ["aht", "AHT (seconds)", 0, null, "s", 1],
  ["acw", "ACW (seconds)", 0, null, "s", 1],
  ["avgHoldTime", "Hold Time (seconds)", 0, null, "s", 1],
  ["fcr", "FCR", 0, 100, "%", 100],
  ["containment", "Containment", 0, 100, "%", 100],
  ["occupancy", "Occupancy", 0, 150, "%", 100],
  ["shrinkage", "Shrinkage", 0, 100, "%", 100],
  ["attrition", "Annual Attrition", 0, 200, "%", 100],
  ["absenteeism", "Absenteeism", 0, 100, "%", 100],
  ["scheduleAdherence", "Schedule Adherence", 0, 100, "%", 100],
  ["avgSpeedAnswer", "ASA (seconds)", 0, null, "s", 1],
  ["abandonRate", "Abandon Rate", 0, 100, "%", 100],
  ["transferRate", "Transfer Rate", 0, 100, "%", 100],
  ["qualityScore", "QA Score", 0, 100, "%", 100],
  ["csat", "CSAT (1 to 5)", 0, 5, "", 1],
  ["nps", "NPS (-100 to 100)", -100, 100, "", 1],
  ["newHireTrainingDays", "New Hire Training (days)", 0, null, "", 1],
  ["channelMixVoice", "Voice", 0, 100, "%", 100],
  ["channelMixChat", "Chat and Messaging", 0, 100, "%", 100],
  ["channelMixEmail", "Email", 0, 100, "%", 100],
  ["channelMixSocial", "Social", 0, 100, "%", 100],
  ["channelMixSelfServe", "Self-Service", 0, 100, "%", 100],
  ["ccaasSeat", "CCaaS Per Seat", 0, null, "$", 1],
  ["wemSeat", "WEM Per Seat", 0, null, "$", 1],
  ["crmSeat", "CRM Per Seat", 0, null, "$", 1],
  ["telephonyPerMin", "Telephony Per Min", 0, null, "$", 1],
  ["ivaMonthly", "IVA and Bot Platform", 0, null, "$", 1],
  ["agentAssistMonthly", "Agent Assist", 0, null, "$", 1],
  ["rpaMonthly", "RPA and Automation", 0, null, "$", 1],
  ["analyticsMonthly", "Analytics Platform", 0, null, "$", 1],
  ["ipaasMonthly", "iPaaS and Integration", 0, null, "$", 1],
  ["recordingMonthly", "Recording & Compliance", 0, null, "$", 1],
  ["knowledgeMgmt", "Knowledge Management", 0, null, "$", 1],
  ["securityCompliance", "Security & Compliance", 0, null, "$", 1],
  ["cloudInfra", "Cloud Infrastructure (mo)", 0, null, "$", 1],
  ["psAmortized", "Professional Services, Amortized (mo)", 0, null, "$", 1],
  ["facilitiesCost", "Facilities (mo)", 0, null, "$", 1],
  ["implementationOneTime", "Implementation (one-time)", 0, null, "$", 1],
  ["blendedEscalatorPct", "Blended Escalator", -100, null, "%", 100],
  ["wageEscalatorPct", "Wage Growth (labor)", -100, null, "%", 100],
  ["licenseEscalatorPct", "License Renewal Uplift", -100, null, "%", 100],
  ["targetContainment", "Target Containment", 0, 100, "%", 100],
  ["targetFcr", "Target FCR", 0, 100, "%", 100],
  ["targetAht", "Target AHT (sec)", 0, null, "s", 1],
  ["targetAttrition", "Target Attrition", 0, 200, "%", 100],
];
const COST_BASIS = { estimate: 1, quoted: 1, invoiced: 1 };

/* Clamp at the engine boundary. A field that needed no correction keeps its raw
   value, so a field mid-edit is never rewritten under the cursor, and when nothing
   was corrected the same object comes back, so nothing downstream sees a new
   identity. Every correction is recorded and printed; none is absorbed. */
function guardTCO(dIn) {
  const { guards, guard, scaled, pick } = createGuards();
  const fix = {};
  for (const [key, label, min, max, unit, factor] of TCO_DOMAIN) {
    const before = guards.length;
    const c = factor === 1 ? guard(label, dIn[key], min, max, unit) : scaled(label, dIn[key], min, max, unit, factor);
    if (guards.length > before) fix[key] = c;
  }
  if (dIn.costBasis !== undefined) {
    const before = guards.length;
    const c = pick("Cost basis", dIn.costBasis, COST_BASIS, "estimate");
    if (guards.length > before) fix.costBasis = c;
  }
  return { d: guards.length ? { ...dIn, ...fix } : dIn, guards };
}

function computeTCO(dIn, stanceKey = "expected") {
  const { d, guards } = guardTCO(dIn);
  const HRS = benchmark("tco.hours.month"); // paid hours per agent per month = 2080 annual / 12
  const productiveHours = HRS * (1 - n(d.shrinkage)); // paid hours net of shrinkage
  const loaded = n(d.agentHourly) * (1 + n(d.agentBenefitsPct));
  const agentLabor = n(d.agents) * loaded * HRS;
  const salaried = (rate) => rate * benchmark("tco.load.salaried") * HRS;
  const supLabor = n(d.supervisors) * salaried(n(d.supHourly));
  const qaLabor = n(d.qaStaff) * salaried(n(d.qaHourly));
  const wfmLabor = n(d.wfmStaff) * salaried(n(d.wfmHourly));
  const trainerLabor = n(d.trainers) * salaried(n(d.trainerHourly));
  const itLabor = n(d.itSupport) * salaried(n(d.itHourly));
  const labor = agentLabor + supLabor + qaLabor + wfmLabor + trainerLabor + itLabor;

  const monthlyHires = Math.round(n(d.agents) * n(d.attrition) / 12);
  const perHire = n(d.recruitingCostPerHire) + n(d.newHireTrainingDays) * 8 * loaded;
  const attritionCost = monthlyHires * perHire;

  const contacts = n(d.monthlyContacts) || 1;
  const voiceContacts = contacts * n(d.channelMixVoice);
  // AHT is full handle time (talk+hold+ACW). Telephony bills only the line-open slice
  // (AHT minus ACW); ACW happens after disconnect.
  const lineOpenSec = Math.max(0, n(d.aht) - n(d.acw));
  const voiceMinutes = voiceContacts * (lineOpenSec / 60);
  const telephony = voiceMinutes * n(d.telephonyPerMin);

  const seats = n(d.agents) + n(d.supervisors) + n(d.qaStaff) + n(d.wfmStaff);
  const ccaas = seats * n(d.ccaasSeat), wem = seats * n(d.wemSeat), crm = seats * n(d.crmSeat);
  const aiUsage = n(d.ivaMonthly) + n(d.agentAssistMonthly) + n(d.rpaMonthly);
  const tech = ccaas + wem + crm + aiUsage + n(d.analyticsMonthly) + n(d.ipaasMonthly) + n(d.recordingMonthly) + n(d.knowledgeMgmt) + n(d.securityCompliance) + telephony;
  const overhead = n(d.cloudInfra) + n(d.psAmortized) + n(d.facilitiesCost) + attritionCost;

  const monthly = labor + tech + overhead;
  const annual = monthly * 12;
  const agents = n(d.agents) || 1;
  const costPerContact = monthly / contacts;
  const costPerResolution = costPerContact * (2 - n(d.fcr)); // contacts per resolution ~ 1 + repeat rate = (2 - FCR); standard repeat model, not 1/FCR
  const humanContacts = contacts * (1 - n(d.containment));
  const costPerHuman = monthly / (humanContacts || 1);

  // Marginal (variable) cost of one handled contact: full handle-time labor plus the
  // per-minute telephony for the voice share. This is what deflecting a contact frees.
  // The labor is valued at the shared marginal load (J10, TB S23 Path B), the only load a
  // saving may be valued on; unit costs stay on the loaded rate. It never exceeds the
  // loaded rate entered, so a benefits load below the marginal one is not raised.
  const marginalLoad = Math.min(benchmark("load.marginal"), 1 + n(d.agentBenefitsPct));
  const handleMin = n(d.aht) / 60;
  const marginalPerMin = n(d.agentHourly) * marginalLoad / 60;
  const marginalPerContact = handleMin * marginalPerMin + (n(d.channelMixVoice) * (lineOpenSec / 60) * n(d.telephonyPerMin));

  // V3 behavior buckets for the 3-year projection. Exhaustive and non-overlapping, so
  // the buckets sum to monthly and Year 1 equals the annual snapshot (the views reconcile).
  //   Wage bucket:    labor plus labor-derived attrition. Escalates at the wage rate.
  //   License bucket: contracted recurring software (seats, subscriptions, cloud infra,
  //                   amortized professional services). Escalates at the renewal rate.
  //   Flat bucket:    usage telephony and fixed facilities. Held flat across the horizon.
  const contractSoftware = ccaas + wem + crm + aiUsage + n(d.analyticsMonthly) + n(d.ipaasMonthly) + n(d.recordingMonthly) + n(d.knowledgeMgmt) + n(d.securityCompliance) + n(d.cloudInfra) + n(d.psAmortized);
  const wageMonthly = labor + attritionCost;
  const licenseMonthly = contractSoftware;
  const flatMonthly = telephony + n(d.facilitiesCost);

  const single = !!d.useSingleEscalator;
  const wEff = single ? n(d.blendedEscalatorPct) : n(d.wageEscalatorPct);
  const lEff = single ? n(d.blendedEscalatorPct) : n(d.licenseEscalatorPct);
  const wA = wageMonthly * 12, lA = licenseMonthly * 12, fA = flatMonthly * 12;
  const y1 = annual; // year 1 = snapshot, so annual and 3-year reconcile
  const y2 = wA * (1 + wEff) + lA * (1 + lEff) + fA;
  const y3 = wA * (1 + wEff) * (1 + wEff) + lA * (1 + lEff) * (1 + lEff) + fA;
  const threeYear = n(d.implementationOneTime) + y1 + y2 + y3; // one-time added once, never escalates

  const perAgentMonth = monthly / agents;

  // Self-audit: largest single license line versus its bucket, with an AI-usage carve-out.
  const licLines = { CCaaS: ccaas, WEM: wem, CRM: crm, "AI usage": aiUsage, Analytics: n(d.analyticsMonthly), iPaaS: n(d.ipaasMonthly), Recording: n(d.recordingMonthly), Knowledge: n(d.knowledgeMgmt), Security: n(d.securityCompliance), "Cloud infra": n(d.cloudInfra), "Prof. services": n(d.psAmortized) };
  let domKey = null, domVal = 0;
  for (const [k, v] of Object.entries(licLines)) if (v > domVal) { domVal = v; domKey = k; }
  const domShare = licenseMonthly > 0 ? domVal / licenseMonthly : 0;

  const flags = [];
  for (const g of guards) flags.push({ level: "block", msg: `${g.label}: you entered ${guardVal(g, "entered")}, which is outside the range this model can compute. Every figure in this report was computed at ${guardVal(g, "used")}, and the result grades Directional until you correct it.` });
  /* Marginal cost per contact above the fully loaded cost per contact cannot happen in a real operation: the handle time
     entered does not fit in the paid hours of the agents entered (1 agent and 120,000 contacts printed it, unflagged). */
  if (marginalPerContact > costPerContact) flags.push({ level: "flag", msg: `Marginal cost per contact ($${marginalPerContact.toFixed(2)}) is above the full cost per contact ($${costPerContact.toFixed(2)}). At this volume the handle time does not fit in the paid hours of ${n(d.agents).toLocaleString()} agent${n(d.agents) === 1 ? "" : "s"}. Check agents, monthly contacts and handle time.` });
  if (perAgentMonth > TCO_CHECKS.perAgentCeiling) flags.push({ level: "block", msg: `Cost per agent per month is ${fmt(perAgentMonth)}, above the tool's plausibility ceiling of ${fmt(TCO_CHECKS.perAgentCeiling)}. Check the wage and seat inputs. Finance-grade stays out of reach until this is corrected.` });
  if (domShare > TCO_CHECKS.domShareMax && domKey !== "AI usage") flags.push({ level: "flag", msg: `${domKey} is ${pct(domShare)} of the software bucket. When one line dominates, an input is usually in the wrong category or the wrong unit. Confirm it before treating this as Finance-grade.` });
  if (domShare > TCO_CHECKS.domShareMax && domKey === "AI usage") flags.push({ level: "note", msg: `AI usage is ${pct(domShare)} of the software bucket. That is normal for an AI contract billed mostly on usage, and it carries no penalty. Confirm it is billed on usage.` });
  if (n(d.psAmortized) > 0 && n(d.implementationOneTime) > 0) flags.push({ level: "note", msg: `Both amortized professional services (recurring) and a one-time implementation are set. Confirm the same cost is not entered twice: amortized professional services is a recurring monthly line, and the one-time figure is a separate upfront cost added once.` });
  const agentsPerSup = n(d.agents) / Math.max(1, n(d.supervisors));
  if (agentsPerSup > TCO_CHECKS.spanMax) flags.push({ level: "flag", msg: `Span of control is ${Math.round(agentsPerSup)} agents per supervisor, above the tool's check line of ${TCO_CHECKS.spanMax}. Thin supervision understates labor cost. Confirm the supervisor count before treating this as Finance-grade.` });
  // Cross-metric coherence: operational sanity, not just financial. These surface as items to
  // confirm and shape the analyst read; they do not block the cost-input grade.
  const occ = n(d.occupancy);
  if (occ > 0 && occ < benchmark("tco.read.lowOccupancy")) flags.push({ level: "note", msg: `Occupancy is ${pct0(occ)}, below ${pct0(benchmark("tco.read.lowOccupancy"))}, so idle capacity already exists. Capacity freed through deflection or AHT can be redeployed or used to avoid hiring. It becomes cash only after you deal with why occupancy is low (overstaffing, staffing that does not match demand by interval, or how it is measured).` });
  if (n(d.abandonRate) > 0.05 && n(d.avgSpeedAnswer) > 0 && n(d.avgSpeedAnswer) < 15) flags.push({ level: "note", msg: `Abandonment is ${pct0(d.abandonRate)} while answer speed is ${Math.round(n(d.avgSpeedAnswer))} seconds. High abandonment with fast answer is unusual. Check whether very short abandons are counted, whether volume swings sharply between intervals, or whether the measure blends channels.` });
  if (n(d.fcr) > 0.75 && n(d.csat) > 0 && n(d.csat) < 3.5) flags.push({ level: "note", msg: `FCR is ${pct0(d.fcr)} but CSAT is ${n(d.csat).toFixed(1)} of 5. High resolution with low satisfaction suggests that resolved issues still leave customers unhappy, or that FCR is measured loosely. Confirm the FCR definition.` });
  const ahtCut = n(d.aht) > 0 ? (n(d.aht) - n(d.targetAht)) / n(d.aht) : 0;
  if (ahtCut > 0.20 && (n(d.qualityScore) > 0 && n(d.qualityScore) < 0.75 || n(d.csat) > 0 && n(d.csat) < 3.5)) flags.push({ level: "note", msg: `The AHT target cuts handle time ${pct0(ahtCut)} while quality is already soft (QA ${pct0(d.qualityScore)}, CSAT ${n(d.csat).toFixed(1)}). Make sure the reduction comes from better tools and knowledge. If agents simply rush, the operation gets cheaper and worse.` });
  const hasBlock = flags.some(f => f.level === "block");
  const hasFlag = flags.some(f => f.level === "flag");

  // The cost basis sets the sensitivity band only. The grade is gradeTCO's, below.
  const basisRank = { estimate: 0, quoted: 1, invoiced: 2 }[d.costBasis || "estimate"];
  const sensPct = benchmark(`tco.band.${["estimate", "quoted", "invoiced"][basisRank]}`);
  const sensitivity = { pct: sensPct, annualLow: annual * (1 - sensPct), annualHigh: annual * (1 + sensPct), threeLow: threeYear * (1 - sensPct), threeHigh: threeYear * (1 + sensPct) };

  const openIssues = [];
  if (basisRank === 0) openIssues.push("Costs are estimates. Until they come from quotes or invoices, treat the numbers as directional.");
  if (stanceKey === "aggressive") openIssues.push("The aggressive stance books the full theoretical value of freed capacity as cash, with no reduction.");
  flags.forEach(f => { if (f.level !== "note") openIssues.push(f.msg); });
  const itemsToConfirm = flags.filter(f => f.level === "note").map(f => f.msg);

  const breakdown = {
      seats,
      agentLabor, supLabor, qaLabor, wfmLabor, trainerLabor, itLabor,
      ccaas, wem, crm, aiUsage, analytics: n(d.analyticsMonthly), ipaas: n(d.ipaasMonthly), recording: n(d.recordingMonthly), knowledge: n(d.knowledgeMgmt), security: n(d.securityCompliance), telephony,
      cloudInfra: n(d.cloudInfra), psAmortized: n(d.psAmortized), facilities: n(d.facilitiesCost), attritionCost,
    };

  return {
    d, guards,
    loaded, labor, tech, overhead, monthly, annual, agents, contacts,
    costPerContact, costPerResolution, costPerHuman, marginalPerContact, marginalLoad, humanContacts,
    monthlyHires, attritionCost, voiceMinutes, perHire,
    laborPct: labor / (monthly || 1), techPct: tech / (monthly || 1), overheadPct: overhead / (monthly || 1),
    disp: buildDisplay(breakdown, monthly),
    techPerAgent: tech / agents, y1, y2, y3, threeYear,
    wageMonthly, licenseMonthly, flatMonthly, wEff, lEff, single,
    perAgentMonth, productiveHours, flags, hasBlock, hasFlag, domKey, domShare, sensitivity, openIssues, itemsToConfirm,
    agentHandled: contacts * (1 - n(d.containment)),
    breakdown,
  };
}

// De-overlapped optimization model. Each lever acts on the pool the prior levers leave,
// valued at marginal cost, then scaled by the stance confidence. Targets are user-owned.
function buildOptimizations(d, r, stanceKey) {
  const f = STANCE[stanceKey].f;
  const out = [];
  const contacts = r.contacts;
  // Levers act on the volume agents actually handle, not gross demand. Start from
  // agent-handled contacts so the deflection lever leaves the correct pool for FCR and AHT.
  let pool = contacts * (1 - n(d.containment));

  const targetCont = Math.max(n(d.containment), n(d.targetContainment));
  const deflectable = Math.max(0, (targetCont - n(d.containment))) * contacts;
  if (deflectable > 100) {
    const gross = deflectable * r.marginalPerContact;
    out.push({ key: "containment", title: "Increase self-service containment", gross, net: gross * f,
      desc: `Deflect ${Math.round(deflectable).toLocaleString()} contacts per month by moving containment ${pct(d.containment)} to ${pctD(targetCont)}. Valued at the marginal handle cost, the labor that goes away with each contact.` });
    pool -= deflectable;
  }

  const targetFcr = Math.max(n(d.fcr), n(d.targetFcr));
  const repeatDrop = Math.max(0, targetFcr - n(d.fcr));
  const avoidedRepeats = repeatDrop * pool;
  if (avoidedRepeats > 100) {
    const gross = avoidedRepeats * r.marginalPerContact;
    out.push({ key: "fcr", title: "Improve first contact resolution", gross, net: gross * f,
      desc: `Lift FCR ${pct(d.fcr)} to ${pctD(targetFcr)}, avoiding ${Math.round(avoidedRepeats).toLocaleString()} repeat contacts per month on the handled pool.` });
    pool -= avoidedRepeats;
  }

  const targetAht = n(d.targetAht);
  if (n(d.aht) > targetAht && pool > 0) {
    const minSaved = (n(d.aht) - targetAht) / 60;
    const gross = minSaved * pool * (r.loaded / 60);
    out.push({ key: "aht", title: "Reduce average handle time", gross, net: gross * f,
      desc: `Bring AHT ${mmss(d.aht)} to ${mmss(targetAht)} across ${Math.round(pool).toLocaleString()} agent-handled contacts per month (after deflection). Applied only to contacts agents still handle, so deflected volume is counted once.` });
  }

  if (n(d.attrition) > n(d.targetAttrition)) {
    const fewerHires = (n(d.attrition) - n(d.targetAttrition)) * r.agents / 12;
    const gross = fewerHires * r.perHire;
    out.push({ key: "attrition", title: "Reduce agent attrition", gross, net: gross * f,
      desc: `Cut attrition ${pct(d.attrition)} to ${pct(d.targetAttrition)} (about ${fewerHires.toFixed(1)} fewer hires per month), saving recruiting, training and ramp cost. Contact volume does not affect it.` });
  }

  // Round each lever to the nearest $1,000 so displayed parts always reconcile with the
  // total. A CFO should never see rounded line items that fail to sum to the headline.
  out.forEach(o => { o.net = Math.round(o.net / 1000) * 1000; o.gross = Math.round(o.gross / 1000) * 1000; });
  const occRisk = n(d.occupancy) > BENCH.occupancy.cautionMax;
  const grossTotal = out.reduce((s, o) => s + o.gross, 0);
  const netTotal = out.reduce((s, o) => s + o.net, 0);
  return { items: out, grossTotal, netTotal, occRisk };
}

/* The one disclosure line for the marginal load (TB S23 Path B). Deflection and repeat savings
   are valued at the wage times the shared marginal load; capturing them by not backfilling
   seats removes benefits too, which the line sizes from the loads actually used. */
function marginalLoadLine(d, r) {
  const full = 1 + n(d.agentBenefitsPct);
  const more = r.marginalLoad > 0 ? Math.round((full / r.marginalLoad - 1) * 100) : 0;
  return `Deflection and repeat savings value agent time at the wage times ${r.marginalLoad.toFixed(2)}, the marginal load, and unit costs at the loaded ${full.toFixed(2)}. Capturing the saving by not backfilling seats removes benefits too${more > 0 ? `, about ${more}% more on those two levers` : ""}.`;
}

function buildAnalystRead(d, r, opt, stanceKey) {
  const out = [];
  const resPremium = r.costPerResolution / r.costPerContact - 1;
  /* At a cost per contact of zero the premium is zero over zero. Say so plainly. */
  if (!(r.costPerContact > 0))
    out.push(`Cost per contact computes to $${(r.costPerContact || 0).toFixed(2)} at these inputs, so the extra cost of resolution cannot be stated. Check the corrected inputs first.`);
  else if (resPremium > benchmark("tco.read.resPremium"))
    out.push(`Cost per resolution ($${r.costPerResolution.toFixed(2)}) runs ${Math.round(resPremium * 100)}% above cost per contact ($${r.costPerContact.toFixed(2)}). At ${pct(d.fcr)} FCR a share of issues take more than one contact to close (the standard one-plus-repeat model, about ${(2 - n(d.fcr)).toFixed(2)} contacts per resolution). That gap is the cost of rework.`);
  else
    out.push(`Cost per resolution ($${r.costPerResolution.toFixed(2)}) is ${Math.round(resPremium * 100)}% above cost per contact ($${r.costPerContact.toFixed(2)}), a small gap at ${pct(d.fcr)} FCR, so rework is a minor cost here. Volume and labor drive the cost.`);

  if (r.laborPct > benchmark("tco.read.laborHeavy"))
    out.push(`Labor is ${r.disp.laborPctStr} of TCO (total cost of ownership), so people drive the cost. The biggest levers are deflection and AHT, which free agent capacity. Trimming the ${r.disp.techPctStr} technology line barely moves the total.`);
  else
    out.push(`Labor is ${r.disp.laborPctStr} of TCO (total cost of ownership) with technology at ${r.disp.techPctStr}, an unusually technology-heavy structure. Check for overlapping platforms in the License Gap Checker before adding more tools.`);

  if (!r.single && r.laborPct > benchmark("tco.read.laborSplit"))
    out.push(`The 3-year view escalates labor at ${pctD(r.wEff)} and contracted license at ${pctD(r.lEff)}, with usage and facilities held flat. The two rates are kept apart because one blended rate would misstate a base that is ${r.disp.laborPctStr} labor.`);

  if (stanceKey === "none")
    out.push(`The None stance books $0 realized. The freed capacity above exists, and none of it becomes cash until you commit to a capacity action, so today's figure is zero.`);
  else if (opt.items.length)
    out.push(`The ${stanceKey} stance values savings at ${fmtK(opt.netTotal)} per month (${fmtK(opt.netTotal * 12)} per year)${Math.round(opt.netTotal) === Math.round(opt.grossTotal) ? ", the full theoretical capacity value with no reduction" : ", reduced from a theoretical " + fmtK(opt.grossTotal) + " per month"}. Each lever acts on the volume the one before it leaves, so no contact is counted twice and nothing is valued at full loaded cost.`);

  out.push(`Savings are valued at marginal cost, $${r.marginalPerContact.toFixed(2)} per contact. The fully loaded cost is $${r.costPerContact.toFixed(2)}. Deflecting contacts frees agent time while technology and facilities costs stay, so capturing the saving as cash means reducing or redeploying FTE (full-time equivalent agents). Agree that plan with the people who own the budget before you count the saving.`);
  out.push(marginalLoadLine(d, r));

  if (opt.occRisk) out.push(`Occupancy at ${pct(d.occupancy)} is in the burnout zone (above ${pct0(BENCH.occupancy.cautionMax)}). That carries a hidden cost: it drives the attrition that adds to your overhead. Model it in the Occupancy Risk Simulator before you treat the savings above as free.`);
  else if (n(d.occupancy) > 0 && n(d.occupancy) < benchmark("tco.read.lowOccupancy")) out.push(`Occupancy at ${pct(d.occupancy)} sits below ${pct0(benchmark("tco.read.lowOccupancy"))}, so you already carry idle capacity. The savings above are freed capacity. They become cash only when you redeploy that time or reduce headcount, and the first question is why occupancy is this low. Test it in the Occupancy Risk Simulator and Staffing Calculator before you book these numbers.`);
  return out;
}
/* ---- Grading. Three axes, doctrine section 5. ----
   gradeTCO reads the guarded input, the engine result, and a per-field `pre` map of
   what arrived over the rail at mount. It never reads flag text, a verdict, or the
   size of any total: the grade turns on where each figure came from and on the
   validity checks below, so scaling every price leaves it unchanged.

   Evidence. Every field that moves the TCO total is graded by its origin:
     default  still at the preset for the selected industry: Directional
     self     restored from this tool's own last run: Directional, a tool never
              credentials itself
     rail     arrived from another tool: railEvidence(origin grade), capped at
              Planning-grade, and Directional with no recorded origin grade
     entered  the user's own figure: Planning-grade at most, because nothing was
              inspected. Cost fields also need a quoted or invoiced cost basis.
   The cost basis select is self-declared, so it lifts cost fields to Planning-grade
   and no further (decision J1, carried from FCR). Finance-grade evidence needs
   document attestation this tool does not collect.
   Realization. TCO prices the cash the operation spends today. No capacity action
   applies to a cost baseline, so the axis is not applicable, with its reason stated.
   Completeness. Any validity check below holds it at Directional. */
const TCO_OPS = [
  ["agents", "agent count"], ["supervisors", "supervisor count"], ["qaStaff", "QA analyst count"],
  ["wfmStaff", "WFM staff count"], ["trainers", "trainer count"], ["itSupport", "IT support count"],
  ["monthlyContacts", "monthly contacts"], ["aht", "AHT"], ["acw", "ACW"], ["channelMixVoice", "voice share"],
  ["attrition", "attrition"], ["newHireTrainingDays", "new hire training days"],
];
const TCO_COST = [
  ["agentHourly", "agent wage"], ["agentBenefitsPct", "benefits and burden"], ["supHourly", "supervisor wage"],
  ["qaHourly", "QA wage"], ["wfmHourly", "WFM wage"], ["trainerHourly", "trainer wage"], ["itHourly", "IT wage"],
  ["recruitingCostPerHire", "recruiting cost per hire"], ["ccaasSeat", "CCaaS seat price"], ["wemSeat", "WEM seat price"],
  ["crmSeat", "CRM seat price"], ["telephonyPerMin", "telephony rate"], ["ivaMonthly", "IVA platform"],
  ["agentAssistMonthly", "agent assist"], ["rpaMonthly", "RPA"], ["analyticsMonthly", "analytics platform"],
  ["ipaasMonthly", "iPaaS"], ["recordingMonthly", "recording and compliance"], ["knowledgeMgmt", "knowledge management"],
  ["securityCompliance", "security and compliance"], ["cloudInfra", "cloud infrastructure"],
  ["psAmortized", "amortized professional services"], ["facilitiesCost", "facilities"],
];
const TCO_CHECKS = { perAgentCeiling: benchmark("tco.check.perAgentCeiling"), domShareMax: benchmark("tco.check.domShareMax"), spanMax: benchmark("tco.check.spanMax"), mixTol: benchmark("tco.check.mixTol") };

/* What this tool publishes, and the grade each published key carries.
   TCO_PUBLISH_ORIGIN maps a published rail key to the graded field behind it, so a
   republished input travels with the grade this tool actually assigned it: a preset that
   was never touched publishes as Directional, not as a fresh source.
   TCO_DERIVED_KEYS are computed outputs and ungraded entries. They carry the tool's
   headline evidence grade, which is the weakest input that produced them. */
const TCO_PUBLISH_ORIGIN = {
  agents: "agents", monthlyContacts: "monthlyContacts", agentHourly: "agentHourly",
  aht: "aht", attritionRate: "attrition",
};
const TCO_DERIVED_KEYS = [
  "annualTCO", "monthlyTCO", "tcoPerAgentMonth", "costPerContact", "costPerResolution",
  "marginalPerContact", "laborPct", "techPct", "threeYearTCO", "optimizationNetMonthly",
  "fcr", "wageEscalatorPct", "licenseEscalatorPct",
];

function tcoDefaults(d) { return { ...BASE, ...(INDUSTRY[d.industry] || INDUSTRY.general) }; }

function tcoFieldOrigin(d, pre, f) {
  const v = n(d[f]);
  const p = pre && Object.prototype.hasOwnProperty.call(pre, f) ? pre[f] : null;
  if (p && n(p.value) === v) return p.src === TOOL_ID ? "self" : "rail";
  if (v === n(tcoDefaults(d)[f])) return "default";
  return "entered";
}

function gradeTCO({ d, r, pre, railOrigin, stanceKey }) {
  const invariants = [];
  const figs = [r.monthly, r.annual, r.threeYear, r.y2, r.y3, r.perAgentMonth, r.costPerContact, r.marginalPerContact, r.wageMonthly, r.licenseMonthly, r.flatMonthly];
  if (!figs.every(Number.isFinite)) invariants.push("an output is not a finite number");
  if ([r.labor, r.tech, r.overhead, r.wageMonthly, r.licenseMonthly, r.flatMonthly].some((x) => x < 0)) invariants.push("a cost bucket is below zero");
  const bucketGap = Math.abs(r.wageMonthly + r.licenseMonthly + r.flatMonthly - r.monthly);
  if (!(bucketGap <= 1e-9 * Math.max(1, Math.abs(r.monthly)))) invariants.push("the escalation buckets do not sum to the monthly total");
  if (!(Math.abs(r.y1 - r.annual) <= 1e-9 * Math.max(1, Math.abs(r.annual)))) invariants.push("Year 1 does not equal the annual snapshot");

  const fields = [...TCO_OPS, ...TCO_COST];
  const origins = Object.fromEntries(fields.map(([f]) => [f, tcoFieldOrigin(d, pre, f)]));
  /* Origin grades are per field. A pulled value grades no higher than the grade its
     publisher recorded for it, so one weak pull no longer drags every pull down and one
     strong pull no longer lifts them. `railOrigin` is the blanket fallback for a field the
     rail carries with no recorded origin. */
  const railGradeOf = (f) => railEvidence((pre && pre[f] && pre[f].origin) || railOrigin);
  const attested = d.costBasis === "quoted" || d.costBasis === "invoiced";
  const fieldGrade = (f, entered) => ({ default: "Directional", self: "Directional", rail: railGradeOf(f), entered })[origins[f]];
  const isCostField = (f) => TCO_COST.some(([c]) => c === f);
  const gradeOfField = (f) => (isCostField(f)
    ? fieldGrade(f, attested ? "Planning-grade" : "Directional")
    : fieldGrade(f, "Planning-grade"));
  const opsGrade = TCO_OPS.map(([f]) => fieldGrade(f, "Planning-grade")).reduce(weakerStream);
  const costGrade = TCO_COST.map(([f]) => fieldGrade(f, attested ? "Planning-grade" : "Directional")).reduce(weakerStream);
  const evidence = weakerStream(opsGrade, costGrade);

  const named = (list, o) => list.filter(([f]) => origins[f] === o).map(([, l]) => l);
  const say = (list) => { const L = list.length > 4 ? [...list.slice(0, 4), `${list.length - 4} more`] : list; return L.length > 1 ? L.slice(0, -1).join(", ") + " and " + L[L.length - 1] : L[0]; };
  const why = (list) => {
    const parts = [];
    const def = named(list, "default"), self = named(list, "self"), rail = named(list, "rail");
    if (def.length) parts.push(`${say(def)} ${def.length > 1 ? "are" : "is"} still at the preset for this industry`);
    if (self.length) parts.push(`${say(self)} ${self.length > 1 ? "were" : "was"} restored from this tool's own last run, and a tool never credentials itself`);
    if (rail.length) {
      const seen = [...new Set(list.filter(([f]) => origins[f] === "rail").map(([f]) => (pre && pre[f] && pre[f].origin) || railOrigin).map((g) => g || "none"))];
      const noted = seen.length === 1 && seen[0] === "none" ? "with no recorded origin grade" : `with an origin grade of ${say(seen)}`;
      parts.push(`${say(rail)} arrived over the rail ${noted}, which confers consistency and evidence only as far as its origin`);
    }
    return parts;
  };
  const opsParts = why(TCO_OPS);
  if (!opsParts.length) opsParts.push("Headcount, volume, handle time and attrition are your own entries. Self-declared figures stand at Planning-grade at most, because no data was inspected");
  const costParts = why(TCO_COST);
  if (!costParts.length && !attested) costParts.push("Every wage and price is your own entry, and the cost basis is an estimate. Select quoted or invoiced once the figures come from quotes or invoices");
  if (!costParts.length) costParts.push("Every wage and price is your own entry, with the cost basis declared by your own account. Self-declaration stands at Planning-grade at most. Finance-grade needs document attestation, which this tool does not collect");
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const evParts = [...(opsGrade === evidence ? opsParts : []), ...(costGrade === evidence ? costParts : [])];

  const blockers = [];
  if (r.guards.length) blockers.push(`${r.guards.length} input${r.guards.length > 1 ? "s were" : " was"} outside the range this model can compute, and corrected before calculation`);
  if (r.perAgentMonth > TCO_CHECKS.perAgentCeiling) blockers.push(`cost per agent per month is above the $${TCO_CHECKS.perAgentCeiling.toLocaleString()} ceiling of any real operation`);
  if (r.domShare > TCO_CHECKS.domShareMax && r.domKey !== "AI usage") blockers.push(`one software line is more than ${Math.round(TCO_CHECKS.domShareMax * 100)} percent of the software bucket, which usually means a miscategorized or mis-scaled input`);
  if (n(d.agents) / Math.max(1, n(d.supervisors)) > TCO_CHECKS.spanMax) blockers.push(`span of control is above ${TCO_CHECKS.spanMax} agents per supervisor, which understates labor cost`);
  const mix = n(d.channelMixVoice) + n(d.channelMixChat) + n(d.channelMixEmail) + n(d.channelMixSocial) + n(d.channelMixSelfServe);
  if (!(Math.abs(mix - 1) < TCO_CHECKS.mixTol)) blockers.push("the channel mix does not total 100 percent, and the voice share prices telephony");
  if (r.marginalPerContact > r.costPerContact) blockers.push("marginal cost per contact is above the full cost per contact, so the handle time does not fit in the paid hours");
  if (stanceKey === "aggressive") blockers.push("the aggressive stance books full theoretical capacity as cash with no haircut");
  const completeness = blockers.length ? "Directional" : "Finance-grade";
  const modelWhy = blockers.length ? blockers.join("; ")
    : "The model is whole: no input was corrected, the channel mix totals 100 percent and every validity check passed";

  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({ invariant: invariants.join("; "), remedy: "Correct the inputs behind the failed check and re-run before citing any figure in this report." })
    : emitGrades({
        evidence, realization: null, completeness,
        naReason: "TCO prices the cash the operation spends today. No capacity action applies to a cost baseline. The optimization savings are a sized opportunity, graded in Business Case Builder once a capacity action is chosen.",
        reasons: { evidence: `${evParts.map(cap).join(". ")}.`, completeness: `${cap(modelWhy)}.` },
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  const gradeWhy = voided ? `export void: ${invariants.join("; ")}` : `Bound by ${gradeObj.boundBy}. ${gradeObj.boundAxes.map((x) => gradeObj.reasons[x]).join(" ")}`;
  return { gradeObj, confidence, gradeWhy, voided, invariants, evidence, opsGrade, costGrade, completeness, blockers, origins, fieldGrade: gradeOfField };
}

/* @engine-end */

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft), firm = alpha(HOUSE.mist, LINE.firm);
const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const h2 = { fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 8px" };
const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted, margin: 0 };
const figure = { fontSize: 18, fontWeight: 600, color: HOUSE.mist };
const link = { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 14 });
const panel = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
const box = { border: `1px solid ${hair}`, borderRadius: RADIUS.field, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" };
const sel = { width: "100%", minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 15, fontWeight: 600, border: `1px solid ${firm}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, cursor: "pointer" };

function Calculator() {
  const [dRaw, setD] = useState({ ...BASE, ...INDUSTRY.general, industry: "general" });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [activeSection, setActiveSection] = useState(0);
  const [stance, setStance] = useState("expected");
  const [pulled, setPulled] = useState({});
  const completedRef = useRef(false);

  const loadIndustry = (key) => setD(prev => ({ ...prev, ...BASE, ...INDUSTRY[key], industry: key }));

  // Mount: auto-fill from upstream tools, and honor a shared scenario URL.
  // tool_view is fired centrally by Journey in App.jsx. A second call here double counted
  // every view of this tool for as long as both existed.
  // Implementation pull uses precedence (licenseImplementationOneTime first, then
  // implementationCost) and never sums the two. A shared ?s= scenario wins over pulls.
  // The attrition field pulls attritionRate. No tool publishes a key named attrition, so
  // the old pull was dead on every visit and never prefilled from the Attrition Calculator.
  // Occupancy is not pulled. Staffing publishes Erlang C occupancy for one design interval
  // at required headcount, which rises with queue size alone: 67 percent at 40 contacts an
  // interval, 98 percent at 3,000, both at an 80/20 target. This field is operating
  // occupancy across logged-in time, and it drives the burnout and idle-capacity verdicts.
  // Same key, different fact, so a prefill would hand TCO a verdict it did not earn.
  /* Rail reads run once, at mount, through getExternalWithSource so every value keeps
     the tool that published it, and a value this tool published itself is never read. `pre` feeds gradeTCO field by field in engine units: a rail value with
     no origin grade grades Directional, and a rail value confers consistency, never
     evidence of its own. Keys stay as string literals so rail-audit.mjs sees every pull. */
  const rail = useRef(null);
  if (rail.current === null) {
    const ext = (res) => (res && !isNaN(res.value) ? res : null);
    const got = {
      aht: ext(getExternalWithSource("aht", TOOL_ID)), shrinkage: ext(getExternalWithSource("shrinkage", TOOL_ID)),
      agents: ext(getExternalWithSource("agents", TOOL_ID)), attrition: ext(getExternalWithSource("attritionRate", TOOL_ID)),
      annual: ext(getExternalWithSource("annualContacts", TOOL_ID)),
      licImpl: ext(getExternalWithSource("licenseImplementationOneTime", TOOL_ID)), bcImpl: ext(getExternalWithSource("implementationCost", TOOL_ID)),
    };
    const pre = {};
    for (const f of ["aht", "shrinkage", "agents", "attrition"]) if (got[f]) pre[f] = { value: got[f].value, src: got[f].sourceTool || "", origin: got[f].railOrigin || null };
    if (got.annual) pre.monthlyContacts = { value: Math.round(got.annual.value / 12), src: got.annual.sourceTool || "", origin: got.annual.railOrigin || null };
    const impl = got.licImpl || got.bcImpl;
    if (impl) pre.implementationOneTime = { value: impl.value, src: impl.sourceTool || "", origin: impl.railOrigin || null };
    rail.current = { pre };
  }
  const [fromLink, setFromLink] = useState(false);
  useEffect(() => {
    const next = {}; const got = {};
    for (const [f, p] of Object.entries(rail.current.pre)) { next[f] = p.value; got[f] = true; }
    const scn = readScenario(TOOL_ID, SCENARIO_DEFAULTS);
    /* A shared link opens on Overhead & Results, the section that carries the report the
       sender shared; the recipient can still step back through every input. */
    if (scn && typeof scn === "object") { Object.assign(next, scn); setFromLink(true); setActiveSection(5); trackTool.scenarioLoad("tco-calculator"); clearScenarioParam(); }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The engine guards what was entered. Everything below reads the guarded set, so no
     figure, field or report line shows a value the engine did not run. The share link
     carries dRaw, what was entered, so a recipient sees the same corrections disclosed. */
  const r = computeTCO(dRaw, stance);
  const d = r.d;
  const opt = buildOptimizations(d, r, stance);
  const analyst = buildAnalystRead(d, r, opt, stance);
  /* A scenario link is a deliberate act and carries its sender's entries, so a linked
     session grades those as entered and no rail value can be credited. */
  const G = gradeTCO({ d, r, pre: fromLink ? {} : rail.current.pre, railOrigin: null, stanceKey: stance });
  /* Publish the grade this tool assigned each field it republishes, so a downstream tool
     grades a pulled figure by where it was born rather than by who last restated it. A
     computed output carries this tool's evidence grade. A voided run publishes nothing. */
  const originsOut = {};
  if (!G.voided) {
    for (const [f, g] of Object.entries(TCO_PUBLISH_ORIGIN)) originsOut[f] = G.fieldGrade(g);
    for (const k of TCO_DERIVED_KEYS) originsOut[k] = G.evidence;
  }

  // Completion: fire once when the user reaches the results, with a coarse real-vs-default
  // signal and a severity bucket. No raw inputs leave the browser.
  useEffect(() => {
    if (activeSection === 5 && !completedRef.current) {
      completedRef.current = true;
      const real = n(d.agents) !== 200 || n(d.monthlyContacts) !== 120000 || n(d.agentHourly) !== 19;
      /* tool_complete is fired once by ReportActions, the single source. Severity
         reaches it through the signals prop below. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const channelTotal = n(d.channelMixVoice) + n(d.channelMixChat) + n(d.channelMixEmail) + n(d.channelMixSocial) + n(d.channelMixSelfServe);
  const channelOK = Math.abs(channelTotal - 1) < 0.005;
  const normalizeChannels = () => {
    if (channelTotal <= 0) return;
    setD(prev => ({ ...prev,
      channelMixVoice: n(prev.channelMixVoice) / channelTotal, channelMixChat: n(prev.channelMixChat) / channelTotal,
      channelMixEmail: n(prev.channelMixEmail) / channelTotal, channelMixSocial: n(prev.channelMixSocial) / channelTotal,
      channelMixSelfServe: n(prev.channelMixSelfServe) / channelTotal }));
  };

  useEffect(() => {
    const primitives = {
      agents: r.agents, monthlyContacts: r.contacts, annualTCO: Math.round(r.annual), monthlyTCO: Math.round(r.monthly),
      tcoPerAgentMonth: Math.round(r.monthly / r.agents), costPerContact: +r.costPerContact.toFixed(2),
      costPerResolution: +r.costPerResolution.toFixed(2), marginalPerContact: +r.marginalPerContact.toFixed(2),
      laborPct: +r.laborPct.toFixed(4), techPct: +r.techPct.toFixed(4), threeYearTCO: Math.round(r.threeYear),
      optimizationNetMonthly: Math.round(opt.netTotal), stance,
      wageEscalatorPct: n(d.wageEscalatorPct), licenseEscalatorPct: n(d.licenseEscalatorPct), tcoConfidence: G.confidence,
      // Baseline facts for downstream tools (e.g. Business Case Builder). Facts, not
      // conclusions: raw current-state drivers so a downstream case inherits the same
      // starting point. Targets and hair-cut savings are deliberately NOT published.
      agentHourly: n(d.agentHourly), aht: n(d.aht), fcr: n(d.fcr), attritionRate: n(d.attrition),
    };
    publishToolResult("tco-calculator", normalizeForPublish(primitives, { sourceTool: "tco-calculator" }).clean, originsOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dRaw, stance]);





  const escLabel = r.single ? pctD(r.wEff) + "/yr blended" : "wage " + pctD(r.wEff) + " / license " + pctD(r.lEff);
  const sections = ["Organization Profile", "Labor Costs", "Operational KPIs", "Channel Mix", "Technology Costs", "Overhead & Results"];
  const navBtn = (to, label, primary, disabled) => (
    <Button kind={primary ? "primary" : "secondary"} disabled={disabled} onClick={() => !disabled && setActiveSection(to)}>{label}</Button>
  );
  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(G.gradeObj);
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Annual total cost of ownership" value={voidReason ? null : r.annual} format={fmtK}
        change={voidReason ? null : `3-year ${fmtK(r.threeYear)}. Range ${fmtK(r.sensitivity.annualLow)} to ${fmtK(r.sensitivity.annualHigh)}.`}
        how={how} voidReason={voidReason} />
      {!voidReason && (
        <div style={panel}>
          {[["Per agent a month", fmt(r.monthly / r.agents)], ["Per contact", "$" + r.costPerContact.toFixed(2)], ["Per resolution", "$" + r.costPerResolution.toFixed(2)], ["Labor share", r.disp.laborPctStr]].map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderTop: i ? `1px solid ${hair}` : "none" }}>
              <span style={small}>{k}</span><span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist, ...NUM }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Cost + Economics" name="TCO Calculator" title="What does your contact center cost to run, today and over three years?"
      lede="TCO (total cost of ownership) is everything it costs to run your contact center: labor, technology and overhead, with 17 operational KPIs (key performance indicators) for context. You get a picture of today and a 3-year projection. Every figure shows how it was made, and savings are valued at marginal cost, the cost that actually goes away, so they stay realistic."
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "Annual TCO", value: fmtK(r.annual) }}>
      <style>{`${FONT_IMPORT_CSS}.tco-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>
      {Object.keys(pulled).length > 0 && <p style={small}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from tools you used recently. You can edit every field.</p>}

      <div role="group" aria-label="Calculator steps" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {sections.map((x, i) => (
          <button key={i} type="button" aria-current={activeSection === i ? "step" : undefined} onClick={() => setActiveSection(i)} style={{ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: activeSection === i ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${activeSection === i ? HOUSE.electric : firm}`, background: activeSection === i ? alpha(HOUSE.electric, 0.22) : "transparent", color: HOUSE.mist }}>{i + 1}. {x}</button>
        ))}
      </div>

            {activeSection === 0 && (
              <fieldset style={{ ...panel, margin: 0 }}>
                <legend style={{ ...kicker, padding: "0 6px" }}>Organization Profile</legend>
                <div style={grid(190)}>
                  <NumField label="Total Agents (FTE)" tone="dark" value={d.agents} onChange={v => set("agents", v)} step={5} min={1} hint="Full-time equivalents (FTE)" pulled={pulled.agents} />
                  <NumField label="Supervisors" tone="dark" value={d.supervisors} onChange={v => set("supervisors", v)} min={0} />
                  <NumField label="QA Analysts" tone="dark" value={d.qaStaff} onChange={v => set("qaStaff", v)} min={0} />
                  <NumField label="WFM Staff" tone="dark" value={d.wfmStaff} onChange={v => set("wfmStaff", v)} min={0} />
                  <NumField label="Trainers" tone="dark" value={d.trainers} onChange={v => set("trainers", v)} min={0} />
                  <NumField label="IT and Tech Support" tone="dark" value={d.itSupport} onChange={v => set("itSupport", v)} min={0} />
                  <NumField label="Sites" tone="dark" value={d.sites} onChange={v => set("sites", v)} min={1} />
                  <div>
                    <label htmlFor="tco-industry" style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "block", marginBottom: 6 }}>Industry</label>
                    <select id="tco-industry" aria-label="Industry" value={d.industry} onChange={e => loadIndustry(e.target.value)} className="tco-sel" style={sel}>
                      {Object.entries(INDUSTRY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <div style={{ ...small, marginTop: 4 }}>Filled with the {INDUSTRY[d.industry]?.label} profile. Adjust any value.</div>
                    <div style={{ ...small, marginTop: 4 }} title={BENCHMARK_SOURCES}>Industry profiles are internal planning values set by us. Hover to see which figures are sourced. Every formula, constant and a worked example are in the <a href="/methodology/tco-calculator" style={link}>published method</a>.</div>
                  </div>
                  <NumField label="Monthly Contacts (gross demand)" tone="dark" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={1} pulled={pulled.monthlyContacts} hint={`Every contact customers start. About ${Math.round(n(d.monthlyContacts) * (1 - n(d.containment))).toLocaleString()} reach an agent at ${pct0(d.containment)} containment.`} />
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>{navBtn(1, "Next: Labor Costs", true)}</div>
              </fieldset>
            )}

            {activeSection === 1 && (
              <fieldset style={{ ...panel, margin: 0 }}>
                <legend style={{ ...kicker, padding: "0 6px" }}>Labor Costs</legend>
                <div style={grid(190)}>
                  <NumField label="Agent Hourly Rate" tone="dark" value={d.agentHourly} onChange={v => set("agentHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Benefits & Burden" tone="dark" value={d.agentBenefitsPct} onChange={v => set("agentBenefitsPct", v)} suffix="%" factor={100} min={0} max={100} hint="Benefits and payroll taxes as a share of wage; enter yours" info={DEFS.loaded} infoTitle="Loaded rate" />
                  <div style={box}>
                    <div style={small}>Loaded rate (wage plus benefits)</div>
                    <div style={figure}>${r.loaded.toFixed(2)}/hr</div>
                  </div>
                  <NumField label="Supervisor Hourly" tone="dark" value={d.supHourly} onChange={v => set("supHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="QA Analyst Hourly" tone="dark" value={d.qaHourly} onChange={v => set("qaHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="WFM Analyst Hourly" tone="dark" value={d.wfmHourly} onChange={v => set("wfmHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Trainer Hourly" tone="dark" value={d.trainerHourly} onChange={v => set("trainerHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="IT Support Hourly" tone="dark" value={d.itHourly} onChange={v => set("itHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Recruiting Cost per Hire" tone="dark" value={d.recruitingCostPerHire} onChange={v => set("recruitingCostPerHire", v)} prefix="$" step={100} min={0} />
                </div>
                <div style={{ ...box, marginTop: 16, flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={small}>Monthly Labor</div><div style={{ ...figure, ...NUM }}>{fmtK(r.labor)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={small}>Attrition cost a month</div><div style={{ ...figure, ...NUM }}>{fmtK(r.attritionCost)}</div><div style={small}>{r.monthlyHires} hires a month</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>{navBtn(0, "Back", false)}{navBtn(2, "Next: KPIs", true)}</div>
              </fieldset>
            )}

            {activeSection === 2 && (
              <fieldset style={{ ...panel, margin: 0 }}>
                <legend style={{ ...kicker, padding: "0 6px" }}>Operational KPIs</legend>
                <div style={grid(190)}>
                  <NumField label="AHT (seconds)" tone="dark" value={d.aht} onChange={v => set("aht", v)} info={DEFS.aht} infoTitle="AHT" step={5} min={1} pulled={pulled.aht} hint={<span>{mmss(d.aht)}, full handle time. Published averages are under How others report it</span>} />
                  <NumField label="ACW (seconds)" tone="dark" value={d.acw} onChange={v => set("acw", v)} info={DEFS.acw} infoTitle="ACW" step={5} min={0} hint="After-call work, inside AHT, line closed" />
                  <NumField label="Hold Time (seconds)" tone="dark" value={d.avgHoldTime} onChange={v => set("avgHoldTime", v)} step={5} min={0} hint="Inside AHT, line open" />
                  <NumField label="FCR" tone="dark" value={d.fcr} onChange={v => set("fcr", v)} info={DEFS.fcr} infoTitle="FCR" suffix="%" factor={100} min={0} max={100} hint="Published figures under How others report it" />
                  <NumField label="Containment" tone="dark" value={d.containment} onChange={v => set("containment", v)} info={DEFS.containment} infoTitle="Containment" suffix="%" factor={100} min={0} max={100} hint="Share of contacts resolved without an agent" />
                  <NumField label="Occupancy" tone="dark" value={d.occupancy} onChange={v => set("occupancy", v)} info={DEFS.occupancy} infoTitle="Occupancy" suffix="%" factor={100} min={0} max={150} hint={<span>{pct0(BENCH.occupancy.healthyMax)} to {pct0(BENCH.occupancy.cautionMax)} healthy. Above that, burnout risk</span>} />
                  <NumField label="Shrinkage" tone="dark" value={d.shrinkage} onChange={v => set("shrinkage", v)} info={DEFS.shrinkage} infoTitle="Shrinkage" suffix="%" factor={100} min={0} max={100} pulled={pulled.shrinkage} hint="Published ranges under How others report it" />
                  <NumField label="Annual Attrition" tone="dark" value={d.attrition} onChange={v => set("attrition", v)} info={DEFS.attrition} infoTitle="Attrition" suffix="%" factor={100} min={0} max={200} pulled={pulled.attrition} hint="Published figures under How others report it" />
                  <NumField label="Absenteeism" tone="dark" value={d.absenteeism} onChange={v => set("absenteeism", v)} suffix="%" factor={100} min={0} max={100} hint="Unplanned absence as a share of scheduled time" />
                  <NumField label="Schedule Adherence" tone="dark" value={d.scheduleAdherence} onChange={v => set("scheduleAdherence", v)} suffix="%" factor={100} min={0} max={100} hint="Published ranges under How others report it" />
                  <NumField label="ASA (seconds)" tone="dark" value={d.avgSpeedAnswer} onChange={v => set("avgSpeedAnswer", v)} step={5} min={0} hint="Published figures under How others report it" />
                  <NumField label="Abandon Rate" tone="dark" value={d.abandonRate} onChange={v => set("abandonRate", v)} suffix="%" factor={100} min={0} max={100} hint="Published figures under How others report it" />
                  <NumField label="Transfer Rate" tone="dark" value={d.transferRate} onChange={v => set("transferRate", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="QA Score" tone="dark" value={d.qualityScore} onChange={v => set("qualityScore", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="CSAT (1 to 5)" tone="dark" value={d.csat} onChange={v => set("csat", v)} step={0.1} min={1} max={5} hint="Your survey average on a 1 to 5 scale" />
                  <NumField label="NPS (-100 to 100)" tone="dark" value={d.nps} onChange={v => set("nps", v)} min={-100} max={100} />
                  <NumField label="New Hire Training (days)" tone="dark" value={d.newHireTrainingDays} onChange={v => set("newHireTrainingDays", v)} min={0} />
                </div>
                <p style={{ ...small, marginTop: 12 }}>Only headcount, wages, attrition, contract and usage prices, and AHT (through voice minutes) move the current TCO total. FCR, containment, occupancy and shrinkage leave current cost unchanged. They size the optimization opportunity and the derived metrics. CSAT (customer satisfaction), NPS (Net Promoter Score), QA (quality assurance) score, adherence, ASA (average speed of answer), abandonment, transfers, hold and absenteeism give context for the analyst read and the consistency checks.</p>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>{navBtn(1, "Back", false)}{navBtn(3, "Next: Channel Mix", true)}</div>
              </fieldset>
            )}

            {activeSection === 3 && (
              <fieldset style={{ ...panel, margin: 0 }}>
                <legend style={{ ...kicker, padding: "0 6px" }}>Channel Mix</legend>
                <div style={grid(190)}>
                  <NumField label="Voice" tone="dark" value={d.channelMixVoice} onChange={v => set("channelMixVoice", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Chat and Messaging" tone="dark" value={d.channelMixChat} onChange={v => set("channelMixChat", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Email" tone="dark" value={d.channelMixEmail} onChange={v => set("channelMixEmail", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Social" tone="dark" value={d.channelMixSocial} onChange={v => set("channelMixSocial", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Self-Service" tone="dark" value={d.channelMixSelfServe} onChange={v => set("channelMixSelfServe", v)} suffix="%" factor={100} min={0} max={100} />
                  <div style={{ ...box, border: channelOK ? `1px solid ${hair}` : `1.5px solid ${HOUSE.mist}` }}>
                    <div style={small}>Total</div>
                    <div style={{ ...figure, ...NUM }}>{pct(channelTotal)}</div>
                    <div style={{ ...small, color: channelOK ? HOUSE.muted : HOUSE.mist, fontWeight: channelOK ? 400 : 700 }}>{channelOK ? "Totals 100%" : "Must total 100%"}</div>
                  </div>
                </div>
                {!channelOK && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", border: `1.5px solid ${HOUSE.mist}`, borderRadius: RADIUS.field, padding: "12px 16px" }}>
                    <span style={{ ...body, fontSize: 14, flex: 1 }}>Channel mix totals {pct(channelTotal)}. It must total 100% before the TCO can be relied on.</span>
                    <Button kind="secondary" onClick={normalizeChannels}>Auto-balance to 100%</Button>
                  </div>
                )}
                <div style={{ ...box, marginTop: 16 }}>
                  <div style={small}>Monthly voice minutes</div>
                  <div style={figure}>{Math.round(r.voiceMinutes).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {navBtn(2, "Back", false)}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {!channelOK && <span style={{ ...small, color: HOUSE.mist }}>Balance the mix to continue</span>}
                    {navBtn(4, "Next: Technology", true, !channelOK)}
                  </div>
                </div>
              </fieldset>
            )}

            {activeSection === 4 && (
              <fieldset style={{ ...panel, margin: 0 }}>
                <legend style={{ ...kicker, padding: "0 6px" }}>Technology Costs <span style={{ textTransform: "none", letterSpacing: 0 }}>(monthly)</span></legend>
                <div style={grid(190)}>
                  <NumField label="CCaaS Per Seat" tone="dark" value={d.ccaasSeat} onChange={v => set("ccaasSeat", v)} info={DEFS.seatBasis} infoTitle="Per-seat basis" prefix="$" step={5} min={0} />
                  <NumField label="WEM Per Seat" tone="dark" value={d.wemSeat} onChange={v => set("wemSeat", v)} prefix="$" step={5} min={0} />
                  <NumField label="CRM Per Seat" tone="dark" value={d.crmSeat} onChange={v => set("crmSeat", v)} prefix="$" step={5} min={0} />
                  <NumField label="Telephony Per Min" tone="dark" value={d.telephonyPerMin} onChange={v => set("telephonyPerMin", v)} info={DEFS.telephony} infoTitle="Telephony" prefix="$" step={0.005} min={0} />
                  <NumField label="IVA and Bot Platform" tone="dark" value={d.ivaMonthly} onChange={v => set("ivaMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Agent Assist" tone="dark" value={d.agentAssistMonthly} onChange={v => set("agentAssistMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="RPA and Automation" tone="dark" value={d.rpaMonthly} onChange={v => set("rpaMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Analytics Platform" tone="dark" value={d.analyticsMonthly} onChange={v => set("analyticsMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="iPaaS and Integration" tone="dark" value={d.ipaasMonthly} onChange={v => set("ipaasMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Recording & Compliance" tone="dark" value={d.recordingMonthly} onChange={v => set("recordingMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Knowledge Management" tone="dark" value={d.knowledgeMgmt} onChange={v => set("knowledgeMgmt", v)} prefix="$" step={500} min={0} />
                  <NumField label="Security & Compliance" tone="dark" value={d.securityCompliance} onChange={v => set("securityCompliance", v)} prefix="$" step={500} min={0} />
                </div>
                <div style={{ ...box, marginTop: 16, flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={small}>Monthly technology cost</div><div style={{ ...figure, ...NUM }}>{fmtK(r.tech)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={small}>Technology per agent a month</div><div style={{ ...figure, ...NUM }}>{fmt(r.techPerAgent)}</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>{navBtn(3, "Back", false)}{navBtn(5, "Next: Results", true)}</div>
              </fieldset>
            )}

            {activeSection === 5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <fieldset style={{ ...panel, margin: 0 }}>
                  <legend style={{ ...kicker, padding: "0 6px" }}>Overhead, Facilities & 3-Year Inputs</legend>
                  <div style={grid(190)}>
                    <NumField label="Cloud Infrastructure (mo)" tone="dark" value={d.cloudInfra} onChange={v => set("cloudInfra", v)} prefix="$" step={500} min={0} />
                    <NumField label="Professional Services, Amortized (mo)" tone="dark" value={d.psAmortized} onChange={v => set("psAmortized", v)} info={DEFS.psAmortized} infoTitle="Amortized PS" prefix="$" step={500} min={0} hint="Recurring managed service" />
                    <NumField label="Facilities (mo)" tone="dark" value={d.facilitiesCost} onChange={v => set("facilitiesCost", v)} prefix="$" step={500} min={0} />
                    <NumField label="Implementation (one-time)" tone="dark" value={d.implementationOneTime} onChange={v => set("implementationOneTime", v)} info={DEFS.implementation} infoTitle="Implementation" prefix="$" step={5000} min={0} pulled={pulled.implementationOneTime} hint="Added once to the 3-year total. 0 for a running operation" />
                  </div>

                  <div style={{ marginTop: 18, border: `1px solid ${hair}`, borderRadius: RADIUS.field, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6 }}>3-Year Escalators <InfoDot title="Two escalators" text="Labor and contracted licenses rise at different rates, so the tool raises them separately. Usage and facilities are held flat, and a one-time cost is added once and never raised." /></div>
                      <Button kind="secondary" onClick={() => set("useSingleEscalator", !d.useSingleEscalator)}>{d.useSingleEscalator ? "Using single blended rate" : "Using two rates"}</Button>
                    </div>
                    {d.useSingleEscalator ? (
                      <div style={grid(190)}>
                        <NumField label="Blended Escalator" tone="dark" value={d.blendedEscalatorPct} onChange={v => set("blendedEscalatorPct", v)} suffix="%" factor={100} step={0.5} min={0} max={20} hint="One rate on all recurring cost" info={DEFS.wageEsc} infoTitle="Escalator" />
                      </div>
                    ) : (
                      <div style={grid(190)}>
                        <NumField label="Wage Growth (labor)" tone="dark" value={d.wageEscalatorPct} onChange={v => set("wageEscalatorPct", v)} suffix="%" factor={100} step={0.5} min={0} max={20} hint="Default 3.5%, applied to labor" info={DEFS.wageEsc} infoTitle="Wage growth" />
                        <NumField label="License Renewal Uplift" tone="dark" value={d.licenseEscalatorPct} onChange={v => set("licenseEscalatorPct", v)} suffix="%" factor={100} step={0.5} min={0} max={20} hint="Default 6%, applied to software" info={DEFS.licenseEsc} infoTitle="Renewal uplift" />
                        <div style={box}>
                          <div style={small}>Held flat</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Usage + facilities</div>
                          <div style={small}>one-time added once</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ ...grid(240), marginTop: 14 }}>
                    <div>
                      <label htmlFor="tco-basis" style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>Cost basis <InfoDot title="Cost basis" text={DEFS.costBasis} /></label>
                      <select id="tco-basis" aria-label="Cost basis" value={d.costBasis} onChange={e => set("costBasis", e.target.value)} className="tco-sel" style={sel}>
                        <option value="estimate">Estimate (Directional)</option>
                        <option value="quoted">Vendor quote</option>
                        <option value="invoiced">Actual invoice</option>
                      </select>
                      <div style={{ ...small, marginTop: 4 }}>Sets the sensitivity range and the grade the cost inputs can reach. It applies to cost inputs such as wages and seat prices. KPIs are unaffected.</div>
                    </div>
                    <div style={box}>
                      <div style={small}>Report confidence</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: HOUSE.mist }}>{G.confidence}</div>
                      <div style={small}>Headline range plus or minus {pct0(r.sensitivity.pct)}</div>
                    </div>
                  </div>
                </fieldset>

                <fieldset style={{ ...panel, margin: 0 }}>
                  <legend style={{ ...kicker, padding: "0 6px", display: "flex", alignItems: "center", gap: 6 }}>Optimization targets <InfoDot title="Your targets" text={DEFS.targets} /></legend>
                  <div style={grid(150)}>
                    <NumField label="Target Containment" tone="dark" value={d.targetContainment} onChange={v => set("targetContainment", v)} suffix="%" factor={100} min={0} max={100} compact />
                    <NumField label="Target FCR" tone="dark" value={d.targetFcr} onChange={v => set("targetFcr", v)} suffix="%" factor={100} min={0} max={100} compact />
                    <NumField label="Target AHT (sec)" tone="dark" value={d.targetAht} onChange={v => set("targetAht", v)} step={5} min={0} compact hint={mmss(d.targetAht)} />
                    <NumField label="Target Attrition" tone="dark" value={d.targetAttrition} onChange={v => set("targetAttrition", v)} suffix="%" factor={100} min={0} max={200} compact />
                  </div>
                </fieldset>

                <section aria-label="Complete TCO results" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                    <span style={kicker}>Complete TCO results</span>
                    <span style={small}><strong style={{ color: HOUSE.mist }}>{G.confidence}</strong>, graded on the cost inputs (savings and KPIs are graded elsewhere)</span>
                  </div>
                  {G.voided ? (
                    <Finding level="critical" title="Result void. No figure is shown and no grade is claimed.">Failed check: {G.invariants.join("; ")}. Remedy: {G.gradeObj.remedy}</Finding>
                  ) : (<>
                  <div style={{ ...grid(170), marginBottom: 20 }}>
                    <div>
                      <div style={small}>Annual TCO</div>
                      <div style={{ ...TYPE.statValueLg, fontSize: 29, color: HOUSE.mist }}>{fmtK(r.annual)}</div>
                      <div style={small}>Range {fmtK(r.sensitivity.annualLow)} to {fmtK(r.sensitivity.annualHigh)}</div>
                    </div>
                    <div>
                      <div style={small}>3-Year TCO</div>
                      <div style={{ ...TYPE.statValueLg, fontSize: 29, color: HOUSE.mist }}>{fmtK(r.threeYear)}</div>
                      <div style={small}>{n(d.implementationOneTime) > 0 ? fmtK(n(d.implementationOneTime)) + " impl + " : ""}{escLabel}</div>
                    </div>
                    <div>
                      <div style={small}>Per agent a month</div>
                      <div style={{ ...TYPE.statValueLg, fontSize: 29, color: HOUSE.mist }}>{fmt(r.monthly / r.agents)}</div>
                      <div style={small}>Every cost in the model, per agent</div>
                    </div>
                  </div>
                  <div style={{ ...grid(130), marginBottom: 20 }}>
                    {[{ l: "Cost Per Contact", v: "$" + r.costPerContact.toFixed(2) }, { l: "Cost Per Resolution", v: "$" + r.costPerResolution.toFixed(2) }, { l: "Marginal per Contact", v: "$" + r.marginalPerContact.toFixed(2) }, { l: "Contacts per Agent a Month", v: Math.round(r.contacts / r.agents).toLocaleString() }].map((item, i) => (
                      <div key={i}><div style={small}>{item.l}</div><div style={{ ...figure, ...NUM }}>{item.v}</div></div>
                    ))}
                  </div>
                  <div>
                    <div style={{ ...small, marginBottom: 6 }}>Cost distribution</div>
                    <div role="img" aria-label={`Labor ${r.disp.laborPctStr}, technology ${r.disp.techPctStr}, overhead ${r.disp.overheadPctStr}`} style={{ display: "flex", height: 24, borderRadius: RADIUS.chip, overflow: "hidden", border: `1px solid ${hair}` }}>
                      <div style={{ width: r.disp.laborPctStr, background: alpha(ARCS.evidence, 0.9) }} />
                      <div style={{ width: r.disp.techPctStr, background: alpha(ARCS.evidence, 0.5) }} />
                      <div style={{ width: r.disp.overheadPctStr, background: alpha(ARCS.evidence, 0.2) }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={small}>Labor {r.disp.laborPctStr}, {fmtK(r.labor)}/mo</span>
                      <span style={small}>Technology {r.disp.techPctStr}, {fmtK(r.tech)}/mo</span>
                      <span style={small}>Overhead {r.disp.overheadPctStr}, {fmtK(r.overhead)}/mo</span>
                    </div>
                  </div>
                  </>)}
                </section>

                {/* Self-audit flags */}
                {!G.voided && r.flags.length > 0 && (
                  <section aria-label="Integrity checks" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <h2 style={h2}>Integrity checks</h2>
                    {r.flags.map((f, i) => (
                      <Finding key={i} level={f.level === "block" ? "critical" : f.level === "flag" ? "high" : "unknown"} title={f.level === "block" ? "Blocks the result" : f.level === "flag" ? "Confirm this" : "Note"}>{f.msg}</Finding>
                    ))}
                  </section>
                )}

                {/* Analyst Read. A void run has no figure to read, so it renders none. */}
                {!G.voided && <section aria-label="What it means" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
                  <span style={kicker}>What these numbers mean</span>
                  {analyst.map((t, i) => <p key={i} style={{ ...body, margin: i ? "10px 0 0" : "8px 0 0" }}>{t}</p>)}
                </section>}

                {/* Stance selector */}
                <section aria-label="Savings stance" style={{ ...panel, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6 }}>Savings stance <InfoDot title="Realization stance" text={DEFS.stance} /></div><div style={small}>{STANCE[stance].note}</div></div>
                  <div role="group" aria-label="Savings stance" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.entries(STANCE).map(([k, v]) => (
                      <button key={k} type="button" aria-pressed={stance === k} onClick={() => setStance(k)} style={{ minHeight: TOUCH, padding: "0 14px", fontFamily: FONT, fontSize: 14, fontWeight: stance === k ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${stance === k ? HOUSE.electric : firm}`, background: stance === k ? alpha(HOUSE.electric, 0.22) : "transparent", color: HOUSE.mist }}>{v.label}</button>
                    ))}
                  </div>
                </section>

                {!G.voided && opt.items.length > 0 && (
                  <section aria-label="Optimization opportunities" style={panel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                      <h2 style={{ ...h2, margin: 0 }}>Optimization opportunities</h2>
                      <div style={small}>{Math.round(opt.netTotal) === Math.round(opt.grossTotal) ? "Booked at full theoretical value" : "Booked"} <strong style={{ color: HOUSE.mist }}>{fmtK(opt.netTotal)}/mo</strong> ({fmtK(opt.netTotal * 12)}/yr){Math.round(opt.netTotal) === Math.round(opt.grossTotal) ? ", with no reduction" : `, reduced from ${fmtK(opt.grossTotal)}/mo theoretical`}</div>
                    </div>
                    <p style={{ ...small, margin: "0 0 12px" }}>Each lever acts on the volume the one before it leaves, so no contact is counted twice. Each is valued at marginal cost, then scaled by the {STANCE[stance].label.toLowerCase()} stance.</p>
                    {opt.items.map((o, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "12px 0", borderTop: `1px solid ${hair}` }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist, margin: "0 0 2px" }}>{o.title}</h3>
                          <p style={small}>{o.desc}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: HOUSE.mist, ...NUM }}>{fmtK(o.net)}/mo</div>
                          {o.net !== o.gross && <div style={small}>gross {fmtK(o.gross)}</div>}
                        </div>
                      </div>
                    ))}
                    {opt.occRisk && <Finding level="high" title={`Occupancy above ${pct0(BENCH.occupancy.cautionMax)}`}>Capturing these savings by reducing headcount will push occupancy higher and risk attrition. Staff to the 83 to 87% band instead of simply cutting.</Finding>}
                  </section>
                )}

                <HowOthersReport toolId={TOOL_ID} />
                {/* The report is paper (Brand Guide section 13). */}
                <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
                        <ReportActions
                          toolId={TOOL_ID}
                          toolName="Total Cost of Ownership Analysis"
                          subtitle={r.agents + " agents, " + (INDUSTRY[d.industry]?.label || d.industry) + ", " + STANCE[stance].label + " stance, " + G.confidence}
                          routePath={ROUTE}
                          state={dRaw}
                          defaults={SCENARIO_DEFAULTS}
                          confidence={G.confidence}
                          grades={G.gradeObj}
                          summary={G.voided ? [
                            { label: "Result", value: "Void. No figure was computed. See the failed check." },
                            { label: "Realization stance", value: STANCE[stance].label },
                          ] : [
                            { label: "Annual TCO", value: fmtK(r.annual) },
                            { label: "Three-year TCO", value: fmtK(r.threeYear) },
                            { label: "Cost per agent per month", value: fmt(r.perAgentMonth) },
                            { label: "Cost per contact", value: "$" + r.costPerContact.toFixed(2) },
                            { label: "Cost per resolution", value: "$" + r.costPerResolution.toFixed(2) },
                            { label: "Marginal cost per contact", value: "$" + r.marginalPerContact.toFixed(2) },
                            { label: "Labor share of TCO", value: r.disp.laborPctStr },
                            { label: "Realization stance", value: STANCE[stance].label },
                            { label: "Optimization booked monthly", value: fmtK(opt.netTotal) },
                            { label: "Optimization theoretical monthly", value: fmtK(opt.grossTotal) },
                          ]}
                          signals={{
                            /* Derived signals only. No wage, seat price, vendor name, contact
                               volume, or company detail leaves this block. Bands and booleans
                               carry the commercial meaning; the raw cost base stays in the
                               browser and in the report the user downloads. */
                            methodology_version: METHODOLOGY_VERSION,
                            /* Tracker 1-15. Ratio is the recoverable share of the cost base:
                               twelve months of de-overlapped gross optimization value over
                               annual TCO. It answers the question this tool exists to answer,
                               which is how much of what you spend the model can identify as
                               recoverable.
                               Numerator is grossTotal, not netTotal, deliberately. netTotal is
                               scaled by the stance factor and the None stance sets that factor
                               to zero, so a netTotal basis published none on a default case
                               carrying 71,000 a month of identified leak. A stance is an
                               attribution position on how much of the leak you dare book. It
                               is not a statement that the leak is absent.
                               Denominator is annual TCO, the headline this tool produces.
                               Rejected: labor, or agent labor, as a narrower addressable base.
                               Every lever here acts on labor, so a narrower denominator is
                               arguably more precise, but it raises the reported band for a
                               labor-light operation without a dollar more leaking, which is
                               the opposite of what a cost tool should report.
                               Rejected: cost per contact against a benchmark, which is the
                               natural reading for a cost-only tool. No cost benchmark exists
                               in benchmarks.js and inventing one would be an unsourced
                               constant.
                               Rejected: hasBlock and hasFlag, the prior basis. Those are input
                               hygiene, they are already published in full by confidence_class
                               on this same block, and reading them here meant this property
                               carried no information the wire did not already have.
                               Clamped at 1.0. Measured across 30,000 operations at maximal
                               targets, gross reaches 3.3 times annual TCO, which means the
                               targets entered are not physically achievable. severe is the
                               correct reading there.
                               Declared unreachable: nothing. none is reached when no lever
                               fires, which happens whenever every target equals current.
                               Most real operations sit in low, because a modelled operation
                               leaks single digit percentages of its base. That is the honest
                               distribution, and the outlier is what this band exists to find.
                               Nothing is published when annual TCO is zero. */
                            /* A void run publishes no property derived from its figures: they are not
                               finite, so any comparison on them reads as a false fact (S21 D17). A dropped
                               property reads as not published, never as zero (TAXONOMY rule 6). */
                            ...(G.voided ? {} : {
                              severity: severityBucket(r.annual > 0 ? Math.max(0, Math.min(1, (opt.grossTotal * 12) / r.annual)) : null),
                              booked_at_full_theoretical: Math.round(opt.netTotal) === Math.round(opt.grossTotal),
                              has_optimization_levers: opt.items.length > 0,
                              labor_dominant: r.laborPct >= 0.75,
                              spend_band: r.annual >= 5e7 ? "very_high" : r.annual >= 1e7 ? "high" : r.annual >= 2e6 ? "mid" : "low",
                            }),
                            confidence_class: G.confidence,
                            inputs_corrected: r.guards.length,
                            cost_basis: d.costBasis,
                            stance_class: stance,
                            modelling_implementation: n(d.implementationOneTime) > 0,
                            overrode_industry_default: d.industry !== "general",
                            pulled_from_upstream_tool: Object.keys(pulled).length > 0,
                            scale_band: r.agents >= 1000 ? "very_large" : r.agents >= 300 ? "large" : r.agents >= 75 ? "mid" : "small",
                            decision_ready_signal: !G.voided && G.evidence === "Planning-grade" && G.completeness === "Finance-grade" && opt.items.length > 0,
                          }}
                          sections={[
                          ...(r.guards.length ? [{ title: "⚠ Inputs Corrected Before Calculation", type: "findings", items: r.guards.map(guardLine) }] : []),
                          /* The document carries one confidence section, built by ReportActions from
                             the grade (doctrine Section 5.6 item 2). This section lists open issues and
                             never restates an axis. A void run carries none of it, because its checks
                             read figures that are not finite (S21 defects D15 and D16). */
                          ...(G.voided ? [] : [{ title: "Open Issues", type: "findings", items: [
                            `Cost basis is ${d.costBasis}, declared by your own account. It sets the sensitivity range for the cost inputs (wages and seat prices) and leaves the operational KPIs and headcount structure alone. It lifts cost evidence to Planning-grade at most. Headline sensitivity is plus or minus ${pct0(r.sensitivity.pct)} (annual ${fmtK(r.sensitivity.annualLow)} to ${fmtK(r.sensitivity.annualHigh)}).`,
                            ...(r.openIssues.length ? r.openIssues : ["No blocking issues on the confidence checks."]),
                            ...r.itemsToConfirm.map(m => "Confirm: " + m),
                          ]}]),
                          { title: "Organization Profile", type: "table", rows: [
                            ["Agents", r.agents.toString()], ["Supervisors", String(d.supervisors)], ["Sites", String(d.sites)],
                            ["Industry", INDUSTRY[d.industry]?.label || d.industry], ["Monthly Contacts", r.contacts.toLocaleString()],
                            ["AHT", mmss(d.aht)], ["FCR", pct(d.fcr)], ["Containment", pct(d.containment)], ["Occupancy", pct(d.occupancy)], ["Attrition", pct(d.attrition)],
                          ]},
                          /* A void result prints no computed figure and no reading of one. The
                             invariant and the remedy are stated once, by ReportActions (S21 D17). */
                          ...(G.voided ? [] : [
                          { title: "TCO Summary", type: "metrics", items: [
                            { label: "Annual TCO", value: fmtK(r.annual), color: ELECTRIC, sub: "Range " + fmtK(r.sensitivity.annualLow) + " to " + fmtK(r.sensitivity.annualHigh) },
                            { label: "3-Year TCO", value: fmtK(r.threeYear), color: ELECTRIC, sub: escLabel },
                            { label: "Per Agent/Month", value: fmt(r.monthly / r.agents), color: ELECTRIC, sub: "every cost in the model" },
                            { label: "Cost per Contact", value: "$" + r.costPerContact.toFixed(2), color: ELECTRIC },
                            { label: "Cost per Resolution", value: "$" + r.costPerResolution.toFixed(2), color: r.costPerResolution > r.costPerContact * 1.25 ? RED : AMBER },
                            { label: "Marginal per Contact", value: "$" + r.marginalPerContact.toFixed(2), color: MUTED, sub: "variable cost" },
                          ]},
                          { title: "3-Year Projection", type: "table", rows: (() => {
                            const impl = n(d.implementationOneTime);
                            const yr = reconcile([r.y1, r.y2, r.y3, impl], r.threeYear);
                            return [
                              ["Annual run-rate (Year 1)", fmt(yr[0])], ["Year 2", fmt(yr[1])], ["Year 3", fmt(yr[2])],
                              ["Escalators", escLabel + ", usage and facilities flat"],
                              ...(impl > 0 ? [["One-time implementation", fmt(yr[3])], ["Year 1 cash (run-rate + implementation)", fmt(yr[0] + yr[3])]] : []),
                              ["3-Year Total", fmt(Math.round(r.threeYear))],
                            ];
                          })()},
                          { title: "Cost Reconciliation", type: "table", rows: (() => {
                            const v = r.disp.rows;
                            return [
                              ["Labor, agents", fmt(v[0])],
                              ["Labor, supervisors, QA, WFM, trainers, IT", fmt(v[1])],
                              ["Technology, " + r.breakdown.seats + " seats (CCaaS, WEM, CRM)", fmt(v[2])],
                              ["Technology, AI usage, analytics, iPaaS, recording, knowledge, security", fmt(v[3])],
                              ["Technology, telephony (" + Math.round(r.voiceMinutes).toLocaleString() + " min)", fmt(v[4])],
                              ["Overhead, cloud, professional services, facilities", fmt(v[5])],
                              ["Overhead, attrition (" + r.monthlyHires + " hires at " + fmt(r.perHire) + " loaded cost per hire)", fmt(v[6])],
                              ["Total monthly", fmt(r.disp.total)],
                            ];
                          })()},
                          { title: "Cost Distribution", type: "table", rows: [
                            ["Labor", fmt(r.disp.labor) + "/mo (" + r.disp.laborPctStr + ")"],
                            ["Technology", fmt(r.disp.tech) + "/mo (" + r.disp.techPctStr + ")"],
                            ["Overhead", fmt(r.disp.overhead) + "/mo (" + r.disp.overheadPctStr + ")"],
                          ]},
                          { title: "Analyst Read", type: "findings", items: analyst },
                          { title: "Optimization Opportunities", type: "actions", items: opt.items.slice(0, 4).map((o, i) => ({ action: o.title + ", " + fmtK(o.net) + "/mo", detail: o.desc, priority: (() => { const rank = [...opt.items].sort((a, b) => b.net - a.net).findIndex(x => x === o); return rank === 0 ? "high" : rank === 1 ? "medium" : undefined; })() })) },
                          ]),
                          { title: "Methodology", type: "text", content: `TCO covers labor, technology, and overhead. Labor cost is computed on ${benchmark("tco.hours.month")} paid hours per agent per month (2080 annual hours divided by 12); at ${pct0(d.shrinkage)} shrinkage that is roughly ${Math.round(r.productiveHours)} productive hours, but cost uses paid hours because shrinkage time is paid. The 3-year view carries the current operation forward with two escalators (this analysis uses ${escLabel}. The tool defaults are wage ${pctD(benchmark("tco.escalator.wage"))} and license ${pctD(benchmark("tco.escalator.license"))}). Usage and facilities are held flat, and any one-time implementation is added once and never escalates. Year 1 equals the annual snapshot so the views reconcile. Annual TCO is recurring run-rate and excludes the one-time implementation, which appears only in Year 1 cash and the 3-year total. Cost per resolution uses cost per contact times (2 minus FCR), the standard one-plus-repeat model. The tool does not use cost per contact divided by FCR. Optimization savings are valued at marginal (variable) cost, the handle-time labor freed per contact, because technology and facilities costs stay the same when volume drops. Optimization levers act on agent-handled volume (gross demand minus contained contacts). Each acts on the volume the one before it leaves, so no contact is counted twice, and the total is scaled by the ${STANCE[stance].label.toLowerCase()} realization stance.${r.guards.length ? ` INPUTS CORRECTED: ${r.guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : ""} The full method, with every formula, constant and a worked example, is published at contactcentercx.com/methodology/tco-calculator. ${BENCHMARK_SOURCES}` },
                        ]}
                        />
                </div>
              </div>
            )}
    </ToolFrame>
  );
}

export default function TCOCalculator() {
  return <Calculator />;
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { SCENARIO_DEFAULTS };
