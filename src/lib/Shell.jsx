// src/lib/Shell.jsx
//
// The site shell (redesign Phase 4): one header and one footer for every page, replacing
// the six hand-built link sets pages carried before. Five pillars; Research and Market
// Watch marked soon; a working menu on a phone. Built on tokens only (tokens.test.mjs
// refuses a colour literal here) and checked by shell.test.mjs.
//
// Placement: `fixed` keeps the header over the page, for pages whose first section already
// clears a fixed bar; the default sits in the flow and sticks to the top as the page scrolls.

import React, { useState } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH, FONT_SANS, alpha, LINE } from "./tokens.js";
import { Icon } from "./Icon.jsx";

export const HEADER_HEIGHT = 64;

/* The five pillars in order. Market Watch has no page yet, so it is a label, never a link
   that goes nowhere. */
export const NAV = [
  { id: "diagnostics", href: "/how-to-choose" },
  { id: "vendors", href: "/vendors" },
  { id: "industries", href: "/industries" },
  { id: "research", href: "/research" },
  { id: "marketWatch", href: null },
].map((n) => ({ ...n, name: PILLARS[n.id].name, soon: PILLARS[n.id].soon }));

export const FOOTER = [
  { head: "Diagnostics", links: [["All tools", "/how-to-choose"], ["Method changelog", "/changelog"], ["Cost per Contact", "/tools/cost-per-contact"], ["Platform Decision", "/tools/platform-decision"]] },
  { head: "Vendor Intelligence", links: [["All categories", "/vendors"], ["Contact center platforms", "/vendors/ccaas"], ["Conversational AI", "/vendors/iva"]] },
  { head: "Industry Insights", links: [["All industries", "/industries"], ["Healthcare", "/industries/healthcare"], ["Financial Services", "/industries/financial-services"]] },
  { head: "The Center of CX", links: [["About", "/about"], ["Advisory", "/advisory"], ["The Human Premium", "/human-premium"], ["Subscribe", "/subscribe"], ["Contact", "/contact"]] },
];

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);

export function Mark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
      <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={HOUSE.mist} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={HOUSE.mist} strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
      <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={HOUSE.mist} strokeWidth="6" strokeLinecap="round" />
      <line x1="-13" y1="-13" x2="13" y2="13" stroke={HOUSE.sky} strokeWidth="7" strokeLinecap="round" />
      <line x1="13" y1="-13" x2="-13" y2="13" stroke={HOUSE.sky} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

const SoonTag = ({ id }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "1px 5px", borderRadius: 4, border: `1px solid ${PILLARS[id].onDark}`, color: PILLARS[id].onDark }}>SOON</span>
);

const CSS = `body{margin:0}.cx-nav{display:flex}.cx-menu-btn{display:none}
@media (max-width:900px){.cx-nav{display:none}.cx-menu-btn{display:flex}}
.cx-nav a:hover,.cx-foot a:hover{color:${HOUSE.paper}}`;

/** The header. `active` is a pillar id; `fixed` places it over the page. */
export function SiteHeader({ active = null, fixed = false }) {
  const [open, setOpen] = useState(false);
  const place = fixed ? { position: "fixed", top: 0, left: 0, right: 0 } : { position: "sticky", top: 0 };
  const item = (n, mobile) => {
    const on = n.id === active;
    const style = { display: "flex", alignItems: "center", gap: 6, minHeight: TOUCH, fontSize: mobile ? 17 : 14, fontWeight: on ? 600 : 500,
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
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: HOUSE.mist, minHeight: TOUCH }}>
          <Mark size={30} /><span style={{ fontSize: 16, fontWeight: 600, whiteSpace: "nowrap" }}>The Center of CX</span>
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
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: HOUSE.mist, fontWeight: 600, fontSize: 16 }}><Mark size={26} />The Center of CX</span>
          <span style={{ fontSize: 14, lineHeight: 1.55 }}>Diagnose before you buy. Independent intelligence for contact center and CX technology. No vendor pays to appear.</span>
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
  if (/^\/(tools|methodology)\//.test(pathname) || pathname === "/how-to-choose" || pathname === "/changelog") return "diagnostics";
  if (/^\/vendors(\/|$)/.test(pathname)) return "vendors";
  if (/^\/industries(\/|$)/.test(pathname)) return "industries";
  if (/^\/research(\/|$)/.test(pathname)) return "research";
  return null;
}

/* Pages built before the shell whose first section clears a fixed bar (37 files carried
   their own fixed navigation). They keep the header over the page until Phases 8 and 9
   rebuild them; every other page has the header in the flow. */
const FIXED_EXACT = new Set(["/", "/about", "/advisory", "/contact", "/cx-ecosystem", "/how-to-choose", "/human-premium",
  "/industries", "/platforms-and-tech", "/privacy", "/terms", "/research", "/subscribe", "/tools/tco-calculator", "/vendors"]);
export function headerFixed(pathname = "") {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return FIXED_EXACT.has(p) || /^\/vendors\//.test(p) || /^\/research\/[^/]+$/.test(p) || /^\/industries\/[^/]+$/.test(p);
}

/** A slim row under the header: where the page sits, and at most one action. Replaces the
 *  back links pages used to carry in their own navigation bars. */
export function Crumbs({ items = [], action = null }) {
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
        {action && <a href={action[1]} style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 44, fontSize: 14, fontWeight: 600, color: HOUSE.sky2, textDecoration: "none" }}>{action[0]}<Icon name="next" size={16} /></a>}
      </div>
    </div>
  );
}
