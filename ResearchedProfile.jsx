// ResearchedProfile.jsx
//
// The profile of a vendor whose current research passed its completion gate (redesign Phase 7 part 2, the design TB
// approved on 26 Sep 2026). Truth surface: Vendor Intelligence. Everything on the page comes from the published research
// snapshot through buildProfile; the page adds words, never a score, rank, tier or count of states. Six questions switch
// the view. The Phase 1 profile prose (strengths, weaknesses, beats, loses to) does not appear here; it stays in the data
// for lineage. Tokens only.
import { useState, useEffect } from "react";
import { HOUSE, PILLARS, RADIUS, TOUCH } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs, HEADER_HEIGHT } from "./src/lib/Shell.jsx";
import { VendorIntro } from "./src/lib/VendorIntro.jsx";
import { buildProfile, VIEWS, FILTERS, capability, evidence, words } from "./src/lib/research/profileView.js";
import { fmtDate } from "./src/lib/researchStatus.js";
import { CCAAS_TAGS, UC_LABEL, PS_LABEL } from "./src/lib/research/ccaasTags.js";
import { Tags, TagNotes } from "./src/lib/VendorTags.jsx";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { trackVendor } from "./src/lib/track.js";

const tab = (on) => ({ minHeight: TOUCH, padding: "0 14px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer",
  border: `${on ? 2 : 1}px solid ${on ? PILLARS.vendors.onDark : K.firm}`, background: "transparent", color: HOUSE.mist });
const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: RADIUS.chip, border: `1px solid ${K.firm}`, color: HOUSE.mist };
const dl = { display: "grid", gap: "6px 14px", margin: "10px 0 0" };
/* Label beside value on a wide screen, stacked on a phone; long unbroken research strings wrap anywhere. */
const CSS = `.cx-dl{grid-template-columns:minmax(0,180px) minmax(0,1fr)}.cx-rp dd,.cx-rp dt,.cx-rp p,.cx-rp li,.cx-rp a{overflow-wrap:anywhere}@media(max-width:600px){.cx-dl{grid-template-columns:minmax(0,1fr)}.cx-dl dd{margin-bottom:6px}}`;

