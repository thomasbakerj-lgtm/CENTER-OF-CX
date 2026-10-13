// VendorFamily.jsx
//
// One page per vendor (open item 13, TB 13 Oct 2026). A vendor profiled in several categories used to hold one page per
// category; those pages are now sections of the family page (seo.js VENDOR_FAMILIES), each at its old slug as an anchor
// (#genesys-wem), and the old addresses redirect here. Each section shows the words that category's profile showed:
// Phase 1 context, labelled as such, with no score, tier, rank or quadrant (integrity freeze). Presentation only: no
// list, order, research finding or Vendor Match reads this. Tokens only.
import { useEffect } from "react";
import { HOUSE, PILLARS, alpha, LINE } from "./tokens.js";
import { FONT } from "./type.js";
import { K } from "./frameKit.jsx";
import { CATEGORIES } from "./verticals.js";
import { familyMembers, vendorDisplayName, VENDOR_FAMILIES } from "./seo.js";
import { phase1Label } from "./researchStatus.js";
import { VendorIntroLink } from "./VendorIntro.jsx";
import { getVendor } from "../../VendorData.js";
import { getIVAVendor } from "../../IVAData.js";
import { getAgentAssistVendor } from "../../AgentAssistData.js";
import { getWEMVendor } from "../../WEMData.js";
import { getAnalyticsVendor } from "../../AnalyticsData.js";
import { getACDVendor } from "../../ACDRoutingData.js";
import { getDEVendor } from "../../DigitalEngagementData.js";
import { getPaymentVendor } from "../../PaymentData.js";

const ACCENT = PILLARS.vendors.onDark;
const P1 = "Phase 1 assessment";

/* The words each category's profile carried, as [label, value]; lists become one line each. No numbers. */
const list = (a) => (Array.isArray(a) ? a.filter(Boolean) : []);
const FIELDS = {
  ccaas: (v) => [["Summary", v.summary], ...list(v.strengths).map((x) => [`Strength (${P1})`, x]), ...list(v.weaknesses).map((x) => [`Weakness (${P1})`, x]), ["Fits when", v.bestFit], ["Less suited when", v.notFit]],
  iva: (v) => [["Summary", v.summary], ["Differentiator", v.differentiator], ["Primary use case", v.bestUseCase], ["Modality", v.modality], ["AI origin", v.origin], ["Industries named", v.verticals]],
  "agent-assist": (v) => [["Type", v.type], [`Strength (${P1})`, v.strength1], [`Strength (${P1})`, v.strength2], [`Strength (${P1})`, v.strength3], [`Weakness (${P1})`, v.weakness1], [`Weakness (${P1})`, v.weakness2], ["Best for", v.bestFor], ["Watch out for", v.watchout]],
  "wem-qm": (v) => [["Market layer", v.layerName], ["What the layer covers", v.layerDesc], ["Segment", v.segment], ["Architecture", v.native]],
  analytics: (v) => [["Summary", v.summary], ["Kind", v.catLabel], ["Segment", v.segment]],
  "acd-routing": (v) => [["Profile", v.profile], ["Segment", v.segment]],
  "digital-engagement": (v) => [["Archetype", v.archetype], [`Strength (${P1})`, v.strength], [`Weakness (${P1})`, v.weakness]],
  payments: (v) => [["Role", v.role], ["Differentiator", v.diff], ["Best fit", v.bestFit], ["Caution", v.caution]],
};
const GET = {
  ccaas: getVendor, iva: getIVAVendor, "agent-assist": getAgentAssistVendor, "wem-qm": getWEMVendor, analytics: getAnalyticsVendor,
  "acd-routing": getACDVendor, "digital-engagement": getDEVendor, payments: getPaymentVendor,
};
const CAT_OF = (slug) => Object.keys(GET).find((c) => GET[c](slug));

/** The sections a family page shows for its other category profiles, as plain data (tested). */
export function familySections(slug) {
  return familyMembers(slug).map((m) => {
    const cat = CAT_OF(m);
    const v = cat ? GET[cat](m) : null;
    return v ? { slug: m, cat, name: v.name || v.vendor || vendorDisplayName(m), rows: FIELDS[cat](v).filter(([, x]) => typeof x === "string" && x.trim()) } : null;
  }).filter(Boolean);
}

export default function VendorFamily({ slug }) {
  const sections = familySections(slug);
  /* An old category address arrives as #<slug>: the profile above scrolls to the top on load and a researched profile
     loads its research after first paint, so the section is brought into view after both. */
  useEffect(() => {
    const id = decodeURIComponent((window.location.hash || "").slice(1));
    if (!sections.some((s) => s.slug === id)) return undefined;
    const go = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: "start" }); };
    const timers = [50, 600, 1500].map((t) => setTimeout(go, t));
    return () => timers.forEach(clearTimeout);
  }, [slug]);
  if (!sections.length) return null;
  const name = vendorDisplayName(slug);
  return (
    <div style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, padding: "40px 20px 64px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <section aria-labelledby="family" style={K.panel}>
          <span style={{ ...K.kicker, color: ACCENT }}>Also profiled in</span>
          <h2 id="family" style={{ ...K.h2, margin: "6px 0 8px" }}>{name} in other categories</h2>
          <p style={K.body}>This vendor also appears in other categories. Each section below shows that category's profile. {phase1Label().text}</p>
          <ul style={{ margin: "10px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map((s) => <li key={s.slug} style={K.body}><a href={`#${s.slug}`} style={K.link}>{s.name}: {CATEGORIES[s.cat].name}</a></li>)}
          </ul>
        </section>
        {sections.map((s) => (
          <section key={s.slug} id={s.slug} aria-labelledby={`h-${s.slug}`} style={{ ...K.panel, scrollMarginTop: 80 }}>
            <span style={{ ...K.kicker, color: ACCENT }}>{CATEGORIES[s.cat].name}</span>
            <h2 id={`h-${s.slug}`} style={{ ...K.h2, margin: "6px 0 10px" }}>{s.name}</h2>
            {s.rows.length
              ? <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {s.rows.map(([label, value], i) => <div key={i}><dt style={K.strong}>{label}</dt><dd style={{ ...K.body, margin: "2px 0 0", overflowWrap: "anywhere" }}>{value}</dd></div>)}
              </dl>
              : <p style={K.small}>No profile text in this category yet.</p>}
            <p style={{ ...K.small, marginTop: 12, borderTop: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, paddingTop: 10 }}>
              <a href={CATEGORIES[s.cat].page} style={K.link}>All {CATEGORIES[s.cat].name} vendors</a>{" · "}
              <VendorIntroLink slug={s.slug} name={s.name} from="vendor" surface="vendor" color={ACCENT} />
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

export { VENDOR_FAMILIES };
