# SHIPPING

How a change reaches production. Closes tracker item 0-06.

0-06 was written as a pre-upload checklist for the GitHub web UI: clear Downloads,
edit in place, md5 verify each file. That workflow is retired now that work runs
through git in Claude Code (`CLAUDE.md` section 8). This file replaces it. The
discipline stays: no change ships unverified.

---

## 1. The path

1. Work on a branch, never directly on `main`.
2. Run the gates in section 2. All of them, every time.
3. Commit, push the branch, open a pull request.
4. Merge to `main`. Vercel auto-deploys `main` to production.

`vercel.json` holds the redirects and the SPA rewrite. Any route rename needs a
permanent redirect there in the same commit.

## 2. The gates

A change does not merge until every line holds.

| Gate | Command | Green means |
|---|---|---|
| Dependencies | `npm install` | Once per fresh container. The chunk gate cannot run without `vite` |
| Suite | `node run-all.mjs` | Every assertion passes, rail audit clean, zero UNPARSED, exit 0 |
| Build | `npm run build` | `vite build` succeeds and `prerender.mjs` writes one route file per sitemap URL |
| Dashes | Python `s.count(chr(0x2014))` and `chr(0x2013)` on every touched file | Zero. Grep is unreliable on Unicode |
| Engine change | `CLAUDE.md` section 8, steps 1 to 10 | Boundary probe, behavior-neutral proof, separate reconciliation gate, live PDF normal and voided |

`run-all.mjs` exit codes: 0 green, 1 assertion failed, 2 a registered tool has no
harness or a harness could not run or parse, 3 orphan rail pulls.

## 3. After deploy

- Open the changed route on the production domain and confirm it renders.
- For a route or SEO change, view the raw HTML of the prerendered route and confirm
  the title, description and canonical are the asset's own.
- For an engine change, generate the live PDF from production. A passing suite is
  Level 1 evidence about the code, not about the deployed page.

## 4. Governance travels with code

A commit that changes what a tracker item describes updates
`docs/CCCX_MASTER_TRACKER.md` in the same commit, including a change log line.
Where the repo and the claude.ai project library disagree, the repo wins.
