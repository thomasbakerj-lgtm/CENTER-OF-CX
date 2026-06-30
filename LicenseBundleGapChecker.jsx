import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import InfoDot from "./src/lib/InfoDot";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, TEAL = "#0EA5A5";
const WRAP = { maxWidth: 1000, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

const MODULES = [
  { id: "wem", name: "WEM / WFM", typical: 25, desc: "Forecasting, scheduling, adherence", core: true, dStatus: "addon", dScope: "agentsup" },
  { id: "qa", name: "Quality Management", typical: 15, desc: "Evaluation, calibration, coaching", core: true, dStatus: "addon", dScope: "agentsup" },
  { id: "recording", name: "Call Recording", typical: 10, desc: "Voice + screen, compliance", core: true, dStatus: "included", dScope: "all" },
  { id: "analytics", name: "Speech + Text Analytics", typical: 20, desc: "Interaction analytics, sentiment", core: true, dStatus: "addon", dScope: "all" },
  { id: "ai", name: "AI / GenAI Features", typical: 25, desc: "Summarization, agent assist, copilot", dStatus: "usage", dScope: "agent" },
  { id: "digital", name: "Digital Channels", typical: 15, desc: "Chat, SMS, social, messaging", dStatus: "addon", dScope: "agent" },
  { id: "outbound", name: "Outbound Dialer", typical: 20, desc: "Preview, progressive, predictive", dStatus: "addon", dScope: "agent" },
  { id: "reporting", name: "Advanced Reporting", typical: 10, desc: "Custom dashboards, BI connector", dStatus: "addon", dScope: "agentsup" },
  { id: "telephony", name: "BYOC / Telephony", typical: 5, desc: "Carrier, SIP trunking", dStatus: "usage", dScope: "all" },
  { id: "storage", name: "Storage / Archival", typical: 8, desc: "Extended retention", dStatus: "limited", dScope: "all" },
  { id: "support", name: "Premium Support / TAM", typical: 12, desc: "24/7, dedicated CSM, SLA", dStatus: "included", dScope: "all" },
  { id: "services", name: "Professional Services", typical: 0, desc: "Implementation (one-time)", dStatus: "thirdparty", dScope: "all" },
];

const USAGE_TYPES = [
  { id: "ai", name: "AI assistant / copilot", basis: "user · interaction · token" },
  { id: "bot", name: "Bot / virtual agent", basis: "session · minute" },
  { id: "transcription", name: "Transcription", basis: "per minute" },
  { id: "storage", name: "Storage / retention", basis: "GB-month · tier" },
  { id: "sms", name: "SMS / WhatsApp", basis: "per message" },
  { id: "voice", name: "Voice / carrier", basis: "minutes · DID · BYOC" },
];

const STATUS_OPTS = [
  { v: "included", l: "Included" }, { v: "limited", l: "Incl, limited" }, { v: "addon", l: "Add-on SKU" },
  { v: "tier", l: "Tier upgrade" }, { v: "usage", l: "Usage-based" }, { v: "thirdparty", l: "Third-party" }, { v: "unknown", l: "Unknown" },
];
const NEED_OPTS = [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "unsure", l: "Unsure" }];
const SCOPE_OPTS = [{ v: "all", l: "All seats" }, { v: "agent", l: "Agents" }, { v: "agentsup", l: "Agents+Sups" }, { v: "sup", l: "Supervisors" }, { v: "admin", l: "Admins" }, { v: "analyst", l: "Analysts" }];
const EVIDENCE_OPTS = [{ v: "estimate", l: "Estimate / guess" }, { v: "email", l: "Vendor email" }, { v: "proposal", l: "Proposal" }, { v: "orderform", l: "Order form" }, { v: "sku", l: "SKU schedule" }, { v: "msa", l: "MSA / contract" }];
const COST_STATUS = new Set(["addon", "tier", "thirdparty"]);
const DOC_EVIDENCE = new Set(["proposal", "orderform", "sku", "msa"]);
const DBL_MAP = { ai: "ai", analytics: "transcription", digital: "sms", recording: "storage", telephony: "voice" };
const DBL_LABEL = { ai: "AI add-on + AI usage tokens", analytics: "analytics module + transcription minutes", digital: "digital channel module + SMS/WhatsApp fees", recording: "recording module + storage retention", telephony: "telephony module + voice/carrier usage" };

