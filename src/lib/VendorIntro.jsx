// src/lib/VendorIntro.jsx
//
// The vendor introduction button. One component wherever a vendor appears, so the link, the event and the wording
// cannot drift between surfaces. Tokens only through the shared Button.
import { Button } from "./ui.jsx";
import { introHref } from "./intro.js";
import { trackVendor } from "./track.js";

export function VendorIntro({ slug, name, from, surface, kind = "primary", label }) {
  const href = introHref({ slug, name, from });
  return (
    <Button kind={kind} href={href} onClick={() => trackVendor.action(slug || undefined, "intro", surface)}>
      {label || `Request an introduction to ${name}`}
    </Button>
  );
}

/** The same introduction as a plain text link, for the older light pages (category lists) until they are rebuilt.
 *  The page passes its own ink colour, so the link keeps that page's contrast. */
export function VendorIntroLink({ slug, name, from, surface, color }) {
  return (
    <a href={introHref({ slug, name, from })} onClick={() => trackVendor.action(slug || undefined, "intro", surface)}
      style={{ display: "inline-flex", alignItems: "center", minHeight: 32, fontSize: 13, fontWeight: 600, color, textDecoration: "underline", textUnderlineOffset: 3 }}>
      Request an introduction to {name}
    </a>
  );
}