function Pair({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (<><dt style={{ ...K.small, fontWeight: 600 }}>{label}</dt><dd style={{ ...K.body, margin: 0 }}>{words(value)}</dd></>);
}

function Sources({ list }) {
  const [open, setOpen] = useState(false);
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ ...K.link, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontSize: 13, minHeight: 32 }}>
        {open ? "Hide sources" : list.length === 1 ? "Show the source" : `Show the ${list.length} sources`}
      </button>
      {open && (
        <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {list.map((s) => (
            <li key={s.id} style={K.small}>
              {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={K.link}>{s.title}</a> : <span style={K.strong}>{s.title}</span>}
              {` · ${s.publisher || "Publisher not stated"}${s.tier ? ` · tier ${s.tier}` : ""}${s.retrieved ? ` · read ${fmtDate(s.retrieved)}` : ""}${s.role ? ` · ${s.role.toLowerCase()}` : ""}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Claim({ c }) {
  return (
    <li style={{ ...K.box, listStyle: "none" }}>
      <p style={{ ...K.body, color: HOUSE.mist }}>{c.Publishable_Summary}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        <span style={chip}>{capability(c.Capability_State)}</span>
        {evidence(c.Evidence_State) && <span style={{ ...chip, fontWeight: 500 }}>{evidence(c.Evidence_State)}</span>}
        {c.Applicability_State === "CONDITIONAL" && c.Applicability_Context && <span style={{ ...chip, fontWeight: 500, borderStyle: "dashed" }}>Applies to: {c.Applicability_Context}</span>}
        {c.Stale && <span style={{ ...chip, borderStyle: "dashed" }}>Source due for review</span>}
      </div>
      {c.Buyer_Implication && <p style={{ ...K.small, marginTop: 8 }}><strong style={K.strong}>What it means for a buyer:</strong> {c.Buyer_Implication}</p>}
      <p style={{ ...K.small, marginTop: 4 }}>Validated {fmtDate(c.Validation_Date)}</p>
      <Sources list={c.sources} />
    </li>
  );
}

/* What the vendor sells and who it is sold to: the tags, the caveats and the research's own words they rest on. */
function SoldTo({ p }) {
  const id = p.vendor.Vendor_ID, t = CCAAS_TAGS[id];
  if (!t) return null;
  const said = (x) => { const pr = p.products.find((y) => y.id === x); if (pr) return `${pr.name}: ${pr.segment}`; const c = p.claimById.get(x); return c ? c.Publishable_Summary : null; };
  const core = p.products.find((y) => y.id === t.core);
  const Quote = ({ label, ids }) => (<>
    <p style={{ ...K.small, marginTop: 10 }}>{label}</p>
    <ul style={{ ...K.small, margin: "4px 0 0", paddingLeft: 18 }}>{ids.map((x) => said(x) && <li key={x}>{said(x)}</li>)}</ul>
  </>);
  return (
    <section aria-label="Who it is sold to" style={K.panel}>
      <h2 style={K.h2}>Who it is sold to</h2>
      <Tags vendorId={id} />
      <div style={{ marginTop: 10 }}><TagNotes vendorId={id} large /></div>
      {core && core.scope && <p style={{ ...K.body, marginTop: 10 }}><strong style={K.strong}>Where it runs:</strong> {core.scope}</p>}
      <Quote label="Sizes, in the research's words:" ids={t.from} />
      {t.uc && <Quote label={`${UC_LABEL}, in the research's words:`} ids={t.uc.from} />}
      {t.publicSector && <Quote label={`${PS_LABEL}, in the research's words:`} ids={t.publicSector.from} />}
      <p style={{ ...K.small, marginTop: 10 }}>A size is the buyer size the research says the platform is sold to. Where a tag holds only for some buyers, the note says which. It describes the offer and carries no grade.</p>
    </section>
  );
}

/* Where to take the research next. Links only: no tool reads this research (Vendor Match V3 at research Stage 4 is where
   the facts behind the tags become buyer filters). RFP Builder opens with this vendor already entered; the link is
   relative so the prerendered page and the hydrated page match. */
export function rfpHref(name) {
  const enc = encodeScenario("rfp-builder", { vendors: [name] }, { vendors: [] });
  return enc ? `/tools/rfp-builder?s=${enc}` : "/tools/rfp-builder";
}

function TakeItFurther({ p, slug }) {
  const name = p.vendor.Supplier_Name;
  const go = (action) => () => trackVendor.action(slug, action, "vendor");
  const rows = [
    [rfpHref(name), `Test ${name}'s answers against your requirements`, "RFP Builder, with this vendor already entered.", "rfp"],
    [`/vendors/ccaas#${p.klass ? p.klass.id.toLowerCase() : ""}`, "See the peers it is compared with", "The other vendors researched for the same job.", "peer"],
    ["/tools/platform-decision", "Decide whether to renew your current platform", "Platform Decision, layer by layer.", "test-it"],
    ["/tools/contract-risk", "Check the contract before you sign", "Contract Risk: the clauses to find.", "test-it"],
    ["/tools/tco-calculator", "Model the cost over the term", "TCO Calculator.", "test-it"],
    ["/tools/license-gap", "Find what the bundle leaves out", "License Gap.", "test-it"],
    ["/tools/vendor-match", "Build a starting list", "Vendor Match. It still runs on its Phase 1 model and does not read this research yet.", "test-it"],
  ];
  return (
    <section aria-label="Take it further" style={K.panel}>
      <h2 style={K.h2}>Take it further</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(([href, label, sub, action]) => (
          <li key={label}><a href={href} onClick={go(action)} style={{ ...K.link, fontSize: 15 }}>{label}</a><p style={K.small}>{sub}</p></li>
        ))}
      </ul>
    </section>
  );
}

function FitView({ p }) {
  return (<>
    {p.klass && (
      <section aria-label="Competitive class" style={K.lead}>
        <span style={K.kicker}>Compared with vendors that do the same job</span>
        <h2 style={{ ...K.h2, marginTop: 6 }}>{p.klass.name}</h2>
        <p style={K.body}>{p.klass.job}</p>
        <dl className="cx-dl" style={dl}>
          <Pair label="Typical buyer" value={p.klass.buyer} />
          <Pair label="Compared on" value={p.klass.boundary} />
          <Pair label="Class status" value={p.klass.status} />
        </dl>
        <p style={{ ...K.small, marginTop: 10 }}>The class is context for comparison, never a quality grade. {p.vendor.Class_Rationale}</p>
      </section>
    )}
    <SoldTo p={p} />
    {p.decisions.map((g) => (
      <section key={g.id} aria-label={g.label} style={K.panel}>
        <h2 style={K.h2}>{g.label}</h2>
        <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {g.rows.map((d) => (
            <li key={d.Decision_ID} style={{ listStyle: "none", ...K.box }}>
              <p style={{ ...K.body, color: HOUSE.mist }}>{d.Statement}</p>
              {d.Buyer_or_Operating_Context && <p style={{ ...K.small, marginTop: 4 }}>Context: {d.Buyer_or_Operating_Context}</p>}
              {d.Causal_Rationale && d.Causal_Rationale !== d.Statement && <p style={{ ...K.small, marginTop: 4 }}>Why: {d.Causal_Rationale}</p>}
            </li>
          ))}
        </ul>
      </section>
    ))}
    {p.fit.map((g) => (
      <section key={g.id} aria-label={g.label} style={K.panel}>
        <h2 style={K.h2}>{g.label}</h2>
        <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {g.rows.map((f) => (
            <li key={f.Fit_ID} style={{ listStyle: "none", ...K.box }}>
              <p style={{ ...K.body, color: HOUSE.mist }}>{f.Buyer_Condition}</p>
              {f.Why_Fit_Changes && <p style={{ ...K.small, marginTop: 4 }}>Why: {f.Why_Fit_Changes}</p>}
            </li>
          ))}
        </ul>
      </section>
    ))}
    <section aria-label="Products" style={K.panel}>
      <h2 style={K.h2}>Products researched</h2>
      <ul style={{ padding: 0, margin: 0, ...K.grid(240) }}>
        {p.products.map((x) => (
          <li key={x.id} style={{ listStyle: "none", ...K.box }}>
            <div style={{ ...K.strong, fontSize: 15 }}>{x.name}</div>
            <p style={K.small}>{[x.type, x.role].filter(Boolean).join(". ")}</p>
            <p style={{ ...K.small, marginTop: 4 }}>Release state: {words(x.state) || "Not stated"}</p>
          </li>
        ))}
      </ul>
    </section>
  </>);
}

function FindingsView({ p, initialFilter }) {
  const [filter, setFilter] = useState(initialFilter);
  const f = FILTERS.find((x) => x.id === filter);
  return (<>
    <div role="group" aria-label="Show findings" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FILTERS.map((x) => <button key={x.id} type="button" aria-pressed={filter === x.id} onClick={() => setFilter(x.id)} style={tab(filter === x.id)}>{x.label}</button>)}
    </div>
    <p style={K.small}>Not yet proven means public evidence does not settle it either way. It raises what to ask the vendor to prove, and it is not a weakness.</p>
    {p.layers.map((l) => {
      const crit = l.criteria.map((c) => ({ ...c, shown: c.claims.filter(f.test) })).filter((c) => c.shown.length);
      if (!crit.length) return null;
      return (
        <section key={l.layer} aria-label={l.layer} style={K.panel}>
          <span style={K.kicker}>{l.layer}</span>
          {crit.map((c) => (
            <div key={c.id} style={{ marginTop: 14 }}>
              <h3 style={{ ...K.h2, fontSize: 16, marginBottom: 8 }}>{c.name}</h3>
              <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>{c.shown.map((x) => <Claim key={x.Claim_ID} c={x} />)}</ul>
            </div>
          ))}
        </section>
      );
    })}
  </>);
}

function BreaksView({ p }) {
  if (!p.breaks.length) return <p style={K.body}>The research records no break for this vendor.</p>;
  return (
    <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {p.breaks.map((b) => (
        <li key={b.Break_ID} style={{ listStyle: "none", ...K.panel }}>
          <span style={K.kicker}>{words(b.Break_Type)}{b.Severity ? ` · ${words(b.Severity)}` : ""}</span>
          <p style={{ ...K.body, color: HOUSE.mist, marginTop: 6 }}>{b.Break_Summary}</p>
          <dl className="cx-dl" style={dl}>
            <Pair label="When it happens" value={b.Trigger_Condition} />
            <Pair label="Who it affects" value={b.Affected_Buyer_or_Use_Case} />
            <Pair label="Can it be mitigated" value={b.Mitigation_Available} />
            <Pair label="How" value={b.Mitigation_Method} />
            <Pair label="What it adds to the build" value={b.Build_or_Config_Implication} />
            <Pair label="Cost" value={b.Cost_Consequence} />
            <Pair label="Who owns it after go-live" value={b.Day2_Owner} />
            <Pair label="Ask the vendor" value={b.Buyer_Question} />
            <Pair label="Walk away when" value={b.Exit_Point} />
          </dl>
        </li>
      ))}
    </ul>
  );
}

function EffortView({ p }) {
  const i = p.effort.implementation;
  const list = (title, rows, key, render) => rows.length ? (
    <section aria-label={title} style={K.panel}>
      <h2 style={K.h2}>{title}</h2>
      <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>{rows.map((r) => <li key={r[key]} style={{ listStyle: "none", ...K.box }}>{render(r)}</li>)}</ul>
    </section>) : null;
  return (<>
    {i && (
      <section aria-label="Implementation" style={K.lead}>
        <h2 style={K.h2}>Implementation</h2>
        <dl className="cx-dl" style={dl}>
          <Pair label="Overall effort" value={i.Overall_Implementation_Gravity || i.Implementation_Gravity} />
          <Pair label="Why" value={i.Gravity_Rationale} />
          <Pair label="Timeline" value={i.Estimated_Timeline_Band} />
          <Pair label="What drives it" value={i.Primary_Implementation_Drivers} />
          <Pair label="Work buyers miss" value={i.Hidden_Work} />
          <Pair label="What speeds it up" value={i.Accelerators} />
          <Pair label="Who you need in-house" value={i.Buyer_Operating_Capacity_Required} />
          <Pair label="Outside services" value={i.External_Services_Dependency} />
        </dl>
      </section>
    )}
    {list("Put this in the statement of work", p.effort.sow, "SOW_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Workstream)}</span>
      <p style={{ ...K.body, color: HOUSE.mist, marginTop: 4 }}>{r.Required_SOW_Content || r.Required_SOW_Language || r.Typical_Assumption_or_Exclusion}</p>
      {(r.Failure_if_Omitted || r.Likely_Change_Order_Risk) && <p style={{ ...K.small, marginTop: 4 }}>If it is left out: {r.Failure_if_Omitted || r.Likely_Change_Order_Risk}</p>}
    </>))}
    {list("After go-live", p.effort.day2, "Change_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Change_Area || r.Change_Type)}</span>
      <dl className="cx-dl" style={dl}>
        <Pair label="Who does it" value={r.Day2_Owner || r.Typical_Role} />
        <Pair label="Can you do it yourself" value={r.Customer_Can_Self_Administer} />
        <Pair label="Depends on the vendor or a partner" value={r.Vendor_or_Partner_Dependency || r.External_Dependency} />
        <Pair label="What can go wrong" value={r.Failure_Risk} />
      </dl>
    </>))}
    {list("What drives the cost", p.effort.tco, "TCO_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Cost_Layer)}</span>
      <p style={{ ...K.body, color: HOUSE.mist, marginTop: 4 }}>{r.Cost_Component}</p>
      <dl className="cx-dl" style={dl}>
        <Pair label="Required" value={r.Required_or_Optional} />
        <Pair label="How predictable" value={r.Predictability} />
        <Pair label="Exit or lock-in cost" value={r.Lock_in_or_Exit_Cost} />
        <Pair label="Note" value={r.Cost_Risk_Notes} />
      </dl>
    </>))}
    {list("Integrations", p.effort.integrations, "Integration_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Integration_Category || r.Integration_Type)}</span>
      <p style={{ ...K.body, color: HOUSE.mist, marginTop: 4 }}>{r.Integration_Target || r.Integration_Name}</p>
      <dl className="cx-dl" style={dl}>
        <Pair label="How it connects" value={r.Architecture_Method || r.Method} />
        <Pair label="Who supports it" value={r.Runtime_Support_Owner || r.Support_Owner} />
        <Pair label="When it fails" value={r.Failure_Behavior} />
      </dl>
    </>))}
  </>);
}

