// src/lib/Assent.jsx
//
// The notice beside a submit button on the forms that carry more risk than reading a page: vendor reviews, contributor
// proposals, consultation and advisory requests, demo requests, research corrections and review requests that send a
// tool's results (TB, 29 Sep 2026, from TB's legal review notes: make assent visible where it matters). A conspicuous
// notice, no checkbox; the choice between the two is TB's and counsel's. `tone` is "dark" on the house, "paper" on the
// report panel. Tokens only.
import { HOUSE, PILLARS } from "./tokens.js";

export const ASSENT_TEXT = "By submitting, you agree to the Terms of Use and acknowledge the Privacy Policy.";

export function Assent({ tone = "dark", align = "left" }) {
  const color = tone === "paper" ? HOUSE.paperInk : HOUSE.body;
  const link = tone === "paper" ? PILLARS.diagnostics.onLight : HOUSE.sky2;
  const a = { color: link, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
  return (
    <p data-assent="" style={{ fontSize: 13, lineHeight: "20px", color, margin: "8px 0 0", textAlign: align }}>
      By submitting, you agree to the <a href="/terms" style={a}>Terms of Use</a> and acknowledge the <a href="/privacy" style={a}>Privacy Policy</a>.
    </p>
  );
}
