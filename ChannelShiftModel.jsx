import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}
const fmtK = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`;

export default function ChannelShiftModel() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({
    monthlyContacts: 100000, hourlyRate: 18, overhead: 1.35,
    voicePct: 70, voiceAHT: 7, voiceConc: 1,
    chatPct: 15, chatAHT: 10, chatConc: 2.5,
    emailPct: 10, emailAHT: 5, emailConc: 1,
    botPct: 5, botCost: 0.50,
    shiftVoiceToChat: 10, shiftVoiceToBot: 10, shiftVoiceToEmail: 0,
    trainingCostPerAgent: 1500, chatSkillRamp: 4,
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = v => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Channel Shift Economics", _subject: "Channel Shift Economics Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const rate = n(d.hourlyRate) * n(d.overhead);
  const monthly = n(d.monthlyContacts);

  const calcChannel = (pct, aht, conc, isBotArg) => {
    const vol = monthly * (pct / 100);
    const effectiveAHT = aht / conc;
    const costPerContact = isBotArg ? n(d.botCost) : (rate / 60) * effectiveAHT;
    const totalCost = vol * costPerContact;
    const fteNeeded = isBotArg ? 0 : (vol * effectiveAHT) / (22 * 8 * 60 * 0.7); // 70% occupancy
    return { vol: Math.round(vol), costPerContact, totalCost, fteNeeded: Math.round(fteNeeded), effectiveAHT };
  };

  // Current state
  const cur = {
    voice: calcChannel(n(d.voicePct), n(d.voiceAHT), n(d.voiceConc), false),
    chat: calcChannel(n(d.chatPct), n(d.chatAHT), n(d.chatConc), false),
    email: calcChannel(n(d.emailPct), n(d.emailAHT), n(d.emailConc), false),
    bot: calcChannel(n(d.botPct), 0, 1, true),
  };
  const curTotal = cur.voice.totalCost + cur.chat.totalCost + cur.email.totalCost + cur.bot.totalCost;
  const curFTE = cur.voice.fteNeeded + cur.chat.fteNeeded + cur.email.fteNeeded;

  // Future state
  const shift = n(d.shiftVoiceToChat) + n(d.shiftVoiceToBot) + n(d.shiftVoiceToEmail);
  const futVoicePct = Math.max(0, n(d.voicePct) - shift);
  const futChatPct = n(d.chatPct) + n(d.shiftVoiceToChat);
  const futBotPct = n(d.botPct) + n(d.shiftVoiceToBot);
  const futEmailPct = n(d.emailPct) + n(d.shiftVoiceToEmail);

  const fut = {
    voice: calcChannel(futVoicePct, n(d.voiceAHT), n(d.voiceConc), false),
    chat: calcChannel(futChatPct, n(d.chatAHT), n(d.chatConc), false),
    email: calcChannel(futEmailPct, n(d.emailAHT), n(d.emailConc), false),
    bot: calcChannel(futBotPct, 0, 1, true),
  };
  const futTotal = fut.voice.totalCost + fut.chat.totalCost + fut.email.totalCost + fut.bot.totalCost;
  const futFTE = fut.voice.fteNeeded + fut.chat.fteNeeded + fut.email.fteNeeded;
  const savings = curTotal - futTotal;
  const fteDelta = curFTE - futFTE;

  // Transition costs
  const chatAgentsNeeded = fut.chat.fteNeeded - cur.chat.fteNeeded;
  const transitionTraining = Math.max(0, chatAgentsNeeded) * n(d.trainingCostPerAgent);
  const rampProductivityLoss = Math.max(0, chatAgentsNeeded) * (n(d.chatSkillRamp) * 5 * 8 * rate / 60 * 0.3);
  const totalTransition = transitionTraining + rampProductivityLoss;
  const paybackMonths = savings > 0 ? Math.ceil(totalTransition / savings) : 0;

  const channels = [
    { name: "Voice", color: ELECTRIC, cur: cur.voice, fut: fut.voice, curPct: n(d.voicePct), futPct: futVoicePct },
    { name: "Chat", color: GREEN, cur: cur.chat, fut: fut.chat, curPct: n(d.chatPct), futPct: futChatPct },
    { name: "Email", color: AMBER, cur: cur.email, fut: fut.email, curPct: n(d.emailPct), futPct: futEmailPct },
    { name: "Bot / Self-Service", color: "#7C3AED", cur: cur.bot, fut: fut.bot, curPct: n(d.botPct), futPct: futBotPct },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Channel Shift Economics Model</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>What happens when you move 10-20% of voice to chat, bot, or email? The answer is not linear. Model the real staffing, cost, and transition impact of channel migration.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? GREEN : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Model →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Channel Shift Economics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} />
              <Input label="Agent hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
              <Input label="Overhead multiplier" value={d.overhead} onChange={v => set("overhead", v)} suffix="x" />
            </div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", margin: "20px 0 8px" }}>Current Channel Mix</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="Voice %" value={d.voicePct} onChange={v => set("voicePct", v)} suffix="%" />
              <Input label="Chat %" value={d.chatPct} onChange={v => set("chatPct", v)} suffix="%" />
              <Input label="Email %" value={d.emailPct} onChange={v => set("emailPct", v)} suffix="%" />
              <Input label="Bot / Self-service %" value={d.botPct} onChange={v => set("botPct", v)} suffix="%" />
            </div>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", margin: "20px 0 8px" }}>Shift from Voice to...</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="→ Chat" value={d.shiftVoiceToChat} onChange={v => set("shiftVoiceToChat", v)} suffix="pts" hint="% points shifting" />
              <Input label="→ Bot / Self-service" value={d.shiftVoiceToBot} onChange={v => set("shiftVoiceToBot", v)} suffix="pts" />
              <Input label="→ Email" value={d.shiftVoiceToEmail} onChange={v => set("shiftVoiceToEmail", v)} suffix="pts" />
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Current Monthly Cost</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: NAVY }}>{fmtK(curTotal)}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>After Shift</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: savings > 0 ? GREEN : RED }}>{fmtK(futTotal)}</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: savings > 0 ? GREEN : RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Monthly Savings</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: "#fff" }}>{fmtK(savings)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{fmtK(savings * 12)}/year</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>FTE Impact</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: fteDelta > 0 ? GREEN : AMBER }}>{fteDelta > 0 ? "-" : "+"}{Math.abs(fteDelta)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{curFTE} → {futFTE} FTE</div>
              </div>
            </div>

            {/* Channel comparison */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Channel-by-Channel Comparison</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="cg">
              {channels.map((ch, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ch.color, marginBottom: 8 }}>{ch.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                    <div><span style={{ color: MUTED }}>Current</span><div style={{ fontSize: 15, fontWeight: 600, color: SLATE }}>{ch.curPct}%</div></div>
                    <div><span style={{ color: MUTED }}>After</span><div style={{ fontSize: 15, fontWeight: 600, color: ch.futPct !== ch.curPct ? ch.color : SLATE }}>{ch.futPct}%</div></div>
                    <div><span style={{ color: MUTED }}>Cost/contact</span><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>${ch.cur.costPerContact.toFixed(2)}</div></div>
                    <div><span style={{ color: MUTED }}>Monthly cost</span><div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{fmtK(ch.fut.totalCost)}</div></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Transition costs */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Transition Investment Required</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Training + reskilling</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>{fmtK(transitionTraining)}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Ramp productivity loss</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>{fmtK(rampProductivityLoss)}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${paybackMonths <= 6 ? GREEN : AMBER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Payback period</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: paybackMonths <= 6 ? GREEN : AMBER }}>{paybackMonths} months</div>
              </div>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Why channel shift is not linear:</strong> Moving 15% of voice to chat does not reduce voice FTE by 15%. Chat has longer AHT but allows concurrency (typically 2-3 simultaneous sessions), different skill requirements, and different quality monitoring needs. The savings come from effective AHT (actual AHT divided by concurrency), not from raw volume shift. This tool models the real math, including the transition investment in training, reskilling, and the productivity dip during ramp.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/ai-deflection" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>AI Deflection Reality Check →</a>
              <a href="/tools/cost-per-contact" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Cost per Contact →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
