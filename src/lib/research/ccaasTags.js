// ccaasTags.js
//
// Two tags per researched CCaaS vendor, asked for by TB (27 Sep 2026): whether the vendor sells its contact center
// alongside its own cloud phone system (UCaaS + CCaaS) or as a contact center (CCaaS), and which buyer sizes the
// research says its platform serves (SMB, midmarket, enterprise). Truth surface: Vendor Intelligence; presentation only.
// These are our plain-word reading of the research, never new research: every tag cites the published records it rests
// on (a product's Primary_Target_Segment or Product_Type, or a claim's summary), and research.test.mjs checks each
// citation exists in that vendor's published file and says what the tag says. A size tag reads the size the research
// states the platform is sold to; it never grades fit, depth or quality, and it never feeds Vendor Match or any order.
// "Selected" marks a size the research itself qualifies as selective or selected use.
//
// segments: { SMB | Midmarket | Enterprise: "yes" | "selected" }, each with the records it rests on in `from`.
// uc: the records showing the vendor's own unified communications product sold with its contact center, or null.

export const SIZES = ["SMB", "Midmarket", "Enterprise"];
export const SIZE_WORDS = { SMB: "SMB", Midmarket: "Midmarket", Enterprise: "Enterprise" };
export const UC_LABEL = "UCaaS + CCaaS", CC_LABEL = "CCaaS";

export const CCAAS_TAGS = {
  "VEN-CC-0001": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0001"], uc: null },
  "VEN-CC-0002": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0007"], uc: null },
  "VEN-CC-0003": { segments: { SMB: "yes", Enterprise: "yes" }, from: ["PRD-CC-0011", "PRD-CC-0015"], uc: null },
  "VEN-CC-0004": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0017"], uc: null },
  "VEN-CC-0005": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0022"], uc: null },
  "VEN-CC-0006": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0027"], uc: null },
  "VEN-CC-0007": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0034"], uc: ["CLM-CC-000340", "CLM-CC-000376"] },
  "VEN-CC-0008": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0039"], uc: ["PRD-CC-0043"] },
  "VEN-CC-0009": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0045"], uc: ["CLM-CC-000472"] },
  "VEN-CC-0010": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0052"], uc: ["PRD-CC-0058"] },
  "VEN-CC-0011": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0061", "PRD-CC-0062", "PRD-CC-0063"], uc: null },
  "VEN-CC-0012": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0066"], uc: ["CLM-CC-000695", "CLM-CC-000750"] },
  "VEN-CC-0013": { segments: { Midmarket: "yes" }, from: ["PRD-CC-0072"], uc: null },
  "VEN-CC-0014": { segments: { Enterprise: "yes" }, from: ["PRD-CC-0080"], uc: ["PRD-CC-0088"] },
  "VEN-CC-0015": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0090"], uc: null },
  "VEN-CC-0016": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0101"], uc: null },
  "VEN-CC-0017": { segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0110"], uc: null },
  "VEN-CC-0018": { segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0117"], uc: ["PRD-CC-0123"] },
};

/* The words each tag needs to find in the records it cites. "Midmarket through enterprise" covers midmarket and
   enterprise; "SMB through large enterprise" covers all three; agent or user counts read as sizes. */
export const SIZE_TEST = {
  SMB: /\bSMB\b|\bsmall\b/i,
  Midmarket: /mid-?market|\bSMB through\b[^;]*\benterprise\b|\bsmall through\b[^;]*\benterprise\b|\b500\b/i,
  Enterprise: /enterprise|\b[0-9]{1,2},000\b/i,
};
export const SELECTED_TEST = /\bselect(?:ive|ed)\b[^;]*enterprise/i;
export const UC_TEST = /\bUCaaS\b|\bUC\+CC\b|\bUC\/contact-center\b|unified communications|Webex Calling|calling\/networking|Zoom Workplace\/Phone/i;

/** The tags for one vendor, in plain words, in size order. */
export function tagsFor(vendorId) {
  const t = CCAAS_TAGS[vendorId];
  if (!t) return null;
  return {
    category: t.uc ? UC_LABEL : CC_LABEL,
    uc: !!t.uc,
    sizes: SIZES.filter((s) => t.segments[s]).map((s) => ({ size: s, selected: t.segments[s] === "selected", label: t.segments[s] === "selected" ? `${s}, selected use` : s })),
  };
}
