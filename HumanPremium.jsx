import { useState, useEffect } from "react";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.research.onDark; const LIGHT = PILLARS.research.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair); const GREEN = HOUSE.mist; const AMBER = HOUSE.mist; const RED = HOUSE.mist;
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const NARROW = { maxWidth: 760, margin: "0 auto", padding: "0 28px" };
/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }
function LogoMark({size=34,light=true}){const a=HOUSE.mist,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"The Human Premium",href:"/human-premium"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.hp-grid{grid-template-columns:1fr!important}.role-grid{grid-template-columns:1fr!important}.cert-grid{grid-template-columns:1fr!important}.path-grid{grid-template-columns:1fr!important}}`}</style>
</>)}

export default function HumanPremium() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div>
      <Nav />

      {/* ═══ HERO: different energy from the rest of the site ═══ */}
      <section style={{ background: HOUSE.navy, padding: "150px 28px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "none" }} />
        <div style={{ ...NARROW, position: "relative", zIndex: 1, textAlign: "center" }}>
          <FadeIn>
            <span style={{ color: GREEN, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", display: "block", marginBottom: 24 }}>A Center of CX Position</span>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.08, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
              The Human{" "}<span style={{ background: `linear-gradient(135deg, ${GREEN}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Premium</span>
            </h1>
            <p style={{ fontSize: "clamp(16px, 1.8vw, 19px)", color: HOUSE.body, lineHeight: 1.75, maxWidth: 580, margin: "0 auto 36px" }}>
              As AI handles more of the routine, the humans who remain become exponentially more important. This isn't a displacement story. It's a transformation story: and the people who lean in will build careers that didn't exist two years ago.
            </p>
            <div style={{ width: 60, height: 2, background: GREEN, margin: "0 auto", borderRadius: 1 }} />
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE THESIS ═══ */}
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}>
        <div style={NARROW}>
          <FadeIn>
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>The Thesis</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: NAVY, lineHeight: 1.2, margin: "0 0 20px" }}>The industry is asking the wrong question.</h2>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, marginBottom: 16 }}>
              Every analyst firm, every vendor, every conference keynote frames the conversation the same way: <em>"How much can we automate?"</em> Containment rates. Cost-per-interaction. Agent labor reduction. The metrics all point in one direction: fewer humans, more machines.
            </p>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, marginBottom: 16 }}>
              That framing is incomplete. It measures what AI replaces. It ignores what humans create.
            </p>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.8, marginBottom: 16 }}>
              When your IVA handles most routine interactions, what remains is not residual volume you haven't automated yet. It is the highest-stakes, most emotionally charged, most commercially consequential work in your entire operation. A patient who needs clinical empathy. A business customer whose large account depends on someone understanding their specific situation. A fraud victim who needs a human being to say "I believe you, and here's what we're going to do."
            </p>
            <p style={{ fontSize: 16, color: NAVY, lineHeight: 1.8, fontWeight: 500 }}>
              The companies that treat this remaining work as the premium layer, and invest in the humans who operate it, will outperform the ones that treat it as a cost line to be further compressed. This is not a sentimental argument. It is a commercial one.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE ECONOMICS: data-backed ═══ */}
      <section style={{ background: WARM, padding: "80px 28px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>The Economics</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: NAVY, lineHeight: 1.2, margin: "0 0 12px" }}>The compensation paradox that changes everything.</h2>
            <p style={{ fontSize: 15, color: MUTED, maxWidth: 600, marginBottom: 36 }}>If AI handles the easy work, the humans who remain handle only the hard work. Hard work requires more skill. More skill commands higher compensation. The math creates a new kind of career.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }} className="hp-grid">
            {[
              { icon: "↓", stat: "Routine", label: "Interactions AI takes first", sub: "Password resets, order status, appointment scheduling, FAQ: the work that was never a career to begin with", color: ELECTRIC },
              { icon: "↑", stat: "Harder", label: "Each interaction that remains", sub: "Every interaction an agent handles is harder, more emotional, and more consequential than before automation", color: AMBER },
              { icon: "◆", stat: "Premium", label: "Compensation for specialist resolvers", sub: "Fewer agents, paid more, trained deeper, given more authority, measured on resolution quality, not handle time", color: GREEN },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px", height: "100%" }}>
                  <div style={{ fontSize: 36, color: s.color, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: FONT, fontSize: 32, color: s.color, marginBottom: 4 }}>{s.stat}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 8px" }}>{s.label}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0 }}>{s.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <div style={{ background: HOUSE.navy, borderRadius: 12, padding: "28px 32px", marginTop: 24 }}>
              <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, margin: 0 }}>
                <span style={{ color: GREEN, fontWeight: 600 }}>The bottom line:</span> As an illustrative example (our own, with no forecast behind it): a 500-agent operation that automates 60% of its contacts does not simply become a 200-agent operation at the same cost per agent. The people who remain handle the hardest work, and each of them is worth more for it. Organizations that plan for this build better teams. Organizations that expect both fewer agents AND lower wages end up with undertrained people handling the hardest interactions their customers will ever have.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FOUR NEW ROLES ═══ */}
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Career Transformation</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: NAVY, lineHeight: 1.2, margin: "0 0 12px" }}>Four roles that didn't exist two years ago.</h2>
            <p style={{ fontSize: 15, color: MUTED, maxWidth: 600, marginBottom: 36 }}>AI doesn't just eliminate roles: it creates new ones. The people best positioned to fill them are the ones who understand the work at an operational level. That's you.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="role-grid">
            {[
              { title: "Complex Issue Resolver", path: "Agent → Specialist", desc: "Handles the interactions AI escalates: emotional, multi-system, exception-heavy. Requires deep product knowledge, empathy, and authority to make decisions that fall outside policy automation.", pay: "Higher compensation, smaller caseloads, measured on resolution quality", grow: "Become the person who handles what AI can't. Build a portfolio of complex resolutions. Document your wins.", color: GREEN },
              { title: "AI Trainer & Knowledge Curator", path: "Agent → AI Operations", desc: "Maintains the knowledge base, reviews AI decisions, tunes conversation flows, identifies gaps in automation. Understanding what the AI gets wrong requires domain expertise that AI itself cannot self-diagnose.", pay: "New role category: lateral move into AI operations with growth trajectory", grow: "Your 10 years of handling insurance claims IS the knowledge base. Learn to capture it, document it, and position yourself as the person who makes AI actually work.", color: ELECTRIC },
              { title: "Experience Designer", path: "Team Lead → Design", desc: "Designs escalation paths, conversation flows, and the seams between AI and human interaction. Designing for the edge case requires understanding hundreds of failure modes from production experience.", pay: "Cross-functional role combining ops knowledge, design thinking, and technical fluency", grow: "Start mapping the failure modes you see every day. That institutional knowledge is your design portfolio.", color: AMBER },
              { title: "Quality & Governance Lead", path: "QA Analyst → AI Governance", desc: "Monitors AI decisions for bias, accuracy, compliance, and customer harm. Owns the trust layer. Regulatory judgment, ethical assessment, and accountability require human ownership.", pay: "Compliance background + AI literacy = high-demand combination", grow: "As AI handles more decisions, someone must ensure those decisions are fair, accurate, and legal. That someone has regulatory expertise AI doesn't.", color: PILLARS.research.onDark },
            ].map((r, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", height: "100%" }}>
                  <div style={{ background: r.color, padding: "3px 0" }} />
                  <div style={{ padding: "28px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{r.title}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.color, background: `${r.color}10`, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5 }}>{r.path}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.65, margin: "0 0 16px" }}>{r.desc}</p>
                    <div style={{ background: WARM, borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Compensation</span>
                      <p style={{ fontSize: 12, color: SLATE, margin: "4px 0 0", lineHeight: 1.5 }}>{r.pay}</p>
                    </div>
                    <div style={{ background: `${ELECTRIC}06`, borderRadius: 8, padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase" }}>How to start</span>
                      <p style={{ fontSize: 12, color: SLATE, margin: "4px 0 0", lineHeight: 1.5 }}>{r.grow}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE GROWTH MINDSET FRAMEWORK ═══ */}
      <section style={{ background: HOUSE.navy, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>The Growth Playbook</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: HOUSE.mist, lineHeight: 1.2, margin: "0 0 12px" }}>Seven moves that separate those who thrive from those who get displaced.</h2>
            <p style={{ fontSize: 15, color: HOUSE.body, maxWidth: 600, marginBottom: 36 }}>Humans who upskill, re-educate, and approach this era with a growth mindset will always win. Here's where to focus: starting today.</p>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "01", title: "Learn to use AI: not just survive it", desc: "The most valuable CX professional in 2027 isn't the one who resists AI or the one replaced by it: it's the one who makes AI better. Start with the tools you have: use ChatGPT or Claude to draft customer responses, summarize complex cases, or practice difficult conversations. The skill isn't 'prompting': it's knowing what good output looks like because you've done the work yourself for years.", action: "This week: Use an AI tool to draft 5 customer responses. Edit them. Notice what the AI misses. That gap is your value." },
              { n: "02", title: "Build a portfolio of complex resolutions", desc: "Designers have portfolios. Developers have GitHub. CX professionals have... nothing. Change that. Start documenting your most complex resolutions: the multi-department escalation you navigated, the regulatory edge case you resolved, the at-risk customer you retained. Strip PII, capture the decision-making process, and articulate the outcome.", action: "This month: Document 3 complex resolutions. Include the situation, the constraints, your decisions, and the outcome. This is your career capital." },
              { n: "03", title: "Reframe your professional identity", desc: "'Contact center agent' carries stigma and implies replaceability. 'Customer resolution specialist,' 'CX intelligence analyst,' 'escalation architect': these describe the work you actually do. The rebrand isn't cosmetics. It changes how you see yourself, how you interview, how you negotiate, and how hiring managers perceive your value.", action: "Today: Update your LinkedIn title. Change 'Contact Center Agent' to something that describes the complexity you handle. The job title you give yourself signals what you believe you're worth." },
              { n: "04", title: "Get certified in something that compounds", desc: "Not every certification matters. The ones that compound are the ones that position you at the intersection of domain expertise and AI capability. A CX professional with an AI certification is rare. An AI engineer who understands contact center operations is even rarer. You can become both.", action: "This quarter: Start one certification from the list below. Choose based on where you want to go, not where you are." },
              { n: "05", title: "Teach AI what you know", desc: "This is the most powerful reframe available: you're not being replaced by AI, you're training it. Your decade of handling insurance claims IS the knowledge base that makes the IVA work. Your understanding of when a customer is about to churn IS the signal the model needs. That expertise has value: learn to capture it, structure it, and position yourself as the person who makes AI actually function in production.", action: "This month: Write down the 10 things you know about your domain that no AI could figure out on its own. That's your intellectual property." },
              { n: "06", title: "Explore the side path", desc: "A 15-year contact center veteran with deep vertical expertise, healthcare billing, insurance claims, financial services compliance, is a consultant who doesn't know they're a consultant yet. Companies paying for CX consulting are buying expertise you already have. The side hustle isn't gig work: it's monetizing knowledge that companies desperately need during their own AI transformations.", action: "This month: Join 2 CX communities (CCW, ICMI, CX Network). Answer questions. Offer perspective. Build visibility. Your first consulting client will come from being known." },
              { n: "07", title: "Protect your mental game", desc: "Everyone talks about upskilling. Nobody talks about the emotional reality of being told your job is being automated. The anxiety is real. The uncertainty is real. The grief for how things used to be is real. Acknowledging that, and building resilience deliberately, is not weakness. It's the foundation that makes everything else possible. The people who thrive through transformation are the ones who process the emotion and then channel it into action.", action: "Ongoing: Find one person, a mentor, a coach, a peer, who you can be honest with about how this feels. Isolation is the real threat, not AI." },
            ].map((m, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 10, padding: "24px 28px" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: FONT, fontSize: 24, color: GREEN, flexShrink: 0, marginTop: -2 }}>{m.n}</span>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: HOUSE.mist, margin: "0 0 6px" }}>{m.title}</h3>
                      <p style={{ fontSize: 13.5, color: HOUSE.body, lineHeight: 1.65, margin: "0 0 12px" }}>{m.desc}</p>
                      <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 6, padding: "10px 14px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase" }}>Action step</span>
                        <p style={{ fontSize: 12, color: HOUSE.body, margin: "4px 0 0", lineHeight: 1.5 }}>{m.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CERTIFICATIONS & LEARNING ═══ */}
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Where to Level Up</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: NAVY, lineHeight: 1.2, margin: "0 0 12px" }}>Certifications and learning paths that compound.</h2>
            <p style={{ fontSize: 15, color: MUTED, maxWidth: 600, marginBottom: 36 }}>Programmes that pair CX expertise with AI, data and automation skills. Prices and times are as each provider states them on the linked page, checked on 28 September 2026. Confirm before you enrol, since providers change them.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="cert-grid">
            {[
              { cat: "AI & Machine Learning", color: ELECTRIC, certs: [
                { name: "Google AI Essentials", link: "https://grow.google/ai-essentials/", time: "Time: under 10 hours (Google)", cost: "USD 49 a month after a 7-day free trial (US and Canada)", why: "Practical AI use for everyday work. No technical background required." },
                { name: "AWS Certified AI Practitioner", link: "https://aws.amazon.com/certification/certified-ai-practitioner/", time: "Exam: 90 minutes", cost: "Exam fee: USD 100", why: "Cloud AI fundamentals. Relevant if your organisation runs on AWS and Amazon Connect." },
                { name: "Microsoft Azure AI Fundamentals (AI-901)", link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/", time: "Study time: not stated by Microsoft", cost: "Exam fee: USD 99 in the US; varies by country", why: "Azure AI basics. Relevant in Microsoft environments." },
                { name: "IBM AI Foundations for Business", link: "https://www.ibm.com/training/badge/ibm-ai-foundations-for-business-specialization", time: "Three courses on Coursera; time not stated by IBM", cost: "Price not stated by IBM (taken through Coursera)", why: "Business-oriented AI understanding. A starting point before a technical course." },
              ]},
              { cat: "CX & Contact Center", color: GREEN, certs: [
                { name: "COPC Best Practices for CX Operations", link: "https://www.copc.com/class-listing/copc-best-practices-for-cx-operations/", time: "40 hours", cost: "From $3,950 (US live virtual class); varies by session and language", why: "Operating discipline for CX performance, taught from the COPC standard." },
                { name: "HDI Support Center Analyst", link: "https://www.thinkhdi.com/education/courses/hdi-support-center-analyst-new-version", time: "About 10 to 12 hours online; two days in a virtual class", cost: "$849 online, $1,699 virtual class; exam included", why: "Service desk and support operations. Strong for IT and CX roles." },
                { name: "Qualtrics Platform Essentials", link: "https://www.qualtrics.com/training/certification/", time: "Time: not stated by Qualtrics", cost: "Exam and final project: $100", why: "Experience management platform skills." },
              ]},
              { cat: "Data, Analytics & Automation", color: AMBER, certs: [
                { name: "Google Data Analytics Certificate", link: "https://grow.google/certificates/data-analytics/", time: "About 240 hours in total (Google)", cost: "USD 49 a month after a 7-day free trial (US and Canada)", why: "Data literacy for non-engineers. Directly applicable to CX analytics." },
                { name: "Salesforce Certified Tableau Desktop Foundations", link: "https://trailheadacademy.salesforce.com/certificate/exam-tableau-desktop-found---Analytics-101", time: "Exam: 70 minutes", cost: "Exam fee: USD 75", why: "Visualization skills. Turn CX data into stories leaders understand." },
                { name: "UiPath Automation Developer Associate", link: "https://www.uipath.com/learning/certification", time: "Free training: 45 hours 20 minutes (UiPath Academy)", cost: "Exam fee: USD 150 per attempt", why: "RPA and automation. Build the workflows that connect AI to action." },
                { name: "Salesforce Certified Platform Administrator", link: "https://trailheadacademy.salesforce.com/certificate/exam-platform-admin---Plat-Admn-201", time: "Exam: 105 minutes", cost: "Exam fee: USD 200", why: "CRM administration, which many contact centers depend on." },
              ]},
            ].map((section, si) => (
              <FadeIn key={si} delay={si * 0.08}>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", height: "100%" }}>
                  <div style={{ background: HOUSE.navy, borderLeft: `4px solid ${section.color}`, padding: "14px 20px" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, margin: 0 }}>{section.cat}</h3>
                  </div>
                  <div style={{ padding: "12px 0" }}>
                    {section.certs.map((c, ci) => (
                      <a key={ci} href={c.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", padding: "12px 20px", borderBottom: ci < section.certs.length - 1 ? `1px solid ${BORDER}40` : "none", transition: "background 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.background = `${section.color}06`}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{c.name}</div>
                        <p style={{ fontSize: 12, color: HOUSE.body, margin: "0 0 2px" }}>{c.cost}</p>
                        <p style={{ fontSize: 12, color: HOUSE.body, margin: "0 0 2px" }}>{c.time}</p>
                        <p style={{ fontSize: 12, color: section.color, margin: 0, fontWeight: 500 }}>{c.why}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAREER PATHS: side hustles, next roles ═══ */}
      <section style={{ background: WARM, padding: "80px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: NAVY, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 10 }}>What's Next</span>
            <h2 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 400, color: NAVY, lineHeight: 1.2, margin: "0 0 12px" }}>Five paths forward. Pick the one that fits your ambition.</h2>
            <p style={{ fontSize: 15, color: MUTED, maxWidth: 600, marginBottom: 36 }}>Your CX experience is an asset, not a liability. Here's how to deploy it: whether you want to go deeper, go wider, go independent, or go somewhere entirely new.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="path-grid">
            {[
              { path: "Go Deeper", title: "Specialist Resolver", desc: "Stay in the contact center. Become the expert who handles what AI can't. Build the highest-value version of the role you already know.", steps: ["Request assignment to escalated/complex queues", "Build expertise in one vertical domain (billing, claims, compliance)", "Document your resolution portfolio", "Negotiate specialist compensation based on complexity metrics"], color: GREEN },
              { path: "Go Wider", title: "CX Operations Leader", desc: "Move from individual contributor to operational leadership. Manage the AI-human hybrid model. Design the workforce of the future.", steps: ["Get certified in one operational framework (COPC, ICMI, Six Sigma)", "Volunteer to lead a pilot: AI implementation, new channel launch, or process redesign", "Learn to read P&L impact, not just CSAT scores", "Build cross-functional relationships with IT, product, and analytics"], color: ELECTRIC },
              { path: "Go Technical", title: "AI Operations / CX Engineer", desc: "Bridge CX expertise and technical capability. Become the person who makes AI work in production, because you understand what 'work' means operationally.", steps: ["Complete one AI/ML certification (Google AI Essentials is the fastest start)", "Learn basic data analysis (Google Data Analytics or Tableau)", "Start documenting knowledge base gaps and bot failure patterns", "Position yourself as the domain expert in AI implementation projects"], color: AMBER },
              { path: "Go Independent", title: "CX Consultant / Advisor", desc: "Years of operational experience are what consultants sell. Companies implementing AI need people who understand how contact centers actually work, not just how they should work in theory.", steps: ["Pick a niche: vertical expertise (healthcare CX) or functional depth (WFM optimization)", "Build visibility: write on LinkedIn, join CX communities, share operational insights", "Start with fractional work: 10-20 hours/month for 2-3 clients", "Price based on value delivered, not hours worked: your expertise prevents six-figure mistakes"], color: PILLARS.research.onDark },
              { path: "Go Build", title: "Entrepreneur / Creator", desc: "Use AI as a force multiplier. Build a training business. Create content. Launch a product. The barrier to starting has never been lower, and your domain expertise is the unfair advantage that AI tools alone can't replicate.", steps: ["Identify a problem you've solved hundreds of times that others struggle with", "Use AI to create the first version: course outline, content drafts, landing page", "Launch small: one workshop, one guide, one consulting engagement", "Let the market tell you what to build next: don't over-plan, over-execute"], color: RED },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", height: "100%" }}>
                  <div style={{ background: `${p.color}08`, borderBottom: `1px solid ${BORDER}`, padding: "16px 22px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: 1.5, textTransform: "uppercase" }}>{p.path}</span>
                    <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: NAVY, margin: "4px 0 0" }}>{p.title}</h3>
                  </div>
                  <div style={{ padding: "18px 22px" }}>
                    <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 16px" }}>{p.desc}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>First moves</span>
                    {p.steps.map((s, si) => (
                      <div key={si} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ color: p.color, fontSize: 11, marginTop: 2, flexShrink: 0 }}>{si + 1}.</span>
                        <span style={{ fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE POSITION ═══ */}
      <section style={{ background: HOUSE.navy, padding: "80px 28px" }}>
        <div style={NARROW}>
          <FadeIn>
            <div style={{ textAlign: "center" }}>
              <span style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", display: "block", marginBottom: 16 }}>The Center of CX Position</span>
              <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.2, margin: "0 0 24px" }}>Technology intelligence without workforce intelligence is half a strategy.</h2>
              <p style={{ fontSize: 16, color: HOUSE.body, lineHeight: 1.8, marginBottom: 16 }}>
                Every IVA deployment is simultaneously a workforce transformation. Every CCaaS migration changes how humans work. Every automation initiative reshapes what skills matter.
              </p>
              <p style={{ fontSize: 16, color: HOUSE.body, lineHeight: 1.8, marginBottom: 16 }}>
                The vendors who understand this, and the buyers who plan for it, will build operations that are both more efficient AND more human. The ones who treat automation as a headcount reduction exercise will automate the easy work, lose their best people, and be left with undertrained agents handling the hardest interactions their customers will ever have.
              </p>
              <p style={{ fontSize: 16, color: GREEN, lineHeight: 1.8, fontWeight: 500 }}>
                That is not a CX strategy. That is a CX liability.
              </p>
              <div style={{ width: 60, height: 2, background: GREEN, margin: "32px auto", borderRadius: 1 }} />
              <p style={{ fontSize: 14, color: HOUSE.body, lineHeight: 1.6 }}>
                We built The Center of CX to help technology buyers make better decisions. We're building The Human Premium to make sure those decisions include the humans who make the technology work.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: HOUSE.navy, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
              <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>Building a CX team for the AI era?</h2>
              <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>
                We help CX leaders design workforce transformation strategies alongside technology evaluations. The technology decision and the people decision are the same decision.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "none" }}>Request a Workforce Strategy Session</a>
                <a href="/vendors" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Explore Vendor Intelligence →</a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      
    </div>
  );
}
