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
// Every intricacy stays on the tag as a caveat (TB, 27 Sep 2026: "it's okay to note or caveat US public sector, gov,
// etc. Rule holds true for all intricacies"): a tag is shown when the research supports it for any buyer, and a note
// or a scope says for whom. A scope that limits a tag to one kind of buyer is part of the tag's own label.
//
// core: the vendor's primary contact center product (its Geographic_Scope is shown as where it runs).
// segments: { SMB | Midmarket | Enterprise: "yes" | "selected" }, each with the records it rests on in `from`.
// sizeNote: a caveat on the sizes, in our words, resting on the same records.
// uc: { from, note, scope? }: the records showing the vendor's own unified communications sold with its contact
//   center, what they rest on, and any buyer scope; null when the research lists none.
// publicSector: { from, note }: a product or offer the research says is sold to government or public sector.

export const SIZES = ["SMB", "Midmarket", "Enterprise"];
export const SIZE_WORDS = { SMB: "SMB", Midmarket: "Midmarket", Enterprise: "Enterprise" };
export const UC_LABEL = "UCaaS + CCaaS", CC_LABEL = "CCaaS";

export const CCAAS_TAGS = {
  "VEN-CC-0001": { core: "PRD-CC-0001", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0001"], uc: null },
  "VEN-CC-0002": { core: "PRD-CC-0007", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0007"], uc: null,
    sizeNote: "Strongest where the buyer already runs on AWS and has cloud operating maturity." },
  "VEN-CC-0003": { core: "PRD-CC-0011", segments: { SMB: "yes", Enterprise: "yes" }, from: ["PRD-CC-0011", "PRD-CC-0015"], uc: null,
    sizeNote: "SMB is served through storm LITE, a separate offer for smaller contact centers.",
    publicSector: { from: ["PRD-CC-0011"], note: "Sold to enterprise, public sector and mission-critical buyers." } },
  "VEN-CC-0004": { core: "PRD-CC-0017", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0017"], uc: null },
  "VEN-CC-0005": { core: "PRD-CC-0022", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0022"], uc: null },
  "VEN-CC-0006": { core: "PRD-CC-0027", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0027"], uc: null,
    publicSector: { from: ["PRD-CC-0033"], note: "Government is covered by a custom industry offer." } },
  "VEN-CC-0007": { core: "PRD-CC-0034", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0034"],
    uc: { from: ["CLM-CC-000340", "CLM-CC-000376"], note: "Rests on findings about Webex Calling; the research lists no separate UC product." },
    publicSector: { from: ["PRD-CC-0038"], note: "Webex Contact Center Enterprise (WxCCE) is sold to large enterprise and public sector estates." } },
  "VEN-CC-0008": { core: "PRD-CC-0039", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0039"],
    uc: { from: ["PRD-CC-0043", "CLM-CC-000398"], note: "RingEX is the UC product, and RingCX terms require a RingEX account." } },
  "VEN-CC-0009": { core: "PRD-CC-0045", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0045"],
    uc: { from: ["CLM-CC-000472"], note: "Rests on a finding about Zoom Workplace and Zoom Phone; the research lists no separate UC product." },
    publicSector: { from: ["PRD-CC-0051"], note: "US public sector: Zoom Contact Center for Government, in a US government environment (AWS GovCloud)." } },
  "VEN-CC-0010": { core: "PRD-CC-0052", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0052"],
    uc: { from: ["PRD-CC-0058"], note: "8x8 Work is the UC product." },
    sizeNote: "Enterprise means distributed enterprise, and selected global enterprise." },
  "VEN-CC-0011": { core: "PRD-CC-0060", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0061", "PRD-CC-0062", "PRD-CC-0063"], uc: null,
    sizeNote: "Each size has its own package: Essential (SMB and midmarket), CCaaS Enterprise, and CXaaS for the largest operations." },
  "VEN-CC-0012": { core: "PRD-CC-0066", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0066"],
    uc: { from: ["CLM-CC-000695", "CLM-CC-000750"], note: "Rests on findings about unified UC and contact center; the research lists no separate UC product." } },
  "VEN-CC-0013": { core: "PRD-CC-0072", segments: { Midmarket: "yes" }, from: ["PRD-CC-0072"], uc: null,
    sizeNote: "European midmarket and upper midmarket; the vendor positions it for teams of 50 to 1,000 agents." },
  "VEN-CC-0014": { core: "PRD-CC-0080", segments: { Enterprise: "yes" }, from: ["PRD-CC-0080"],
    uc: { from: ["PRD-CC-0088"], scope: "US public sector", note: "Only through Avaya Government Cloud, for US public sector buyers. For other buyers the research lists Avaya Aura, installed on premises, and no cloud UC product." },
    publicSector: { from: ["PRD-CC-0088", "PRD-CC-0087"], note: "US public sector: Avaya Government Cloud. Avaya Aura's installed base includes government." } },
  "VEN-CC-0015": { core: "PRD-CC-0090", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0090"], uc: null },
  "VEN-CC-0016": { core: "PRD-CC-0101", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "selected" }, from: ["PRD-CC-0101"], uc: null,
    sizeNote: "Enterprise means distributed enterprise, with selective large-enterprise use." },
  "VEN-CC-0017": { core: "PRD-CC-0110", segments: { Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0110"], uc: null },
  "VEN-CC-0018": { core: "PRD-CC-0117", segments: { SMB: "yes", Midmarket: "yes", Enterprise: "yes" }, from: ["PRD-CC-0117"],
    uc: { from: ["PRD-CC-0123"], note: "Vonage Fusion is the combined UC and contact center offer." } },
};

/* The words each tag needs to find in the records it cites. "Midmarket through enterprise" covers midmarket and
   enterprise; "SMB through large enterprise" covers all three; agent or user counts read as sizes. */
export const SIZE_TEST = {
  SMB: /\bSMB\b|\bsmall\b/i,
  Midmarket: /mid-?market|\bSMB through\b[^;]*\benterprise\b|\bsmall through\b[^;]*\benterprise\b|\b500\b/i,
  Enterprise: /enterprise|\b[0-9]{1,2},000\b/i,
};
export const SELECTED_TEST = /\bselect(?:ive|ed)\b[^;]*enterprise/i;
export const UC_TEST = /RingEX account|\bUCaaS\b|\bUC\+CC\b|\bUC\/contact-center\b|unified communications|Webex Calling|calling\/networking|Zoom Workplace\/Phone/i;

export const PS_LABEL = "Public sector offer";
export const PS_TEST = /public sector|government/i;

/** The tags for one vendor, in plain words, in size order, each caveat beside it. */
export function tagsFor(vendorId) {
  const t = CCAAS_TAGS[vendorId];
  if (!t) return null;
  const notes = [];
  if (t.uc) notes.push({ tag: UC_LABEL, text: t.uc.note });
  if (t.sizeNote) notes.push({ tag: "Sizes", text: t.sizeNote });
  if (t.publicSector) notes.push({ tag: PS_LABEL, text: t.publicSector.note });
  return {
    category: t.uc ? (t.uc.scope ? `${UC_LABEL} (${t.uc.scope})` : UC_LABEL) : CC_LABEL,
    uc: !!t.uc,
    ucScope: t.uc && t.uc.scope ? t.uc.scope : null,
    publicSector: !!t.publicSector,
    sizes: SIZES.filter((s) => t.segments[s]).map((s) => ({ size: s, selected: t.segments[s] === "selected", label: t.segments[s] === "selected" ? `${s}, selected use` : s })),
    notes,
  };
}
