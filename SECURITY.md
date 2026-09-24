# Security

ContactCenterCX.com is a static site with no accounts, no database and no stored user
data. What a visitor enters stays in their browser, in a scenario link they choose to
share, or in a review request they choose to send. Security work protects exactly
those three paths, and the site itself from being turned against its visitors.

## Reporting a problem

Use GitHub's private vulnerability reporting on this repository (the Security tab,
"Report a vulnerability"). Please do not open a public issue for a security problem.
We aim to confirm within two working days and to ship a fix before any public detail.

## The floor, gated on every run

`security.test.mjs` fails the suite if any of these slips:

1. Production serves a strict Content Security Policy: scripts from the site only, no
   inline or evaluated script, no plugins, no framing, pinned base and form targets,
   and only the external hosts the code actually contacts (fonts, PostHog, Formspree).
   Every host the code contacts must be in the policy, and every host in the policy
   must still be used.
2. `nosniff`, `X-Frame-Options: DENY`, a referrer policy and a permissions policy.
3. No HTML sink in shipped code: no `dangerouslySetInnerHTML`, `innerHTML`, `eval` or
   `Function` constructor. `document.write` and `window.open` exist only in the report
   renderer.
4. The report window escapes every field (`export.test.mjs`), carries its own policy
   with `script-src 'none'`, has no inline handler, and loses its handle to the site.
5. Every new-tab link carries `rel="noopener"`.
6. No `.env` file, private key or known token shape is tracked, and the raw research
   corpus is never committed.

The live checker (`scripts/live-check.mjs`, nightly on production) confirms the
headers are served and fails on any policy violation on any page or report window.
`INJECT_HEADERS=1` runs it locally under the same policy before a deploy.

## When we find a security problem

1. **Confirm and size it.** Reproduce it in an isolated browser with analytics and
   Formspree blocked, never with real visitor data. Record who can trigger it, what it
   reaches, and whether it is live.
2. **Fix it at the sink.** Fix the shared component that every path goes through, and
   make the safe behavior the default, so a new tool cannot reintroduce it.
3. **Sweep for siblings.** Find every other path to the same sink or the same class
   of defect, and fix those in the same change.
4. **Add a second layer.** Pair the fix with a policy or header that would stop the
   same attack if the fix were ever missed.
5. **Gate it.** Add a harness that attacks the defect and a static gate that forbids
   its pattern, and prove the gate fires on the unfixed code.
6. **Verify on production.** Re-run the reproduction and the live checker against
   production after the deploy.
7. **Record it.** Log the defect class, impact and fix in `CLAUDE.md` and the tracker
   change log. The repository is public, so the fix ships before any detail that would
   help someone exploit it.
8. **Tell anyone affected.** If visitor data was exposed, say so plainly to the people
   it affects.

## History

| Date | Defect | Fix |
|---|---|---|
| 2026-09-23 | A scenario link could replace a decoded state's prototype | Unsafe keys dropped in both directions; `track.test.mjs` M |
| 2026-09-24 | A scenario link could put markup into report text that ran in the report window | Renderer escapes every field; report window policy `script-src 'none'`; site-wide policy and headers; `export.test.mjs`, `security.test.mjs` |
