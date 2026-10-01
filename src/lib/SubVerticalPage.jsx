// SubVerticalPage.jsx
//
// One sub-page for every industry segment (site scan part 4; redesign Phase 8 part 1). Each industry file is a wrapper
// that passes its name, its hub page and its data getter. Page text renders through ClaimText, so [[claim]] tokens show
// their class, and every source is listed once at the foot. The stack map is the reader's own: nothing is sent unless
// the reader asks for a consultant review. Vendors named for a layer are examples in our words, never a research
// finding, a ranking or a recommendation; each offers an introduction. Tokens only; colour never marks a figure alone.
import { useState, useEffect } from "react";
import { Crumbs } from "./Shell.jsx";
import { useParams } from "react-router-dom";
import ClaimText, { ClaimSources } from "./ClaimText.jsx";
import { claimIds, claim, TESTS } from "./claims.js";
import { HOUSE, PILLARS, LAYERS, RADIUS, TOUCH } from "./tokens.js";
import { FONT } from "./type.js";
import { K } from "./frameKit.jsx";
import { Button } from "./ui.jsx";
import { VendorIntroLink } from "./VendorIntro.jsx";
import { isVendorSlug } from "./seo.js";
import { CATEGORIES } from "./verticals.js";

const ACCENT = PILLARS.industries.onDark;
const PAGE = { background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" };
const H1 = { margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist };
const WRAP = { maxWidth: 1000, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 };
const CSS = `.cx-sv p,.cx-sv li,.cx-sv a,.cx-sv span{overflow-wrap:anywhere}`;
const layerOf = (n) => LAYERS.find((l) => l.n === n) || null;
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "10px 12px", fontFamily: FONT, fontSize: 15, color: HOUSE.mist, background: HOUSE.navy, border: `1px solid ${K.firm}`, borderRadius: RADIUS.field };
const lbl = { ...K.small, fontWeight: 600, color: HOUSE.mist, display: "block", marginBottom: 6 };

/* Have, Need or Planned, as words with a mark; the chosen one is heavier and outlined. */
const STATUS_OPTS = [
  { label: "Have", icon: "\u2713" },
  { label: "Need", icon: "\u2717" },
  { label: "Planned", icon: "\u2192" },
];

/* A row whose role is "None" is guidance (for example "Minimal AI recommended"), not a vendor: it gets no introduction. */
/* A named vendor's profile slug, when its link points at a profile (not a category page). */
const profileSlug = (href) => {
  const m = typeof href === "string" && href.match(/^\/vendors\/([a-z0-9-]+)$/);
  return m && !CATEGORIES[m[1]] && isVendorSlug(m[1]) ? m[1] : null;
};