const DEFS = {
  baseSeat: "The advertised per-agent price the vendor leads with. It typically covers core voice, routing, and basic reporting only — most everything else is priced separately.",
  effLicenseSeat: "The seat price plus the per-seat modules and edition upgrades you require. Still a true per-seat number — what one production-ready license actually costs.",
  effPlatform: "The license seat plus usage-based fees, normalized across billable seats for comparison. This is a comparison figure, not a seat price — usage scales with volume, not seats.",
  gap: "How far the all-in platform cost per seat sits above the quote. It is not overcharging — it's the part of a production-ready platform's cost the headline seat price leaves out.",
  basis: "Named licenses bill per assigned user; concurrent bills on peak simultaneous logins. With part-time agents, seasonal ramps, or shared queues, your billable count can differ sharply from headcount.",
  seatClass: "A CCaaS quote rarely maps to one price times all agents. Supervisors, admins, and analysts are often priced differently or on different editions. Enter the classes your quote actually contains.",
  status: "How a module is priced matters as much as whether you need it. An add-on is a separate line; a tier upgrade forces a higher edition; usage-based bills by volume. Completely different economics.",
  scope: "Not every module is priced on every seat. WEM may cover agents and supervisors, AI assist only agents, admin features only admins. Set who each add-on or upgrade applies to so the cost isn't overstated.",
  tier: "Not a line-item add-on — getting this means moving seats to a higher edition. Enter the per-seat edition delta; it applies to the seats in scope. Vendors often require the whole base on the higher edition, so confirm scope in writing.",
  limited: "Included, but capped — limited retention, minutes, sessions, or seats. The cap is where overage charges hide, so it's flagged for you to confirm against real volume.",
  unknown: "You don't yet know whether this is included, and recording that honestly is the point. Unknown inclusion on a needed module caps export confidence — false precision is worse than a flagged gap.",
  usage: "Metered charges that don't live in the seat price: AI tokens, bot sessions, transcription, storage, SMS, carrier minutes. The biggest reason a per-seat model understates real cost.",
  committed: "The minimum seats your contract obligates you to pay for, which can exceed the seats you actually staff. Paying more committed than active is commit exposure — not waste, but real money and leverage.",
  commitBasis: "Minimum commitments are usually priced on contracted licenses, not your usage-loaded equivalent. Pricing idle committed seats at the platform equivalent overstates the exposure, so this defaults to the license seat.",
  uplift: "The annual percentage your rates rise at renewal. A quote that looks fine in year one can look very different in year three; this projects the seat forward so you negotiate the uplift now.",
  seats18mo: "Seats you expect to add within eighteen months, priced at today's rate. It shows the exposure to rate-lock before signing, while you still have leverage.",
  shelfware: "Modules bundled into your tier that you don't use. Leverage to negotiate a lower tier or credits — but usually not a line you can drop on its own, so it is flagged, never counted as recoverable savings.",
  confidence: "How much weight this output can carry. Finance-grade is deliberately hard: it requires a real document as the evidence source, committed seats, usage fees, renewal uplift, license basis, and terms confirmed in writing.",
  evidence: "What the numbers rest on. An estimate is a guess; a vendor email beats a guess; a proposal or order form is what finance will trust. Finance-grade requires a document, not a checkbox.",
};

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}
function Select({ value, onChange, options, color }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 5, background: "#fff", color: color || NAVY, fontWeight: 600, outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>;
}
function Cell({ value, onChange, prefix }) {
  return <div style={{ position: "relative" }}>
    {prefix && <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
    <input type="number" value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "6px 8px", paddingLeft: prefix ? 16 : 8, fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 5, textAlign: "right", color: NAVY, outline: "none" }} />
  </div>;
}
function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, pulled, info, infoTitle }) {
  const [local, setLocal] = useState(String(n(value)));
  const holdRef = useRef(null), valRef = useRef(n(value));
  valRef.current = n(value);
  useEffect(() => { setLocal(String(n(value))); /* eslint-disable-next-line */ }, [value]);
  const clamp = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => { stop(); let v = clamp(n(valRef.current)); const d = () => { v = clamp(v + dir * step); setLocal(String(v)); onChange(v); }; d(); let delay = 280; const tick = () => { d(); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); }; holdRef.current = setTimeout(tick, delay); };
  const btn = { width: 20, height: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, fontSize: 7, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}{info && <InfoDot text={info} title={infoTitle || label} />}{pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local} onChange={e => { setLocal(e.target.value); const p = parseFloat(e.target.value); onChange(isNaN(p) ? 0 : p); }} onBlur={() => setLocal(String(n(value)))}
          style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, paddingLeft: prefix ? 24 : 12, paddingRight: 40, outline: "none" }} />
        {suffix && <span style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 3, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}
function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}

