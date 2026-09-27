// src/lib/intro.js
//
// Vendor introductions (TB, S24: wherever a vendor appears, the reader can ask for an introduction; part of the site's
// lead generation). Every introduction goes to the contact form, which carries the vendor to TB's inbox with the
// rest of the request. Nothing here changes a list's order, a score or a research finding: the button sits beside a
// vendor, it never decides where the vendor sits.
//
// A link carries a profile slug (checked against the vendor registry) or, for a vendor the reader typed into a tool
// with no profile on the site, a short name limited to plain characters. Anything else is dropped, so a crafted link
// can put neither markup nor a long message into the form.

import { isVendorSlug, vendorDisplayName } from "./seo.js";

const NAME = /^[A-Za-z0-9][A-Za-z0-9 .,&'+()/]{0,59}$/;
const FROM = /^[a-z0-9][a-z0-9-]{0,39}$/;

export const INTRO_TOPIC = "Vendor introduction";

/** The contact link for an introduction to one vendor. `from` is where the reader asked (a tool id or a page type). */
export function introHref({ slug, name, from } = {}) {
  const q = new URLSearchParams();
  if (slug && isVendorSlug(slug)) q.set("intro", slug);
  else if (typeof name === "string" && NAME.test(name.trim())) q.set("vendor", name.trim());
  else return "/contact";
  if (typeof from === "string" && FROM.test(from)) q.set("from", from);
  return "/contact?" + q.toString();
}

/** The introduction a contact link asks for, or null. */
export function readIntro(search) {
  const q = new URLSearchParams(typeof search === "string" ? search : "");
  const from = FROM.test(q.get("from") || "") ? q.get("from") : null;
  const slug = q.get("intro");
  if (slug && isVendorSlug(slug)) return { slug, name: vendorDisplayName(slug), from };
  const name = (q.get("vendor") || "").trim();
  if (NAME.test(name)) return { slug: null, name, from };
  return null;
}