function AskView({ p }) {
  const block = (title, note, rows, key, render) => rows.length ? (
    <section aria-label={title} style={K.panel}>
      <h2 style={K.h2}>{title}</h2>
      {note && <p style={{ ...K.small, marginBottom: 10 }}>{note}</p>}
      <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>{rows.map((r) => <li key={r[key]} style={{ listStyle: "none", ...K.box }}>{render(r)}</li>)}</ul>
    </section>) : null;
  return (<>
    {block("Proof to ask for", "Run each in your own scenario, with your data, before you sign.", p.ask.proof, "Proof_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Proof_Type)}</span>
      <p style={{ ...K.body, color: HOUSE.mist, marginTop: 4 }}>{r.Buyer_Controlled_Scenario || r.Risk_or_Hypothesis}</p>
      <dl className="cx-dl" style={dl}>
        <Pair label="Passes when" value={r.Success_Criterion} />
        <Pair label="Fails when" value={r.Failure_Criterion} />
        <Pair label="Must be proven in production" value={r.Must_Be_Production_Proven} />
        <Pair label="Ask a reference" value={r.Reference_Call_Question} />
      </dl>
    </>))}
    {block("Contract terms to ask for", null, p.ask.contract, "Contract_ID", (r) => (<>
      <span style={K.kicker}>{words(r.Requirement_Type)}</span>
      <p style={{ ...K.body, color: HOUSE.mist, marginTop: 4 }}>{r.Required_Language_or_Commitment}</p>
      <dl className="cx-dl" style={dl}>
        <Pair label="Measured by" value={r.Metric_or_Acceptance_Standard} />
        <Pair label="Remedy or exit" value={r.Remedy_or_Exit_Right} />
      </dl>
    </>))}
    {block("AI controls to check", null, p.ask.ai, "AI_ID", (r) => (<>
      <span style={K.kicker}>{r.AI_Capability_or_Workflow}</span>
      <dl className="cx-dl" style={dl}>
        <Pair label="What it may do" value={r.Action_Authority} />
        <Pair label="Human approval" value={r.Human_Approval} />
        <Pair label="Audit trail" value={r.Auditability} />
        <Pair label="Use of your data" value={r.Data_Use_or_Training} />
        <Pair label="Proven in production" value={r.Production_Proof_State} />
      </dl>
    </>))}
    {block("Questions the research could not settle", "Open questions stay open until evidence settles them. They are not marked against the vendor.", p.ask.questions, "Question_ID", (r) => (<>
      <p style={{ ...K.body, color: HOUSE.mist }}>{r.Question}</p>
      {r.Why_It_Matters && <p style={{ ...K.small, marginTop: 4 }}>Why it matters: {r.Why_It_Matters}</p>}
    </>))}
  </>);
}

