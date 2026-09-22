/* aid.test.mjs
   Slices the @engine-start..@engine-end region out of AIDeflectionRealityCheck.jsx and
   tests the DEPLOYED engine, using the REAL shared constants imported from
   ./src/lib/mech.js. Nothing is reconstructed. If that module is missing, renamed, or
   structurally changed, this harness fails rather than passing on invented values.
   Run from repo root: node aid.test.mjs */
import { readFileSync } from "fs";

/* ---- dependency integrity. Import the real module, do not rebuild it. ---- */
let MECHMOD;
let MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL, createGuards, BENCHMOD, CONF;
try {
  const m = await import("./src/lib/mech.js");
  MECHMOD = m;
  ({ MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL } = m);
  ({ createGuards } = await import("./src/lib/guards.js"));
  BENCHMOD = await import("./src/lib/benchmarks.js");
  CONF = await import("./src/lib/confidence.js");
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/mech.js or ./src/lib/guards.js. The engine cannot be");
  console.error("verified against reconstructed constants. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---- 0. Validate the shared module itself before trusting anything downstream ---- */
A("mech.js exports MECH, MECH_ORDER and both named mech constants",
  !!MECH && Array.isArray(MECH_ORDER) && typeof MECH_FALLBACK === "string" && typeof MECH_INITIAL === "string");
A("both mech constants are keys in MECH", !!MECH[MECH_FALLBACK] && !!MECH[MECH_INITIAL]);
A("the resolver fallback realizes zero and credits nothing", MECH[MECH_FALLBACK].f === 0 && MECH[MECH_FALLBACK].cred === "none");
A("the ambiguous MECH_DEFAULT name is retired from mech.js", !("MECH_DEFAULT" in MECHMOD));
A("every MECH_ORDER key exists in MECH", MECH_ORDER.every(k => !!MECH[k]));
A("MECH_ORDER covers every MECH key", Object.keys(MECH).every(k => MECH_ORDER.indexOf(k) >= 0));
A("every MECH entry has numeric f in [0,1], a label, and a cred class",
  Object.values(MECH).every(v => typeof v.f === "number" && v.f >= 0 && v.f <= 1 && typeof v.label === "string" && typeof v.cred === "string"));
A("MECH_ORDER is monotonically non-decreasing in f",
  MECH_ORDER.every((k, i) => i === 0 || MECH[k].f >= MECH[MECH_ORDER[i - 1]].f));
A("a zero-realization option exists, so 'none' can mean $0",
  Object.values(MECH).some(v => v.f === 0));
A("at least one cash-class option exists, so Finance-grade is reachable",
  Object.values(MECH).some(v => v.cred === "cash"));
A("cred classes are drawn from the known taxonomy",
  Object.values(MECH).every(v => ["none","capacity","finance","cash"].indexOf(v.cred) >= 0));

/* ---- load the shipped engine ---- */
const src = readFileSync("./AIDeflectionRealityCheck.jsx", "utf8");
const a = src.indexOf("/* @engine-start"), b = src.indexOf("/* @engine-end */");
if (a < 0 || b < 0) { console.error("BLOCKER: engine markers not found."); process.exit(1); }
const region = src.slice(a, b).replace(/^export /gm, "");
const { engine: engineRaw, buildScenarios, gradeAID, fieldOrigin, BASE: AID_BASE, V_A, V_B, TOOL_ID } = new Function("MECH", "MECH_INITIAL", "createGuards",
  "benchmark", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "realizationFromCred",
  region + "\nreturn { engine, buildScenarios, gradeAID, fieldOrigin, BASE, V_A, V_B, TOOL_ID };")(MECH, MECH_INITIAL, createGuards,
  BENCHMOD.benchmark, CONF.emitGrades, CONF.voidResult, CONF.isVoid, CONF.railEvidence, CONF.weakerStream, CONF.realizationFromCred);
/* The component runs engine, then gradeAID on the same inputs. The harness composes
   them the same way, so every assertion below reads the grade the page prints. */
const engine = (I, pre = {}, railOrigin = null) => {
  const r = engineRaw(I);
  const g = gradeAID({ I, r, pre, railOrigin });
  return { ...r, ...g, headlineConf: g.confidence };
};

/* the harness must exercise the real ladder, whatever it contains */
const MECH_KEYS = MECH_ORDER.slice();
const CASH_KEY = MECH_KEYS.filter(k => MECH[k].cred === "cash").pop();
const ZERO_KEY = MECH_KEYS.filter(k => MECH[k].f === 0)[0];

const DEF = { M:80000, cpc:7, marg:0, eligibleRate:55, mech:MECH_INITIAL, rampOn:false, rampMonths:6,
  evidence:"estimate", costBasisOwned:false, apparentResolutionRate:65, repeatLeakRate:18,
  escalationPenalty:25, implOneTime:0, botPlatformCost:8000, qaCost:2000, tuningHours:40,
  tuningRate:65, knowledgeMaintHours:20, knowledgeRate:55 };

/* ---- 1. Waterfall reconciliation ---- */
let maxErr = 0;
for (let i = 0; i < 8000; i++) {
  const I = { ...DEF, M:Math.random()*3e5, cpc:1+Math.random()*20, marg:Math.random()<.5?0:1+Math.random()*15,
    eligibleRate:Math.random()*100, apparentResolutionRate:Math.random()*100, repeatLeakRate:Math.random()*100,
    escalationPenalty:Math.random()*200, mech:MECH_KEYS[Math.floor(Math.random()*MECH_KEYS.length)],
    botPlatformCost:Math.random()*2e4, qaCost:Math.random()*5e3, implOneTime:Math.random()*2e5 };
  const r = engine(I);
  maxErr = Math.max(maxErr, Math.abs(r.waterfallSum - r.netSavings));
}
A("waterfall reconciles to net savings, max err " + maxErr.toExponential(2), maxErr < 1e-6);

/* ---- 2. Domain safety under hostile input ---- */
let rateOK=true, botOK=true, ordOK=true, finOK=true, nanOK=true;
for (let i = 0; i < 20000; i++) {
  const I = { ...DEF, M:(Math.random()-.2)*3e5, cpc:(Math.random()-.1)*30, marg:(Math.random()-.1)*30,
    eligibleRate:(Math.random()*1.4-.2)*100, apparentResolutionRate:(Math.random()*1.4-.2)*100,
    repeatLeakRate:(Math.random()*1.4-.2)*100, escalationPenalty:(Math.random()*2.4-.2)*100,
    mech:MECH_KEYS[Math.floor(Math.random()*MECH_KEYS.length)] };
  const r = engine(I);
  if (!(r.netAutomationRate >= 0 && r.netAutomationRate <= 100)) rateOK = false;
  if (!(r.botResolutionRate >= 0 && r.botResolutionRate <= 100)) botOK = false;
  if (r.netAutomationRate > r.botResolutionRate + 1e-9) ordOK = false;
  if (!isFinite(r.netSavings) || !isFinite(r.year1)) finOK = false;
  if ([r.netSavings,r.netAutomationRate,r.botResolutionRate,r.year1,r.escSwing].some(v => typeof v !== "number" || isNaN(v))) nanOK = false;
}
A("net automation rate cannot leave [0,100]", rateOK);
A("bot resolution rate cannot leave [0,100]", botOK);
A("net automation <= bot resolution always, Channel Shift invariant", ordOK);
A("net savings and year 1 are always finite", finOK);
A("no NaN reaches any reported figure", nanOK);

/* ---- 3. Closed-form break-even zeros ---- */
{ const r = engine(DEF);
  if (isFinite(r.beResPct)) { const r2 = engine({ ...DEF, apparentResolutionRate:r.beResPct });
    A("break-even resolution zeroes net savings, got $" + r2.netSavings.toFixed(4), Math.abs(r2.netSavings) < 1); }
  if (r.repeatTolPct != null && r.repeatTolPct > 0 && r.repeatTolPct < 100) {
    const r3 = engine({ ...DEF, repeatLeakRate:r.repeatTolPct });
    A("max tolerable repeat zeroes net savings, got $" + r3.netSavings.toFixed(4), Math.abs(r3.netSavings) < 1); }
}

/* ---- 4. Denominator identities ---- */
{ const r = engine(DEF);
  A("vendorClaim = M * R * loadedCPC", Math.abs(r.vendorClaim - 80000*0.65*7) < 1e-6);
  A("botResolutionRate = R(1-rho), of ROUTED", Math.abs(r.botResolutionRate - 0.65*(1-0.18)*100) < 1e-9);
  A("netAutomationRate = E*R(1-rho), of TOTAL", Math.abs(r.netAutomationRate - 0.55*0.65*(1-0.18)*100) < 1e-9);
  A("durable = attempted * dur", Math.abs(r.durable - r.attempted*r.dur) < 1e-6);
  A("postBotHuman = attempted - durable", Math.abs(r.postBotHuman - (r.attempted - r.durable)) < 1e-6);
  A("escalation premium covers ALL post-bot human contacts", Math.abs(r.escalationPremium - r.postBotHuman*r.marg*r.esc) < 1e-6);
}

/* ---- 5. Monotonicity, driven by the real ladder ---- */
{ let m1=true, p1=Infinity;
  for (let rho=0; rho<=60; rho+=5) { const r=engine({...DEF,repeatLeakRate:rho}); if(r.netSavings>p1+1e-6)m1=false; p1=r.netSavings; }
  A("net savings non-increasing in repeat rate", m1);
  let m2=true, p2=-Infinity;
  for (let el=10; el<=90; el+=10) { const r=engine({...DEF,eligibleRate:el}); if(r.netSavings<p2-1e-6)m2=false; p2=r.netSavings; }
  A("net savings non-decreasing in eligibility", m2);
  let m3=true, p3=-Infinity;
  for (const k of MECH_KEYS) { const r=engine({...DEF,mech:k}); if(r.netSavings<p3-1e-6)m3=false; p3=r.netSavings; }
  A("net savings non-decreasing across the real MECH ladder", m3);
  A("zero-realization option yields no capacity value", engine({...DEF,marg:4.2,mech:ZERO_KEY,escalationPenalty:0}).netSavings === -engine({...DEF,marg:4.2,mech:ZERO_KEY,escalationPenalty:0}).opexMonthly);
}

/* ---- 6. Doctrine: loaded cost moves the claim, never the savings ---- */
{ const lo=engine({...DEF,cpc:7,marg:4.2}), hi=engine({...DEF,cpc:14,marg:4.2});
  A("loaded cost moves the vendor claim", hi.vendorClaim > lo.vendorClaim*1.9);
  A("loaded cost does NOT move net savings when marginal is supplied", Math.abs(hi.netSavings-lo.netSavings) < 1e-6);
}

/* ---- 7. Confidence gates ---- */
A("defaulted marginal forces Directional", engine(DEF).headlineConf === "Directional");
/* Every graded field moved off its default, so the only thing standing between this
   case and Finance-grade is the self-declared evidence. Decision I1, session 16. */
const OWN_ALL = { ...DEF, M:90000, marg:4.2, eligibleRate:52, apparentResolutionRate:66, repeatLeakRate:15, escalationPenalty:22, botPlatformCost:7500 };
A("Finance-grade is unreachable: cash action, pilot evidence, attested basis and every field entered stop at Planning-grade",
  engine({...OWN_ALL,costBasisOwned:true,evidence:"pilot",mech:CASH_KEY}).headlineConf === "Planning-grade");
A("a contracted floor stops at Planning-grade too", engine({...OWN_ALL,costBasisOwned:true,evidence:"sla",mech:CASH_KEY}).headlineConf === "Planning-grade");
A("pilot evidence on default rates grades Directional", engine({...DEF,marg:4.2,costBasisOwned:true,evidence:"pilot",mech:CASH_KEY}).headlineConf === "Directional");
A("marginal above loaded is a hard flag to Directional", engine({...DEF,marg:99,cpc:7}).headlineConf === "Directional");
A("no self-credentialing: consistency alone cannot reach Finance",
  engine({...DEF,marg:4.2,costBasisOwned:false,evidence:"estimate",mech:CASH_KEY}).headlineConf !== "Finance-grade");
A("marketing evidence caps at Directional",
  engine({...DEF,marg:4.2,costBasisOwned:true,evidence:"marketing",mech:CASH_KEY}).headlineConf === "Directional");

/* ---- 8. Rail contract ---- */
A("M=0 blocks rail publish", engine({...DEF,M:0}).railPublished === false);
A("normal case publishes rail", engine(DEF).railPublished === true);
A("rail values are fractions in [0,1]", (()=>{const r=engine(DEF);return r.railRate>=0&&r.railRate<=1&&r.railBot>=0&&r.railBot<=1;})());

/* ---- 9. All four verdicts reachable ---- */
{ const vP=engine({...DEF,marg:4.2,costBasisOwned:true,evidence:"pilot",mech:CASH_KEY,eligibleRate:60,apparentResolutionRate:75,repeatLeakRate:10}).verdict;
  const vB=engine({...DEF,marg:4.2,eligibleRate:60,apparentResolutionRate:70,repeatLeakRate:12,evidence:"estimate",mech:MECH_INITIAL}).verdict;
  const vF=engine({...DEF,marg:4.2,eligibleRate:20,apparentResolutionRate:70,repeatLeakRate:12,evidence:"pilot",mech:CASH_KEY}).verdict;
  const vN=engine({...DEF,marg:4.2,eligibleRate:40,apparentResolutionRate:20,repeatLeakRate:60,botPlatformCost:60000,mech:CASH_KEY,evidence:"pilot"}).verdict;
  A("verdict: Proceed reachable", vP.indexOf("Proceed") === 0);
  A("verdict: Pilot reachable", vB.indexOf("Run a bounded") === 0);
  A("verdict: Fix the foundation reachable", vF.indexOf("Fix the foundation") === 0);
  A("verdict: Buy nothing reachable", vN.indexOf("Buy nothing") === 0);
  A("zero-realization action never yields Proceed", engine({...DEF,marg:4.2,mech:ZERO_KEY,evidence:"pilot"}).verdict.indexOf("Proceed") !== 0);
}

/* ---- 10. Scenarios name their own assumptions ---- */
{ const sc = buildScenarios({...DEF, marg:4.2});
  A("three scenarios returned", sc.length === 3);
  A("conservative <= expected <= stretch", sc[0].netSavings <= sc[1].netSavings + 1e-6 && sc[1].netSavings <= sc[2].netSavings + 1e-6);
  A("each scenario states eligibility, resolution, repeat", sc.every(x => x.eligibleRate && x.apparentResolutionRate && x.repeatLeakRate !== undefined));
}

/* ---- 11. Escalation premium is never a silent constant ---- */
{ const r = engine({...DEF, marg:4.2});
  A("escalation at zero is reported", typeof r.netAtEscZero === "number");
  A("escalation at double is reported", typeof r.netAtEscDouble === "number");
  A("zero-escalation net is the most favourable of the three", r.netAtEscZero >= r.netSavings - 1e-9 && r.netSavings >= r.netAtEscDouble - 1e-9);
  A("escalation swing is non-negative", r.escSwing >= 0);
  A("escalation set to zero removes the premium entirely", engine({...DEF,marg:4.2,escalationPenalty:0}).escalationPremium === 0);
}

/* ---- 12. Boundary cases ---- */
{ const cases = [
    {...DEF, M:0}, {...DEF, cpc:0, marg:0}, {...DEF, eligibleRate:0}, {...DEF, apparentResolutionRate:0},
    {...DEF, repeatLeakRate:100}, {...DEF, eligibleRate:100, apparentResolutionRate:100, repeatLeakRate:0},
    {...DEF, escalationPenalty:0, mech:ZERO_KEY}, {...DEF, botPlatformCost:0,qaCost:0,tuningHours:0,knowledgeMaintHours:0},
    {...DEF, M:1e9, cpc:1e6, marg:1e6},
  ];
  let ok = true;
  for (const c of cases) { try { const r = engine(c);
    if ([r.netSavings,r.netAutomationRate,r.botResolutionRate,r.year1].some(v => typeof v !== "number" || isNaN(v))) ok = false;
  } catch (e) { ok = false; } }
  A("boundary cases produce no NaN and no throw", ok);
}

/* ---- 13. Integrity flags fire ---- */
{ A("defaulted marginal raises a flag", engine(DEF).flags.some(f => /assumed at 60%/.test(f)));
  A("denominator check flag present when resolving", engine({...DEF,marg:4.2}).flags.some(f => /Denominator check/.test(f)));
  A("zero-realization action raises a flag", engine({...DEF,marg:4.2,mech:ZERO_KEY}).flags.some(f => /realized savings are \$0/.test(f)));
  A("eligibility above 90 raises a flag", engine({...DEF,marg:4.2,eligibleRate:95}).flags.some(f => /rare/.test(f)));
  A("dominant escalation premium raises a flag",
    engine({...DEF,marg:4.2,escalationPenalty:200,apparentResolutionRate:30,repeatLeakRate:50}).flags.some(f => /directional, not measured/.test(f)));
}


/* ---- 14. PDF reconciliation defects, regression-locked ---- */
{
  /* The PDF was produced with the 90% cash-class action. Select it by FACTOR, not by
     label or by position, because the deployed module's labels differ from any local
     copy and a label match would be a false positive. */
  const KEY_90 = MECH_ORDER.filter(k => MECH[k].f === 0.9 && MECH[k].cred === "cash")[0];
  A("a 0.9 cash-class capacity action exists in mech.js", !!KEY_90);
  const RECON = { M:200000, cpc:4.5, marg:2.7, eligibleRate:65, mech:KEY_90, rampOn:true, rampMonths:7,
    evidence:"proposal", costBasisOwned:true, apparentResolutionRate:67, repeatLeakRate:15,
    escalationPenalty:35, implOneTime:50000, botPlatformCost:5500, qaCost:2750,
    tuningHours:80, tuningRate:55, knowledgeMaintHours:20, knowledgeRate:55 };
  const r = engine(RECON);

  /* Figures verified line by line against the exported PDF of 22 July 2026. */
  A("recon: net monthly savings is 113268", Math.round(r.netSavings) === 113268);
  A("recon: vendor claim is 603000", Math.round(r.vendorClaim) === 603000);
  A("recon: year 1 net is 928163", Math.round(r.year1) === 928163);
  A("recon: steady annual is 1359218", Math.round(r.steadyAnnual) === 1359218);
  A("recon: payback is month 3", r.payback === 3);
  A("recon: upside case is 189698", Math.round(r.bestNet) === 189698);
  A("recon: escalation swing is 105774", Math.round(r.escSwing) === 105774);
  A("recon: net automation is 37.0 percent", r.netAutomationRate.toFixed(1) === "37.0");
  A("recon: bot resolution is 57.0 percent", r.botResolutionRate.toFixed(1) === "57.0");
  A("recon: break-even resolution is 36.6 percent", r.beResPct.toFixed(1) === "36.6");
  A("recon: exactly one integrity flag fires", r.flags.length === 1);
  A("recon: headline is Planning-grade, bound by evidence", r.headlineConf === "Planning-grade" && r.evidence === "Planning-grade" && r.realization === "Finance-grade" && r.completeness === "Finance-grade" && r.gradeObj.boundBy === "evidence");
  A("recon: the grade rationale is one whole paragraph", /^Bound by evidence\. [A-Z]/.test(r.gradeWhy) && /\.$/.test(r.gradeWhy) && !/because .*because/.test(r.gradeWhy));

  /* Defect 2. A scenario label a reader recomputes from must be the value the engine used. */
  const sc = buildScenarios(RECON);
  let labelsMatch = true;
  for (const x of sc) {
    const re = engine({ ...RECON, eligibleRate:x.eligibleRate, apparentResolutionRate:x.apparentResolutionRate, repeatLeakRate:x.repeatLeakRate });
    if (Math.abs(re.netSavings - x.netSavings) > 1e-6) labelsMatch = false;
    if (Math.abs(re.netAutomationRate - x.netAutomationRate) > 1e-9) labelsMatch = false;
  }
  A("scenario labels reproduce their own net savings exactly", labelsMatch);
  A("scenario labels are integers, not rounded display strings",
    sc.every(x => Number.isInteger(x.eligibleRate) && Number.isInteger(x.apparentResolutionRate) && Number.isInteger(x.repeatLeakRate)));

  /* Defect 3. Rates are named, never referred to by position. */
  A("integrity flags never refer to a rate by ordinal position",
    !r.flags.some(f => /the (first|second|third|fourth) denominator|responds to the (first|second|third|fourth)/.test(f)));
}


/* ---- 15. Second PDF reconciliation, 22 July 2026, and confidence-sentence grammar ---- */
{
  const KEY_90b = MECH_ORDER.filter(k => MECH[k].f === 0.9 && MECH[k].cred === "cash")[0];
  const R2 = { M:300000, cpc:4.32, marg:2.59, eligibleRate:71, mech:KEY_90b, rampOn:true, rampMonths:7,
    evidence:"pilot", costBasisOwned:true, apparentResolutionRate:74, repeatLeakRate:12,
    escalationPenalty:33, implOneTime:75000, botPlatformCost:7500, qaCost:1700,
    tuningHours:80, tuningRate:55, knowledgeMaintHours:17, knowledgeRate:75 };
  const r2 = engine(R2);
  A("recon2: net monthly savings is 244948", Math.round(r2.netSavings) === 244948);
  A("recon2: vendor claim is 959040", Math.round(r2.vendorClaim) === 959040);
  A("recon2: year 1 net is 2084910", Math.round(r2.year1) === 2084910);
  A("recon2: steady annual is 2939380", Math.round(r2.steadyAnnual) === 2939380);
  A("recon2: payback is month 2", r2.payback === 2);
  A("recon2: upside case is 369477", Math.round(r2.bestNet) === 369477);
  A("recon2: escalation swing is 126999", Math.round(r2.escSwing) === 126999);
  A("recon2: net automation is 46.2 percent", r2.netAutomationRate.toFixed(1) === "46.2");
  A("recon2: bot resolution is 65.1 percent", r2.botResolutionRate.toFixed(1) === "65.1");
  A("recon2: break-even resolution is 33.0 percent", r2.beResPct.toFixed(1) === "33.0");
  A("recon2: pilot evidence and an attested basis stop at Planning-grade", r2.evidence === "Planning-grade" && r2.realization === "Finance-grade" && r2.completeness === "Finance-grade" && r2.headlineConf === "Planning-grade");

  /* The rationale must stand alone in the export: capitalised, terminated, no stutter,
     no undefined, and every applicable axis carries a reason. */
  const sentenceOK = (x) => /^[A-Z]/.test(x) && /[.]$/.test(x) && !/undefined|\.\.| because .* because /.test(x);
  let allOK = true;
  for (const ev of ["estimate","marketing","proposal","sla","pilot"])
    for (const k of MECH_ORDER)
      for (const marg of [0, 2.59])
        for (const owned of [true,false]) {
          const t = engine({ ...R2, evidence:ev, mech:k, marg, costBasisOwned:owned });
          if (!sentenceOK(t.gradeWhy)) allOK = false;
          for (const ax of t.gradeObj.applicable) if (!sentenceOK(t.gradeObj.reasons[ax])) allOK = false;
          if (t.gradeObj.defects.length) allOK = false;
        }
  A("the grade rationale is standalone and stutter-free across every gate combination", allOK);
}


/* ---- 15. Confidence sentence, all three axis states. Regression from PDF run 2,
   where both axes reached Finance-grade and the report still claimed one was weaker,
   and rendered the clause as a lowercase fragment after a full stop. ---- */
{
  const BASE = { M:300000, cpc:4.32, marg:2.59, eligibleRate:71, rampOn:true, rampMonths:7,
    costBasisOwned:true, apparentResolutionRate:74, repeatLeakRate:12, escalationPenalty:33,
    implOneTime:75000, botPlatformCost:7500, qaCost:1700, tuningHours:80, tuningRate:55,
    knowledgeMaintHours:17, knowledgeRate:75 };
  const K90 = MECH_ORDER.filter(k => MECH[k].f === 0.9 && MECH[k].cred === "cash")[0];

  const tied  = engine({ ...BASE, evidence:"pilot", mech:K90 });            // Planning / Finance / Finance
  const both  = engine({ ...BASE, evidence:"pilot", mech:MECH_INITIAL });   // Planning / Planning / Finance
  const rlLow = engine({ ...BASE, evidence:"pilot", mech:ZERO_KEY });       // Planning / Directional / Finance

  A("evidence-bound case names evidence alone", tied.gradeObj.boundBy === "evidence" && /^Bound by evidence\./.test(tied.gradeWhy));
  A("a tie names both axes and claims neither is weaker", both.gradeObj.boundBy === "evidence and realization" && /^Bound by evidence and realization\./.test(both.gradeWhy));
  A("realization-bound case names realization alone", rlLow.gradeObj.boundBy === "realization" && /No capacity action is selected/.test(rlLow.gradeWhy));

  for (const [nm, r] of [["evidence-bound",tied],["tied",both],["realization-bound",rlLow]]) {
    A(nm + ": gradeWhy starts capitalised", /^[A-Z]/.test(r.gradeWhy));
    A(nm + ": gradeWhy ends with a full stop", /\.$/.test(r.gradeWhy));
    A(nm + ": gradeWhy has no double-because stutter", (r.gradeWhy.match(/ because /g) || []).length <= 1);
  }

  /* The headline is the minimum of the applicable axes, computed by confidence.js. */
  for (const r of [tied, both, rlLow])
    A("headline equals the weakest axis", r.headlineConf === CONF.gradeConfidence({ evidence: r.evidence, realization: r.realization, completeness: r.completeness }).headline);

  /* Reconciliation, PDF run 2 of 22 July 2026. */
  A("recon2: net monthly savings is 244948", Math.round(tied.netSavings) === 244948);
  A("recon2: year 1 net is 2084910", Math.round(tied.year1) === 2084910);
  A("recon2: payback is month 2", tied.payback === 2);
  A("recon2: escalation swing is 126999", Math.round(tied.escSwing) === 126999);
  A("recon2: net automation is 46.2 percent", tied.netAutomationRate.toFixed(1) === "46.2");
  A("recon2: bot resolution is 65.1 percent", tied.botResolutionRate.toFixed(1) === "65.1");
  A("recon2: headline is Planning-grade under Decision I1", tied.headlineConf === "Planning-grade");
}


/* ---- 16. Reconciliation run 3, PDF of 22 July 2026. Exercises the 0.75 capacity
   action, an 8-month ramp, and the realization-weaker confidence branch. Together with
   blocks 14 and 15 this pins three independent input sets and all three axis states. ---- */
{
  const K75 = MECH_ORDER.filter(k => MECH[k].f === 0.75)[0];
  A("a 0.75 capacity action exists in mech.js", !!K75);
  const R3 = { M:300000, cpc:4.21, marg:2.53, eligibleRate:72, mech:K75, rampOn:true, rampMonths:8,
    evidence:"pilot", costBasisOwned:true, apparentResolutionRate:71, repeatLeakRate:12,
    escalationPenalty:32, implOneTime:75000, botPlatformCost:7500, qaCost:1700,
    tuningHours:80, tuningRate:45, knowledgeMaintHours:32, knowledgeRate:65 };
  const r = engine(R3);
  A("recon3: net monthly savings is 175588", Math.round(r.netSavings) === 175588);
  A("recon3: vendor claim is 896730", Math.round(r.vendorClaim) === 896730);
  A("recon3: operating cost is 14880", Math.round(r.opexMonthly) === 14880);
  A("recon3: year 1 net over an 8-month ramp is 1365418", Math.round(r.year1) === 1365418);
  A("recon3: steady annual is 2107055", Math.round(r.steadyAnnual) === 2107055);
  A("recon3: payback is month 3", r.payback === 3);
  A("recon3: upside case is 278548", Math.round(r.bestNet) === 278548);
  A("recon3: escalation swing is 131225", Math.round(r.escSwing) === 131225);
  A("recon3: net automation is 45.0 percent", r.netAutomationRate.toFixed(1) === "45.0");
  A("recon3: bot resolution is 62.5 percent", r.botResolutionRate.toFixed(1) === "62.5");
  A("recon3: break-even resolution is 36.9 percent", r.beResPct.toFixed(1) === "36.9");
  A("recon3: realization reads the 0.75 action's credit class", r.realization === CONF.realizationFromCred(MECH[K75].cred));
  A("recon3: headline is Planning-grade and the rationale names every binding axis",
    r.headlineConf === "Planning-grade" && r.evidence === "Planning-grade" && r.gradeObj.boundAxes.every(ax => r.gradeWhy.indexOf(ax) > 0));
  A("recon3: waterfall closes", Math.abs(r.waterfallSum - r.netSavings) < 1e-6);

  /* Scenario labels must reproduce their own math on this input set too. */
  let ok = true;
  for (const x of buildScenarios(R3)) {
    const re = engine({ ...R3, eligibleRate:x.eligibleRate, apparentResolutionRate:x.apparentResolutionRate, repeatLeakRate:x.repeatLeakRate });
    if (Math.abs(re.netSavings - x.netSavings) > 1e-6) ok = false;
  }
  A("recon3: scenario labels reproduce their own net savings", ok);
}

/* ---- 12. Typography invariance and type-system compliance ----------------
   A type change must move zero numbers. These assertions pin the headline
   figures of the default input set so any future styling pass that touches
   this file has to prove it changed nothing computational, and they refuse
   the hand-written font stacks that type.js exists to eliminate. */
{
  const T = engine(DEF);
  A("type: default net savings is exactly 38,598", Math.round(T.netSavings) === 38598);
  A("type: default net automation is 29.3 percent", T.netAutomationRate.toFixed(1) === "29.3");
  A("type: default bot resolution is 53.3 percent", T.botResolutionRate.toFixed(1) === "53.3");
  A("type: default escalation swing is exactly 43,151", Math.round(T.escSwing) === 43151);
  A("type: default verdict is 'Run a bounded pilot'", T.verdict === "Run a bounded pilot");
  A("type: default headline confidence is Directional", T.headlineConf === "Directional");
  A("type: default waterfall still closes to net", Math.abs(T.waterfallSum - T.netSavings) < 1e-6);

  A("type: file imports the shared type system", /from\s+"\.\/src\/lib\/type"/.test(src));
  A("type: no hand-written font stack survives", src.indexOf('fontFamily: "') < 0);
  A("type: Instrument Serif is gone", src.indexOf("Instrument Serif") < 0);
  A("type: DM Sans is gone", src.indexOf("DM Sans") < 0);
  A("type: the Archivo import is loaded on the page", src.indexOf("FONT_IMPORT_CSS") >= 0);
  A("type: zero em-dashes", src.indexOf(String.fromCharCode(0x2014)) < 0);
}

/* ---- Tracker 1-15: the band ratio, in the engine where it can be tested ---- */
/*
 * severityRatio is break-even resolution over claimed resolution: the share of the
 * claimed rate consumed simply paying for the program. It is computed in the engine
 * rather than in the JSX so these assertions can reach it. The rendered gate in
 * aid.report.mjs then proves the band the document publishes comes from this figure.
 */
{
  const CASH = MECH_KEYS.filter(k => MECH[k].cred === "cash").pop();
  const inDomain = (x) => x === null || (typeof x === "number" && x >= 0 && x <= 1);

  A("ratio is in domain on the shipped default", inDomain(engine(DEF).severityRatio));

  let domainOK = true, monoOK = true;
  for (let i = 0; i < 20000; i++) {
    const I = { ...DEF, M:(Math.random()-.2)*3e5, cpc:(Math.random()-.1)*30, marg:(Math.random()-.1)*30,
      eligibleRate:(Math.random()*1.4-.2)*100, apparentResolutionRate:(Math.random()*1.4-.2)*100,
      repeatLeakRate:(Math.random()*1.4-.2)*100, escalationPenalty:(Math.random()*2.4-.2)*100,
      mech:MECH_KEYS[Math.floor(Math.random()*MECH_KEYS.length)],
      botPlatformCost:Math.random()*2e4, qaCost:Math.random()*5e3 };
    const x = engine(I);
    if (!inDomain(x.severityRatio)) domainOK = false;
    /* A program that does not break even at any rate is the top of the scale, always. */
    if (x.attempted > 0 && !isFinite(x.beResPct) && x.severityRatio !== 1) monoOK = false;
  }
  A("ratio stays in domain under hostile input across 20,000 cases", domainOK);
  A("an unreachable break-even is always the top of the scale", monoOK);

  /* Both ends of the scale are reachable, which is the whole point of the retrofit. */
  const free = engine({ ...DEF, marg:4.2, mech:CASH, escalationPenalty:0, botPlatformCost:0,
    qaCost:0, tuningHours:0, knowledgeMaintHours:0 });
  A("bottom of the scale is reachable: a program with no operating cost", free.severityRatio === 0);
  const dead = engine({ ...DEF, marg:4.2, mech:ZERO_KEY });
  A("top of the scale is reachable: no capacity action converts freed time", dead.severityRatio === 1);

  /* A zero claim against a positive break-even is not unknown. It is a claim sitting
     below any rate that pays. The first cut withheld the band here. */
  const noClaim = engine({ ...DEF, marg:4.2, mech:CASH, apparentResolutionRate:0 });
  A("a zero claim against a positive break-even is the top of the scale", noClaim.severityRatio === 1);
  A("that case does have a finite break-even, so it is not the unreachable case", isFinite(noClaim.beResPct));

  /* Withheld only when there is no eligible volume routed at all. */
  const empty = engine({ ...DEF, marg:4.2, mech:CASH, eligibleRate:0 });
  A("no eligible volume routed withholds the ratio rather than reporting a band", empty.severityRatio === null);

  /* The ratio moves with cost, holding the claim fixed. More operating spend means more
     of the claimed rate is consumed paying for it. */
  const cheap = engine({ ...DEF, marg:4.2, mech:CASH, botPlatformCost:2000 });
  const dear  = engine({ ...DEF, marg:4.2, mech:CASH, botPlatformCost:20000 });
  A("the ratio rises with operating cost at a fixed claim", dear.severityRatio > cheap.severityRatio);

  /* And falls as the claim rises, holding cost fixed. */
  const weakClaim   = engine({ ...DEF, marg:4.2, mech:CASH, apparentResolutionRate:45 });
  const strongClaim = engine({ ...DEF, marg:4.2, mech:CASH, apparentResolutionRate:90 });
  A("the ratio falls as the claimed rate rises at a fixed cost", strongClaim.severityRatio < weakClaim.severityRatio);

  /* The rejected basis, asserted so the rejection cannot be quietly reversed.
     realizedDollarsPct rates the shipped default at the top of the scale while that
     same case nets money, because vendorClaim is the naive slide. */
  const d0 = engine(DEF);
  A("the rejected basis would put the shipped default at the top of the scale",
    Math.max(0, Math.min(1, 1 - d0.realizedDollarsPct / 100)) >= 0.75);
  A("the shipped default nevertheless nets money", d0.netSavings > 0);
  A("the argued basis does not put it at the top of the scale", d0.severityRatio < 0.75);
}

/* ---- 14. Enum inputs resolve through the shared own-key pick (9-11) ----
   The engine indexed MECH and EVIDENCE with the raw link value. A prototype name
   passed the truthy check and computed NaN. An unknown capacity action silently
   credited the hiring default at Planning-grade. An unknown evidence source printed
   an undefined band, and a prototype name left the label undefined, which crashes
   the page on toLowerCase. Every hostile key must resolve to the fallback, disclose
   exactly one correction, and block the grade at Directional. */
console.log("\n14. enum inputs resolve through pick");
{
  const EV_KEYS = ["estimate", "marketing", "proposal", "sla", "pilot"];
  const HOSTILE = ["bogus", "", "HIRING", " hiring", "Pilot", undefined, ...Object.getOwnPropertyNames(Object.prototype)];
  const CLEAN = { ...DEF, marg:4.2, costBasisOwned:true, evidence:"pilot", mech:CASH_KEY };
  const corr = (r) => r.flags.filter(f => /which is not an option this tool offers/.test(f));
  const nums = (r) => [r.netSavings, r.K, r.steadyAnnual, r.year1, r.band, r.escalationPremium, r.waterfallSum, ...r.waterfall.map(w => w.value), ...r.monthly];
  const allFinite = (r) => nums(r).every(Number.isFinite);

  for (const k of MECH_KEYS) {
    const r = engine({ ...CLEAN, mech:k });
    A(`capacity action ${k} runs as entered with no correction`, r.mechKey === k && corr(r).length === 0);
  }
  for (const k of EV_KEYS) {
    const r = engine({ ...CLEAN, evidence:k });
    A(`evidence source ${k} runs as entered with no correction`, r.evidenceKey === k && corr(r).length === 0);
  }

  const NONE = engine({ ...CLEAN, mech:"none" });
  for (const k of HOSTILE) {
    let r = null, threw = false;
    try { r = engine({ ...CLEAN, mech:k }); } catch { threw = true; }
    A(`hostile capacity action ${String(k)} does not throw`, !threw);
    if (!r) continue;
    const c = corr(r);
    A(`hostile capacity action ${String(k)} resolves to none with one disclosed correction`,
      r.mechKey === "none" && c.length === 1 && c[0] === `Capacity action was "${String(k)}", which is not an option this tool offers, and was held at ${MECH.none.label}.`);
    A(`hostile capacity action ${String(k)} computes every figure finite`, allFinite(r));
    A(`hostile capacity action ${String(k)} computes exactly the none figures`, JSON.stringify(nums(r)) === JSON.stringify(nums(NONE)));
    A(`hostile capacity action ${String(k)} blocks the grade at Directional`, r.hardFlag === true && r.headlineConf === "Directional");
  }

  const EST = engine({ ...CLEAN, evidence:"estimate" });
  for (const k of HOSTILE) {
    let r = null, threw = false;
    try { r = engine({ ...CLEAN, evidence:k }); } catch { threw = true; }
    A(`hostile evidence source ${String(k)} does not throw`, !threw);
    if (!r) continue;
    const c = corr(r);
    A(`hostile evidence source ${String(k)} resolves to estimate with one disclosed correction`,
      r.evidenceKey === "estimate" && c.length === 1 && c[0] === `Evidence source was "${String(k)}", which is not an option this tool offers, and was held at Internal estimate or benchmark.`);
    A(`hostile evidence source ${String(k)} prints the estimate label and band`,
      r.evidenceLabel === EST.evidenceLabel && r.band === EST.band && typeof r.band === "number");
    A(`hostile evidence source ${String(k)} blocks the grade at Directional with a whole sentence`,
      r.hardFlag === true && r.headlineConf === "Directional" && r.evidence === "Directional" && !/undefined/.test(r.gradeWhy));
  }

  A("a hostile capacity action resolves to the zero-credit fallback", engine({ ...CLEAN, mech:"bogus" }).mechKey === MECH_FALLBACK);
  A("a hostile capacity action never inherits the form initial", engine({ ...CLEAN, mech:"bogus" }).mechKey !== MECH_INITIAL);
  A("a hostile evidence source never credits a document", engine({ ...CLEAN, evidence:"bogus" }).evidenceKey === "estimate");
  const both = engine({ ...CLEAN, M:-5, mech:"toString", evidence:"constructor", botPlatformCost:-1 });
  A("hostile enums between hostile inputs disclose in engine order",
    both.flags.slice(0, 4).map(f => f.split(" was ")[0]).join("|") === "Monthly contacts|Capacity action|Evidence source|Platform cost");
  A("two hostile enums disclose two corrections, never more", corr(both).length === 2);
  A("the scenario rows resolve too, so no scenario prints NaN",
    buildScenarios({ ...CLEAN, mech:"valueOf", evidence:"hasOwnProperty" }).every(x => Number.isFinite(x.netSavings) && Number.isFinite(x.netAutomationRate)));

  /* Source gates. The destructure pin keeps pick bound; the negative gates keep the
     raw lookups from returning. */
  A("the engine imports createGuards from the shared module", /import \{ createGuards \} from "\.\/src\/lib\/guards";/.test(src));
  A("the engine binds pick through createGuards", /const \{ guards: picks, pick \} = createGuards\(\);/.test(region));
  A("the capacity action resolves through pick with a none fallback", /const mechKey = resolve\("Capacity action", I\.mech, MECH, "none"\);/.test(region));
  A("the evidence source resolves through pick with an estimate fallback", /const evKey = resolve\("Evidence source", I\.evidence, EVIDENCE, "estimate"\);/.test(region));
  A("the resolved correction carries the phrase that blocks the grade", /which is not an option this tool offers, and was held at \$\{table\[k\]\.label\}/.test(region));
  A("the engine region no longer reads either mech constant as a silent default", !/MECH_DEFAULT/.test(region) && !/MECH_FALLBACK/.test(region));
  A("no raw lookup on the entered capacity action remains", !/MECH\[I\.mech\]/.test(src) && !/MECH\[s\.mech\]/.test(src));
  A("no raw lookup on the entered evidence source remains",
    !/EVIDENCE\[I\.evidence\]/.test(src) && !/I\.evidence \|\|/.test(src) && (src.match(/I\.evidence/g) || []).length === 1);
  A("the band and the label read the resolved evidence key",
    /const band = BANDS\[evKey\];/.test(region) && /const ev = EVIDENCE\[evKey\];/.test(region) && /evidenceRank: ev\.rank,/.test(region));
  A("the retired evidence reason table is gone, and gradeAID writes the rationale", !/EV_REASON|MECH_REASON|confSentence|\bcostConf\b|\brealConf\b|axesTied/.test(src));
  A("the engine returns the resolved evidence key", /evidenceKey: evKey,/.test(region));
  A("the component signals read the resolved evidence key, never the entered one",
    !/indexOf\(s\.evidence\)/.test(src) && (src.match(/indexOf\(R\.evidenceKey\)/g) || []).length === 3);
}

/* ---- 17. Numeric entries disclose through the shared clean-entry probe ----
   Local gc read every numeric field through n(). A blank, a word, or a partial number
   became 0 or a truncated value with no record whenever the result sat inside bounds,
   74 of 88 probed cases. Ramp months had no guard at all, and "abc" printed Year 1 as
   NaN. Every unclean entry must disclose exactly once, block at Directional, and leave
   every number finite. Clean entries keep their arithmetic. A blank marginal cost is
   "not supplied" and discloses through its own default flag. Ramp months are validated
   only while the ramp is on, floor at 1, and carry no ceiling. */
console.log("\n17. numeric entries disclose");
{
  const LABELS = { M:"Monthly contacts", cpc:"Loaded cost per contact", marg:"Marginal cost per contact",
    eligibleRate:"AI-eligible demand", apparentResolutionRate:"Apparent resolution rate", repeatLeakRate:"Repeat and false resolution",
    escalationPenalty:"Escalation premium", botPlatformCost:"Platform cost", qaCost:"QA cost", tuningHours:"Tuning hours",
    tuningRate:"Tuning rate", knowledgeMaintHours:"Knowledge hours", knowledgeRate:"Knowledge rate", implOneTime:"Implementation cost" };
  const UNCLEAN = ["abc", "12abc", "1,200", "", null, NaN, Infinity, "Infinity", "$50"];
  const text = (v) => v == null || (typeof v === "string" && v.trim() === "") ? "blank" : typeof v === "string" ? `"${v}"` : String(v);
  const bad = (r) => r.flags.filter(f => /which is not a number, and was held at/.test(f));
  const nums = (r) => [r.netSavings, r.K, r.steadyAnnual, r.year1, r.year1NoRamp, r.escalationPremium, r.waterfallSum, ...r.waterfall.map(w => w.value), ...r.monthly];
  const BASE = { ...DEF, marg:4.2, costBasisOwned:true, evidence:"pilot", mech:CASH_KEY };
  A("clean base discloses nothing", bad(engine(BASE)).length === 0 && !engine(BASE).hardFlag);
  for (const k of Object.keys(LABELS)) for (const v of UNCLEAN) {
    const r = engine({ ...BASE, [k]: v });
    if (k === "marg" && text(v) === "blank") {
      A(`marg ${text(v)}: no unclean sentence, the default flag discloses it`, bad(r).length === 0 && r.margWasDefaulted && r.headlineConf === "Directional");
      continue;
    }
    const b = bad(r);
    A(`${k} ${text(v)}: exactly one disclosure`, b.length === 1 && b[0].startsWith(`${LABELS[k]} was entered as ${text(v)}, which is not a number`));
    A(`${k} ${text(v)}: blocks at Directional`, r.hardFlag && r.headlineConf === "Directional");
    A(`${k} ${text(v)}: every number finite`, nums(r).every(Number.isFinite));
  }
  A("a clean string exponent is clean and equals its number", bad(engine({ ...BASE, M:"8e4" })).length === 0
    && engine({ ...BASE, M:"8e4" }).netSavings === engine({ ...BASE, M:80000 }).netSavings);
  A("a clean numeric string computes as its number", engine({ ...BASE, apparentResolutionRate:"65" }).year1 === engine({ ...BASE, apparentResolutionRate:65 }).year1);

  /* ramp */
  const ON = { ...BASE, rampOn:true };
  for (const v of ["abc", "12abc", "", null, NaN, Infinity]) {
    const r = engine({ ...ON, rampMonths:v });
    A(`ramp on, ${text(v)}: held at the floor with one disclosure`, r.rampMonths === (v === "12abc" ? 12 : 1)
      && bad(r).length === 1 && bad(r)[0].startsWith(`Ramp months was entered as ${text(v)}`));
    A(`ramp on, ${text(v)}: Year 1 finite and Directional`, Number.isFinite(r.year1) && r.headlineConf === "Directional");
  }
  for (const v of [0, -5]) {
    const r = engine({ ...ON, rampMonths:v });
    A(`ramp on, ${v}: floor disclosure`, r.rampMonths === 1 && r.flags.includes(`Ramp months was ${v}, below the floor of 1, and was held at 1.`) && r.hardFlag);
  }
  const off = engine({ ...BASE, rampOn:false, rampMonths:"abc" });
  A("ramp off: an unclean ramp value is not validated and moves nothing", bad(off).length === 0 && off.rampMonths === null && off.rampNote === null && !off.hardFlag);
  A("ramp off: Year 1 equals Year 1 at full run rate", off.year1 === off.year1NoRamp);
  const long = engine({ ...ON, rampMonths:48 });
  A("ramp 48: no ceiling, no correction, grade not blocked", long.rampMonths === 48 && !long.hardFlag && bad(long).length === 0);
  A("ramp 48: note says Year 1 never reaches steady state", /never reaches steady state inside Year 1/.test(long.rampNote));
  const six = engine({ ...ON, rampMonths:6 });
  A("ramp 6: note carries both figures and no steady-state line", six.rampNote.includes("over a 6 month ramp") && !/steady state/.test(six.rampNote));
  A("ramp 12: boundary, no steady-state line", !/steady state/.test(engine({ ...ON, rampMonths:12 }).rampNote));
  A("ramp 13: boundary, steady-state line present", /never reaches steady state/.test(engine({ ...ON, rampMonths:13 }).rampNote));
  A("ramp note never uses a dash", !/[\u2013\u2014]/.test(six.rampNote + long.rampNote));
  A("ramp note is not a hard flag and not an integrity flag", !six.flags.includes(six.rampNote) && !/impossible|refuses it|was held at/.test(six.rampNote));
  let agree = true, claim = true;
  for (let i = 0; i < 500; i++) {
    const I = { ...ON, M:Math.round(Math.random()*400000)+1, implOneTime:Math.round(Math.random()*200000), rampMonths:Math.floor(Math.random()*30)+1,
      apparentResolutionRate:Math.round(Math.random()*100), botPlatformCost:Math.round(Math.random()*30000) };
    const r = engine(I), f = engine({ ...I, rampOn:false });
    if (Math.abs(r.year1NoRamp - f.year1) > 1e-6) agree = false;
    if (r.K > 0 && r.rampMonths > 1 && !/claiming that difference/.test(r.rampNote)) claim = false;
    if (r.K <= 0 && /claiming that difference/.test(r.rampNote)) claim = false;
  }
  A("year1NoRamp equals Year 1 with the ramp off, 500 cases", agree);
  A("the claiming line appears only when the ramp costs money", claim);

  /* source pins */
  A("gc runs the shared probe with no bounds", /rawProbe\(what, raw, -Infinity, null, ""\);/.test(region));
  A("only a blank marginal cost is exempt", /!\(what === "Marginal cost per contact" && bad === "blank"\)/.test(region));
  A("ramp months route through gc, floor 1, no ceiling, only when on", /const rampMonths = rampOn \? gc\(I\.rampMonths, 1, Infinity, "Ramp months"\) : null;/.test(region));
  A("no raw ramp read remains in arithmetic", (src.match(/I\.rampMonths/g) || []).length === 1);
  A("the analyst read carries the ramp note", /if \(R\.rampNote\) out\.push\(R\.rampNote\);/.test(src));
  A("rendered ramp labels read the engine value", !/s\.rampMonths \+/.test(src) && (src.match(/R\.rampMonths \+/g) || []).length === 2);
}

/* ---- 18. 11B grading layer, registry and component wiring. Session 16. ---- */
console.log("\n18. 11B grading layer and registry");
{
  const TOOL = "ai-deflection";
  const owned = BENCHMOD.benchmarksForTool(TOOL);
  const ids = [...src.matchAll(/benchmark\("([^"]+)"\)/g)].map(m => m[1]);
  A("the tool id is the registry tool", TOOL_ID === TOOL);
  A("the registry holds 38 entries for this tool", owned.length === 38);
  A("the registry splits 33 heuristics, 0 market and 5 thresholds",
    owned.filter(e => e.kind === "heuristic").length === 33 && owned.filter(e => e.kind === "market").length === 0 && owned.filter(e => e.kind === "threshold").length === 5);
  A("every literal registry read resolves", ids.every(id => id in BENCHMOD.BENCHMARK_SOURCES));
  A("the defaults read every shared field by template", /const dflt = \(f\) => benchmark\(`aid\.default\.\$\{f\}`\);/.test(src) && (src.match(/dflt\("/g) || []).length === 5);
  A("both vendor sets read every field by template", /benchmark\(`aid\.\$\{set\}\.\$\{f\}`\)/.test(src) && VENDOR_OK());
  function VENDOR_OK() { return Object.keys(V_A).length === 10 && Object.keys(V_A).every(f => V_A[f] === BENCHMOD.benchmark(`aid.vendorA.${f}`) && V_B[f] === BENCHMOD.benchmark(`aid.vendorB.${f}`)); }
  A("every registered id is read by the tool", owned.every(e => ids.includes(e.id) || /^aid\.(default|vendorA|vendorB)\./.test(e.id)));
  A("the base case is the registry, not a literal", AID_BASE.M === 80000 && AID_BASE.eligibleRate === 55 && AID_BASE.apparentResolutionRate === 65 && AID_BASE.marg === 0);
  A("no default literal survives in the component", !/const V_A = \{ apparentResolutionRate: 65/.test(src) && !/M: 80000, cpc: 7/.test(src));
  A("no grade or band constant survives as a literal", !/cpc \* 0\.6|0\.85 \* cpc|ep >= 90|rp >= 80|E < 0\.35|R \* 1\.2|RHO \* 0\.5|estimate: 0\.25/.test(src));
  A("every heuristic is labelled as one", owned.filter(e => e.kind === "heuristic").every(e => /heuristic/i.test(e.source)));
  A("every threshold states a rationale", owned.filter(e => e.kind === "threshold").every(e => e.rationale.length > 40));
  A("set B is registered as never graded", owned.filter(e => /^aid\.vendorB\./.test(e.id)).every(e => /never graded/.test(e.rationale)));

  A("the grading layer is in the engine region", typeof gradeAID === "function" && typeof fieldOrigin === "function");
  A("the component grades through gradeAID with no rail origin",
    /const G = gradeAID\(\{ I: inputA, r: R, pre: fromLink \? \{\} : rail\.current\.pre, railOrigin: null \}\);/.test(src));
  A("the component exports the three-axis grade object", /grades=\{G\.gradeObj\}/.test(src) && /confidence=\{G\.confidence\}/.test(src));
  A("the rationale is displayed on the page, not only in the PDF", /\{G\.gradeWhy\} Net savings carry/.test(src));
  A("the rail pulls carry their source tool", (src.match(/getPrimitiveWithSource\("(monthlyContacts|costPerContact|marginalPerContact)"\)/g) || []).length === 3 && !/getPrimitive\(/.test(src));
  A("sourcedExternally is display only", (src.match(/sourcedExternally\(/g) || []).length === 1 && !/sourcedExternally/.test(region.slice(region.indexOf("function gradeAID"))));

  const G = (o = {}, pre = {}, ro = null) => engine({ ...OWN_ALL, costBasisOwned: true, evidence: "pilot", mech: CASH_KEY, ...o }, pre, ro);
  const clean = G();
  A("a whole, own, document-backed case grades Planning-grade on evidence and Finance-grade elsewhere",
    clean.evidence === "Planning-grade" && clean.realization === "Finance-grade" && clean.completeness === "Finance-grade" && clean.headlineConf === "Planning-grade" && clean.blockers.length === 0);

  /* Defect class 2. Rail and self values carry no credential. */
  const railM = G({}, { M: { value: OWN_ALL.M, src: "staffing-calculator" } });
  A("class 2: a rail volume with no origin grades evidence Directional", railM.evidence === "Directional" && railM.origins.M === "rail" && /arrived over the rail with no recorded origin grade/.test(railM.gradeWhy));
  const railMarg = G({}, { marg: { value: 4.2, src: "cost-per-contact" } });
  A("class 2: a rail marginal cost with no origin grades cost evidence Directional even when attested", railMarg.costGrade === "Directional" && railMarg.origins.marg === "rail");
  A("class 2: a rail value's origin grade caps at Planning-grade", G({}, { M: { value: OWN_ALL.M, src: "x" } }, "Finance-grade").evidence === "Planning-grade");
  A("class 2: a rail Directional origin stays Directional", G({}, { M: { value: OWN_ALL.M, src: "x" } }, "Directional").evidence === "Directional");
  const self = G({}, { M: { value: OWN_ALL.M, src: TOOL } });
  A("class 2: a value restored from this tool's own last run grades Directional", self.evidence === "Directional" && self.origins.M === "self" && /a tool never credentials itself/.test(self.gradeWhy));
  A("class 2: a prefilled value the user changed is the user's own", G({}, { M: { value: 1234, src: "x" } }).origins.M === "entered");
  A("class 2: a defaulted marginal cost grades Directional whatever the checkbox says", G({ marg: 0 }).costGrade === "Directional" && G({ marg: 0 }).origins.marg === "default");
  A("class 2: an unattested marginal cost grades Directional", G({ costBasisOwned: false }).costGrade === "Directional" && /Tick the cost basis box/.test(G({ costBasisOwned: false }).gradeWhy));
  for (const [f, lbl] of [["M", "monthly volume"], ["eligibleRate", "AI-eligible demand"], ["apparentResolutionRate", "apparent resolution"], ["repeatLeakRate", "repeat and false resolution"], ["escalationPenalty", "escalation premium"], ["botPlatformCost", "platform fee"]]) {
    const g = G({ [f]: AID_BASE[f] });
    A(`class 2: ${f} still at its default grades evidence Directional and is named`, g.evidence === "Directional" && g.origins[f] === "default" && g.gradeWhy.toLowerCase().indexOf(lbl.toLowerCase()) > 0);
  }

  /* Self-credentialing. The select and the checkbox never reach Finance-grade. */
  for (const ev of ["estimate", "marketing", "proposal", "sla", "pilot"]) for (const owned of [true, false]) {
    const g = G({ evidence: ev, costBasisOwned: owned });
    A(`self-credential: ${ev}, basis ${owned ? "attested" : "unattested"} never reaches Finance-grade`, g.evidence !== "Finance-grade" && g.headlineConf !== "Finance-grade");
  }
  A("self-credential: estimate and marketing leave the bot claims Directional", G({ evidence: "estimate" }).opsGrade === "Directional" && G({ evidence: "marketing" }).opsGrade === "Directional");
  A("self-credential: a proposal lifts the bot claims to Planning-grade", G({ evidence: "proposal" }).opsGrade === "Planning-grade");

  /* Defect class 3. Every validity check reaches completeness. */
  const blockers = {
    "a corrected input": { M: -5 },
    "marginal above loaded": { marg: 9, cpc: 7 },
    "marginal near loaded": { marg: 6.5, cpc: 7 },
    "zero volume, rail refused": { M: 0 },
    "no demand routed": { eligibleRate: 0 },
    "a near-free bot": { botPlatformCost: 0, qaCost: 0, tuningHours: 0, knowledgeMaintHours: 0 },
    "perfect resolution with no repeats": { apparentResolutionRate: 100, repeatLeakRate: 0 },
  };
  for (const [nm, o] of Object.entries(blockers)) {
    const g = G(o);
    A(`class 3: ${nm} holds completeness Directional`, g.completeness === "Directional" && g.headlineConf === "Directional" && g.blockers.length > 0 && !g.voided);
    A(`class 3: ${nm} is named in the completeness rationale`, g.gradeObj.reasons.completeness.length > 20 && g.gradeObj.boundAxes.includes("completeness"));
  }
  A("class 3: the rail refusal travels into the completeness rationale", /the rail refused the result: monthly contacts is zero/i.test(G({ M: 0 }).gradeObj.reasons.completeness));
  A("class 3: a real program at scale is not near-free", G({ M: 300000, eligibleRate: 71, botPlatformCost: 7500, qaCost: 1700, tuningHours: 80, tuningRate: 55, knowledgeMaintHours: 17, knowledgeRate: 75 }).completeness === "Finance-grade");
  A("class 3: 99 percent resolution with no repeats is not blocked", G({ apparentResolutionRate: 99, repeatLeakRate: 0 }).completeness === "Finance-grade");
  A("class 3: the grading layer never reads the display regex", !/hardFlag/.test(region.slice(region.indexOf("function gradeAID"), region.indexOf("/* @engine-end */"))));

  /* Doctrine 5.5. The answer never reaches an axis. */
  {
    const I = { ...OWN_ALL, costBasisOwned: true, evidence: "pilot", mech: CASH_KEY }, r = engineRaw(I);
    const axes = (g) => JSON.stringify([g.evidence, g.realization, g.completeness, g.confidence]);
    const base = gradeAID({ I, r, pre: {}, railOrigin: null });
    const neg = gradeAID({ I, r: { ...r, netSavings: -Math.abs(r.netSavings) - 1, K: -1, steadyAnnual: -1, bestNet: -1, payback: null, verdict: "Buy nothing, as scoped", beResPct: Infinity }, pre: {}, railOrigin: null });
    const zero = gradeAID({ I, r: { ...r, netSavings: 0, bestNet: 0, payback: null, beResPct: 0 }, pre: {}, railOrigin: null });
    A("sign invariance: a negative outcome moves no axis and no headline", axes(neg) === axes(base));
    A("sign invariance: a zero outcome moves no axis and no headline", axes(zero) === axes(base));
    const loss = engine({ ...I, botPlatformCost: 90000 });
    A("sign invariance: a net-loss program from inputs grades on inputs alone", loss.netSavings < 0 && loss.completeness === "Finance-grade" && axes(loss) === axes(base));
    A("the grading layer never reads the verdict, net savings or the break-even",
      !/verdict|netSavings|bestNet|beResPct|payback|severityRatio/.test(region.slice(region.indexOf("function gradeAID"), region.indexOf("/* @engine-end */"))));
  }

  /* Sweep. No Finance-grade anywhere, no void reachable, no silent axis. */
  let fin = 0, voids = 0, silent = 0, notMin = 0, defects = 0, thrown = 0;
  const pres = [{}, { M: { value: 90000, src: "staffing-calculator" }, marg: { value: 4.2, src: "cost-per-contact" } }, { M: { value: 90000, src: TOOL } }];
  const RN = () => Math.random();
  for (let i = 0; i < 6000; i++) {
    const o = {
      M: [Math.round(RN() * 900000), 0, 1, 1e7, -5, "x", 90000][i % 7], cpc: [RN() * 20, 0, -3, 7][i % 4], marg: [RN() * 12, 0, -2, 4.2, 6.5][i % 5],
      eligibleRate: [RN() * 100, 150, -10, 0, 100][i % 5], apparentResolutionRate: [RN() * 100, 100, 0, 220, -4][i % 5], repeatLeakRate: [RN() * 100, 0, -40, 100][i % 4],
      escalationPenalty: [RN() * 200, 0, 300, -9][i % 4], botPlatformCost: [RN() * 40000, 0, -1][i % 3], qaCost: [RN() * 5000, 0][i % 2],
      tuningHours: [RN() * 100, 0][i % 2], knowledgeMaintHours: [RN() * 50, 0][i % 2], implOneTime: [RN() * 1e5, 0, -5][i % 3],
      rampOn: i % 2 === 0, rampMonths: [RN() * 24, 0, "abc", 48][i % 4],
      evidence: ["estimate", "marketing", "proposal", "sla", "pilot", "toString", "bogus"][i % 7], costBasisOwned: i % 3 !== 0,
      mech: [...MECH_KEYS, "toString", "bogus"][i % (MECH_KEYS.length + 2)],
    };
    let g;
    try { g = engine({ ...DEF, ...o }, pres[i % 3], [null, "Finance-grade", "Planning-grade"][i % 3]); } catch { thrown++; continue; }
    if (g.headlineConf === "Finance-grade") fin++;
    if (g.voided) voids++;
    if (!g.voided && g.gradeObj.applicable.some(a => !g.gradeObj.reasons[a].trim())) silent++;
    if (!g.voided && g.headlineConf !== CONF.gradeConfidence({ evidence: g.evidence, realization: g.realization, completeness: g.completeness }).headline) notMin++;
    if (!g.voided && g.gradeObj.defects.length) defects++;
  }
  A("sweep: no input set throws", thrown === 0);
  A("sweep: no input set reaches Finance-grade", fin === 0);
  A("sweep: every invariant is unreachable through the guards", voids === 0);
  A("sweep: every applicable axis carries a stated reason", silent === 0);
  A("sweep: the headline is the minimum of the applicable axes", notMin === 0);
  A("sweep: emitGrades reports no content defect", defects === 0);

  /* Void is reachable only by a broken engine, and it claims nothing. */
  const I = { ...OWN_ALL, costBasisOwned: true, evidence: "pilot", mech: CASH_KEY }, r = engineRaw(I);
  const vg = gradeAID({ I, r: { ...r, K: NaN }, pre: {}, railOrigin: null });
  A("a failed invariant voids the export and claims no grade", vg.voided && vg.confidence === "Void" && CONF.isVoid(vg.gradeObj) && vg.gradeObj.headline === null && /remedy|Correct the inputs/.test(vg.gradeObj.remedy));
  A("more routed than total demand voids the export", gradeAID({ I, r: { ...r, attempted: r.M * 2 + 1 }, pre: {}, railOrigin: null }).voided);
  A("more durable than attempted voids the export", gradeAID({ I, r: { ...r, durable: r.attempted * 2 + 1 }, pre: {}, railOrigin: null }).voided);
  A("a negative cost voids the export", gradeAID({ I, r: { ...r, opexMonthly: -1 }, pre: {}, railOrigin: null }).voided);
  A("the void rationale names the failed invariant", /export void: an output is not a finite number/.test(vg.gradeWhy));
}

const r = engine(DEF);
console.log("\n  shared module: " + MECH_ORDER.length + " capacity actions, fallback '" + MECH_FALLBACK + "' at " + Math.round(MECH[MECH_FALLBACK].f*100) + "%, form initial '" + MECH_INITIAL + "' at " + Math.round(MECH[MECH_INITIAL].f*100) + "%");
console.log("\n  default readout");
console.log("  coverage            " + r.ep + "% of total demand is eligible");
console.log("  apparent resolution " + r.rp + "% of AI-involved");
console.log("  bot resolution      " + r.botResolutionRate.toFixed(1) + "% of routed");
console.log("  NET automation      " + r.netAutomationRate.toFixed(1) + "% of TOTAL");
console.log("  net savings         $" + Math.round(r.netSavings).toLocaleString() + "/mo");
console.log("  escalation swing    $" + Math.round(r.escSwing).toLocaleString() + "/mo across 0 to 2x");
console.log("  verdict             " + r.verdict);
console.log("  confidence          " + r.headlineConf);
console.log("\n  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
