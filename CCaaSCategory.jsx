// CCaaSCategory.jsx
//
// The CCaaS category page by competitive class (redesign Phase 7 part 3, the design TB approved on 26 Sep 2026). Truth
// surface: Vendor Intelligence; presentation only. Researched vendors come from the research snapshot's category index
// (categoryView.js): the class they are compared in, their validation date and their first published best-when
// statement. Vendors are A to Z inside each class and classes follow their research IDs; nothing is ordered by merit.
// No score, rank, tier or count of states renders. Phase 1 scores and tiers stay withdrawn (integrity freeze, TB 23 Sep
// 2026). Vendors not yet researched carry no class and no claim. An introduction link never changes an order. Tokens only.
import { useState, useEffect } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs, HEADER_HEIGHT } from "./src/lib/Shell.jsx";
import { CATEGORIES } from "./src/lib/verticals.js";
import CategoryTerms from "./src/lib/CategoryTerms.jsx";
import { VendorIntroLink } from "./src/lib/VendorIntro.jsx";
import { getCoreVendors, getAdjacentVendors } from "./VendorData";
import { ccaasResearchStatus, CCAAS_RESEARCH, fmtDate } from "./src/lib/researchStatus";
import { trackVendor } from "./src/lib/track.js";
import INDEX from "./src/data/research/ccaas/category.json";
import { tagsFor, SIZES, UC_LABEL, PS_LABEL } from "./src/lib/research/ccaasTags.js";
import { Tags, TagNotes } from "./src/lib/VendorTags.jsx";
import { PLAIN } from "./src/lib/research/classWords.js";

const ACCENT = PILLARS.vendors.onDark;

/* Each class restated in plain words (presentation only, src/lib/research/classWords.js). The research's own name,
   definition, buyer and comparison boundary render beside it, word for word. */
export { PLAIN };

const SLUG_OF = Object.fromEntries(Object.entries(CCAAS_RESEARCH.complete).map(([slug, r]) => [r.vendorId, slug]));
const plain = (c) => PLAIN[c.id] || { name: c.name, job: c.job };
const btn = (on) => ({ minHeight: TOUCH, padding: "10px 14px", fontFamily: FONT, textAlign: "left", borderRadius: RADIUS.card, cursor: "pointer",
  border: `${on ? 2 : 1}px solid ${on ? ACCENT : K.firm}`, background: HOUSE.navy, color: HOUSE.mist, display: "flex", flexDirection: "column", gap: 4 });
const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: RADIUS.chip, border: `1px solid ${K.firm}`, color: HOUSE.mist };
const CSS = `.cx-cat p,.cx-cat li,.cx-cat a,.cx-cat dd{overflow-wrap:anywhere}`;

const METHOD = [
  ["Atomic claims", "Each finding is one testable claim with its own dated evidence and an evidence state: verified, strongly supported, inferred or unverified."],
  ["Compared with peers", "Vendors are compared inside a class of platforms built for the same job. The class frames the comparison and carries no quality grade."],
  ["Where they break", "Each break names the buyer condition that triggers it, whether implementation can mitigate it, what that adds in cost and who owns it after go-live."],
  ["Unknown stays unknown", "Missing public evidence raises the proof burden. It is never counted as a weakness."],
];