/* One sub-page for every industry (site scan part 4). */
export default function SubVerticalPage({ industry, href, getSubVertical, initial = {} }) {
  const { slug } = useParams();
  const sv = getSubVertical(slug);
  const [phase, setPhase] = useState(initial.phase || "framework");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState("");
  const [statuses, setStatuses] = useState(initial.statuses || {});
  const [expandedLayers, setExpandedLayers] = useState(initial.expanded || {});
  const toggleLayer = (li) => setExpandedLayers(prev => ({ ...prev, [li]: !prev[li] }));

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  if (!sv) return (
    <div style={{ ...PAGE, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}><h1 style={H1}>Segment not found</h1><a href={href} style={K.link}>Back to {industry}</a></div>
    </div>
  );

  const setStatus = (layerIdx, capIdx, status) => setStatuses(prev => ({ ...prev, [`${layerIdx}-${capIdx}`]: status }));
  const getStatus = (layerIdx, capIdx) => statuses[`${layerIdx}-${capIdx}`];

  const totalCaps = sv.layers.reduce((a, l) => a + l.capabilities.length, 0);
  const assessed = Object.keys(statuses).length;
  const haveCount = Object.values(statuses).filter(s => s === "Have").length;
  const needCount = Object.values(statuses).filter(s => s === "Need").length;
  const plannedCount = Object.values(statuses).filter(s => s === "Planned").length;
  const maturityPct = totalCaps > 0 ? Math.round((haveCount / totalCaps) * 100) : 0;


  /* The framework is open to every visitor (TB, S23). Nothing is sent anywhere unless the visitor asks for a
     consultant review below and presses Send. */
  const handleResults = () => setPhase("results");

  const profileText = () => [
    `${sv.parent}: ${sv.name} CX stack profile`,
    `${haveCount} of ${totalCaps} capabilities in place (${maturityPct}%). Planned: ${plannedCount}. Needed: ${needCount}.`,
    ...sv.layers.map((l, li) => `L${l.layer} ${l.name}: ${l.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length} of ${l.capabilities.length} in place`),
    ...sv.layers.flatMap((l, li) => l.capabilities.filter((_, ci) => getStatus(li, ci) === "Need").map((c) => `Need, L${l.layer}: ${c}`)),
  ].join("\n");

  const copyProfile = async () => {
    try { await navigator.clipboard.writeText(profileText()); setCopied(true); setTimeout(() => setCopied(false), 2400); } catch (e) { setCopied(false); }
  };

  const requestReview = async () => {
    if (!email.includes("@")) return; setSending(true); setSent("");
    try {
      const r = await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, name, company, tool: `Stack Framework: ${sv.name}`, _subject: `Stack Framework review request: ${sv.name}`, maturity: `${maturityPct}%`, have: haveCount, need: needCount, planned: plannedCount, profile: profileText() }) });
      setSent(r.ok ? "ok" : "error");
    } catch (e) { setSent("error"); }
    setSending(false);
  };

  const tile = { ...K.box, display: "flex", flexDirection: "column", gap: 4 };
  const statusBtn = (on) => ({ minHeight: TOUCH, minWidth: 92, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer",
    border: `${on ? 2 : 1}px solid ${on ? ACCENT : K.firm}`, background: "transparent", color: HOUSE.mist });

  return (
    <div className="cx-sv" style={PAGE}>
      <style>{CSS}</style>
      <Crumbs items={[["Industry Insights", "/industries"], [industry, href], [sv.name || "Segment"]]} />

      {phase === "framework" && (
        <div style={WRAP}>
          <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ ...K.kicker, color: ACCENT }}>{sv.parent}: {sv.name}</span>
            <h1 style={H1}>{sv.name} CX Stack Framework</h1>
            <p style={{ ...K.body, maxWidth: 760 }}><ClaimText text={sv.intro} /></p>
            <p style={{ ...K.small, maxWidth: 760 }}>Map your current capabilities across all 7 layers: {totalCaps} checkpoints. Mark what you have, what you need and what is planned. Your answers stay in this browser tab.</p>
          </header>

          <section aria-label="Figures for this segment" style={K.grid(200)}>
            {sv.kpis.map((k, i) => {
              const ids = claimIds([k.avg]); const c = ids.length === 1 ? claim(ids[0]) : null; const t = c && TESTS[c.test];
              return (
                <div key={i} style={tile}>
                  <span style={K.kicker}>{k.metric}</span>
                  {c && c.kind === "none"
                    ? <p style={{ ...K.body, color: HOUSE.mist }}>No public benchmark{t && <><br /><a href={t.href} aria-label={`Measure your ${k.metric} in ${t.label}`} style={K.link}>Measure yours</a></>}</p>
                    : <p style={{ ...K.stat, fontSize: 22 }}><ClaimText text={k.avg} /></p>}
                  {k.note && <p style={K.small}><ClaimText text={k.note} /></p>}
                </div>
              );
            })}
          </section>

          {sv.measures && (
            <section aria-label={sv.measures.title} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ ...K.h2, margin: 0 }}>{sv.measures.title}</h2>
              <div style={K.grid(180)}>
                {sv.measures.items.map((m, i) => (
                  <div key={i} style={tile}><p style={{ ...K.stat, fontSize: 22 }}><ClaimText text={m.value} /></p><p style={K.small}>{m.metric}</p></div>
                ))}
              </div>
              <p style={K.small}>{sv.measures.note}</p>
            </section>
          )}

          <section id="framework" aria-labelledby="stack-h" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 id="stack-h" style={{ ...K.h2, margin: 0 }}>{sv.name}: the 7-layer CX stack</h2>
                <p style={{ ...K.small, marginTop: 4 }}>For each capability, mark whether you have it, need it or have it planned.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span role="status" style={K.small}>{assessed} of {totalCaps} marked</span>
                {assessed >= totalCaps * 0.7 && <Button onClick={handleResults}>View your stack profile</Button>}
              </div>
            </div>

            {sv.layers.map((layer, li) => {
              const L = layerOf(layer.layer);
              const layerHave = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length;
              return (
                <section key={li} aria-labelledby={`layer-${li}`} style={{ ...K.panel, borderLeft: `4px solid ${L ? L.color : ACCENT}`, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                    <h3 id={`layer-${li}`} style={{ ...K.h2, margin: 0 }}>Layer {layer.layer}: {layer.name}</h3>
                    <span style={K.small}>{layerHave} of {layer.capabilities.length} in place</span>
                  </div>
                  {L && <p style={K.small}>{L.name}. Vendors in this layer include {layer.vendors}.</p>}
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
                    {layer.capabilities.map((cap, ci) => {
                      const status = getStatus(li, ci);
                      return (
                        <li key={ci} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "10px 0", borderTop: ci ? `1px solid ${K.hair}` : "none" }}>
                          <span style={{ ...K.body, flex: "1 1 260px", color: HOUSE.mist, fontWeight: status ? 600 : 400 }}>{cap}</span>
                          <div role="group" aria-label={`Status of: ${cap}`} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {STATUS_OPTS.map((opt) => (
                              <button key={opt.label} type="button" aria-pressed={status === opt.label} onClick={() => setStatus(li, ci, opt.label)} style={statusBtn(status === opt.label)}>
                                <span aria-hidden="true">{opt.icon}</span>&nbsp;{opt.label}
                              </button>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {layer.stack && layer.stack.length > 0 && (
                    <div style={{ borderTop: `1px solid ${K.hair}`, paddingTop: 10 }}>
                      <button type="button" aria-expanded={!!expandedLayers[li]} onClick={() => toggleLayer(li)}
                        style={{ ...K.link, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontSize: 14, minHeight: TOUCH }}>
                        {expandedLayers[li] ? "Hide" : "Show"} {layer.stack.length === 1 ? "the vendor" : `the ${layer.stack.length} vendors`} named for this layer
                      </button>
                      {expandedLayers[li] && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                          <p style={K.small}>Named as examples of providers in this layer, in our words. This is neither a research finding nor a recommendation; researched vendors carry their findings on their profiles.</p>
                          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                            {layer.stack.map((v, vi) => {
                              const slug = profileSlug(v.href);
                              return (
                                <li key={vi} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 4 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
                                    {v.href ? <a href={v.href} style={{ ...K.link, color: HOUSE.mist }}>{v.name}</a> : <span style={K.strong}>{v.name}</span>}
                                    <span style={K.small}>{v.role}</span>
                                  </div>
                                  <p style={K.small}><ClaimText text={v.why} /></p>
                                  {v.role !== "None" && <div><VendorIntroLink slug={slug} name={v.name} from="industry" surface="industry" color={ACCENT} /></div>}
                                </li>
                              );
                            })}
                          </ul>
                          {layer.pitfall && <p style={K.small}><strong style={K.strong}>Integration pitfall:</strong> <ClaimText text={layer.pitfall} /></p>}
                        </div>
                      )}
                    </div>
                  )}

                  {layer.risk && <p style={K.small}><strong style={K.strong}>Key risk:</strong> <ClaimText text={layer.risk} /></p>}
                </section>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {assessed < totalCaps * 0.5 && <span style={K.small}>Mark at least {Math.ceil(totalCaps * 0.5)} capabilities to see your profile ({assessed} of {totalCaps} so far).</span>}
              <Button onClick={handleResults} disabled={assessed < totalCaps * 0.5}>View your stack profile ({assessed} of {totalCaps})</Button>
            </div>
          </section>

          {claimIds(sv).length > 0 && (
            <section id="sources" aria-labelledby="sources-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 id="sources-h" style={{ ...K.h2, margin: 0 }}>Sources and assumptions</h2>
              <p style={K.small}>Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or a worked example.</p>
              <ClaimSources ids={claimIds(sv)} color={HOUSE.body} accent={ACCENT} />
            </section>
          )}
        </div>
      )}

      {phase === "results" && (
        <div style={WRAP}>
          <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ ...K.kicker, color: ACCENT }}>{sv.name}: your stack profile</span>
            <h1 style={H1}>{haveCount} of {totalCaps} capabilities in place</h1>
            <p style={K.body}>{maturityPct}% in place. {plannedCount} planned. {needCount} marked Need. {totalCaps - assessed} not marked.</p>
            <div><button type="button" onClick={() => setPhase("framework")} style={{ ...K.link, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontSize: 14, minHeight: TOUCH }}>Back to the framework</button></div>
          </header>

          <section aria-labelledby="layers-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 id="layers-h" style={{ ...K.h2, margin: 0 }}>Layer by layer</h2>
            {sv.layers.map((layer, li) => {
              const have = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length;
              const need = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Need").length;
              const pct = Math.round((have / layer.capabilities.length) * 100);
              const L = layerOf(layer.layer);
              return (
                <div key={li} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={K.strong}>Layer {layer.layer}: {layer.name}</span>
                    <span style={K.small}>{have} of {layer.capabilities.length} in place ({pct}%){need > 0 ? `, ${need} marked Need` : ""}</span>
                  </div>
                  <div aria-hidden="true" style={{ height: 8, background: K.hair, borderRadius: RADIUS.pill, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: L ? L.color : ACCENT }} />
                  </div>
                </div>
              );
            })}
          </section>

          {needCount > 0 && (
            <section aria-labelledby="need-h" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8 }}>
              <h2 id="need-h" style={{ ...K.h2, margin: 0 }}>What you marked Need ({needCount})</h2>
              <p style={K.small}>The capabilities you said your {sv.name} stack is missing, by layer. Which to close first is your call; the tools below help size them.</p>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {sv.layers.map((layer, li) => layer.capabilities.map((cap, ci) => getStatus(li, ci) === "Need" ? (
                  <li key={`${li}-${ci}`} style={K.body}><strong style={K.strong}>Layer {layer.layer}:</strong> {cap}</li>
                ) : null))}
              </ul>
            </section>
          )}

          <section aria-labelledby="next-h" style={{ ...K.lead, display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 id="next-h" style={{ ...K.h2, margin: 0 }}>Where to go from here</h2>
            <p style={K.body}>A consultant can map your gaps to vendor capabilities and an implementation sequence. Platform Decision tests whether your current platform can close them.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button href="/contact">Talk to a consultant</Button>
              <Button kind="secondary" href="/tools/platform-decision">Platform Decision</Button>
              <Button kind="secondary" href="/vendors/ccaas">Contact center platforms</Button>
            </div>
            <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 10 }}>
              <Button kind="secondary" onClick={copyProfile}>{copied ? "Profile copied" : "Copy your profile"}</Button>
              <p style={K.small}>Want a consultant to review it? This sends your profile and details to The Center of CX so a consultant can reply. Nothing is sent until you press Send.</p>
              <div><label htmlFor="sv-review-email" style={lbl}>Work email</label><input id="sv-review-email" value={email} onChange={e => setEmail(e.target.value)} style={field} /></div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px" }}><label htmlFor="sv-review-name" style={lbl}>Name</label><input id="sv-review-name" value={name} onChange={e => setName(e.target.value)} style={field} /></div>
                <div style={{ flex: "1 1 180px" }}><label htmlFor="sv-review-company" style={lbl}>Company</label><input id="sv-review-company" value={company} onChange={e => setCompany(e.target.value)} style={field} /></div>
              </div>
              <Button onClick={requestReview} disabled={sending || !email.includes("@") || sent === "ok"}>{sending ? "Sending" : sent === "ok" ? "Sent" : "Send for a consultant review"}</Button>
              {sent === "ok" && <p role="status" style={K.small}>Sent. A consultant will reply to {email}.</p>}
              {sent === "error" && <p role="alert" style={K.small}>That did not go through. Copy your profile and email it through the contact page instead.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