export default function LicenseBundleGapChecker() {
  const [classes, setClasses] = useState([
    { id: "agent", name: "Agent", count: 150, price: 125 },
    { id: "sup", name: "Supervisor", count: 0, price: 150 },
    { id: "admin", name: "Admin", count: 0, price: 200 },
    { id: "analyst", name: "Analyst", count: 0, price: 170 },
  ]);
  const [basis, setBasis] = useState("named");
  const [committedSeats, setCommittedSeats] = useState(0);
  const [commitBasis, setCommitBasis] = useState("license");
  const [commitRate, setCommitRate] = useState(0);
  const [uplift, setUplift] = useState(0);
  const [seats18mo, setSeats18mo] = useState(0);
  const [evidence, setEvidence] = useState("estimate");
  const [confirmed, setConfirmed] = useState(false);
  const [dblAck, setDblAck] = useState(false);
  const [pulled, setPulled] = useState({});
  const [sending, setSending] = useState(false); const [sent, setSent] = useState(false);
  const [modules, setModules] = useState(() => {
    const m = {}; MODULES.forEach(mod => { m[mod.id] = { need: mod.core ? "yes" : "no", status: mod.dStatus, cost: mod.typical, scope: mod.dScope }; }); return m;
  });
  const [usage, setUsage] = useState(() => { const u = {}; USAGE_TYPES.forEach(t => { u[t.id] = 0; }); return u; });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const ag = getPrimitive("agents");
    if (ag != null && !isNaN(ag)) { setClasses(c => c.map(x => x.id === "agent" ? { ...x, count: Math.round(ag) } : x)); setPulled({ agents: true }); }
  }, []);

  const setClass = (id, k, v) => setClasses(prev => prev.map(c => c.id === id ? { ...c, [k]: n(v) } : c));
  const setMod = (id, k, v) => setModules(prev => ({ ...prev, [id]: { ...prev[id], [k]: k === "cost" ? n(v) : v } }));
  const setUse = (id, v) => setUsage(prev => ({ ...prev, [id]: n(v) }));

  // ENGINE (node-verified v4)
  const cls = {}; classes.forEach(c => cls[c.id] = n(c.count));
  const billable = classes.reduce((s, c) => s + n(c.count), 0);
  const baseMonthly = classes.reduce((s, c) => s + n(c.count) * n(c.price), 0);
  const scopeSeats = (sc) => sc === "all" ? billable : sc === "agentsup" ? (cls.agent + cls.sup) : sc === "agent" ? cls.agent : sc === "sup" ? cls.sup : sc === "admin" ? cls.admin : sc === "analyst" ? cls.analyst : billable;
  let addOnMonthly = 0, tierMonthly = 0;
  const unknowns = [], limiteds = [], tiers = [], usageFlagged = [], doubles = [];
  MODULES.forEach(mod => {
    const m = modules[mod.id]; if (m.need !== "yes") return;
    const appl = scopeSeats(m.scope || "all");
    if (m.status === "addon" || m.status === "thirdparty") addOnMonthly += appl * n(m.cost);
    else if (m.status === "tier") { tierMonthly += appl * n(m.cost); tiers.push(mod.name); }
    else if (m.status === "unknown") unknowns.push(mod.name);
    else if (m.status === "limited") limiteds.push(mod.name);
    else if (m.status === "usage") usageFlagged.push(mod.name);
    const ut = DBL_MAP[mod.id];
    if (ut && (COST_STATUS.has(m.status)) && n(usage[ut]) > 0) doubles.push(mod.id);
  });
  const usageMonthly = USAGE_TYPES.reduce((s, t) => s + n(usage[t.id]), 0);
  const licenseMonthly = baseMonthly + addOnMonthly + tierMonthly;
  const platformMonthly = licenseMonthly + usageMonthly;
  const quotedSeat = billable > 0 ? baseMonthly / billable : 0;
  const effLicenseSeat = billable > 0 ? licenseMonthly / billable : 0;
  const effPlatformSeat = billable > 0 ? platformMonthly / billable : 0;
  const gapPct = quotedSeat > 0 ? (effPlatformSeat - quotedSeat) / quotedSeat * 100 : 0;
  const hiddenAnnual = (platformMonthly - baseMonthly) * 12;
  const decomp = { addOns: addOnMonthly * 12, tier: tierMonthly * 12, usage: usageMonthly * 12 };
  const annualPlatform = platformMonthly * 12;
  const commitBasisPrice = commitBasis === "quoted" ? quotedSeat : commitBasis === "custom" ? n(commitRate) : effLicenseSeat;
  const commitExpSeats = Math.max(0, n(committedSeats) - billable);
  const commitExpAnnual = commitExpSeats * commitBasisPrice * 12;
  const usagePerSeat = billable > 0 ? usageMonthly / billable : 0;
  const year3LicenseSeat = effLicenseSeat * Math.pow(1 + n(uplift) / 100, 2);
  const year3Seat = year3LicenseSeat + usagePerSeat; // uplift applies to contracted license rates; usage held flat (volume-driven, not seat-priced)
  const exp18Annual = n(seats18mo) * effPlatformSeat * 12;
  const gapColor = gapPct > 80 ? RED : gapPct > 40 ? AMBER : GREEN;

  const shelfware = MODULES.filter(mod => { const m = modules[mod.id]; return m.need === "no" && (m.status === "included" || m.status === "limited"); });
  const anyUnsure = MODULES.some(mod => modules[mod.id].need === "unsure");
  const needPriced = MODULES.filter(mod => modules[mod.id].need === "yes" && COST_STATUS.has(modules[mod.id].status));

  // CONFIDENCE
  const planningOK = billable > 0 && quotedSeat > 0 && unknowns.length === 0 && !anyUnsure;
  const financeOK = planningOK && DOC_EVIDENCE.has(evidence) && n(committedSeats) > 0 && n(uplift) > 0 && (usageFlagged.length === 0 || usageMonthly > 0) && (doubles.length === 0 || dblAck) && confirmed;
  const confidence = financeOK ? "Finance-grade" : planningOK ? "Planning-grade" : "Directional";
  const confColor = confidence === "Finance-grade" ? GREEN : confidence === "Planning-grade" ? ELECTRIC : AMBER;

  // INTEGRITY FLAGS
  const flags = [];
  doubles.forEach(id => flags.push(dblAck
    ? { sev: "info", t: `Double count reviewed: ${DBL_LABEL[id]} confirmed as separate charges.` }
    : { sev: "warn", t: `Possible double count: ${DBL_LABEL[id]} are both entered. Confirm these are separate charges, not one already including the other.` }));
  if (unknowns.length) flags.push({ sev: "warn", t: `Unknown inclusion: ${unknowns.join(", ")} needed but bundle status unconfirmed. Get it in writing — this caps confidence at Directional.` });
  if (limiteds.length) flags.push({ sev: "warn", t: `Limited inclusion: ${limiteds.join(", ")} included but capped. Confirm the limit against real volume; overage is where the next surprise hides.` });
  if (tiers.length) flags.push({ sev: "warn", t: `Tier upgrade: ${tiers.join(", ")} force an edition jump ($${tierMonthly > 0 ? Math.round(tierMonthly / Math.max(1, billable)) : 0}/seat blended). Vendor may require all seats on the higher edition — confirm upgrade scope in writing.` });
  if (usageFlagged.length && usageMonthly === 0) flags.push({ sev: "warn", t: `Usage fee missing: ${usageFlagged.join(", ")} usage-based, but no usage cost entered. The platform equivalent is understated until you add it.` });
  if (commitExpSeats > 0) flags.push({ sev: "warn", t: `Commit exposure: ${n(committedSeats)} committed vs ${billable} active — ${commitExpSeats} idle seats at the ${commitBasis === "quoted" ? "quoted" : commitBasis === "custom" ? "custom" : "license"} basis ($${commitBasisPrice.toFixed(0)}) = ${fmtK(commitExpAnnual)}/yr. Leverage and real cost, not waste.` });
  if (n(uplift) === 0) flags.push({ sev: "info", t: `Renewal exposure: no annual uplift entered. Ask for the renewal cap and enter it — year one rarely tells the year-three story.` });
  if (shelfware.length) flags.push({ sev: "info", t: `Shelfware leverage: ${shelfware.map(m => m.name).join(", ")} bundled but unused. Leverage for a lower tier or credits, not recoverable savings.` });
  if (usageMonthly > 0) flags.push({ sev: "info", t: `Normalized, not seat costs: ${fmtK(usageMonthly)}/mo of usage fees are spread across seats for comparison only. They scale with volume, not seats — the platform equivalent is not a vendor seat price.` });
  needPriced.forEach(mod => { if (n(modules[mod.id].cost) === 0) flags.push({ sev: "info", t: `${mod.name} is needed and priced, but its cost is $0 — pull the real figure from the quote or the gap is understated.` }); });

  // ANALYST READ (reviewer wording)
  const analyst = [];
  analyst.push(`The quoted seat price is not the production-ready license cost. This model separates the vendor's headline seat from required add-ons, tier upgrades, usage-based charges, support packages, commit exposure, and renewal uplift. Across ${billable} billable seats the ${"$" + quotedSeat.toFixed(0)} quote becomes ${"$" + effLicenseSeat.toFixed(0)} once required per-seat modules and edition upgrades are added, and ${"$" + effPlatformSeat.toFixed(0)} per-seat-equivalent once usage fees are normalized in — a ${gapPct.toFixed(0)}% premium worth ${fmtK(hiddenAnnual)}/yr. The hidden annual amount is not automatically waste; it is the portion of platform cost the quote did not make obvious.`);
  if (decomp.addOns + decomp.tier + decomp.usage > 0) analyst.push(`That hidden annual breaks down as ${fmtK(decomp.addOns)} required add-ons, ${fmtK(decomp.tier)} tier upgrades, and ${fmtK(decomp.usage)} usage fees. Each is a different negotiation: add-ons get co-termed and rate-locked, edition upgrades get scope-confirmed, usage fees get capped or committed. Treating them as one number hides the levers.`);
  if (tiers.length) analyst.push(`${tiers.join(" and ")} ${tiers.length > 1 ? "are" : "is"} a tier upgrade, not a line item — getting ${tiers.length > 1 ? "them" : "it"} can force every seat to a higher edition, not just the users of the feature. Confirm the upgrade scope in writing before you model it.`);
  if (usageMonthly > 0) analyst.push(`${fmtK(usageMonthly)}/mo runs through usage meters and is normalized across seats for comparison only — it is not a seat fee. These scale with volume, so cap or commit them deliberately rather than leaving them open-ended.`);
  if (commitExpSeats > 0) analyst.push(`You're committed to ${n(committedSeats)} seats but staff ${billable}. That ${commitExpSeats}-seat gap, priced at the ${commitBasis === "quoted" ? "quoted base" : commitBasis === "custom" ? "custom commit" : "license"} seat, is ${fmtK(commitExpAnnual)}/yr of commit exposure — use it to negotiate the minimum down or win ramp flexibility, but budget it until the contract says otherwise.`);
  if (n(uplift) > 0) analyst.push(`At ${n(uplift)}% annual uplift, the license component rises while usage fees are held flat: the license seat moves from ${"$" + effLicenseSeat.toFixed(0)} to ${"$" + year3LicenseSeat.toFixed(0)}, putting the year-three platform seat-equivalent at ${"$" + year3Seat.toFixed(0)}, assuming no usage-volume growth. Negotiate the renewal cap now, while you hold the leverage.`);
  if (shelfware.length) analyst.push(`Bundled-but-unused capability is leverage, not recoverable savings. Use ${shelfware.map(m => m.name).join(", ")} to challenge tier fit, request credits, secure implementation concessions, or negotiate future module access. Do not count it as cash unless the vendor confirms a price reduction in writing.`);
  analyst.push(`Use this to budget the real platform baseline and negotiate the terms before signature: price every required module and edition delta in writing, co-term add-ons to the master agreement, cap usage fees, and rate-lock the ${n(seats18mo) > 0 ? n(seats18mo) + " seats" : "seats"} you'll need within eighteen months. The quote is the opening move, not the price.`);

  const evLabel = EVIDENCE_OPTS.find(e => e.v === evidence)?.l || evidence;
  const caveats = [];
  if (doubles.length > 0 && !dblAck) caveats.push(`possible double count not yet confirmed as separate charges (${doubles.map(id => DBL_LABEL[id]).join("; ")})`);
  if (unknowns.length) caveats.push(`${unknowns.length} required module${unknowns.length > 1 ? "s" : ""} with unknown inclusion`);
  if (anyUnsure) caveats.push(`needs marked Unsure`);
  if (usageFlagged.length && usageMonthly === 0) caveats.push(`usage-based module${usageFlagged.length > 1 ? "s" : ""} with no usage cost entered`);
  const confLine = `Confidence: ${confidence}. Evidence source: ${evLabel}. ` + (caveats.length ? `Open issues: ${caveats.join("; ")}.` : doubles.length > 0 && dblAck ? `Commercial overlap: module and usage fees confirmed as separate charges.` : `No unresolved commercial caveats.`);

  useEffect(() => {
    publishToolResult("license-gap", {
      licenseQuotedSeat: +quotedSeat.toFixed(2), licenseEffectiveLicenseSeat: +effLicenseSeat.toFixed(2), licenseEffectivePlatformSeat: +effPlatformSeat.toFixed(2),
      licenseBundleGapPct: +gapPct.toFixed(1), licenseAddOnAnnual: Math.round(decomp.addOns), licenseTierAnnual: Math.round(decomp.tier), licenseUsageMonthly: Math.round(usageMonthly),
      licenseHiddenAnnual: Math.round(hiddenAnnual), licenseAnnualPlatform: Math.round(annualPlatform), licenseYear3Seat: +year3Seat.toFixed(2),
      licenseCommitExposureAnnual: Math.round(commitExpAnnual), agents: billable, licenseConfidence: confidence, analystRead: analyst[0],
    }); /* eslint-disable-next-line */
  }, [classes, modules, usage, committedSeats, commitBasis, commitRate, uplift, seats18mo, evidence, confirmed]);

  const sendResults = () => {
    setSending(true);
    const b = new FormData();
    b.append("_subject", "License Bundle Gap (v4) — Center of CX"); b.append("source", "License Bundle Gap Checker");
    b.append("quoted_seat", "$" + quotedSeat.toFixed(0)); b.append("eff_license_seat", "$" + effLicenseSeat.toFixed(0)); b.append("eff_platform_seat_eq", "$" + effPlatformSeat.toFixed(0));
    b.append("gap_pct", gapPct.toFixed(0) + "%"); b.append("hidden_annual", fmtK(hiddenAnnual)); b.append("confidence", confidence); b.append("evidence", evidence);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body: b, headers: { Accept: "application/json" } })
      .then(r => { if (r.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  const card = { background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 14px", textAlign: "center" };
  const lab = { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "flex", justifyContent: "center", alignItems: "center", gap: 4, lineHeight: 1.25 };
  const big = { fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28 };
  const h3 = { fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:780px){.cg2{grid-template-columns:1fr!important}.s4{grid-template-columns:1fr 1fr!important}.s3{grid-template-columns:1fr!important}.modrow{grid-template-columns:1fr 72px 104px 104px 64px!important}.moddesc{display:none!important}.clsrow{grid-template-columns:1fr 64px 76px!important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "52px 28px 30px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>License Bundle Gap Checker</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 720 }}>The advertised seat price is not the license cost. This reconciles the quote against what you actually pay: base seats by class, required add-ons and edition upgrades scoped to the seats they touch, usage fees normalized for comparison, minimum commits, and renewal uplift — plus the shelfware you can use as leverage. It hands TCO and Contract Risk better numbers; it does not replace them.</p>
          {pulled.agents && <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}><span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Agent count pulled from your TCO run. Editable below.</span></div>}
        </div>
      </section>

      {/* SEATS */}
      <section style={{ background: WARM, padding: "26px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 6 }} className="cg2">
            <div>
              <h3 style={h3}>Seat classes<InfoDot text={DEFS.seatClass} title="Seat classes" /></h3>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 84px", gap: 8, padding: "6px 10px", background: DEEP }} className="clsrow">
                  <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Class</span>
                  <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "right" }}>Count</span>
                  <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "right" }}>$/seat/mo</span>
                </div>
                {classes.map((c, i) => (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 72px 84px", gap: 8, padding: "7px 10px", alignItems: "center", background: i % 2 ? WARM : "#fff" }} className="clsrow">
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: c.id === "agent" ? NAVY : SLATE }}>{c.name}{c.id === "agent" && pulled.agents && <span style={{ fontSize: 8, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 4px", borderRadius: 3, marginLeft: 5 }}>PULLED</span>}</span>
                    <Cell value={c.count} onChange={v => setClass(c.id, "count", v)} />
                    <Cell value={c.price} onChange={v => setClass(c.id, "price", v)} prefix="$" />
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 84px", gap: 8, padding: "7px 10px", background: NAVY }} className="clsrow">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Billable total</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", textAlign: "right" }}>{billable}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: LIGHT, textAlign: "right" }}>${quotedSeat.toFixed(0)}</span>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>License basis<InfoDot text={DEFS.basis} title="License basis" /></label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["named", "Named"], ["concurrent", "Concurrent"], ["blended", "Blended"]].map(([v, l]) => (
                    <button key={v} onClick={() => setBasis(v)} style={{ flex: 1, padding: "7px", fontSize: 11.5, fontWeight: 600, borderRadius: 6, border: `1px solid ${basis === v ? ELECTRIC : BORDER}`, background: basis === v ? ELECTRIC : "#fff", color: basis === v ? "#fff" : SLATE, cursor: "pointer" }}>{l}</button>
                  ))}
                </div>
                <span style={{ fontSize: 10.5, color: MUTED, marginTop: 4, display: "block" }}>{basis === "concurrent" ? "Count peak simultaneous logins, not headcount." : basis === "blended" ? "Each class priced on its own edition or rate." : "Every assigned user needs a license, active or not."}</span>
              </div>
            </div>
            <div>
              <h3 style={h3}>Commitment + renewal</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <NumField label="Committed / minimum seats" value={committedSeats} onChange={setCommittedSeats} step={5} min={0} hint="The floor you pay for, even if you staff fewer" info={DEFS.committed} infoTitle="Committed seats" />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>Commit priced at<InfoDot text={DEFS.commitBasis} title="Commit basis" /></label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[["license", "License seat"], ["quoted", "Quoted base"], ["custom", "Custom"]].map(([v, l]) => (
                      <button key={v} onClick={() => setCommitBasis(v)} style={{ flex: 1, padding: "6px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${commitBasis === v ? ELECTRIC : BORDER}`, background: commitBasis === v ? ELECTRIC : "#fff", color: commitBasis === v ? "#fff" : SLATE, cursor: "pointer" }}>{l}</button>
                    ))}
                  </div>
                  {commitBasis === "custom" && <div style={{ marginTop: 6 }}><Cell value={commitRate} onChange={setCommitRate} prefix="$" /></div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <NumField label="Renewal uplift" value={uplift} onChange={setUplift} suffix="%" step={1} min={0} hint="Rate rise / year" info={DEFS.uplift} infoTitle="Renewal uplift" />
                  <NumField label="Seats +18 mo" value={seats18mo} onChange={setSeats18mo} step={5} min={0} hint="Expansion to lock" info={DEFS.seats18mo} infoTitle="18-month expansion" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section style={{ background: "#fff", padding: "24px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={h3}>Module coverage<InfoDot text={DEFS.status} title="Module pricing type" /></h3>
          <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 84px 116px 116px 64px", gap: 8, padding: "8px 10px", background: DEEP, alignItems: "center" }} className="modrow">
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Module</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }} className="moddesc">What it is</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center" }}>Need</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center" }}>Pricing type</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center" }}>Applies to</span>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "right" }}>$/seat</span>
            </div>
            {MODULES.map((mod, i) => {
              const m = modules[mod.id];
              const isCost = COST_STATUS.has(m.status);
              const showCost = m.need === "yes" && isCost;
              const showScope = m.need === "yes" && isCost;
              const isGap = m.need === "yes" && (isCost || m.status === "usage");
              const isShelf = m.need === "no" && (m.status === "included" || m.status === "limited");
              const isUnk = m.need === "yes" && m.status === "unknown";
              const lc = isUnk ? MUTED : isGap ? AMBER : isShelf ? TEAL : m.need === "yes" ? GREEN : "transparent";
              return (
                <div key={mod.id} style={{ display: "grid", gridTemplateColumns: "1fr 180px 84px 116px 116px 64px", gap: 8, padding: "8px 10px", alignItems: "center", background: i % 2 ? WARM : "#fff", borderLeft: `3px solid ${lc}` }} className="modrow">
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>{mod.name}</span>
                  <span style={{ fontSize: 11, color: MUTED }} className="moddesc">{mod.desc}</span>
                  <div><Select value={m.need} onChange={v => setMod(mod.id, "need", v)} options={NEED_OPTS} color={m.need === "yes" ? NAVY : m.need === "unsure" ? AMBER : MUTED} /></div>
                  <div><Select value={m.status} onChange={v => setMod(mod.id, "status", v)} options={STATUS_OPTS} color={isCost ? AMBER : m.status === "unknown" ? RED : m.status === "usage" ? TEAL : SLATE} /></div>
                  <div>{showScope ? <Select value={m.scope} onChange={v => setMod(mod.id, "scope", v)} options={SCOPE_OPTS} color={SLATE} /> : <span style={{ fontSize: 10.5, color: BORDER, display: "block", textAlign: "center" }}>—</span>}</div>
                  <div>{showCost ? <Cell value={m.cost} onChange={v => setMod(mod.id, "cost", v)} prefix="$" /> : <span style={{ fontSize: 10.5, color: BORDER, display: "block", textAlign: "right" }}>{m.status === "usage" ? "below" : "—"}</span>}</div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
            Add-ons <strong style={{ color: AMBER }}>{fmtK(addOnMonthly)}/mo</strong> · tier upgrades <strong style={{ color: AMBER }}>{fmtK(tierMonthly)}/mo</strong> · scoped to the seats each touches · {shelfware.length} shelfware · {unknowns.length} unknown
          </p>

          {/* USAGE */}
          <h3 style={{ ...h3, marginTop: 20 }}>Usage-based fees<InfoDot text={DEFS.usage} title="Usage-based fees" /></h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="s3">
            {USAGE_TYPES.map(t => (
              <div key={t.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", background: n(usage[t.id]) > 0 ? `${TEAL}08` : "#fff" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{t.name}</div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>{t.basis}</div>
                <Cell value={usage[t.id]} onChange={v => setUse(t.id, v)} prefix="$" />
                <div style={{ fontSize: 9.5, color: MUTED, marginTop: 3 }}>$/month</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>Total metered fees <strong style={{ color: TEAL }}>{fmtK(usageMonthly)}/mo</strong>, normalized to {fmtK(usageMonthly / Math.max(1, billable))}/seat for comparison only — not a seat fee.</p>
        </div>
      </section>

      {/* RESULTS */}
      <section style={{ background: "#fff", padding: "28px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }} className="s4">
            <div style={card}><div style={lab}>Quoted Seat<InfoDot text={DEFS.baseSeat} title="Quoted seat" /></div><div style={{ ...big, color: ELECTRIC }}>${quotedSeat.toFixed(0)}</div><div style={{ fontSize: 10, color: MUTED }}>vendor headline</div></div>
            <div style={card}><div style={lab}>Eff. License Seat<InfoDot text={DEFS.effLicenseSeat} title="Effective license seat" /></div><div style={{ ...big, color: SLATE }}>${effLicenseSeat.toFixed(0)}</div><div style={{ fontSize: 10, color: MUTED }}>seat + modules + tier</div></div>
            <div style={{ ...card, background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, border: "none" }}><div style={{ ...lab, color: gapColor }}>Platform Seat-Eq<InfoDot text={DEFS.effPlatform} title="Effective platform seat equivalent" align="right" /></div><div style={{ ...big, color: "#fff" }}>${effPlatformSeat.toFixed(0)}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>+ usage, normalized</div></div>
            <div style={{ ...card, border: `1px solid ${gapColor}` }}><div style={lab}>Bundle Gap<InfoDot text={DEFS.gap} title="Bundle gap" /></div><div style={{ ...big, color: gapColor }}>+{gapPct.toFixed(0)}%</div><div style={{ fontSize: 10, color: MUTED }}>platform vs quote</div></div>
          </div>

          {/* Hidden annual decomposition */}
          <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Hidden annual above quoted baseline</span>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: AMBER }}>{fmtK(hiddenAnnual)}</span>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", marginBottom: 8, background: BORDER }}>
              {[["Add-ons", decomp.addOns, AMBER], ["Tier upgrades", decomp.tier, "#D97706"], ["Usage fees", decomp.usage, TEAL]].map(([l, v, c]) => {
                const w = hiddenAnnual > 0 ? (v / hiddenAnnual) * 100 : 0;
                return w > 0 ? <div key={l} style={{ width: `${w}%`, background: c }} title={`${l} ${fmtK(v)}`} /> : null;
              })}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["Add-ons", decomp.addOns, AMBER], ["Tier upgrades", decomp.tier, "#D97706"], ["Usage fees", decomp.usage, TEAL]].map(([l, v, c]) => (
                <span key={l} style={{ fontSize: 11, color: SLATE, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: c, display: "inline-block" }} />{l} <strong>{fmtK(v)}</strong></span>
              ))}
            </div>
          </div>

          {/* Commercial traps */}
          {(commitExpSeats > 0 || n(uplift) > 0 || n(seats18mo) > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }} className="s3">
              <div style={{ ...card, textAlign: "left", opacity: commitExpSeats > 0 ? 1 : 0.5 }}><div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Commit Exposure</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 21, color: commitExpSeats > 0 ? AMBER : MUTED }}>{commitExpSeats > 0 ? `${commitExpSeats} seats` : "none"}</div><div style={{ fontSize: 10, color: MUTED }}>{commitExpSeats > 0 ? `vs ${billable} active · ${fmtK(commitExpAnnual)}/yr at ${commitBasis} basis` : "committed ≤ active"}</div></div>
              <div style={{ ...card, textAlign: "left", opacity: n(uplift) > 0 ? 1 : 0.5 }}><div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Year-3 Seat-Eq</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 21, color: n(uplift) > 0 ? RED : MUTED }}>${year3Seat.toFixed(0)}</div><div style={{ fontSize: 10, color: MUTED }}>{n(uplift) > 0 ? `license $${effLicenseSeat.toFixed(0)}→$${year3LicenseSeat.toFixed(0)} at ${n(uplift)}%, usage flat` : "enter uplift to project"}</div></div>
              <div style={{ ...card, textAlign: "left", opacity: n(seats18mo) > 0 ? 1 : 0.5 }}><div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>18-mo Expansion</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 21, color: n(seats18mo) > 0 ? SLATE : MUTED }}>{fmtK(exp18Annual)}</div><div style={{ fontSize: 10, color: MUTED }}>{n(seats18mo) > 0 ? `${n(seats18mo)} seats · rate-lock now` : "enter expansion seats"}</div></div>
            </div>
          )}

          {/* Confidence + evidence */}
          <div style={{ border: `1px solid ${confColor}`, background: `${confColor}0A`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: confColor, letterSpacing: 1, textTransform: "uppercase" }}>Export confidence</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: confColor }}>{confidence}</span>
              <InfoDot text={DEFS.confidence} title="Export confidence" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: SLATE, fontWeight: 600 }}>Evidence</span>
                <div style={{ minWidth: 130 }}><Select value={evidence} onChange={setEvidence} options={EVIDENCE_OPTS} color={DOC_EVIDENCE.has(evidence) ? GREEN : MUTED} /></div>
                <InfoDot text={DEFS.evidence} title="Evidence source" align="right" />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ width: 15, height: 15, accentColor: GREEN }} />
                <span style={{ fontSize: 12, color: SLATE, fontWeight: 600 }}>Confirmed in writing</span>
              </label>
            </div>
          </div>
          {doubles.length > 0 && (
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", border: `1px solid ${dblAck ? GREEN : AMBER}`, background: `${dblAck ? GREEN : AMBER}0A`, borderRadius: 8, padding: "9px 14px", marginBottom: 8 }}>
              <input type="checkbox" checked={dblAck} onChange={e => setDblAck(e.target.checked)} style={{ width: 15, height: 15, accentColor: GREEN }} />
              <span style={{ fontSize: 12, color: SLATE, fontWeight: 600 }}>Possible double counts confirmed as separate charges{!dblAck && <span style={{ color: AMBER, fontWeight: 700 }}> — required for Finance-grade</span>}</span>
            </label>
          )}
          {confidence !== "Finance-grade" && <p style={{ fontSize: 11.5, color: MUTED, margin: "0 0 18px" }}>{confidence === "Directional" ? "Directional until needed modules have known inclusion and pricing. Resolve every Unknown and Unsure to reach Planning-grade." : `Planning-grade. Finance-grade needs a document as evidence (proposal, order form, SKU schedule, or MSA), committed seats, renewal uplift, priced usage${doubles.length > 0 && !dblAck ? ", possible double counts confirmed separate" : ""}, and confirmation in writing.`}</p>}

          {/* Shelfware */}
          {shelfware.length > 0 && (
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>Shelfware — leverage, not savings<InfoDot text={DEFS.shelfware} title="Shelfware" /></div>
              <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5, margin: 0 }}>Bundled but unused: {shelfware.map(m => m.name).join(", ")}. Use it to challenge tier fit, request credits, secure implementation concessions, or negotiate future module access — not recoverable cash unless the vendor confirms a reduction in writing.</p>
            </div>
          )}

          {/* Integrity */}
          <div style={{ border: `1px solid ${flags.some(f => f.sev === "warn") ? AMBER : BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 20, background: flags.some(f => f.sev === "warn") ? `${AMBER}06` : WARM }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: flags.some(f => f.sev === "warn") ? AMBER : GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: flags.length ? 10 : 0 }}>{flags.length ? "⚠ Integrity checks" : "✓ Integrity checks passed"}</div>
            {flags.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: i ? 8 : 0 }}>
                <span style={{ color: f.sev === "warn" ? AMBER : ELECTRIC, fontWeight: 700, fontSize: 13 }}>{f.sev === "warn" ? "!" : "i"}</span>
                <span style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5 }}>{f.t}</span>
              </div>
            ))}
            {!flags.length && <span style={{ fontSize: 12.5, color: SLATE }}>Inclusion is known on every needed module, nothing forces a hidden tier upgrade, usage fees are priced with no double counts, and committed seats match active.</span>}
          </div>

          {/* Analyst */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · normalized per-seat is not a vendor seat price</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport toolName="License Bundle Gap Analysis" subtitle={`Quoted vs effective platform seat · ${confidence}`} userName="" userEmail="" sections={[
              { title: "Confidence & Evidence", type: "text", content: confLine },
              { title: "Seat Economics", type: "metrics", items: [
                { label: "Quoted Seat", value: "$" + quotedSeat.toFixed(0), color: ELECTRIC, sub: "vendor headline" },
                { label: "Eff. License Seat", value: "$" + effLicenseSeat.toFixed(0), color: SLATE, sub: "seat+modules+tier" },
                { label: "Platform Seat-Eq", value: "$" + effPlatformSeat.toFixed(0), color: gapColor, sub: "+usage, normalized" },
                { label: "Bundle Gap", value: "+" + gapPct.toFixed(0) + "%", color: gapColor },
              ]},
              { title: "Hidden Annual, decomposed", type: "table", rows: [
                ["Required add-ons", fmtK(decomp.addOns)],
                ["Tier upgrades", fmtK(decomp.tier)],
                ["Usage-based fees", fmtK(decomp.usage)],
                ["Total hidden annual", fmtK(hiddenAnnual)],
              ]},
              { title: "Module Coverage", type: "table", rows: MODULES.filter(m => modules[m.id].need !== "no" || modules[m.id].status === "included" || modules[m.id].status === "limited").map(m => {
                const x = modules[m.id]; const st = STATUS_OPTS.find(s => s.v === x.status)?.l || x.status;
                const sc = COST_STATUS.has(x.status) ? " · " + (SCOPE_OPTS.find(s => s.v === x.scope)?.l || x.scope) : "";
                const tag = x.need === "no" && (x.status === "included" || x.status === "limited") ? "Shelfware" : x.need === "unsure" ? "Unsure" : st + (COST_STATUS.has(x.status) ? " $" + n(x.cost) + sc : "");
                return [m.name, tag];
              }) },
              ...(commitExpSeats > 0 || n(uplift) > 0 ? [{ title: "Commercial Exposure", type: "metrics", items: [
                ...(commitExpSeats > 0 ? [{ label: "Commit Exposure", value: commitExpSeats + " seats", color: AMBER, sub: fmtK(commitExpAnnual) + "/yr · " + commitBasis + " basis" }] : []),
                ...(n(uplift) > 0 ? [{ label: "Year-3 Seat-Eq", value: "$" + year3Seat.toFixed(0), color: RED, sub: n(uplift) + "% uplift" }] : []),
                ...(n(seats18mo) > 0 ? [{ label: "18-mo Expansion", value: fmtK(exp18Annual), color: SLATE }] : []),
              ] }] : []),
              ...(shelfware.length ? [{ title: "Shelfware (leverage, not savings)", type: "text", content: `${shelfware.length} module${shelfware.length > 1 ? "s" : ""} bundled but unused: ${shelfware.map(m => m.name).join(", ")}. Challenge tier fit, request credits, secure implementation concessions, or negotiate future module access — not recoverable unless the vendor confirms a reduction in writing.` }] : []),
              ...(flags.length ? [{ title: "Integrity Checks", type: "findings", items: flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Three figures, deliberately distinct. Quoted seat = base monthly across seat classes / billable seats. Effective license seat adds required per-seat add-ons and edition (tier) upgrades, each priced only on the seats in its scope, then divided by billable seats — still a true per-seat figure. Effective platform seat-equivalent adds usage-based fees and normalizes across billable seats for comparison only; it is not a vendor seat price, because usage scales with volume, not seats. Hidden annual is the platform total over the quoted baseline, decomposed into add-ons, tier upgrades, and usage. Tier upgrades may force the whole base onto a higher edition — confirm scope in writing. Commit exposure prices idle committed seats at the chosen basis (license seat by default, not the usage-loaded equivalent, to avoid overstating). The year-three projection applies the renewal uplift to the contracted license rates only and holds usage flat, because usage scales with volume rather than the contract. Shelfware is leverage only, never recoverable savings. Confidence is ${confidence}; Finance-grade requires a document as evidence (proposal, order form, SKU schedule, or MSA), committed seats, usage treatment, renewal uplift, license basis, and written confirmation. Evidence source: ${EVIDENCE_OPTS.find(e => e.v === evidence)?.l}.` },
              { title: "Next Steps", type: "next", items: [
                { tool: "Contract Risk Scanner", reason: "Rate-locks, co-term, promo expiration, upgrade scope, and minimum-commit terms behind these numbers", href: "/tools/contract-risk" },
                { tool: "TCO Calculator", reason: "Roll the platform seat-equivalent and usage fees into full cost of ownership", href: "/tools/tco-calculator" },
                { tool: "Vendor Match", reason: "Compare effective platform economics, not quoted seats, across vendors", href: "/tools/vendor-match" },
              ]},
            ]} />
            <button onClick={sendResults} disabled={sending} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer" }}>{sent ? "Sent ✓" : sending ? "Sending..." : "Send Results & Request Review"}</button>
            <a href="/tools/contract-risk" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Contract Risk Scanner →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
