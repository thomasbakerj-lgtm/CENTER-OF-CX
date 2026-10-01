import { CATEGORIES } from "./verticals.js";
import { HOUSE } from "./tokens.js";

/* The category's other names, under its heading. "Also called" lists terms that mean exactly the same thing;
   "Related searches" lists what buyers search for part of the category or the outcome it serves. The names come
   from CATEGORIES only, so a page cannot drift from the registry. */
const ROW = { margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: HOUSE.body, maxWidth: 720 };
const KEY = { color: HOUSE.mist, fontWeight: 600 };

export default function CategoryTerms({ category }) {
  const c = CATEGORIES[category];
  if (!c) return null;
  return (
    <div data-category-terms={category} style={{ marginTop: 14 }}>
      {c.also.length > 0 && <p style={ROW}><span style={KEY}>Also called:</span> {c.also.join(", ")}</p>}
      {c.related.length > 0 && <p style={ROW}><span style={KEY}>Related searches:</span> {c.related.join(", ")}</p>}
    </div>
  );
}
