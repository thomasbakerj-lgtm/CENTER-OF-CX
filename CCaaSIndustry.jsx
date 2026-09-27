// CCaaSIndustry.jsx
//
// A CCaaS by industry page rebuilt from the research (redesign Phase 7 part 4, research Stage 3). Truth surface: Vendor
// Intelligence; presentation only. Each theme shows every published record that meets its stated rule (ccaasIndustry.js),
// in the research's own words, with its evidence state and validation date, vendors A to Z. Nothing is scored, ranked
// or picked by hand. Where the research has nothing for the industry, the page says so. Requirements and regulations,
// with their sources, live on the industry page it links. Every vendor offers an introduction. Tokens only.
import { HOUSE, PILLARS, RADIUS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs, HEADER_HEIGHT } from "./src/lib/Shell.jsx";
import { VendorIntroLink } from "./src/lib/VendorIntro.jsx";
import { Tags, TagNotes } from "./src/lib/VendorTags.jsx";
import { getCoreVendors } from "./VendorData";
import { ccaasResearchStatus, CCAAS_RESEARCH, fmtDate } from "./src/lib/researchStatus";
import { KIND } from "./src/lib/research/ccaasIndustry.js";
import { evidence } from "./src/lib/research/profileView.js";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { VERTICALS } from "./src/lib/verticals";
import INDEX from "./src/data/research/ccaas/industry.json";

const ACCENT = PILLARS.vendors.onDark;
const SLUG_OF = Object.fromEntries(Object.entries(CCAAS_RESEARCH.complete).map(([slug, r]) => [r.vendorId, slug]));
const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: RADIUS.chip, border: `1px solid ${K.firm}`, color: HOUSE.mist };
const CSS = `.cx-ind p,.cx-ind li,.cx-ind a{overflow-wrap:anywhere}`;

/* The RFP Builder's own name for each industry, so its link opens with the industry chosen. */
export const RFP_VERTICAL = { "financial-services": "Financial Services", healthcare: "Healthcare", retail: "Retail + eCommerce", telecom: "Telecom", insurance: "Insurance",
  travel: "Travel + Hospitality", government: "Government", utilities: "Utilities", manufacturing: "Manufacturing", education: "Education" };

export function rfpForIndustry(slug) {
  const enc = RFP_VERTICAL[slug] ? encodeScenario("rfp-builder", { vertical: RFP_VERTICAL[slug] }, { vertical: "" }) : null;
  return enc ? `/tools/rfp-builder?s=${enc}` : "/tools/rfp-builder";
}

