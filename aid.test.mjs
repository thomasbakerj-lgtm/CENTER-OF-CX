/* aid.test.mjs
   Slices the @engine-start..@engine-end region out of AIDeflectionRealityCheck.jsx and
   tests the DEPLOYED engine, using the REAL shared constants imported from
   ./src/lib/mech.js. Nothing is reconstructed. If that module is missing, renamed, or
   structurally changed, this harness fails rather than passing on invented values.
   Run from repo root: node aid.test.mjs */
import { readFileSync } from "fs";

/* ---- dependency integrity. Import the real module, do not rebuild it. ---- */
let MECH, MECH_ORDER, MECH_DEFAULT;
try {
  const m = await import("./src/lib/mech.js");
  ({ MECH, MECH_ORDER, MECH_DEFAULT } = m);
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/mech.js. The engine cannot be");
  console.error("verified against reconstructed constants. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---- 0. Validate the shared module itself before trusting anything downstream ---- */
A("mech.js exports MECH, MECH_ORDER, MECH_DEFAULT",
  !!MECH && Array.isArray(MECH_ORDER) && typeof MECH_DEFAULT === "string");
A("MECH_DEFAULT is a key in MECH", !!MECH[MECH_DEFAULT]);
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
const { engine, buildScenarios } = new Function("MECH", "MECH_DEFAULT",
  region + "\nreturn { engine, buildScenarios };")(MECH, MECH_DEFAULT);

/* the harness must exercise the real ladder, whatever it contains */
const MECH_KEYS = MECH_ORDER.slice();
const CASH_KEY = MECH_KEYS.filter(k => MECH[k].cred === "cash").pop();
const ZERO_KEY = MECH_KEYS.filter(k => MECH[k].f === 0)[0];

const DEF = { M:80000, cpc:7, marg:0, eligibleRate:55, mech:MECH_DEFAULT, rampOn:false, rampMonths:6,
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
A("Finance-grade reachable with cash action, pilot evidence, confirmed basis",
  engine({...DEF,marg:4.2,costBasisOwned:true,evidence:"pilot",mech:CASH_KEY}).headlineConf === "Finance-grade");
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
  const vB=engine({...DEF,marg:4.2,eligibleRate:60,apparentResolutionRate:70,repeatLeakRate:12,evidence:"estimate",mech:MECH_DEFAULT}).verdict;
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
  A("recon: headline is Planning-grade, weaker axis wins", r.headlineConf === "Planning-grade" && r.realConf === "Finance-grade");

  /* Defect 1. The rendered sentence is "It is {conf} because {confReason}".
     confReason must not itself open with a "... because" clause or the copy stutters. */
  A("no double-because stutter in confidence reason", !/^(evidence|realization) is (Directional|Planning-grade|Finance-grade) because/.test(r.confReason));
  const rendered = "It is " + r.headlineConf + " because " + r.confReason;
  A("rendered confidence sentence contains one 'because'", (rendered.match(/ because /g) || []).length === 1);

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
  A("recon2: both axes reach Finance-grade", r2.costConf === "Finance-grade" && r2.realConf === "Finance-grade" && r2.headlineConf === "Finance-grade");

  /* When the axes are tied, no axis may be described as the weaker one. */
  A("tied axes are reported as tied, not as one being weaker",
    r2.axesTied === true && !/weaker axis, which is/.test(r2.confSentence) && /neither is the weaker one/.test(r2.confSentence));

  /* confSentence must stand alone in the export: capitalised, terminated, no stutter. */
  const sentenceOK = (x) => /^[A-Z]/.test(x) && /[.]$/.test(x) && !/ axis[.,]? .*weaker axis/.test(x);
  let allOK = true;
  for (const ev of ["estimate","marketing","proposal","sla","pilot"])
    for (const k of MECH_ORDER)
      for (const marg of [0, 2.59])
        for (const owned of [true,false]) {
          const t = engine({ ...R2, evidence:ev, mech:k, marg, costBasisOwned:owned });
          if (!sentenceOK(t.confSentence)) allOK = false;
          if (/because .*because/.test("It is " + t.headlineConf + " because " + t.confReason)) allOK = false;
        }
  A("confidence sentence is standalone and stutter-free across every gate combination", allOK);
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

  const tied  = engine({ ...BASE, evidence:"pilot",    mech:K90 });          // Finance / Finance
  const evLow = engine({ ...BASE, evidence:"proposal", mech:K90 });          // Planning / Finance
  const rlLow = engine({ ...BASE, evidence:"pilot",    mech:MECH_DEFAULT }); // Finance / Planning

  A("tied case is detected", tied.axesTied === true && tied.costConf === tied.realConf);
  A("tied case never claims one axis IS the weaker one", !/is the weaker axis|which is (realization|evidence) at/.test(tied.confSentence));
  A("tied case says neither axis is weaker", /neither is the weaker/.test(tied.confSentence));
  A("evidence-weaker case names evidence", /evidence/.test(evLow.confSentence) && evLow.axesTied === false);
  A("realization-weaker case names realization", /realization/.test(rlLow.confSentence) && rlLow.axesTied === false);

  /* confSentence stands alone in the report's Why row, so it must be a real sentence. */
  for (const [nm, r] of [["tied",tied],["evidence-weaker",evLow],["realization-weaker",rlLow]]) {
    A(nm + ": confSentence starts capitalised", /^[A-Z]/.test(r.confSentence));
    A(nm + ": confSentence ends with a full stop", /\.$/.test(r.confSentence));
    A(nm + ": confSentence has no double-because stutter", (r.confSentence.match(/ because /g) || []).length <= 1);
  }

  /* The headline must still be the weaker of the two axes, tie or not. */
  const idx = (c) => ["Directional","Planning-grade","Finance-grade"].indexOf(c);
  for (const r of [tied, evLow, rlLow])
    A("headline equals the weaker axis", idx(r.headlineConf) === Math.min(idx(r.costConf), idx(r.realConf)));

  /* Reconciliation, PDF run 2 of 22 July 2026. */
  A("recon2: net monthly savings is 244948", Math.round(tied.netSavings) === 244948);
  A("recon2: year 1 net is 2084910", Math.round(tied.year1) === 2084910);
  A("recon2: payback is month 2", tied.payback === 2);
  A("recon2: escalation swing is 126999", Math.round(tied.escSwing) === 126999);
  A("recon2: net automation is 46.2 percent", tied.netAutomationRate.toFixed(1) === "46.2");
  A("recon2: bot resolution is 65.1 percent", tied.botResolutionRate.toFixed(1) === "65.1");
  A("recon2: headline is Finance-grade", tied.headlineConf === "Finance-grade");
}

const r = engine(DEF);
console.log("\n  shared module: " + MECH_ORDER.length + " capacity actions, default '" + MECH_DEFAULT + "' at " + Math.round(MECH[MECH_DEFAULT].f*100) + "%");
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
