# Phase 2 Vendor Record Schema

**Version 2.0.0. 19 September 2026.**
Authority: AI Builder Handoff V3 and Addendum 1, Market Position Index and Tool Separation Rules.
Implemented in `src/lib/vendorSchema.js` and `src/lib/categoryRegistry.js`. Proven by
`tests/vendorSchema.harness.mjs`, 102 assertions green.

---

## 1. Two records, one vendor

| | Index record | Decision record |
|---|---|---|
| Truth type | market | research |
| Feeds | Market Position Index only | Vendor Intelligence and Vendor Match only |
| Capture set | Shallow and broad. Public sources only | Deep and atomic. Full corpus |
| Content | Five dimensions, market read fields | Five axes, atomic claims, breaks, consequences, gravity, Day 2, change economics, proof |
| Joined by | `vendorId`, `categoryId`, `competitiveClassId` | Same |

They share identity keys and nothing else. The wall is enforced by `assertSeparation`
and by `toVendorMatchInput`, which is the only supported path into the match engine and
throws on any index field. That satisfies the Addendum acceptance criterion by static check.

---

## 2. The rules the schema enforces

Unknown does not equal weak. `value: null` plus a stated reason is valid and publishable.
A zero is an evidenced absence and requires `absenceEvidenced: true`. The validator rejects
a zero standing in for a gap.

Evidence never moves a rating beyond what its source tier licenses. Analyst reports, RFP
responses, buyer transcripts and field intelligence are not scorable at all. Vendor collateral
caps at Claimed. A vendor demo caps at Strongly Supported internally and publishes nothing
without written permission. An artifact with no confidentiality determination is confidential.

Confidence travels separately. Evidence confidence is its own axis and is never blended into
a capability, fit or position value.

Date everything. A rated value without a source or a `lastValidated` date fails validation.
`isStale` flags anything past its cadence.

No precision beyond the evidence. The index exposes five integer components and a band.
No composite decimal exists on the row object. Near ties render as ties.

An unknown capability may never eliminate a vendor.

---

## 3. Gates

**Completion gate.** `completionGate(record, registry)`. An index row fails without its market
read fields and a methodology link. A decision record fails without charter version, calibration
gate, implementation gravity, Day 2 ownership and change economics. No decision record in a
category may publish until that category's dimensions are locked.

**Score change control.** `applyScoreChange` is the only supported way to move a rated value.
It requires a reason, evidence references, the gate that authorized it and a date, and it appends
to the score delta ledger. It does not mutate the source record. Ratings that move without a
ledger entry are a defect, not an edit.

**Category lock.** `lockCategory` flips `dimensionsLocked` at the calibration gate. Classes and
dimensions are draft hypotheses until then. CCaaS ships with twelve draft dimensions and six draft
classes carried from Phase 1. The other seven categories ship deliberately empty. Nothing is
invented ahead of research.

---

## 4. What the collaborator fills in

**Market Position capture, one to two hours per vendor, public sources only.**
Five dimensions rated zero to four with sources and dates. Then `whatTheySell`, `bestKnownFor`,
`lineageOwnership`, `recentMoves`, `marketCaveat`. A ranked row without a market read is not a
deliverable and the gate will reject it. Never rate on inference. Unrated with a stated reason is
the correct answer when the evidence is absent.

**Phase 2 capture, full record, calibration vendors first.**
Atomic claims, each carrying applicability, capability mode, evidence state with sources, decision
effect and a proof question where the claim is vendor stated or unresolved. Break records tie to
consequence records by id. Implementation gravity, Day 2 ownership and change economics are
required sections, not optional colour.

---

## 5. Open decisions, TB

These are set to defaults in code and flagged here rather than decided silently.

1. Band cuts. Currently mean of rated dimensions: 3.25 Leading, 2.25 Established, 1.25 Emerging, below that Limited.
2. Near tie threshold. Currently one component point on a zero to twenty sum.
3. Minimum rated dimensions to publish a position. Currently three of five. Below that the row renders unpositioned with the reason shown.
4. Whether index positions publish inside competitive class only, which is what the code enforces today, or also category wide. Category wide requires a second ordering function and a second methodology disclosure.
