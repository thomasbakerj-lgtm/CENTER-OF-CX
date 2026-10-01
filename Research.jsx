// Research.jsx
//
// The Research landing (redesign Phase 10). What the site has researched and published, and how to check it: vendor
// research by category with its status, the published methods, the sourced industry pages, Market Watch, contributor
// perspectives, the reports that exist, and the studies still to come. Every count is derived from the data it
// describes, so the page cannot drift from the site. It lists only pages that exist (the previous landing listed eight
// articles that were never written). Tokens only.
import { HOUSE, PILLARS, RADIUS, alpha, LINE } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { Button } from "./src/lib/ui.jsx";
import { IdeaBox } from "./src/lib/IdeaBox.jsx";
import { CATEGORIES, CCAAS_INDEXED_INDUSTRIES, VERTICALS } from "./src/lib/verticals.js";
import { CCAAS_RESEARCH, CCAAS_COMPLETE_COUNT } from "./src/lib/researchStatus.js";
import { vendorDisplayName, SEGMENT_COUNT } from "./src/lib/seo.js";
import { METHOD_COUNT, INDUSTRY_COUNT } from "./src/lib/home.js";
import { longDate } from "./src/lib/methodVersions.js";
import { publishedItems, LABELS } from "./src/lib/marketWatch.js";
import { publishedPieces } from "./src/lib/contributors.js";
import INDEX from "./src/data/research/ccaas/category.json";

const ACCENT = PILLARS.research.onDark;
const CSS = `.cx-res p,.cx-res li,.cx-res h2,.cx-res h3{overflow-wrap:anywhere}`;
const link = { color: ACCENT, fontWeight: 600 };
const hair = alpha(HOUSE.mist, LINE.hair);

/* Research runs one category at a time, in this order (CLAUDE.md section 13). */
export const RESEARCH_ORDER = ["ccaas", "iva", "agent-assist", "wem-qm", "analytics", "acd-routing", "digital-engagement", "payments"];

/* Reports that exist on the site, with what each one is. */
export const REPORTS = [
  { title: "Why a CCaaS migration may not cut costs", href: "/research/ccaas-migration-costs", what: "An article on where contact center migration costs go." },
  { title: "CCaaS Platform Buyer's Guide, Phase 1 edition", href: "/research/ccaas-buyer-guide", what: "The April 2026 edition, 19 pages, kept as a dated download. Its scores and tiers are withdrawn on the site while current research is published." },
];

