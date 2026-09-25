/* Phase1Directory.jsx
 *
 * The withdrawn-scores banner and the vendor directory every non-CCaaS category page uses
 * (integrity freeze, TB S23). Vendors are grouped by the category's own taxonomy and listed
 * by name. Each carries one neutral classification line (a segment, modality or role) and
 * no score, tier, rank or verdict. Rendered identically on all seven pages so the freeze
 * cannot erode one page at a time.
 */
import { phase1Label, byName } from "./researchStatus.js";

const NAVY = "#0B1D3A"; const ELECTRIC = "#0088DD"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const SERIF = { fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 };

export function ScoresWithdrawn({ category }) {
  return (
    <section style={{ background: WARM, padding: "56px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ maxWidth: 760 }}>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scores withdrawn</span>
          <h2 style={{ ...SERIF, fontSize: 28, color: NAVY, margin: "8px 0 12px" }}>Why this page no longer ranks vendors.</h2>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, margin: 0 }}>The earlier assessment of {category} scored every vendor on one model and placed unlike platforms on a single scale. Current research compares vendors only inside a class of platforms built for the same job, and publishes ratings only once a class has enough validated peers. Until {category} is researched that way, its scores, tiers and rankings are withdrawn. Vendors are listed by name, and every profile is labelled Phase 1 context.</p>
        </div>
      </div>
    </section>
  );
}

export function Phase1Directory({ groups }) {
  const label = phase1Label();
  const total = groups.reduce((s, g) => s + g.vendors.length, 0);
  return (
    <section style={{ background: "#fff", padding: "72px 28px" }}>
      <div style={WRAP}>
        <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Directory</span>
        <h2 style={{ ...SERIF, fontSize: 32, color: NAVY, margin: "0 0 8px" }}>All {total} vendors, by name.</h2>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 720 }}>{label.text}</p>
        {groups.map((g) => (
          <div key={g.name} style={{ marginBottom: 32 }}>
            {groups.length > 1 && <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{g.name} <span style={{ fontSize: 12, color: MUTED, fontWeight: 400 }}>· {g.vendors.length} vendors</span></h3>}
            {g.desc && <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: "0 0 12px", maxWidth: 760 }}>{g.desc}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
              {[...g.vendors].sort(byName).map((v) => (
                <a key={v.slug} href={`/vendors/${v.slug}`} style={{ display: "block", padding: "12px 14px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{v.name}</div>
                  {v.line && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{v.line}</div>}
                  <div style={{ fontSize: 11, color: SLATE, marginTop: 6 }}>{label.short}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
