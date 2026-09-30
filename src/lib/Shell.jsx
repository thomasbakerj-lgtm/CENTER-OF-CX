// src/lib/Shell.jsx
//
// The site shell (redesign Phase 4): one header and one footer for every page, replacing
// the six hand-built link sets pages carried before. Five pillars; Research and Market
// Watch marked soon; a working menu on a phone. Built on tokens only (tokens.test.mjs
// refuses a colour literal here) and checked by shell.test.mjs.
//
// Placement: `fixed` keeps the header over the page, for pages whose first section already
// clears a fixed bar; the default sits in the flow and sticks to the top as the page scrolls.

import React, { useState, useEffect } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH, FONT_SANS, alpha, LINE } from "./tokens.js";
import { Icon } from "./Icon.jsx";
import { editionFor, todayUtc } from "./editions.js";
import { EVERYDAY, geometryFor, markParts, boxWidth, BOX_VIEW } from "./mark.js";
import { trackShare } from "./track.js";

export const HEADER_HEIGHT = 64;

/* The five pillars in order. Research stays marked soon until the first study of our own is published; its landing
   gathers what exists today. A pillar without a page would be a label, never a link that goes nowhere. */
export const NAV = [
  { id: "diagnostics", href: "/how-to-choose" },
  { id: "vendors", href: "/vendors" },
  { id: "industries", href: "/industries" },
  { id: "research", href: "/research" },
  { id: "marketWatch", href: "/market-watch" },
].map((n) => ({ ...n, name: PILLARS[n.id].name, soon: PILLARS[n.id].soon }));

export const FOOTER = [
  { head: "Diagnostics", links: [["All tools", "/how-to-choose"], ["Cost per Contact", "/tools/cost-per-contact"], ["Platform Decision", "/tools/platform-decision"]] },
  { head: "Vendor Intelligence", links: [["All categories", "/vendors"], ["Contact center platforms", "/vendors/ccaas"], ["Conversational AI", "/vendors/iva"]] },
  { head: "Industry Insights", links: [["All industries", "/industries"], ["Healthcare", "/industries/healthcare"], ["Financial Services", "/industries/financial-services"]] },
  { head: "Research", links: [["Research", "/research"], ["Market Watch", "/market-watch"], ["Contributor perspectives", "/perspectives"], ["Write for us", "/contribute"]] },
  { head: "The Center of CX", links: [["About", "/about"], ["Advisory", "/advisory"], ["The Human Premium", "/human-premium"], ["Subscribe", "/subscribe"], ["Corrections", "/corrections"], ["Contact", "/contact"]] },
];

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);

/** The mark (src/lib/mark.js): the mist C, the voice in sky, the X. `size` is its height; it sits in the drawing's own box
 *  so it meets the name without the empty right third of a square. `edition` (src/lib/editions.js) colours the voice
 *  bars in turn with its three colours and the X with its own, on its dates; the C stays mist. */
export function Mark({ size = 30, edition = null }) {
  const p = markParts(geometryFor(size));
  const voices = edition ? edition.voices : [EVERYDAY.dark.voice];
  const x = edition ? edition.x : EVERYDAY.dark.x;
  return (
    <svg width={boxWidth(size)} height={size} viewBox={BOX_VIEW} aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round">
        <path d={p.c} stroke={EVERYDAY.dark.c} strokeWidth={p.cW} />
        <g strokeWidth={p.barW}>
          {p.bars.map((b, i) => <line key={i} x1={b.x1} y1="0" x2={b.x2} y2="0" transform={`rotate(${b.rot})`} stroke={voices[i % voices.length]} />)}
        </g>
        <path d={p.x} stroke={x} strokeWidth={p.xW} />
      </g>
    </svg>
  );
}

const SoonTag = ({ id }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "1px 5px", borderRadius: 4, border: `1px solid ${PILLARS[id].onDark}`, color: PILLARS[id].onDark, whiteSpace: "nowrap" }}>Coming soon</span>
);

const CSS = `body{margin:0}.cx-nav{display:flex}.cx-menu-btn{display:none}
@media (max-width:1100px){.cx-nav{display:none}.cx-menu-btn{display:flex}}
.cx-nav a:hover,.cx-foot a:hover{color:${HOUSE.paper}}`;