function Section({ id, title, kicker, children }) {
  return (
    <section aria-labelledby={id} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
      {kicker && <span style={{ ...K.kicker, color: ACCENT }}>{kicker}</span>}
      <h2 id={id} style={{ ...K.h2, margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function Research() {
  const items = publishedItems().slice(0, 3);
  const pieces = publishedPieces();
  const ccaasTotal = CATEGORIES.ccaas.vendorCount;
  const calibrated = INDEX.classes.filter((c) => !c.draft).length;

  return (
    <div className="cx-res" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Research"]]} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Research</span>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1 }}>What we have researched, and how to check it</h1>
          <p style={{ ...K.body, maxWidth: 720 }}>Vendor research built from public evidence, the methods behind every tool, sourced industry pages, and news kept apart from all of it. Each piece shows its sources and its date. No vendor pays for, previews or approves any of it.</p>
        </header>

        <Section id="vendors" kicker="Vendor Intelligence" title="Vendor research, one category at a time">
          <p style={K.body}>
            Contact center platforms come first: {CCAAS_COMPLETE_COUNT} of {ccaasTotal} researched under the current method, across {INDEX.classes.length} competitive classes
            {calibrated ? ` (${calibrated} calibrated)` : ""}, validated between {longDate(INDEX.validatedFrom)} and {longDate(INDEX.validatedTo)}.
            {CCAAS_RESEARCH.next ? ` Next: ${vendorDisplayName(CCAAS_RESEARCH.next)}.` : ""} Each profile shows every finding with its evidence and date, and numeric ratings stay locked until each class has enough validated peers.
          </p>
          <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            {RESEARCH_ORDER.map((slug) => {
              const c = CATEGORIES[slug];
              return (
                <li key={slug} style={K.body}>
                  <a href={c.page} style={link}>{c.name}</a>: {slug === "ccaas" ? "current research published" : "Phase 1 context, listed A to Z, not yet researched under the current method"}.
                </li>
              );
            })}
          </ol>
          <p style={K.small}>Found an error in a profile? <a href="/corrections" style={{ color: ACCENT }}>How corrections work</a>.</p>
        </Section>

        <Section id="methods" kicker="Diagnostics" title="Published methods">
          <p style={K.body}>{METHOD_COUNT} tools publish their method: the formulas in words, every constant with its kind and source, a worked example and the cases each is checked against. Each tool and report carries its method version.</p>
          <p style={K.body}><a href="/tools" style={link}>See every tool and its method</a></p>
        </Section>

        <Section id="industries" kicker="Industry Insights" title="Industry research">
          <p style={K.body}>{INDUSTRY_COUNT} industries and {SEGMENT_COUNT} segments. Every figure is a published fact with its source, a labelled planning assumption, a worked example, or marked as having no public benchmark.</p>
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            <li style={K.body}><a href="/industries" style={link}>All industries</a></li>
            {CCAAS_INDEXED_INDUSTRIES.map((v) => (
              <li key={v} style={K.body}><a href={`/vendors/ccaas/${v}`} style={link}>What the platform research says for {VERTICALS[v].name}</a></li>
            ))}
          </ul>
        </Section>

        <Section id="market-watch" kicker="Market Watch" title="What is new in the market">
          {items.length ? (
            <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((it) => (
                <li key={it.id} style={{ listStyle: "none", paddingBottom: 10, borderBottom: `1px solid ${hair}` }}>
                  <span style={{ ...K.small, fontWeight: 700, letterSpacing: "0.06em" }}>{LABELS[it.label].word}</span>
                  <span style={K.small}> · {longDate(it.date)}</span>
                  <p style={{ ...K.body, margin: "4px 0 0" }}><a href={`/market-watch#${it.id}`} style={{ ...link, color: HOUSE.mist }}>{it.headline}</a></p>
                </li>
              ))}
            </ul>
          ) : <p style={K.body}>Items appear here as they are checked.</p>}
          <p style={K.body}><a href="/market-watch" style={link}>Read Market Watch</a>. Every item is labelled for its source, and none changes the research.</p>
        </Section>

        <Section id="perspectives" kicker="Contributors" title="Contributor perspectives">
          <p style={K.body}>
            {pieces.length ? `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} published. ` : "Proposals are open and the first pieces are published once reviewed. "}
            Practitioners, consultants, analysts and academics write under their own names, with any vendor tie disclosed. A perspective never changes a research finding.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button href="/contribute">Write for us</Button>
            <Button kind="secondary" href="/perspectives">Read perspectives</Button>
          </div>
        </Section>

        <Section id="reports" title="Reports and articles">
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {REPORTS.map((r) => (
              <li key={r.href} style={{ listStyle: "none" }}>
                <a href={r.href} style={link}>{r.title}</a>
                <p style={{ ...K.small, margin: "4px 0 0" }}>{r.what}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="studies" kicker="Coming" title="Studies of our own">
          <p style={K.body}>Studies we run ourselves, starting from what professionals choose to share through the diagnostics. Nothing is collected until the consent design is published, participation will be opt-in and anonymous, and every study will publish its data, its method and its limits.</p>
        </Section>

        <IdeaBox where="Research" title="What should we study first?" prompt="Tell us the question you most want answered with real data from contact centers like yours, or a study you would take part in. We read every one, and they shape which studies come first." />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", padding: 20, borderRadius: RADIUS.card, border: `1px solid ${hair}` }}>
          <p style={{ ...K.body, flex: "1 1 280px", margin: 0 }}>Get new research, methods and Market Watch as they publish. <a href="/cx-ecosystem" style={{ color: ACCENT }}>Other publications and communities we read</a>.</p>
          <Button href="/subscribe">Subscribe</Button>
        </div>
      </div>
    </div>
  );
}
