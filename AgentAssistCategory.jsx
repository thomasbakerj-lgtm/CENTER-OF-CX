import { useState, useEffect, useRef } from "react";
import { getAllAgentAssist } from "./AgentAssistData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";
import { HOUSE, PILLARS, LINE, FINDINGS, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.vendors.onDark; const LIGHT = PILLARS.vendors.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair);
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=HOUSE.mist,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.bell-tiers{flex-direction:column!important}.method-grid{grid-template-columns:1fr 1fr!important}}`}</style>
</>)}

const sc = (v) => v >= 5 ? FINDINGS.clear.dark : v >= 4.5 ? HOUSE.sky2 : v >= 4 ? HOUSE.sky2 : v >= 3.5 ? PILLARS.industries.onDark : FINDINGS.high.dark;

export default function AgentAssistCategory() {
  const all = getAllAgentAssist();
  /* Integrity freeze (TB, S23): grouped by vendor type, listed by name; no score, tier or band. */
  const types = [...new Set(all.map((v) => v.type))].sort();
  const groups = types.map((t) => ({ name: t, vendors: all.filter((v) => v.type === t).map((v) => ({ slug: v.slug, name: v.name })) }));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "130px 28px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: HOUSE.body, fontSize: 13 }}>Vendors</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Agent Assist & Knowledge</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "0 0 20px" }}>
              Agent Assist{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Market Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 640 }}>
              {all.length} agent assist vendors: real-time guidance, knowledge grounding, workflow actions, coaching and compliance. The category sits where cost, quality, compliance and employee experience meet. Listed by type and name; scores are withdrawn until this category is researched under the current methodology.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: all.length, l: "Vendors listed" },{ n: types.length, l: "Vendor types" }].map((s, i) => (
                <div key={i} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: FONT, fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: HOUSE.body }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ScoresWithdrawn category="agent assist" />
      <Phase1Directory groups={groups} />

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: HOUSE.navy, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>Evaluating agent assist for your operation?</h2>
                <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Agent assist sits where cost, quality, compliance, and employee experience collide. The right choice depends on your operating model, installed stack, and which use cases carry the most value. We can help you build a scored shortlist.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "none" }}>Request an Agent Assist Briefing</a>
                  <a href="/vendors/ccaas" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Compare CCaaS Platforms →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      
    </div>
  );
}
