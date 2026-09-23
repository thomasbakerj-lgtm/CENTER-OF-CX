# SHIPPING

How a change reaches production. Closes tracker item 0-06.

0-06 was written as a pre-upload checklist for the GitHub web UI: clear Downloads,
edit in place, md5 verify each file. That workflow is retired now that work runs
through git in Claude Code (`CLAUDE.md` section 8). This file replaces it. The
discipline stays: no change ships unverified.

Drafted 23 September 2026 from the repo and `SHIPPING_FACTS.md` (22 Sep). Approved
by TB 23 September 2026.

---

## 1. The system

| Part | Fact |
|---|---|
| Production | https://contactcentercx.com |
| Host | Vercel, GitHub auto-deploy from `main`. **Every push to `main` is a production deploy** |
| Build | `npm run build` = `vite build && node prerender.mjs`. Prerender writes one HTML file per sitemap URL with the route's own title, description, canonical and social tags, and fails the build on error. 429 URLs as of 23 Sep 2026 |
| Routing | `vercel.json`: 3 permanent redirects (`/tco-calculator` and two CCaaS vertical slugs) and an SPA rewrite of extensionless paths to `/index.html` |
| Analytics | Vercel Analytics (Hobby) plus PostHog through `src/lib/track.js`, keyed by `VITE_POSTHOG_KEY` in the Vercel environment. TB to confirm the key is set |
| Lead capture | Formspree free tier: 50 submissions a month, 30-day retention |

## 2. The path

1. Work on a branch. Never commit directly to `main`, because `main` is production.
2. Run the gates in section 3. All of them, every time.
3. Commit, push the branch, open a pull request.
4. Merge to `main`. Vercel deploys it.
5. Run the post-deploy checks in section 4.

Any route rename needs a permanent redirect in `vercel.json` in the same commit.

## 3. Pre-merge gates

| Gate | Command | Green means |
|---|---|---|
| Dependencies | `npm install` | Once per fresh container. The chunk gate cannot run without `vite` |
| Suite | `node run-all.mjs` | 0 failed, 0 UNPARSED, rail audit clean, chunk gate 25 of 25, exit 0 |
| Build | `npm run build` | `vite build` succeeds and prerender writes every sitemap route |
| Dashes | Python `s.count(chr(0x2014))` and `s.count(chr(0x2013))` on every touched file | Zero. Grep is unreliable on Unicode |
| Engine change | `CLAUDE.md` section 8 | Boundary probe, behavior-neutral A/B, engine and reconciliation harnesses, both registered |

`run-all.mjs` exit codes: 0 green, 1 assertion failed, 2 a registered tool has no
harness or a harness could not run or parse, 3 orphan rail pulls.

## 4. Post-deploy checks

- **Live PDF, one normal and one voided, for any tool whose engine or report
  changed.** Reconcile to the dollar against the harness. This is the step that
  finds defects the suite does not.
- Open each changed route on https://contactcentercx.com and confirm it renders.
- For a route or SEO change, read the raw HTML of the prerendered route and confirm
  the title, description and canonical belong to that asset.

## 5. Governance travels with code

A commit that changes what a tracker item describes updates
`docs/CCCX_MASTER_TRACKER.md` in the same commit, including a change log line.
Where the repo and the claude.ai project library disagree, the repo wins.