function SourcesView({ p, manifestDate }) {
  return (<>
    <section aria-label="Who published the evidence" style={K.lead}>
      <h2 style={K.h2}>Who published the evidence</h2>
      <ul style={{ padding: 0, margin: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.publishers.map((x) => <li key={x.name} style={{ listStyle: "none", ...chip, fontSize: 13 }}>{x.name}: {x.count}</li>)}
      </ul>
      <p style={{ ...K.small, marginTop: 10 }}>{p.publishers[0] ? `${p.publishers[0].name} published ${p.publishers[0].count} of the ${p.sources.length} sources behind this page. ` : ""}A source published by the vendor documents what is offered; it does not show how the platform runs in your operation. The proof list under "What should I ask for?" covers that.</p>
    </section>
    <section aria-label="Sources" style={K.panel}>
      <h2 style={K.h2}>Every source</h2>
      <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {p.sources.map((s) => (
          <li key={s.id} style={{ listStyle: "none", ...K.box }}>
            {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={K.link}>{s.title}</a> : <span style={K.strong}>{s.title}</span>}
            <p style={{ ...K.small, marginTop: 4 }}>{[s.publisher, s.type, s.tier ? `tier ${s.tier}` : null, s.published ? `published ${s.published}` : null, s.retrieved ? `read ${fmtDate(s.retrieved)}` : null].filter(Boolean).join(" · ")}</p>
            {s.limits && <p style={{ ...K.small, marginTop: 4 }}>Limits: {s.limits}</p>}
          </li>
        ))}
      </ul>
    </section>
    <p style={K.small}>Research checkpoint {manifestDate ? `of ${fmtDate(manifestDate)}` : ""}. Ratings stay unpublished until each competitive class has enough validated peers to compare fairly.</p>
  </>);
}

export default function ResearchedProfile({ slug, file, shared, manifestDate, initialView = "fit", initialFilter = "all" }) {
  const p = buildProfile(file, shared);
  const [view, setView] = useState(initialView);
  /* A view can be linked (#findings); read after first paint so the prerendered page and the hydrated page match. */
  useEffect(() => { try { const h = window.location.hash.slice(1); if (VIEWS.some((v) => v.id === h)) setView(h); } catch { /* no hash */ } }, []);
  const pick = (id) => { setView(id); try { window.history.replaceState(null, "", "#" + id); } catch { /* ignore */ } };
  const v = p.vendor;
  return (
    <div className="cx-rp" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh", paddingTop: HEADER_HEIGHT }}>
      <style>{CSS}</style>
      <Crumbs items={[["Vendor Intelligence", "/vendors"], ["CCaaS", "/vendors/ccaas"], [v.Supplier_Name]]} />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ ...K.kicker, color: PILLARS.vendors.onDark }}>Current research complete · validated {fmtDate(v.Last_Validated_Date)}</span>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist }}>{v.Supplier_Name}</h1>
          <p style={{ ...K.body, maxWidth: 720 }}>{[v.Legal_Name, v.HQ, v.Ownership_Status].filter(Boolean).join(" · ")}</p>
          <Tags vendorId={v.Vendor_ID} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <VendorIntro slug={slug} name={v.Supplier_Name} from="vendor" surface="vendor" />
            <a href="/contact" style={{ ...K.link, fontSize: 14 }}>Report an error</a>
          </div>
        </header>
        <div role="tablist" aria-label="Questions about this vendor" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {VIEWS.map((x) => <button key={x.id} type="button" role="tab" aria-selected={view === x.id} onClick={() => pick(x.id)} style={tab(view === x.id)}>{x.label}</button>)}
        </div>
        {view === "fit" && <><FitView p={p} /><TakeItFurther p={p} slug={slug} /></>}
        {view === "findings" && <FindingsView p={p} initialFilter={initialFilter} />}
        {view === "breaks" && <BreaksView p={p} />}
        {view === "effort" && <EffortView p={p} />}
        {view === "ask" && <AskView p={p} />}
        {view === "sources" && <SourcesView p={p} manifestDate={manifestDate} />}
      </div>
    </div>
  );
}