/** The header. `active` is a pillar id; `fixed` places it over the page. */
export function SiteHeader({ active = null, fixed = false }) {
  const [open, setOpen] = useState(false);
  /* A special edition switches in after the page loads, so the prerendered header and the first render always match. */
  const [edition, setEdition] = useState(null);
  useEffect(() => { try { setEdition(editionFor(todayUtc())); } catch { setEdition(null); } }, []);
  const place = fixed ? { position: "fixed", top: 0, left: 0, right: 0 } : { position: "sticky", top: 0 };
  const item = (n, mobile) => {
    const on = n.id === active;
    const style = { display: "flex", alignItems: "center", gap: 6, minHeight: TOUCH, whiteSpace: "nowrap", fontSize: mobile ? 17 : 14, fontWeight: on ? 600 : 500,
      color: on ? HOUSE.paper : HOUSE.body, textDecoration: "none", borderBottom: mobile ? `1px solid ${hair}` : `2px solid ${on ? PILLARS[n.id].fill : "transparent"}`,
      padding: mobile ? "0 4px" : "0 2px" };
    return n.href
      ? <a key={n.id} href={n.href} aria-current={on ? "page" : undefined} style={style}>{n.name}{n.soon && <SoonTag id={n.id} />}</a>
      : <span key={n.id} style={{ ...style, color: HOUSE.muted }}>{n.name}<SoonTag id={n.id} /></span>;
  };
  return (
    <header style={{ ...place, zIndex: 1000, background: HOUSE.ink, borderBottom: `1px solid ${hair}`, fontFamily: FONT_SANS }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: HEADER_HEIGHT, padding: "0 20px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 28 }}>
        <a href="/" title={edition ? `${edition.name}: ${edition.why}` : undefined} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: HOUSE.mist, minHeight: TOUCH }}>
          <Mark size={40} edition={edition} /><span style={{ fontSize: 16, fontWeight: 600, whiteSpace: "nowrap" }}>The Center of CX</span>
        </a>
        <nav aria-label="Primary" className="cx-nav" style={{ alignItems: "center", gap: 22 }}>{NAV.map((n) => item(n, false))}</nav>
        <div style={{ flexGrow: 1 }} />
        <a href="/subscribe" className="cx-nav" style={{ alignItems: "center", minHeight: 40, padding: "0 14px", borderRadius: RADIUS.field, border: `1px solid ${soft}`, color: HOUSE.mist, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Subscribe</a>
        <button type="button" className="cx-menu-btn" aria-expanded={open} aria-controls="cx-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}
          style={{ width: TOUCH, height: TOUCH, alignItems: "center", justifyContent: "center", background: "none", border: "none", color: HOUSE.mist, cursor: "pointer" }}>
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>
      {open && (
        <nav id="cx-menu" aria-label="Menu" style={{ background: HOUSE.ink, borderTop: `1px solid ${hair}`, padding: "8px 20px 20px", display: "flex", flexDirection: "column" }}>
          {NAV.map((n) => item(n, true))}
          <a href="/subscribe" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 16, borderRadius: RADIUS.field, background: HOUSE.action, color: HOUSE.paper, fontWeight: 600, textDecoration: "none" }}>Subscribe</a>
        </nav>
      )}
    </header>
  );
}

/** The footer, the same on every page. */
export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="cx-foot" style={{ background: HOUSE.ink, color: HOUSE.body, borderTop: `1px solid ${hair}`, fontFamily: FONT_SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 28px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: HOUSE.mist, fontWeight: 600, fontSize: 16 }}><Mark size={34} />The Center of CX</span>
          <span style={{ fontSize: 14, lineHeight: 1.55 }}>Diagnose before you buy. Free tools and research for contact center decisions. No vendor pays to appear.</span>
        </div>
        {FOOTER.map((col) => (
          <nav key={col.head} aria-label={col.head} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted, marginBottom: 6 }}>{col.head}</span>
            {col.links.map(([label, href]) => <a key={href} href={href} style={{ display: "flex", alignItems: "center", minHeight: 36, fontSize: 14, color: HOUSE.body, textDecoration: "none" }}>{label}</a>)}
          </nav>
        ))}
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 20px 28px", boxSizing: "border-box", borderTop: `1px solid ${hair}`, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", fontSize: 13, color: HOUSE.muted }}>
        <span>© {year} The Center of CX. contactcentercx.com</span>
        <span style={{ display: "flex", gap: 18 }}><a href="/privacy" style={{ color: HOUSE.muted, textDecoration: "none", minHeight: 36, display: "flex", alignItems: "center" }}>Privacy</a><a href="/terms" style={{ color: HOUSE.muted, textDecoration: "none", minHeight: 36, display: "flex", alignItems: "center" }}>Terms</a></span>
      </div>
    </footer>
  );
}