function Researched({ v, klass }) {
  const slug = SLUG_OF[v.id];
  return (
    <li style={{ ...K.box, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <a href={`/vendors/${slug}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 17 }}>{v.name}</a>
      <Tags vendorId={v.id} />
      <TagNotes vendorId={v.id} />
      {v.bestWhen
        ? <p style={K.body}><strong style={K.strong}>Where the research says it fits:</strong> {v.bestWhen.statement}</p>
        : <p style={K.small}>No best-when statement is published for this vendor yet. Its profile carries the full research.</p>}
      <p style={K.small}>Compared on: {(PLAIN[klass.id] || {}).compared || klass.boundary}</p>
      <p style={K.small}>Research validated {fmtDate(v.validated)}</p>
      <div><VendorIntroLink slug={v.slug} name={v.name} from="category" surface="category" color={ACCENT} /></div>
    </li>
  );
}

function Requested({ v }) {
  const [sent, setSent] = useState(false);
  const next = CCAAS_RESEARCH.next === v.slug;
  return (
    <li style={{ ...K.box, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <a href={`/vendors/${v.slug}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 17 }}>{v.name}</a>
        {next && <span style={{ ...chip, borderStyle: "dashed" }}>Researching next</span>}
      </div>
      <p style={K.small}>Not yet researched under the current method. No class and no finding until it is.{v.segment ? ` Earlier Phase 1 description: ${v.segment}.` : ""}</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {!next && (sent
          ? <span role="status" style={K.small}>Request noted. Thank you.</span>
          : <button type="button" onClick={() => { trackVendor.action(v.slug, "request", "category"); setSent(true); }}
              style={{ ...K.link, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontSize: 13, minHeight: 32 }}>Ask us to research {v.name}</button>)}
        <VendorIntroLink slug={v.slug} name={v.name} from="category" surface="category" color={ACCENT} />
      </div>
    </li>
  );
}

export default function CCaaSCategory({ initialClass = "all", initialSize = "all", initialUc = false, initialPs = false }) {
  const core = getCoreVendors();
  const adjacent = getAdjacentVendors();
  const notYet = core.filter((v) => ccaasResearchStatus(v.slug) !== "complete").sort((a, b) => a.name.localeCompare(b.name));
  const classes = INDEX.classes.map((c) => ({ ...c, vendors: c.vendors.map((v) => ({ ...v, slug: SLUG_OF[v.id] })).filter((v) => v.slug) }));
  const researched = classes.reduce((n, c) => n + c.vendors.length, 0);
  const calibrated = classes.filter((c) => !c.draft).length;
  const [pick, setPick] = useState(initialClass);
  /* A class can be linked (#cls-cc-004); read after first paint so the prerendered page and the hydrated page match. */
  useEffect(() => { try { const h = window.location.hash.slice(1).toUpperCase(); if (classes.some((c) => c.id === h)) setPick(h); } catch { /* no hash */ } }, []);
  const choose = (id) => { setPick(id); try { window.history.replaceState(null, "", id === "all" ? window.location.pathname : "#" + id.toLowerCase()); } catch { /* ignore */ } };
  const [size, setSize] = useState(initialSize);
  const [ucOnly, setUcOnly] = useState(initialUc);
  const [psOnly, setPsOnly] = useState(initialPs);
  const keep = (v) => { const t = tagsFor(v.id); return (!ucOnly || t.uc) && (!psOnly || t.publicSector) && (size === "all" || t.sizes.some((z) => z.size === size)); };
  const shown = (pick === "all" ? classes : classes.filter((c) => c.id === pick)).map((c) => ({ ...c, kept: c.vendors.filter(keep) }));
  const filterBtn = (on) => ({ ...btn(on), flexDirection: "row", alignItems: "center", padding: "0 14px", fontSize: 14, fontWeight: on ? 700 : 500 });

  return (
    <div className="cx-cat" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh", paddingTop: HEADER_HEIGHT }}>
      <style>{CSS}</style>
      <Crumbs items={[["Vendor Intelligence", "/vendors"], [CATEGORIES.ccaas.name]]} />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Vendor Intelligence</span>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist }}>{CATEGORIES.ccaas.name}</h1>
          <p style={{ ...K.body, maxWidth: 760 }}>A contact center platform runs customer conversations: it routes calls and digital contacts to agents and bots, gives agents their desktop and gives supervisors the controls to run the operation. The category ends where a product only adds one piece around it: a digital-only channel, a CRM, workforce and quality tools, or a virtual agent. Those have their own categories.</p>
          <p style={{ ...K.small, maxWidth: 760 }}>Phase 1 scores and tiers are withdrawn. Vendors are compared only with peers that do the same job, and nothing on this page ranks them.</p>
          <CategoryTerms category="ccaas" />
        </header>

        <section aria-label="Where the research stands" style={K.lead}>
          <span style={K.kicker}>Where the research stands</span>
          <ul style={{ ...K.body, margin: "10px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>{researched} of {core.length} core platforms researched under the current method; {notYet.length} not yet.</li>
            <li>{classes.length} competitive classes: {calibrated} calibrated, {classes.length - calibrated} still in draft.</li>
            <li>Research validated between {fmtDate(INDEX.validatedFrom)} and {fmtDate(INDEX.validatedTo)}.</li>
            <li>Numeric ratings stay locked until each class has enough validated peers to support them.</li>
          </ul>
        </section>

        <section aria-labelledby="jobs" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="jobs" style={{ ...K.h2, margin: 0 }}>Start with the job you need done</h2>
          <p style={K.small}>Pick a job to see the vendors researched for it. A class is context for comparison, never a quality grade.</p>
          <div role="group" aria-label="Filter by job" style={K.grid(280)}>
            {classes.map((c) => {
              const pl = plain(c);
              return (
                <button key={c.id} type="button" aria-pressed={pick === c.id} onClick={() => choose(pick === c.id ? "all" : c.id)} style={btn(pick === c.id)}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{pl.name}</span>
                  <span style={K.body}>{pl.job}</span>
                  <span style={K.small}>Typical buyer: {c.buyer}</span>
                  <span style={K.small}>{c.draft ? "Class in draft" : "Class calibrated"} · {c.vendors.length === 1 ? "1 vendor" : `${c.vendors.length} vendors`}</span>
                </button>
              );
            })}
          </div>
          <div role="group" aria-label="Filter by size served" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...K.small, marginRight: 4 }}>Size served</span>
            {["all", ...SIZES].map((z) => <button key={z} type="button" aria-pressed={size === z} onClick={() => setSize(z)} style={filterBtn(size === z)}>{z === "all" ? "Any size" : z}</button>)}
            <button type="button" aria-pressed={ucOnly} onClick={() => setUcOnly(!ucOnly)} style={filterBtn(ucOnly)}>{UC_LABEL} only</button>
            <button type="button" aria-pressed={psOnly} onClick={() => setPsOnly(!psOnly)} style={filterBtn(psOnly)}>{PS_LABEL}</button>
          </div>
          <p style={K.small}>{UC_LABEL}: the research shows the vendor's own phone system sold with its contact center. A size is the buyer size the research says the platform is sold to; "selected use" means the research calls that size selective. {PS_LABEL}: the research lists a product or offer sold to government or public sector. Where a tag holds only for some buyers, the note under it says which. A tag describes the offer and carries no grade.</p>
          {pick !== "all" && <div><button type="button" onClick={() => choose("all")} style={{ ...K.link, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontSize: 14, minHeight: TOUCH }}>Show every class</button></div>}
        </section>

        {shown.map((c) => (
          <section key={c.id} id={c.id.toLowerCase()} aria-labelledby={`h-${c.id}`} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <h2 id={`h-${c.id}`} style={{ ...K.h2, margin: 0 }}>{plain(c).name}</h2>
              <span style={{ ...chip, borderStyle: c.draft ? "dashed" : "solid" }}>{c.draft ? "Draft class" : "Calibrated class"}</span>
            </div>
            <p style={K.small}>Research class: {c.name}. {c.definition}</p>
            <p style={K.small}>How the research compares this class, in its own words: {c.boundary}</p>
            {c.kept.length
              ? <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>{c.kept.map((v) => <Researched key={v.id} v={v} klass={c} />)}</ul>
              : <p style={K.small}>No researched vendor in this class matches these filters.</p>}
          </section>
        ))}

        <section aria-labelledby="notyet" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="notyet" style={{ ...K.h2, margin: 0 }}>Not yet researched</h2>
          <p style={K.small}>These platforms keep their earlier Phase 1 context pages, labelled as such. They get a class only once researched. Asking us to research one sends an anonymous count and nothing else.</p>
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {notYet.map((v) => <Requested key={v.slug} v={v} />)}
          </ul>
        </section>

        {/* Audit 30 Sep (TB: agree): large buyers weigh these three, and a shortlist check would ask why they are missing. */}
        <section aria-labelledby="suites" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="suites" style={{ ...K.h2, margin: 0 }}>Contact centers from the large cloud suites</h2>
          <p style={K.small}>Three offers that large buyers often weigh are not in this research yet: Microsoft Dynamics 365 Contact Center, Google Cloud's contact center offering, and Salesforce's own contact center built on Service Cloud. The research adds one vendor at a time under a locked method, and none of these three has been researched, so this page makes no claim about them either way. Salesforce Service Cloud appears below as an adjacent suite.</p>
          <p style={K.small}><a href="/research#ideas" style={K.link}>Tell us which one you want researched first</a></p>
        </section>

        <section aria-labelledby="adjacent" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="adjacent" style={{ ...K.h2, margin: 0 }}>Adjacent suites</h2>
          <p style={K.small}>Suites that shape contact center design from beside it, such as CRM and service management platforms. Tracked here, researched in their own categories.</p>
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {adjacent.map((v) => (
              <li key={v.slug} style={{ ...K.box, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                <a href={`/vendors/${v.slug}`} style={{ ...K.link, color: HOUSE.mist, fontSize: 17 }}>{v.name}</a>
                <div><VendorIntroLink slug={v.slug} name={v.name} from="category" surface="category" color={ACCENT} /></div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="method" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 id="method" style={{ ...K.h2, margin: 0 }}>How vendors are researched</h2>
          <div style={K.grid(240)}>
            {METHOD.map(([h, t]) => (
              <div key={h} style={K.box}><p style={{ ...K.body, ...K.strong }}>{h}</p><p style={{ ...K.small, marginTop: 6 }}>{t}</p></div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tools" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="tools" style={{ ...K.h2, margin: 0 }}>Test it against your own situation</h2>
          <ul style={{ ...K.body, margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><a href="/tools/platform-decision" style={K.link}>Platform Decision</a>: renew, add a specialist or test the market, layer by layer.</li>
            <li><a href="/tools/rfp-builder" style={K.link}>RFP Builder</a>: your requirements and the vendors' answers, scored by what is generally available.</li>
            <li><a href="/tools/contract-risk" style={K.link}>Contract Risk</a>: the clauses to find before you sign.</li>
            <li><a href="/tools/tco-calculator" style={K.link}>TCO Calculator</a>: what the platform costs to run over the term.</li>
          </ul>
          <p style={K.small}>Further reading: the <a href="/research/ccaas-buyer-guide" style={K.link}>CCaaS buyer guide</a> (a dated Phase 1 edition) and <a href="/research/ccaas-migration-costs" style={K.link}>why CCaaS migrations rarely cut costs on their own</a>.</p>
        </section>
      </div>
    </div>
  );
}
