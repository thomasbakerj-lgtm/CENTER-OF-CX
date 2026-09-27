// VendorTags.jsx
//
// The one rendering of a researched vendor's tags (what it sells, the sizes the research says it is sold to, a public
// sector offer) and the caveats beside them, for the category page, the profile and the industry pages. A chip is a
// label and carries no grade; a size the research calls selective carries the words and a dashed edge. Tokens only.
import { HOUSE, RADIUS } from "./tokens.js";
import { K } from "./frameKit.jsx";
import { tagsFor, PS_LABEL } from "./research/ccaasTags.js";

const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: RADIUS.chip, border: `1px solid ${K.firm}`, color: HOUSE.mist };

export function Tags({ vendorId }) {
  const t = tagsFor(vendorId);
  if (!t) return null;
  return (
    <ul aria-label="Tags" style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: 0, padding: 0, listStyle: "none" }}>
      <li style={{ ...chip, fontWeight: 700 }}>{t.category}</li>
      {t.sizes.map((z) => <li key={z.size} style={{ ...chip, fontWeight: 500, borderStyle: z.selected ? "dashed" : "solid" }}>{z.label}</li>)}
      {t.publicSector && <li style={{ ...chip, fontWeight: 500 }}>{PS_LABEL}</li>}
    </ul>
  );
}

/* Each caveat beside the tag it qualifies (TB: every intricacy is noted). */
export function TagNotes({ vendorId, large = false }) {
  const t = tagsFor(vendorId);
  if (!t || !t.notes.length) return null;
  return (
    <ul aria-label="Notes on the tags" style={{ ...(large ? K.body : K.small), margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: large ? 4 : 0 }}>
      {t.notes.map((n) => <li key={n.tag}><strong style={K.strong}>{n.tag}:</strong> {n.text}</li>)}
    </ul>
  );
}