/** The pillar a path belongs to, for the header's active mark. */
export function pillarFor(pathname = "") {
  if (/^\/(tools|methodology)\//.test(pathname) || pathname === "/how-to-choose") return "diagnostics";
  if (/^\/vendors(\/|$)/.test(pathname)) return "vendors";
  if (/^\/industries(\/|$)/.test(pathname)) return "industries";
  if (/^\/(research|perspectives|contributors|contribute)(\/|$)/.test(pathname)) return "research";
  if (/^\/market-watch(\/|$)/.test(pathname)) return "marketWatch";
  return null;
}

/* Pages built before the shell whose first section clears a fixed bar (37 files carried
   their own fixed navigation; the homepage left the list when Phase 5 rebuilt it). They keep the header over the page until Phases 8 and 9
   rebuild them; every other page has the header in the flow. */
const FIXED_EXACT = new Set(["/advisory", "/contact", "/cx-ecosystem", "/how-to-choose", "/human-premium",
  "/industries", "/platforms-and-tech", "/privacy", "/terms", "/research", "/vendors"]);
export function headerFixed(pathname = "") {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return FIXED_EXACT.has(p) || /^\/vendors\//.test(p) || /^\/research\/[^/]+$/.test(p) || /^\/industries\/[^/]+$/.test(p);
}

/** A slim row under the header: where the page sits, and at most one action. Replaces the
 *  back links pages used to carry in their own navigation bars. */
/* Share this page. On a touch device with a share sheet, the sheet opens; anywhere else the page's address is copied. The
   address is the page's own (path and view hash), never the query, so nothing a tool or form placed there travels. The
   prerender and the first paint render the same button; nothing reads the browser until it is pressed. */
export function ShareButton() {
  const [note, setNote] = useState("");
  const onClick = async () => {
    const { origin, pathname, hash } = window.location;
    const url = origin + pathname + hash;
    try {
      if (navigator.share && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: document.title, url });
        trackShare.page(pathname, "native");
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    try {
      await navigator.clipboard.writeText(url);
      trackShare.page(pathname, "copy");
      setNote("Link copied");
    } catch { setNote("Copy the address from your browser bar"); }
    setTimeout(() => setNote(""), 3000);
  };
  return (
    <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: TOUCH, padding: "0 4px", background: "transparent", border: "none", cursor: "pointer", fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: HOUSE.sky2 }}>
      <Icon name="share" size={16} />
      <span>Share</span>
      <span role="status" style={{ fontWeight: 400, color: HOUSE.body }}>{note}</span>
    </button>
  );
}

export function Crumbs({ items = [], action = null, share = true }) {
  return (
    <div style={{ background: HOUSE.navy, borderBottom: `1px solid ${hair}`, fontFamily: FONT_SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", boxSizing: "border-box", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: HOUSE.muted, flexWrap: "wrap" }}>
          {items.map(([label, href], i) => (
            <span key={href || label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {href ? <a href={href} style={{ color: HOUSE.body, textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}>{label}</a> : <span aria-current="page" style={{ color: HOUSE.mist }}>{label}</span>}
            </span>
          ))}
        </nav>
        {(share || action) && (
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            {share && <ShareButton />}
            {action && <a href={action[1]} style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 44, fontSize: 14, fontWeight: 600, color: HOUSE.sky2, textDecoration: "none" }}>{action[0]}<Icon name="next" size={16} /></a>}
          </div>
        )}
      </div>
    </div>
  );
}
