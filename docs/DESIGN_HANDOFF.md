# Design handoff: ContactCenterCX aesthetic rebuild

For a separate design chat (TB, S23). Self-contained: paste or attach this file. Written 25 September 2026 from the
repository at the close of the full site scan. Production: https://www.contactcentercx.com

## 1. What the site is, and who it must convince

A vendor-neutral decision platform for contact center and CX technology buyers, run by one operator. 25 free tools,
283 vendor profiles in 8 categories, 10 industry pages with 61 industry sub-pages, 23 published method and rubric pages, a public
changelog. The promise is "verified and traceable": every calculation checked, every fact sourced, every assumption
labelled. Commercial line: we sell confidence in decisions, never access to vendors. Independence is the product.

Audience goal: 100,000 people. The design has to earn a return visit from someone's first use of one tool.

Personas the design serves, in order of who decides:
- **CFO and finance partner.** Reads a PDF someone else ran. Needs to trust a number in ten seconds: where it came
  from, how sure it is, what would change it. Allergic to marketing.
- **Contact center operations or WFM leader.** Runs the calculators with their own numbers. Dense data is fine if it
  is legible; wants to change an input and see the effect immediately.
- **CX or IT leader evaluating platforms.** Reads vendor and method pages, builds an RFP, compares. Needs neutral
  presentation: no vendor looks promoted.
- **Consultant or analyst.** Shares scenario links and PDFs with clients; the output is their credibility.
- **Researcher or journalist.** Lands from search on a method or industry page; needs citations visible.

## 2. The brief TB has set

- The site is v1 visually and **must not read as AI-generated** or as a generic dark SaaS template (the audit's words
  for the homepage and How to Choose).
- Start from **3 to 5 reference sites TB wants to stand beside**, then mockups, then one design system applied once.
- Design psychology and optimization in scope: trust signals, reading order, decision flow, the path from one tool
  to a second (the one behaviour the business most needs to prove).

## 3. Hard constraints (the build enforces these)

- **No new external hosts** unless added to the site's Content Security Policy in the same change. Allowed today:
  scripts from the site and Vercel Analytics; styles from the site and Google Fonts; fonts from Google Fonts; network
  calls to PostHog and Formspree; images from the site, data and blob URLs. No font CDNs, icon CDNs or image hosts
  beyond these. Self-hosted assets are fine.
- **Zero incremental spend.** No paid fonts, templates, stock libraries or SaaS.
- **No em or en dashes anywhere**, in copy or design specs. No "X, not Y" sentence cadence in public copy.
  Retired words: most conservative, only independent, industry-leading, best-in-class, world-class, seamless,
  cutting-edge, game-changing, revolutionary, state-of-the-art, unparalleled, unmatched.
- **Claim markers are part of the design.** Every figure on an industry page carries its class inline: a published
  fact links its source ("Publisher 2025"), a planning assumption is labelled with a "test yours" link to a tool, a
  worked example is marked, and a missing benchmark reads "No public benchmark, measure yours". Each page ends with a
  "Sources and assumptions" list. These must stay legible and never look like fine print.
- **Confidence grades are part of the design.** Tool results carry one of Directional, Planning-grade or
  Finance-grade, or Void (no figure shown at all). The grade must read as information about the evidence, never as a
  score of the reader.
- **Vendor neutrality.** No ranking, tier, score or colour that implies a vendor is better. Vendor lists are
  alphabetical. Unresearched vendors carry a "Phase 1 context" label that must not read as a penalty.
- **Accessibility floor already met, keep it:** one h1 per page, every field labelled, 44px touch targets on tools,
  no horizontal scroll on a 390px phone.

## 4. What exists today

- **Type:** Archivo is the site face on tools and method pages. 45 content pages still load DM Sans and Instrument
  Serif (the old pair). Some rail tools fall back to Georgia or Arial in places.
- **Colour tokens in use:** navy #0B1D3A, deep #061325, electric blue #0088DD, light blue #00AAFF, warm #F8FAFB,
  slate #3A4F6A, muted #6B7F99, border #D8E3ED, plus status green, red and amber. Defined per file, not centrally.
- **Frames:** 16 tools share `ToolShell` (one header shape, one h1); the 9 larger calculators keep their own headers
  in the same shape. Every tool ends in the same `ReportActions` block (PDF, scenario link, method stamp, next step,
  review request).
- **Page types to design for:** homepage; How to Choose; tool (inputs, live results, confidence, report actions);
  method page (formulas in words, constants with sources, worked example, "checked against"); rubric page; changelog;
  industry page (stat strip, failure modes, stack layers, benchmark table with claim markers, BPO section, sources);
  industry sub-page (a 7-layer capability map the visitor marks Have, Need or Planned, then a results profile); vendor
  category page; vendor profile; buyer guide landing page; contact.

## 5. Open items from the visual audit (docs/VISUAL_AUDIT.md), left for the rebuild

- Electric blue and the status colours are used as text and fail contrast; the system needs separate text and fill
  variants of each.
- Link tap targets are under 40px on phones in many places.
- Contrast failures fell from 2,031 to 762 but remain, mostly translucent white text on dark sections.
- The 45 content pages on DM Sans and Instrument Serif.
- Emoji used as icons on several tools.
- The 9 large calculators should fold onto the shared tool frame.
- Floor tools once read as "a second, older product" next to the rail tools; the frame fixed structure, not look.

## 6. What the design chat should return

1. A short positioning read of TB's reference sites: what each does that we want, and what we must not copy.
2. Design principles (five or fewer) tied to the personas above.
3. Tokens: type scale and families (free, self-hostable or Google Fonts), colour with text and fill variants that pass
   WCAG AA, spacing, radius, elevation.
4. Components: tool frame, input, result tile, confidence badge, claim marker, sources list, vendor card, table,
   page header, navigation, footer.
5. Mockups of: homepage, one calculator, one method page, one industry page, one vendor profile, phone and desktop.
6. The first-to-second-tool flow: how every result page hands the reader to one next diagnostic.

Implementation happens back in Claude Code, applied once across the site, gated by the existing suite, the visual
audit script and the live checker.
