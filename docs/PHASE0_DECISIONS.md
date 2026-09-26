# Redesign Phase 0: decisions for TB

Drafted 26 September 2026 (S24, redesign session 1). Each item is written so it can be approved as is or changed in one
reply. Once approved, the decision is copied into CLAUDE.md section 5 and this file records the date.

## D1. Where the research corpus lives

The repository is public, so the raw corpus is never committed (CLAUDE.md section 3, decision 5). Vendor Intelligence
(redesign Phase 7) needs it at build time.

**Recommended: a private GitHub repository, read at build time.**

1. Create a private repository, for example `center-of-cx-research`, holding the corpus JSON and XLSX, one folder per
   category, one file per checkpoint. Free on GitHub.
2. Create a fine-grained read-only token for that repository only. Store it as a Vercel environment variable
   (`RESEARCH_TOKEN`) and as a GitHub Actions secret for the public repository.
3. The Stage 1 loader fetches the named checkpoint during `npm run build`, checks the schema version, keeps only
   publishable evidence and fields the surface-permission table grants to Vendor Intelligence, and writes derived view
   data into the build output. Nothing raw reaches the public repository or the browser.
4. Public tests run against a small synthetic corpus committed to the public repository (invented vendors, the real
   schema), so every separation and publishability test runs on every pull request without the private data. A second
   CI job, holding the secret, runs the same tests against the real checkpoint.
5. Each new checkpoint is a commit in the private repository; the public site names the checkpoint it was built from.

Cost: none. Alternatives considered: a private Vercel Blob store (usage-based, needs a paid plan beyond limits),
committing derived data only (loses the audit trail back to the corpus), manual upload per build (error-prone).

Decision needed: approve the private repository, and create it and the token (Claude cannot create repositories or
tokens from this session). Status: open.

## D2. Vendor correction policy

Vendor pages will be disputed. A published, even-handed process protects independence and the reader.

**Draft policy, for publication on each vendor page footer and a `/corrections` page:**

1. Anyone, including a vendor, can report a factual error using the correction form. The report names the statement, the
   source they believe contradicts it, and a public link to that source.
2. We acknowledge within five working days and decide within twenty.
3. We change a finding only when public, citable evidence supports the change, through the same research process as any
   other finding. Private briefings, demos and marketing claims can raise a question to research; they cannot change a
   published finding on their own.
4. Every accepted correction is logged on the page with its date and what changed. Rejected reports receive a reason.
5. Vendors cannot pay for, sponsor, review in advance or approve any research page.
6. A vendor may add a short, clearly labelled vendor response to a page, shown separately from the research, once per
   research cycle.

Decision needed: approve, change the response times, or remove point 6. Status: open.

## D3. Contributor rules

**Draft rules for the contributor platform (redesign Phase 10):**

1. Who may publish: working practitioners, consultants, analysts and academics in contact center and CX. Vendor
   employees may publish on practice topics; their employer is disclosed on every piece.
2. Every piece is reviewed before publishing for accuracy, originality and disclosure. Review never changes the
   contributor's opinion; it checks facts, sources and the house rules (no dashes, no retired words, figures sourced).
3. Disclosure: role, organisation, and any commercial tie to a vendor or product named in the piece.
4. No product promotion: a piece may name vendors for context; it may not sell, rank or score them.
5. Originality: the contributor confirms the work is their own and that quotations are credited. The site's originality
   record applies.
6. Licence: the contributor keeps copyright and grants The Center of CX a non-exclusive licence to publish, excerpt and
   share with credit. They may republish anywhere.
7. Separation: contributor pieces are labelled "Contributor perspective" and never feed research, grades, Vendor Match or
   the Market Position Index.
8. Removal: a contributor can ask for a piece to be withdrawn; we remove it and note the removal.

Decision needed: approve or change. Legal wording of the licence may warrant a lawyer's read before launch. Status: open.

## D4. Practitioner test group

**Recommended: six to eight people, one or two per role in Brand Guide section 2.**

- Three rounds, each about 30 minutes on a video call, sharing the design canvas or the site:
  - Checkpoint A (end of redesign Phase 1): homepage, one tool, the Vonage page.
  - Checkpoint B (end of Phase 5): the live homepage and the first tools on the new shell.
  - Checkpoint C (Phase 7): vendor pages.
- Five questions every round: what is this site for; where would you start; what would you trust, and why; what would
  you not trust; what would make you come back.
- Notes are summarised, without names, into the tracker change log.

Draft invitation for TB to send:

> I'm rebuilding The Center of CX, a free, independent set of diagnostics and research for contact center and CX
> technology decisions. Would you give me three 30 minute sessions over the next few weeks to react to the designs?
> No preparation, no selling, and your name stays out of anything published.

Decision: skipped by TB on 26 September 2026. No practitioner rounds; the design is committed and the build proceeds.

## Done in this session without a decision

- Research status registry updated to checkpoint `PRODUCTION_COHORT3_NORMALIZED`: 18 CCaaS vendors complete (Puzzel,
  Avaya, Enghouse Interactive, UJET, Bright Pattern and Vonage added), 10 CCaaS and adjacent profiles remain Phase 1
  context. `freeze.test.mjs` updated to match.
- Measurement taxonomy 1.1 drafted in `docs/MEASUREMENT.md`; freezes with code at the start of Phase 5.