function Theme({ t }) {
  const vendors = [...new Set(t.rows.map((r) => r.vendorId))];
  return (
    <section aria-labelledby={`t-${t.id}`} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
      <h2 id={`t-${t.id}`} style={{ ...K.h2, margin: 0 }}>{t.title}</h2>
      <p style={K.body}>{t.why}</p>
      <p style={K.small}>Shows every published research record that {t.rule}, from the {vendors.length === 1 ? "one vendor" : `${vendors.length} vendors`} where one does.</p>
      {vendors.map((id) => {
        const rows = t.rows.filter((r) => r.vendorId === id);
        return (
          <div key={id} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 8 }}>
            <a href={`/vendors/${SLUG_OF[id]}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 16 }}>{rows[0].vendor}</a>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {rows.map((r) => (
                <li key={r.id}>
                  <p style={{ ...K.body, color: HOUSE.mist }}>{r.text}</p>
                  {r.detail && <p style={K.small}>{r.detail}</p>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                    <span style={chip}>{KIND[r.kind]}</span>
                    {evidence(r.state) && <span style={{ ...chip, fontWeight: 500 }}>{evidence(r.state)}</span>}
                    {r.validated && <span style={K.small}>Validated {fmtDate(r.validated)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export default function CCaaSIndustry({ verticalSlug }) {
  const vert = VERTICALS[verticalSlug];
  const entry = INDEX.industries.find((i) => i.industry === verticalSlug) || { themes: [] };
  const themes = entry.themes.filter((t) => t.rows.length > 0);
  const core = getCoreVendors();
  const researched = Object.values(CCAAS_RESEARCH.complete).map((r) => r.vendorId);
  const names = Object.fromEntries(INDEX.industries.flatMap((i) => i.themes.flatMap((t) => t.rows.map((r) => [r.vendorId, r.vendor]))));
  const researchedList = core.filter((v) => ccaasResearchStatus(v.slug) === "complete").map((v) => ({ ...v, id: CCAAS_RESEARCH.complete[v.slug].vendorId })).sort((a, b) => (names[a.id] || a.name).localeCompare(names[b.id] || b.name));
  const notYet = core.filter((v) => ccaasResearchStatus(v.slug) !== "complete").sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="cx-ind" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh", paddingTop: HEADER_HEIGHT }}>
      <style>{CSS}</style>
      <Crumbs items={[["Vendor Intelligence", "/vendors"], ["CCaaS", "/vendors/ccaas"], [vert.name]]} />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Vendor Intelligence · by industry</span>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.12, color: HOUSE.mist }}>Contact center platforms for {vert.name}</h1>
          <p style={{ ...K.body, maxWidth: 760 }}>What the current research on {researched.length} contact center platforms says that bears on {vert.name.toLowerCase()} buyers. The research is organised by vendor, so this page gathers it by published rules, shown with each theme, and shows every record that meets them in the research's own words. Nothing here ranks a vendor.</p>
          <p style={{ ...K.small, maxWidth: 760 }}>The requirements and regulations of {vert.name.toLowerCase()}, each with its source, are on the <a href={vert.industryPage} style={K.link}>{vert.name} industry page</a>. Phase 1 vertical fit scores are withdrawn.</p>
        </header>

        {themes.length
          ? themes.map((t) => <Theme key={t.id} t={t} />)
          : (
            <section aria-label="No industry finding yet" style={K.lead}>
              <h2 style={{ ...K.h2, margin: 0 }}>No {vert.name.toLowerCase()} finding in the research yet</h2>
              <p style={{ ...K.body, marginTop: 8 }}>None of the {researched.length} researched vendors has a published record specific to {vert.name.toLowerCase()}. That means the research has not tested it; it says nothing about how well any platform serves the industry. Each vendor's profile carries the full research, and the tools below test a platform against your own requirements.</p>
            </section>
          )}

        <section aria-labelledby="vendors" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="vendors" style={{ ...K.h2, margin: 0 }}>Researched vendors, A to Z</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {researchedList.map((v) => (
              <li key={v.slug} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 6 }}>
                <a href={`/vendors/${v.slug}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 16 }}>{names[v.id] || v.name}</a>
                <Tags vendorId={v.id} />
                <TagNotes vendorId={v.id} />
                <div><VendorIntroLink slug={v.slug} name={names[v.id] || v.name} from="category" surface="category" color={ACCENT} /></div>
              </li>
            ))}
          </ul>
          <h3 style={{ ...K.h2, fontSize: 16, margin: "8px 0 0" }}>Not yet researched</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {notYet.map((v) => (
              <li key={v.slug} style={{ ...K.box, display: "flex", flexDirection: "column", gap: 6 }}>
                <a href={`/vendors/${v.slug}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 16 }}>{v.name}</a>
                <p style={K.small}>Not yet researched under the current method.</p>
                <div><VendorIntroLink slug={v.slug} name={v.name} from="category" surface="category" color={ACCENT} /></div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tools" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="tools" style={{ ...K.h2, margin: 0 }}>Test it against your own situation</h2>
          <ul style={{ ...K.body, margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><a href={rfpForIndustry(verticalSlug)} style={K.link}>RFP Builder</a>, opened with {vert.name} chosen: your requirements and the vendors' answers.</li>
            <li><a href="/tools/platform-decision" style={K.link}>Platform Decision</a>: renew, add a specialist or test the market.</li>
            <li><a href="/tools/contract-risk" style={K.link}>Contract Risk</a>: the clauses to find before you sign.</li>
            <li><a href="/tools/tco-calculator" style={K.link}>TCO Calculator</a>: what the platform costs over the term.</li>
          </ul>
        </section>

        <section aria-label="Other industries" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(VERTICALS).filter(([k]) => k !== verticalSlug).map(([k, v]) => <a key={k} href={`/vendors/ccaas/${k}`} style={{ ...K.link, fontSize: 14, minHeight: 32, display: "inline-flex", alignItems: "center", marginRight: 8 }}>{v.name}</a>)}
        </section>
      </div>
    </div>
  );
}
