import { useState, useEffect, useRef } from "react";
import { categoryMeta, scoringCriteria, leaderboards, marketLayers, buyerShortlists, demoGates, brutalConclusions } from "./WEMData";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.crit-grid{grid-template-columns:1fr!important}.lb-grid{grid-template-columns:1fr!important}.layer-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

function ScoreBar({ score, max = 5 }) {
  const pct = (score / max) * 100;
  const color = score >= 4.5 ? GREEN : score >= 3.5 ? ELECTRIC : score >= 2.5 ? AMBER : RED;
  return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: `${BORDER}`, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 15, color, fontWeight: 500, minWidth: 32 }}>{score.toFixed(2)}</span>
  </div>);
}

function LeaderboardCard({ lb, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: `${color}08`, padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{lb.name}</h3>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{lb.description}</p>
      </div>
      <div style={{ padding: "8px 0" }}>
        {lb.vendors.map((v, i) => (
          <div key={i} style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: i < lb.vendors.length - 1 ? `1px solid ${BORDER}40` : "none" }}>
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 14, color: MUTED, minWidth: 20 }}>#{v.rank}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{v.vendor}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{v.read}</div>
            </div>
            <ScoreBar score={v.score} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WEMCategory() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [activeTab, setActiveTab] = useState("fullSuiteWEM");

  return (
    <div><Nav />
      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Workforce & Quality Management</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Workforce & Quality{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Management</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>{categoryMeta.executiveTake}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: "25", l: "Vendors scored" }, { n: "3", l: "Market layers" }, { n: "3", l: "Scoring modes" }, { n: "8", l: "Weighted criteria" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: LIGHT }}>{s.n}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div></div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Scoring Framework */}
      <section style={{ background: WARM, padding: "80px 28px", borderBottom: `1px solid ${BORDER}` }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Scoring Framework</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>One framework. Three weighting modes.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>{categoryMeta.scoringNote}</p>
        </FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>
              {["Criterion", "WFM Backbone", "Balanced WEM", "QA Modernization", "What It Measures"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{scoringCriteria.map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: NAVY }}>{c.name}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: c.wfm >= 14 ? ELECTRIC : MUTED }}>{c.wfm}%</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: c.balanced >= 14 ? ELECTRIC : MUTED }}>{c.balanced}%</td>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: c.qa >= 14 ? ELECTRIC : MUTED }}>{c.qa}%</td>
                <td style={{ padding: "10px 14px", color: SLATE, fontSize: 12 }}>{c.def}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div></section>

      {/* Three Leaderboards */}
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Weighted Leaderboards</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Three ways to rank. Pick the one that matches your buying problem.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>The same vendor scores differently depending on what you're buying. NICE and Verint dominate WFM Backbone and Balanced WEM. Cresta and CallMiner lead QA Modernization. Do not compare totals across modes.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }} className="lb-grid">
          <FadeIn delay={0.04}><LeaderboardCard lb={leaderboards.wfmBackbone} color={ELECTRIC} /></FadeIn>
          <FadeIn delay={0.08}><LeaderboardCard lb={leaderboards.balancedWEM} color={GREEN} /></FadeIn>
          <FadeIn delay={0.12}><LeaderboardCard lb={leaderboards.qaModernization} color={AMBER} /></FadeIn>
        </div>
      </div></section>

      {/* Market Layer Vendor Assessments */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Assessments</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>25 vendors across three market layers.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 24 }}>{categoryMeta.methodology}</p>
        </FadeIn>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[{ key: "fullSuiteWEM", label: "Full-Suite WEM (12)" }, { key: "wfmSpecialists", label: "WFM Specialists (6)" }, { key: "aiQAOverlays", label: "AI-QA Overlays (7)" }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ background: activeTab === tab.key ? ELECTRIC : "rgba(255,255,255,0.06)", color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.5)", border: activeTab === tab.key ? "none" : "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{tab.label}</button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}><p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", margin: 0 }}>{marketLayers[activeTab].description}</p></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {marketLayers[activeTab].vendors.map((v, i) => (
            <FadeIn key={`${activeTab}-${i}`} delay={i * 0.03}>
              <a href={`/vendors/${v.slug}`} style={{ display: "block", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "18px 22px", textDecoration: "none", color: "inherit", transition: "all 0.2s", cursor: "pointer" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 14, color: LIGHT }}>#{v.rank}</span>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{v.vendor}</h3>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>{v.segment}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 0", lineHeight: 1.5 }}>{v.rec}</p>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexShrink: 0, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Enterprise</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: v.entDepth >= 5 ? GREEN : v.entDepth >= 4 ? LIGHT : AMBER }}>{v.entDepth}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>AI-QA</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: v.aiQA >= 5 ? GREEN : v.aiQA >= 4 ? LIGHT : AMBER }}>{v.aiQA}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>BPO</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: v.bpo >= 5 ? GREEN : v.bpo >= 4 ? LIGHT : AMBER }}>{v.bpo}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>Native</div><div style={{ fontSize: 11, color: v.native === "Native" ? GREEN : v.native === "Mixed" ? AMBER : LIGHT, fontWeight: 600 }}>{v.native}</div></div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>→</span>
                  </div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* Buyer Shortlists */}
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Buyer Guidance</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Start from your situation, not from a vendor list.</h2>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {buyerShortlists.map((bs, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>If: {bs.situation}</h3>
                <p style={{ fontSize: 13, color: ELECTRIC, fontWeight: 500, margin: "0 0 4px" }}>{bs.shortlist}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{bs.logic}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* Demo Gates */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Demo Gates</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five gates every vendor demo must pass.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 24 }}>Polished demos hide weak exception handling, unexplainable AI, and hidden admin burden. These gates force vendors to prove operational readiness, not just feature existence.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demoGates.map((dg, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px", borderLeft: `4px solid ${RED}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: 0 }}>{dg.gate}</h3>
                  <span style={{ fontSize: 11, color: RED, fontWeight: 600, background: `${RED}08`, padding: "2px 10px", borderRadius: 4 }}>Penalty: {dg.penalty} if fail</span>
                </div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.5, margin: "0 0 6px" }}>{dg.desc}</p>
                <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, margin: "0 0 4px" }}>Pass: {dg.pass}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Why: {dg.why}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* Brutal Conclusions */}
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: NAVY, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What's Actually True</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 24px" }}>Seven things the market won't tell you.</h2>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {brutalConclusions.map((bc, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: i < brutalConclusions.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: ELECTRIC, flexShrink: 0, marginTop: -2 }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, margin: 0 }}>{bc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating WEM, WFM, or QA technology?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The right shortlist depends on whether you're buying a workforce control plane, a balanced WEM suite, or a QA modernization overlay. We can help you decide which layer to prioritize and which 3-5 vendors to evaluate.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a WEM/QM Briefing</a>
            <a href="/vendors/ccaas" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See CCaaS Vendor Scores →</a>
          </div>
        </div>
      </FadeIn></div></section>

      {/* Consolidation Note */}
      <section style={{ background: "#fff", padding: "40px 28px" }}><div style={{ ...WRAP, maxWidth: 700 }}>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, textAlign: "center" }}>{categoryMeta.consolidationNote} — Last updated {categoryMeta.lastUpdated}.</p>
      </div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
