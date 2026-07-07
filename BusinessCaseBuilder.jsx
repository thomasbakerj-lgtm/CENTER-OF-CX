import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import { normalizeForPublish } from "./src/lib/metrics";
import { trackTool, severityBucket } from "./src/lib/track";
import { readScenarioFromUrl, copyShareUrl } from "./src/lib/scenario";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED", ICE = "#E8F4FD";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 880, margin: "0 auto", padding: "0 28px" };
const CAPTURE_ENDPOINT = "https://formspree.io/f/mjgjwzwz";

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmtK = (v) => v >= 1000000 ? "$" + (v / 1000000).toFixed(2) + "M" : v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : "$" + Math.round(v).toLocaleString();
const fmtFull = (v) => "$" + Math.round(v).toLocaleString();
const fmt2 = (v) => "$" + Number(v).toFixed(2);

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

function Card({ children, accent }) {
  return <div style={{ background: "#fff", border: `1px solid ${accent ? accent + "40" : BORDER}`, borderRadius: 10, padding: "24px 22px", marginBottom: 16 }}>{children}</div>;
}
function H({ children, color }) {
  return <h3 style={{ fontSize: 13, fontWeight: 700, color: color || ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{children}</h3>;
}

// InfoDot definition strings. Two sentences each: what it is, then why the tool uses it.
// This DEFS map is the future glossary content for this tool.
const DEFS = {
  marginal: "The variable cost that actually disappears when one contact goes away, essentially the agent handle-time labor for that contact. Savings are valued here rather than at fully loaded cost, because fixed tech, facilities, and supervision do not fall when a single contact is deflected.",
  loadedCPC: "Your fully loaded cost per contact, carrying labor plus a share of fixed tech, facilities, and supervision. The tool shows it for context but never values savings on it, because deflecting one contact does not remove those fixed costs.",
  stance: "A per-lever haircut on modeled savings, set higher for levers a board trusts and lower for levers that are hard to attribute to a platform. It exists because deflection, handle-time, FCR, and attrition are not equally believable, so a single blanket discount would either overstate the soft levers or understate the hard ones.",
  phasing: "Spreads savings across the migration build and the post-go-live ramp instead of assuming they arrive on day one. It exists because a transformation earns nothing while it is being built, so an instant-payback number is the fastest way to lose CFO trust.",
  confidence: "Rates how bookable the cost and investment inputs are, from estimate to signed proposal, kept separate from how believable the savings are. It exists so a case built on guesses cannot present with the same authority as one built on a real quote.",
  containment: "The share of contacts the transformation fully handles in self-service with no agent. It is the lever a board probes first, so the tool sizes it on the handled pool and flags targets above what most centers actually reach.",
  ht: "The percent cut in talk-and-hold time, applied to AHT after after-call work is removed. Much of AHT is not compressible, so double-digit cuts should be read as upside rather than base case.",
  acw: "After-call work, the wrap time that sits inside AHT. The tool treats it as a separate slice so a handle-time cut and an ACW cut can never claim the same saved minute twice.",
  fcr: "The point lift in first-contact resolution, which removes repeat contacts from the handled pool. It saves money only by avoiding the second contact, so it is valued at the same marginal cost as a deflected one.",
  attrition: "The percent cut in agent turnover, converted into fewer hires and their recruiting and training cost. It is the softest lever because attrition has many causes, so a platform rarely deserves full credit for the improvement.",
};

const STANCE = {
  aggressive: { label: "Aggressive", c: 1.00, h: 1.00, f: 1.00, a: 1.00, note: "Full modeled savings, no discount. Matches typical vendor ROI tools." },
  expected: { label: "Expected", c: 0.85, h: 0.90, f: 0.80, a: 0.65, note: "Each lever discounted for real-world attribution. The defensible default." },
  conservative: { label: "Conservative", c: 0.70, h: 0.80, f: 0.65, a: 0.50, note: "Heavy haircut on the soft levers. The floor you can commit to." },
};

const EVIDENCE = {
  estimate: { label: "Estimate", note: "Numbers are internal estimates." },
  quote: { label: "Vendor quote", note: "Platform cost from a vendor quote." },
  proposal: { label: "Signed proposal", note: "Investment from a signed proposal or order form." },
};

/* De-overlapped model: every contact-based saving runs on the HANDLED pool
   (post-deflection); ACW is a disjoint slice of AHT; FCR repeats are on handled
   volume. Avoided contacts (deflection + FCR) are valued at MARGINAL cost, the
   same basis the TCO Calculator uses, so the two tools never disagree on the
   same contact. Confidence weighting then turns gross into a stance-adjusted net. */
function computeCase(d, stanceKey, rampOn) {
  const loaded = n(d.avgHourly) * (1 + n(d.benefitsPct) / 100);
  // Marginal cost per contact: use the value inherited from TCO when present,
  // otherwise derive the labor-marginal (handle-time at the loaded wage). This is
  // what actually disappears when a contact is deflected, not the fully loaded CPC.
  const derivedMarginal = (n(d.currentAHT) / 3600) * loaded;
  const marginal = n(d.marginalPerContact) > 0 ? n(d.marginalPerContact) : derivedMarginal;
  const marginalPulled = n(d.marginalPerContact) > 0;

  const annual = n(d.monthlyContacts) * 12;
  const deflected = annual * (n(d.containment) / 100);
  const handled = Math.max(0, annual - deflected);

  const acw = Math.min(n(d.currentACW), n(d.currentAHT));
  const talkHold = Math.max(0, n(d.currentAHT) - acw);
  const secSaved = talkHold * (n(d.htReduction) / 100) + acw * (n(d.acwReduction) / 100);
  const handleTime = handled * secSaved / 3600 * loaded;

  const containment = deflected * marginal;              // marginal basis, not loaded CPC

  const oldRepeat = 1 - n(d.currentFCR) / 100;
  const newRepeat = 1 - Math.min(100, n(d.currentFCR) + n(d.fcrImprovement)) / 100;
  const avoidedRepeats = handled * Math.max(0, oldRepeat - newRepeat);
  const fcr = avoidedRepeats * marginal;                 // marginal basis, not loaded CPC

  const newAtt = n(d.currentAttrition) * (1 - n(d.attritionReduction) / 100);
  const avoidedTurnover = n(d.agents) * (n(d.currentAttrition) - newAtt) / 100;
  const perHire = n(d.recruitCostPerHire) + n(d.trainingDays) * 8 * loaded;
  const attrition = avoidedTurnover * perHire;

  const buckets = { containment, handleTime, fcr, attrition };
  const gross = containment + handleTime + fcr + attrition;
  const cf = STANCE[stanceKey];
  const net = containment * cf.c + handleTime * cf.h + fcr * cf.f + attrition * cf.a;

  const recurring = n(d.newPlatformPerAgentMo) * n(d.agents) * 12;
  const impl = n(d.implementationCost);
  const tco3 = impl + recurring * 3;

  // Monthly cash flow with a savings ramp. During the migration window savings are
  // ~0 while the new platform is already being paid; after go-live they phase up
  // linearly to full over the ramp window, turning an idealized instant payback into
  // an honest J-curve. With rampOn=false it collapses to the old instant model.
  const M = Math.max(0, Math.min(36, n(d.migrationMonths)));
  const R = Math.max(1, n(d.rampMonths));
  const monthlyFull = net / 12;
  const monthlyPlatform = recurring / 12;
  const factor = (t) => {
    if (!rampOn) return 1;
    if (t <= M) return 0;
    if (t <= M + R) return (t - M) / R;
    return 1;
  };
  const cumFlow = [-impl];
  let cum = -impl, savings3 = 0, year1 = 0, payback = 0;
  for (let t = 1; t <= 36; t++) {
    const s = factor(t) * monthlyFull;
    savings3 += s;
    if (t <= 12) year1 += s;
    cum += s - monthlyPlatform;
    cumFlow.push(cum);
    if (payback === 0 && cum >= 0) payback = t;
  }
  const roi3 = tco3 > 0 ? ((savings3 - tco3) / tco3 * 100) : 0;
  const netValue3 = savings3 - tco3;

  return { loaded, marginal, marginalPulled, derivedMarginal, annual, handled, deflected, buckets, gross, net, haircut: gross - net, recurring, tco3, roi3, payback, netValue3, avoidedTurnover, avoidedRepeats, cumFlow, savings3, year1, M, R, monthlyFull, monthlyPlatform, rampOn };
}

// Evidence-confidence: how bookable the cost and target inputs are, degraded by
// plausibility flags. Separate axis from the stance (which weights savings), and
// deliberately scoped: it certifies the cost basis, not that the org can deliver.
function confidenceOf(d, r, stanceKey) {
  const open = [];
  const evidence = d.evidence || "estimate";
  const perAgentImpl = n(d.agents) > 0 ? n(d.implementationCost) / n(d.agents) : 0;
  let aggressiveTargets = false;
  if (n(d.containment) > 25) { open.push(`Containment target of ${n(d.containment)}% is above the 10 to 25% most centers reach without a proven pilot.`); aggressiveTargets = true; }
  if (n(d.htReduction) > 15) { open.push(`Handle-time reduction of ${n(d.htReduction)}% is above the 8 to 15% typical range.`); aggressiveTargets = true; }
  if (n(d.attritionReduction) > 25) { open.push(`Attrition reduction of ${n(d.attritionReduction)}% is optimistic and hard to attribute to a platform.`); aggressiveTargets = true; }
  if (perAgentImpl > 0 && perAgentImpl < 2000) open.push(`Implementation of ${fmtFull(perAgentImpl)} per agent looks understated for a platform transformation.`);
  if (r.payback === 0) open.push("The case does not pay back within three years as modeled.");
  if (stanceKey === "aggressive") open.push("Aggressive stance books full modeled savings with no attribution haircut.");

  let grade;
  if (r.payback === 0) grade = "Directional";
  else if (evidence === "proposal" && stanceKey !== "aggressive" && !aggressiveTargets && perAgentImpl >= 2000) grade = "Finance-grade";
  else if (evidence === "quote" || evidence === "proposal") grade = "Planning-grade";
  else grade = "Directional";
  return { grade, open, evidence };
}

function caseInsights(r, d, stanceKey, conf) {
  const flags = [];
  // Input plausibility, the assumptions a CFO rejects on sight. These lead the read.
  if (n(d.containment) > 25) flags.push(`Your ${n(d.containment)}% self-service containment is above the 10 to 25% most centers actually achieve. Without a pilot proving it, model 15 to 20% as the defensible case. It is ${Math.round(r.buckets.containment / r.gross * 100)}% of your savings, so the board challenges it first.`);
  if (n(d.htReduction) > 15) flags.push(`A ${n(d.htReduction)}% handle-time reduction is aggressive. 8 to 15% is typical even with AI assist, so treat anything above 15% as upside, not base case.`);
  if (n(d.attritionReduction) > 25) flags.push(`${n(d.attritionReduction)}% attrition reduction is optimistic (15 to 25% is realistic) and the hardest lever to attribute to a platform. Discount it heavily or footnote it.`);
  const perAgentImpl = n(d.agents) > 0 ? n(d.implementationCost) / n(d.agents) : 0;
  if (perAgentImpl > 0 && perAgentImpl < 2000) flags.push(`Implementation of ${fmtFull(n(d.implementationCost))} for ${n(d.agents)} agents is about ${fmtFull(perAgentImpl)} per agent, low for a platform transformation (typical $3 to 8K per agent). An understated investment is the fastest way to lose board trust. A complete figure lengthens payback but survives diligence.`);
  if (r.payback === 0) flags.push(`At this platform cost, monthly savings never exceed monthly platform spend within three years, so the case does not pay back as modeled. Revisit platform cost, targets, or stance before presenting.`);
  else if (r.payback > 0 && r.payback < 3) flags.push(`A ${r.payback}-month payback reads as too good to be true and invites scrutiny. Confirm the investment captures professional services, change management, and internal time before you present it.`);

  const out = [...flags.slice(0, 2)];

  // The differentiator, stated plainly so a blind user understands why the number is smaller than a vendor's.
  out.push(`Deflected and repeat-avoided contacts are valued at the marginal cost of ${fmt2(r.marginal)} each, the labor that actually disappears, not the fully loaded ${fmt2(n(d.costPerContact))}. That is the same basis the TCO Calculator uses, so the two tools agree on the same contact and a finance reviewer cannot pit one against the other.`);

  const sorted = Object.entries(r.buckets).sort((a, b) => b[1] - a[1]);
  const [topName, topVal] = sorted[0];
  const labelMap = { containment: "self-service containment", handleTime: "handle-time reduction", fcr: "FCR improvement", attrition: "attrition reduction" };
  const topShare = Math.round(topVal / r.gross * 100);
  out.push(`${topShare}% of your case rests on ${labelMap[topName]}. ${topName === "containment" ? "A board probes deflection hardest, so bring a pilot result or vendor benchmark." : topName === "attrition" ? "That is the softest, least attributable lever, so expect the most pushback there." : "It is a relatively defensible lever, which strengthens the case."}`);

  if (r.rampOn && r.payback > 0) {
    const instMonthly = r.monthlyFull - r.monthlyPlatform;
    const instPay = instMonthly > 0 ? Math.ceil(n(d.implementationCost) / instMonthly) : 0;
    if (instPay > 0 && r.payback > instPay)
      out.push(`Phasing savings over your ${r.M}-month migration and ${r.R}-month ramp moves payback from an idealized ${instPay} months to a realistic ${r.payback}. The phased figure is the one a CFO will trust, so lead with it.`);
  } else if (!r.rampOn) {
    out.push(`Savings phasing is off, so this assumes 100% of savings land on day one, an idealized payback. Turn on phasing for the board-defensible number that accounts for migration and ramp.`);
  }

  out.push(`The ${stanceKey} stance applies a ${fmtK(r.haircut)} haircut to gross savings. Presenting gross ${fmtK(r.gross)} and net ${fmtK(r.net)} side by side signals you have already stress-tested your own numbers.`);

  if (conf) out.push(`Cost-input confidence reads ${conf.grade}${conf.open.length ? `, with ${conf.open.length} open item${conf.open.length > 1 ? "s" : ""} to close before you call the investment side final` : ""}. That badge rates how bookable the cost inputs are, not whether the organization can deliver the targets, which is a separate question for the Transformation Readiness tool.`);

  return out;
}

const DEFAULTS = {
  agents: 200, avgHourly: 18, benefitsPct: 30, monthlyContacts: 120000, currentAHT: 420, currentACW: 45,
  currentFCR: 72, currentAttrition: 35, costPerContact: 7, marginalPerContact: 0, recruitCostPerHire: 3500, trainingDays: 21,
  htReduction: 12, acwReduction: 30, fcrImprovement: 8, attritionReduction: 20, containment: 15,
  implementationCost: 750000, newPlatformPerAgentMo: 135, migrationMonths: 9, rampMonths: 6, evidence: "estimate",
};

export default function BusinessCaseBuilder() {
  const [d, setD] = useState(DEFAULTS);
  const [stance, setStance] = useState("expected");
  const [rampOn, setRampOn] = useState(true);
  const [pulled, setPulled] = useState({});
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const [capOpen, setCapOpen] = useState(false);
  const [capName, setCapName] = useState(""), [capCompany, setCapCompany] = useState(""), [capEmail, setCapEmail] = useState("");
  const [capState, setCapState] = useState("idle");
  const completedRef = useRef(false);

  // Mount: report the view, inherit the BASELINE from upstream tools (facts both tools
  // share), and honor a shared scenario URL. Targets are NOT inherited: the transformation
  // is authored here, so the target fields keep their defaults for the user to own.
  useEffect(() => {
    window.scrollTo(0, 0);
    trackTool.view("business-case-builder");
    const next = {}, got = {};
    const take = (field, key, xf = (x) => x) => {
      const v = getPrimitive(key);
      if (v != null && !isNaN(v)) { next[field] = xf(v); got[field] = true; }
    };
    take("agents", "agents");
    take("avgHourly", "agentHourly");
    take("currentAHT", "aht");
    take("currentFCR", "fcr", (x) => Math.round(x * 1000) / 10);        // fraction to percent
    take("currentAttrition", "attritionRate", (x) => Math.round(x * 1000) / 10);
    take("costPerContact", "costPerContact");                          // loaded, context only
    take("marginalPerContact", "marginalPerContact");                  // savings basis
    const annual = getPrimitive("annualContacts");
    if (annual != null && !isNaN(annual)) { next.monthlyContacts = Math.round(annual / 12); got.monthlyContacts = true; }
    else { const mc = getPrimitive("monthlyContacts"); if (mc != null && !isNaN(mc)) { next.monthlyContacts = Math.round(mc); got.monthlyContacts = true; } }
    const scn = readScenarioFromUrl();
    if (scn && typeof scn === "object") { Object.assign(next, scn); trackTool.scenarioLoad("business-case-builder"); }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = computeCase(d, stance, rampOn);
  const conf = confidenceOf(d, r, stance);
  const insights = caseInsights(r, d, stance, conf);

  const spark = (() => {
    const W = 600, H = 88, pad = 8;
    const arr = r.cumFlow;
    const minV = Math.min(...arr), maxV = Math.max(...arr), span = (maxV - minV) || 1;
    const x = i => pad + (i / (arr.length - 1)) * (W - 2 * pad);
    const y = v => pad + (1 - (v - minV) / span) * (H - 2 * pad);
    const pts = arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return { W, H, pts, y0: y(0), pbx: r.payback > 0 ? x(r.payback) : null, end: arr[arr.length - 1] };
  })();
  const paybackLabel = r.payback > 0 ? `${r.payback} mo` : ">36 mo";

  // Publish through the shared normalizer so units and provenance are canonical on the rail.
  useEffect(() => {
    const primitives = {
      agents: n(d.agents), annualContacts: r.annual, monthlyContacts: n(d.monthlyContacts),
      grossSavings: Math.round(r.gross), netSavings: Math.round(r.net), marginalPerContact: +r.marginal.toFixed(2),
      stance, paybackMonths: r.payback, threeYearROI: Math.round(r.roi3), implementationCost: n(d.implementationCost),
      year1Savings: Math.round(r.year1), rampOn, migrationMonths: r.M, rampMonths: r.R,
      confidence: conf.grade, analystRead: insights[0],
    };
    publishToolResult("business-case-builder", normalizeForPublish(primitives, { sourceTool: "business-case-builder" }).clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, stance, rampOn]);

  // Completion: fire once when the case has real inputs (not the untouched defaults).
  useEffect(() => {
    if (completedRef.current) return;
    const real = n(d.agents) !== DEFAULTS.agents || n(d.monthlyContacts) !== DEFAULTS.monthlyContacts || n(d.implementationCost) !== DEFAULTS.implementationCost || Object.keys(pulled).length > 0;
    if (real) { completedRef.current = true; trackTool.complete("business-case-builder", { real: true, severity: severityBucket(r.payback > 0 ? Math.min(1, r.payback / 36) : 1) }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, pulled]);

  const submitCapture = async () => {
    if (!capEmail.includes("@") || capState === "sending") return;
    setCapState("sending");
    try {
      await fetch(CAPTURE_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: capEmail, name: capName, company: capCompany, tool: "Business Case Builder", stance, net: fmtK(r.net), gross: fmtK(r.gross), payback: r.payback + "mo", roi: Math.round(r.roi3) + "%", confidence: conf.grade, _subject: `Business Case (${stance}): ${fmtK(r.net)} net for ${capCompany || capName || capEmail}` }),
      });
      setCapState("sent");
    } catch { setCapState("error"); }
  };

  const shareScenario = async () => {
    const ok = await copyShareUrl("/tools/business-case-builder", d);
    if (ok) { setCopied(true); trackTool.scenarioShare("business-case-builder"); setTimeout(() => setCopied(false), 2200); }
  };
  const goNext = (toTool, href) => { trackTool.nextStep("business-case-builder", toTool); window.location.href = href; };

  const bucketRows = [
    { label: "Self-service containment", key: "containment", val: r.buckets.containment },
    { label: "Handle-time reduction (talk + ACW)", key: "handleTime", val: r.buckets.handleTime },
    { label: "FCR improvement (avoided repeats)", key: "fcr", val: r.buckets.fcr },
    { label: "Attrition reduction", key: "attrition", val: r.buckets.attrition },
  ].sort((a, b) => b.val - a.val);

  const gradeColor = conf.grade === "Finance-grade" ? GREEN : conf.grade === "Planning-grade" ? AMBER : MUTED;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: WARM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}@media(max-width:700px){.bc-grid{grid-template-columns:1fr!important}.bc-sum{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Back to Tools</a>
        </div>
      </nav>

      <section style={{ padding: "40px 28px 80px" }}>
        <div style={WRAP}>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: NAVY, margin: "6px 0 6px" }}>Business Case Builder</h2>
          <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 10, maxWidth: 680 }}>Model the ROI of a CX transformation on your real numbers, live and with no sign-up. This tool is built to survive a CFO, so it does four things most ROI calculators do not.</p>
          <ul style={{ fontSize: 13, color: SLATE, lineHeight: 1.7, marginBottom: 20, maxWidth: 680, paddingLeft: 18 }}>
            <li><b>Values savings at marginal cost.</b> Deflected and repeat-avoided contacts are counted at the labor that actually disappears, not the fully loaded cost per contact, which keeps the number honest and consistent with the TCO Calculator.</li>
            <li><b>De-overlaps every lever.</b> Deflection, handle-time, FCR, and attrition never claim the same minute or contact twice.</li>
            <li><b>Weights each lever separately.</b> A stance discounts soft levers harder than defensible ones, so the case is not a single blanket haircut.</li>
            <li><b>Phases savings over a real J-curve.</b> Nothing is earned during the build, so payback reflects migration and ramp instead of landing on day one.</li>
          </ul>

          {Object.keys(pulled).length > 0 && (
            <div style={{ background: ICE, border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 12.5, color: NAVY }}>
              Baseline inherited from your TCO Calculator run. Fields marked <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: "#fff", padding: "1px 5px", borderRadius: 4 }}>PULLED</span> carried over as shared facts and stay editable. Target improvements were left for you to author, because the transformation is the argument, not an inherited assumption.
            </div>
          )}

          <Card>
            <H>Current State</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <NumField label="Agent Count" value={d.agents} onChange={v => set("agents", v)} step={5} min={1} pulled={pulled.agents} />
              <NumField label="Avg Agent Hourly Rate" value={d.avgHourly} onChange={v => set("avgHourly", v)} prefix="$" step={0.5} min={0} pulled={pulled.avgHourly} />
              <NumField label="Benefits & Burden" value={d.benefitsPct} onChange={v => set("benefitsPct", v)} suffix="%" hint="Typically 25 to 35%" min={0} max={100} />
              <NumField label="Monthly Contact Volume" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
              <NumField label="Current AHT (sec)" value={d.currentAHT} onChange={v => set("currentAHT", v)} step={5} min={1} hint={`${(n(d.currentAHT) / 60).toFixed(1)} min total`} pulled={pulled.currentAHT} />
              <NumField label="Current ACW (sec)" value={d.currentACW} onChange={v => set("currentACW", v)} step={5} min={0} info={DEFS.acw} infoTitle="After-call work" hint="Part of AHT" />
              <NumField label="Current FCR" value={d.currentFCR} onChange={v => set("currentFCR", v)} suffix="%" min={0} max={100} pulled={pulled.currentFCR} />
              <NumField label="Annual Attrition" value={d.currentAttrition} onChange={v => set("currentAttrition", v)} suffix="%" min={0} max={100} pulled={pulled.currentAttrition} />
              <NumField label="Loaded Cost per Contact" value={d.costPerContact} onChange={v => set("costPerContact", v)} prefix="$" step={0.5} min={0} info={DEFS.loadedCPC} infoTitle="Loaded cost per contact" hint="Context only, not the savings basis" pulled={pulled.costPerContact} />
              <NumField label="Recruiting Cost / Hire" value={d.recruitCostPerHire} onChange={v => set("recruitCostPerHire", v)} prefix="$" step={100} min={0} />
              <NumField label="New Hire Training Days" value={d.trainingDays} onChange={v => set("trainingDays", v)} min={0} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", background: WARM, borderRadius: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Savings basis</span>
              <InfoDot text={DEFS.marginal} title="Marginal cost per contact" />
              <span style={{ fontSize: 12, color: SLATE }}>avoided contacts valued at</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: ELECTRIC }}>{fmt2(r.marginal)}</span>
              {r.marginalPulled
                ? <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: "#fff", padding: "1px 5px", borderRadius: 4 }}>PULLED</span>
                : <span style={{ fontSize: 11, color: MUTED }}>derived from AHT and loaded wage</span>}
              <span style={{ fontSize: 11, color: MUTED }}>vs {fmt2(n(d.costPerContact))} fully loaded</span>
            </div>
          </Card>

          <Card accent={GREEN}>
            <H color={GREEN}>Target Improvements <span style={{ fontWeight: 500, color: MUTED, letterSpacing: 0, textTransform: "none" }}>you author these</span></H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <NumField label="Handle-time Reduction" value={d.htReduction} onChange={v => set("htReduction", v)} suffix="%" min={0} max={100} info={DEFS.ht} infoTitle="Handle-time reduction" hint="Applied to AHT minus ACW" />
              <NumField label="ACW Reduction" value={d.acwReduction} onChange={v => set("acwReduction", v)} suffix="%" min={0} max={100} hint="Applied to ACW only" />
              <NumField label="FCR Improvement" value={d.fcrImprovement} onChange={v => set("fcrImprovement", v)} suffix="pts" min={0} max={100} info={DEFS.fcr} infoTitle="FCR improvement" hint="Industry: 5 to 10 pt lift" />
              <NumField label="Attrition Reduction" value={d.attritionReduction} onChange={v => set("attritionReduction", v)} suffix="%" min={0} max={100} info={DEFS.attrition} infoTitle="Attrition reduction" hint="Industry: 15 to 25%" />
              <NumField label="Self-Service Containment" value={d.containment} onChange={v => set("containment", v)} suffix="%" min={0} max={100} info={DEFS.containment} infoTitle="Self-service containment" hint="Industry: 10 to 25%" />
            </div>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>ACW is modeled as a slice of AHT, so handle-time and ACW reductions never double-count the same minutes. Containment removes contacts from the handled pool before any per-contact saving is applied.</p>
          </Card>

          <Card accent={AMBER}>
            <H color={AMBER}>Investment</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="bc-grid">
              <NumField label="Implementation (one-time)" value={d.implementationCost} onChange={v => set("implementationCost", v)} prefix="$" step={5000} min={0} hint="PS, migration, integration" />
              <NumField label="New Platform / Agent / Mo" value={d.newPlatformPerAgentMo} onChange={v => set("newPlatformPerAgentMo", v)} prefix="$" step={5} min={0} hint="Recurring solution cost" />
              <NumField label="Migration Timeline" value={d.migrationMonths} onChange={v => set("migrationMonths", v)} suffix="mo" min={1} max={36} info={DEFS.phasing} infoTitle="Savings phasing" hint="Build phase, about 0% savings" />
              <NumField label="Ramp to Full Savings" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" min={1} max={24} hint="Post-go-live climb to 100%" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Evidence basis</span>
              <InfoDot text={DEFS.confidence} title="Cost-input confidence" />
              <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                {Object.entries(EVIDENCE).map(([k, v]) => (
                  <button key={k} onClick={() => set("evidence", k)} style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: d.evidence === k ? ELECTRIC : "transparent", color: d.evidence === k ? "#fff" : SLATE }}>{v.label}</button>
                ))}
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={rampOn} onChange={e => setRampOn(e.target.checked)} style={{ width: 15, height: 15, accentColor: ELECTRIC, cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Phase in savings over migration + ramp <span style={{ color: MUTED, fontWeight: 400 }}>(recommended for an honest payback)</span></span>
            </label>
          </Card>

          {/* Stance selector */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>Case stance <InfoDot text={DEFS.stance} title="Case stance" /></div>
                <div style={{ fontSize: 12, color: MUTED }}>{STANCE[stance].note}</div>
              </div>
              <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                {Object.entries(STANCE).map(([k, v]) => (
                  <button key={k} onClick={() => setStance(k)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: stance === k ? ELECTRIC : "transparent", color: stance === k ? "#fff" : SLATE }}>{v.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "32px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Business Case Summary <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>· {STANCE[stance].label} stance</span></h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: gradeColor, padding: "4px 10px", borderRadius: 20 }}>Cost-input confidence: {conf.grade}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }} className="bc-sum">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: GREEN }}>{fmtK(r.net)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Net Annual Savings <span style={{ opacity: 0.6 }}>· run-rate</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `year 1 ${fmtK(r.year1)} after ramp` : `gross ${fmtK(r.gross)} less ${fmtK(r.haircut)} haircut`}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: r.payback && r.payback <= 12 ? GREEN : (r.payback && r.payback <= 18) ? AMBER : RED }}>{paybackLabel}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Payback Period</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `phased: ${r.M}mo build + ${r.R}mo ramp` : "idealized, phasing off"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: r.roi3 > 100 ? GREEN : r.roi3 > 0 ? AMBER : RED }}>{Math.round(r.roi3)}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>3-Year ROI</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>on {fmtK(r.tco3)} 3-yr TCO</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bucketRows.map((item, i) => {
                const pctv = r.gross > 0 ? item.val / r.gross * 100 : 0;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, minWidth: 70, textAlign: "right" }}>{fmtK(item.val)}</span>
                    <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pctv}%`, height: "100%", background: GREEN, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30 }}>{Math.round(pctv)}%</span>
                  </div>
                );
              })}
            </div>

            {rampOn && (
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>Cumulative Cash Flow · 36 months</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{r.payback > 0 ? `Breaks even month ${r.payback}` : "No breakeven in 3 yrs"} · ends {fmtK(spark.end)}</span>
                </div>
                <svg viewBox={`0 0 ${spark.W} ${spark.H}`} width="100%" height="88" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                  <line x1="0" y1={spark.y0} x2={spark.W} y2={spark.y0} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  {spark.pbx != null && <line x1={spark.pbx} y1="0" x2={spark.pbx} y2={spark.H} stroke={GREEN} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
                  <polyline points={spark.pts} fill="none" stroke={LIGHT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  {spark.pbx != null && <circle cx={spark.pbx} cy={spark.y0} r="3.5" fill={GREEN} />}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  <span>Month 0 · minus {fmtK(Math.abs(r.cumFlow[0]))}</span>
                  <span>Migration {r.M}mo</span>
                  <span>Month 36</span>
                </div>
              </div>
            )}
          </div>

          {/* Confidence & open issues */}
          <div style={{ background: "#fff", border: `1px solid ${gradeColor}55`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: gradeColor, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Cost-input confidence: {conf.grade} · {EVIDENCE[conf.evidence].label}</div>
            <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.55, marginBottom: conf.open.length ? 8 : 0 }}>This rates how bookable the cost and investment inputs are. It does not certify that the organization can deliver the targets, which the Transformation Readiness tool assesses separately.</p>
            {conf.open.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Open items before the investment side is final:</div>
                {conf.open.map((o, i) => <div key={i} style={{ fontSize: 12, color: SLATE, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: gradeColor }}>›</span>{o}</div>)}
              </div>
            )}
          </div>

          {/* Analyst Read */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · how this survives the boardroom</div>
            {insights.map((t, i) => (
              <p key={i} style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>
            ))}
          </div>

          {/* Optional capture */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            {capState === "sent" ? (
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>Sent. The full business case is on its way to your inbox.</div>
            ) : !capOpen ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: SLATE }}>Want this business case emailed to you?</span>
                <button onClick={() => setCapOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "transparent", border: `1px solid ${ELECTRIC}`, borderRadius: 7, padding: "9px 16px", cursor: "pointer" }}>Email me this case</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Name" value={capName} onChange={e => setCapName(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <input placeholder="Company" value={capCompany} onChange={e => setCapCompany(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="email" placeholder="you@company.com" value={capEmail} onChange={e => setCapEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitCapture()} style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <button onClick={submitCapture} disabled={!capEmail.includes("@") || capState === "sending"} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: capEmail.includes("@") ? ELECTRIC : MUTED, border: "none", borderRadius: 6, padding: "10px 18px", cursor: "pointer" }}>{capState === "sending" ? "Sending" : "Send"}</button>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Optional. We send this case once. No list, no spam.</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span onClick={() => trackTool.pdf("business-case-builder")} style={{ display: "inline-flex" }}>
              <ReportExport
                toolName="Business Case"
                subtitle={`CX Transformation ROI · ${STANCE[stance].label} stance · cost-input confidence ${conf.grade}`}
                userName={capName}
                userEmail={capEmail}
                sections={[
                  { title: "Confidence & Evidence", type: "text", content: `Cost-input confidence: ${conf.grade} (evidence basis: ${EVIDENCE[conf.evidence].label}). This rates how bookable the cost and investment inputs are, and does not certify that the organization can deliver the operational targets. ${conf.open.length ? `Open items before the investment side is final: ${conf.open.join(" ")}` : "No open items were flagged on the cost inputs at the current settings."} Savings believability is governed separately by the ${STANCE[stance].label} stance below.` },
                  { title: "Executive Summary", type: "text", content: `Modeled on ${n(d.agents)} agents handling ${(r.annual / 1e6).toFixed(2)}M contacts annually, this CX transformation reaches ${fmtK(r.net)} in net annual savings at full run-rate (${STANCE[stance].label} stance) against a ${fmtFull(n(d.implementationCost))} one-time investment and ${fmtFull(r.recurring)} per year in platform cost. ${rampOn ? `Savings are phased over a ${r.M}-month migration and ${r.R}-month ramp, so year one delivers ${fmtK(r.year1)} as the program ramps, producing ` : `Assuming savings land at full run-rate immediately, this produces `}a ${r.payback > 0 ? `${r.payback}-month` : "beyond-three-year"} payback and ${Math.round(r.roi3)}% three-year ROI on ${fmtK(r.tco3)} total cost of ownership. Deflected and repeat-avoided contacts are valued at the marginal cost of ${fmt2(r.marginal)} each, the labor that actually disappears, not the fully loaded ${fmt2(n(d.costPerContact))}. Savings are de-overlapped and discounted for attribution risk, so the figures are presented to survive financial scrutiny rather than to maximize a headline.` },
                  { title: "Financial Summary", type: "metrics", items: [
                    { label: "Net Annual Savings", value: fmtFull(r.net), color: GREEN, sub: `${STANCE[stance].label} · run-rate` },
                    { label: rampOn ? "Year 1 (ramped)" : "Gross (pre-haircut)", value: rampOn ? fmtFull(r.year1) : fmtFull(r.gross), color: rampOn ? ELECTRIC : MUTED, sub: rampOn ? `${r.M}mo build + ${r.R}mo ramp` : `Haircut ${fmtFull(r.haircut)}` },
                    { label: "One-time Investment", value: fmtFull(n(d.implementationCost)), color: RED },
                    { label: "Annual Platform Cost", value: fmtFull(r.recurring), color: AMBER },
                    { label: "Payback Period", value: r.payback > 0 ? `${r.payback} months` : ">36 months", color: ELECTRIC, sub: rampOn ? "phased" : "idealized" },
                    { label: "3-Year ROI", value: `${Math.round(r.roi3)}%`, color: GREEN, sub: `on ${fmtFull(r.tco3)} TCO` },
                  ]},
                  { title: "Savings Breakdown", type: "table", rows: bucketRows.map(b => [b.label, fmtFull(b.val) + ` (${Math.round(r.gross > 0 ? b.val / r.gross * 100 : 0)}% of gross)`]) },
                  { title: "Analyst Read", type: "findings", items: insights },
                  { title: "Key Assumptions", type: "table", rows: [
                    ["Loaded hourly rate", fmtFull(r.loaded) + ` per hr (${n(d.avgHourly)} plus ${n(d.benefitsPct)}% burden)`],
                    ["Marginal cost per contact (savings basis)", fmt2(r.marginal) + (r.marginalPulled ? " (inherited from TCO)" : " (derived from AHT and loaded wage)")],
                    ["Fully loaded cost per contact (context)", fmt2(n(d.costPerContact))],
                    ["Annual contacts", (r.annual).toLocaleString()],
                    ["Contacts deflected (containment)", Math.round(r.deflected).toLocaleString() + ` (${n(d.containment)}%)`],
                    ["Handled pool (post-deflection)", Math.round(r.handled).toLocaleString()],
                    ["Handle-time saved per contact", `${(((n(d.currentAHT) - Math.min(n(d.currentACW), n(d.currentAHT))) * n(d.htReduction) / 100) + (Math.min(n(d.currentACW), n(d.currentAHT)) * n(d.acwReduction) / 100)).toFixed(0)}s`],
                    ["Avoided repeat contacts (FCR)", Math.round(r.avoidedRepeats).toLocaleString()],
                    ["Avoided turnover (attrition)", `${r.avoidedTurnover.toFixed(1)} agents per yr`],
                    ["Savings phasing", rampOn ? `${r.M}-mo migration (0% savings) plus ${r.R}-mo linear ramp to full` : "Off, full savings assumed from day one"],
                    ...(rampOn ? [["Year 1 savings (ramped)", fmtFull(r.year1) + ` of ${fmtFull(r.net)} run-rate`]] : []),
                    ["Confidence weighting", `containment ${Math.round(STANCE[stance].c * 100)}%, handle-time ${Math.round(STANCE[stance].h * 100)}%, FCR ${Math.round(STANCE[stance].f * 100)}%, attrition ${Math.round(STANCE[stance].a * 100)}%`],
                  ]},
                  { title: "Recommended Next Steps", type: "next", items: [
                    { tool: "TCO Calculator", reason: "Validate the platform cost assumptions behind this case", href: "/tools/tco-calculator" },
                    { tool: "Transformation Readiness", reason: "Confirm the organization can actually deliver these targets", href: "/tools/transformation-readiness" },
                    { tool: "Contract Risk Scanner", reason: "Pressure-test vendor pricing before it enters the case", href: "/tools/contract-risk" },
                  ]},
                  { title: "Methodology", type: "text", content: "Deflected and repeat-avoided contacts are valued at marginal cost, the handle-time labor that actually disappears when a contact goes away, not the fully loaded cost per contact, because fixed tech, facilities, and supervision do not fall when one contact is removed. This is the same basis the TCO Calculator uses, so the two tools never disagree on the value of the same contact. Savings are computed on the post-deflection handled pool so deflected contacts are never also credited with handle-time or FCR savings. After-call work is treated as a disjoint slice of AHT, so handle-time and ACW reductions cannot double-count the same minutes. Each lever is then weighted by an attribution-confidence factor (the stance) to produce net savings. Savings are phased over a monthly cash-flow model: zero during the migration build, then a linear ramp to full run-rate over the ramp window, so payback reflects the real J-curve rather than assuming benefits land on day one. ROI is calculated against three-year total cost of ownership (one-time implementation plus recurring platform cost). This is deliberately conservative: the goal is a number a CFO will approve, not the largest possible headline." },
                ]}
              />
            </span>
            <button onClick={shareScenario} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8, cursor: "pointer" }}>{copied ? "Link copied" : "Share scenario link"}</button>
            <a href="/contact" onClick={() => trackTool.nextStep("business-case-builder", "contact")} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8 }}>Connect with a Consultant</a>
            <button onClick={() => goNext("tco-calculator", "/tools/tco-calculator")} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8, cursor: "pointer" }}>TCO Calculator</button>
          </div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "40px 28px 28px" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={24} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX</span>
        <div style={{ display: "flex", gap: 16 }}><a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a><a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a></div></div></div></footer>
    </div>
  );
}
