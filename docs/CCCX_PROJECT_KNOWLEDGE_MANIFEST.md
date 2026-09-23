# CCCX PROJECT KNOWLEDGE MANIFEST

**Rebuilt 27 August 2026, after a full wipe.**

What belongs in project knowledge, what does not, and why. Read this before
uploading anything.

---

## 1. The one rule

**Project knowledge holds only what is authoritative, static, and stored nowhere else.**

Three tests. A file must pass all three.

| Test | Question | Fails if |
|---|---|---|
| Authoritative | Is this the canonical copy? | A newer copy lives in the repo |
| Static | Does it change between sessions? | It is revised as work proceeds |
| Unique | Is this the only copy? | It is in the repo, Drive, or regenerable |

Code fails all three. Research passes all three.

**Corollary, and it is the important one.** If it lives in the repo, it does not
go here. The moment a file exists in two places, one of them is silently wrong
and the filename gives no clue which. That is what caused the wipe: seven
`src/lib` files were uploaded under shifted filenames, so `track.js` in the
library actually held `metrics.js`, and nothing about the name said so.

---

## 2. What to upload

### Tier 1: governance. Upload first, one at a time, verify each filename.

| File | Status | Source |
|---|---|---|
| `DOCTRINE_Epistemic_Standard.md` v1.1 | Rebuilt 27 Aug, consolidated | This session |
| `CCCX_MASTER_TRACKER.md` | **Recover** | Chat "Next phase," 26 Aug. 96 items, 16 workstreams |
| `CCCX_RESEQUENCE_UNDER_AMENDMENT_11.md` | Have it | Already in library |
| `DECISION_1-09_Confidence_Taxonomy.md` | Have it | This session |
| `CCCX_ACHIEVEMENT_AUDIT.md` | **Recover** | Chat "Next phase," 26 Aug. Optional, it is a dated snapshot |

**Retire, do not re-upload:** the standalone `ContactCenterCX_Doctrine_Amendment_11`.
It is now Section 11 of the doctrine. Keeping both recreates the amend-from-outside
problem the consolidation just solved. The Resequence stays because it replaces a
tracker section, not a doctrine section, and the tracker is still a separate file.

### Tier 2: research and market intelligence. The actual reason this library exists.

Everything not in the repo and not regenerable. Vendor matrices, IVA research,
category playbooks, orchestration framework, vertical work, thesis and brand
documents, competitive analysis.

**Deduplicate before uploading.** One Digital Engagement matrix, not four. One IVA
Research file, not three. Where two files cover the same ground, upload the newer
and delete the other rather than keeping both and deciding later.

### Tier 3: nothing.

---

## 3. What never goes here

| Category | Why |
|---|---|
| Any `.jsx`, `.js`, `.mjs` | Revised every session. The repo is canonical. Verified stale and mislabeled at wipe |
| Harnesses and test files | Most likely to be misread as current, because a passing assertion count looks like evidence |
| `package.json`, `vite.config.js`, `index.html`, `vercel.json` | In the repo |
| Kickoff and handoff packets | Single-session scope. Pasted into the chat, not stored |
| Session transcripts and readouts | Superseded by the next session by definition |
| Applied patch sheets | Contain instructions that read as pending after they are done |

---

## 4. Upload discipline

The failure that caused the wipe was a bulk upload that shifted filenames. It will
happen again on a bulk drag-and-drop.

1. **One file at a time.** No multi-select.
2. **Confirm the filename in the library after each upload**, before starting the next.
3. **Clear the Downloads folder first**, so no `(1)` collision renames anything.
4. **Spot-check content, not just the name.** Open one file per batch and read the
   first line. A filename is not evidence of content.

---

## 5. Standing audit

Once a month, or after any bulk change, pick three files at random and read the
first three lines of each. If any file's content does not match its name, wipe and
rebuild rather than repairing. A library with one known mislabeling has an unknown
blast radius, and auditing all of it costs more than rebuilding it.

---

## 6. What project knowledge is for

It is retrieval context, not an archive and not a backup.

Claude searches it and reasons from what it finds. A stale file is not clutter, it
is a document that can hand back a superseded instruction with no date attached.
**Contradiction costs more than volume.** A small, current library beats a complete one.

The session's source of truth is the live repo, pulled at the start of every chat:

```
curl -sL https://codeload.github.com/thomasbakerj-lgtm/CENTER-OF-CX/tar.gz/refs/heads/main -o r.tgz
tar xzf r.tgz && cd CENTER-OF-CX-main
```

Never `raw.githubusercontent.com`. It caches per path and honours neither a
cache-busting query string nor a no-cache header.

---

## 7. Backup, which the library is not

Governance documents existed only in project knowledge, so the wipe removed the
only copy of the doctrine and tracker. Both are recoverable, but the exposure was
real and it should not recur.

**Fix:** governance documents live in the repo as well, at repo root. The repo is
version-controlled, the library is not. The library gets a copy for retrieval; the
repo holds the record.

That is the one deliberate exception to the rule in Section 1, and it is justified
because the alternative is having no version history on the documents that govern
everything else. Where the two disagree, the repo wins.