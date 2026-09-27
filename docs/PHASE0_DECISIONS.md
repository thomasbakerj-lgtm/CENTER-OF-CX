# Redesign Phase 0: decisions for TB

Drafted 26 September 2026 (S24, redesign session 1). Each item is written so it can be approved as is or changed in one
reply. Once approved, the decision is copied into CLAUDE.md section 5 and this file records the date.

## D1. Where the research corpus lives

The repository is public, so the raw corpus is never committed (CLAUDE.md section 3, decision 5). Vendor Intelligence
(redesign Phase 7) needs it at build time.

**Recommended (revised 27 September 2026, S24): a private repository for the raw corpus, and a committed, publishable
snapshot that the site builds from.**

1. **Raw stays private.** A private repository, `center-of-cx-research`, holds the corpus JSON and XLSX, one folder per
   category, one commit per checkpoint. Free on GitHub. The public repository never holds raw research.
2. **A sync job makes the public snapshot.** `scripts/research-sync.mjs` reads a named checkpoint, checks the schema
   version, drops everything the publication rules exclude (confidential and restricted evidence, the
   `INTERNAL_RESEARCH_ONLY` objects, fields no public surface is allowed to read) and writes one derived file per category,
   `src/data/research/<category>.json`, with a manifest: checkpoint name, schema version, SHA-256 of the source file,
   loader version, date. A GitHub Action holding a read-only token runs it on demand and opens a pull request.
3. **The site builds from the snapshot only.** Vercel needs no token, so every build and preview works, and a GitHub or
   token outage cannot break a deploy.
4. **Every change to what the public sees is a reviewed diff.** A new checkpoint arrives as a pull request: the suite
   gates it (schema, publishability, separation tests), and the diff shows exactly which claims changed. Rollback is a
   revert. The manifest hash ties each snapshot to the exact private checkpoint, so the audit trail is kept.
5. **Tests run in public on synthetic data.** A small invented corpus with the real schema lives in the public repository,
   so the 18 separation and publishability tests run on every pull request. The sync job also runs them on the real
   checkpoint before it opens its pull request.
6. **It scales by category.** Each of the eight categories gets its own adapter and derived file on the same loader; one
   category's criteria never leak into another's.

Why this over the earlier plan (fetch the private corpus during every Vercel build): the snapshot is exactly what the
site publishes anyway, so committing it exposes nothing new, and it removes a secret and a network call from every build,
makes each research update reviewable before it goes live, and lets previews work. Cost: none.

What TB does, about ten minutes, once:
1. Create the private repository `center-of-cx-research` and upload the Cohort 3 corpus JSON (and the XLSX).
2. Create a fine-grained personal access token: that repository only, Contents read-only.
3. Add it to the public repository as an Actions secret named `RESEARCH_TOKEN`.
4. Add the private repository to a Claude session (so the loader can be written and tested against the real file).

Status: **decided 27 September 2026 (TB: "merge it and go").** Built the same day: the loader, the committed CCaaS snapshot
(derived locally from the Cohort 3 corpus TB uploaded to the session), the research harness, and the sync workflow
(`.github/workflows/research-sync.yml`). The workflow runs once TB completes steps 1 to 3 above; until then a new checkpoint
is synced by running `node scripts/research-sync.mjs --corpus <file>` in a session that has the corpus.

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

**Decided (TB, 27 Sep 2026):** points 1 to 5 as drafted; point 6 (vendor response block) removed; accepted corrections noted on the vendor's page. Published at `/corrections`; built in `src/lib/research/corrections.js` and `Corrections.jsx`, gated by `corrections.test.mjs`.

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
