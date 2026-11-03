# Editorial style: how the site speaks

Every public word on ContactCenterCX reads as if a professional writer and editor wrote it for a buyer. The reader is a
contact center leader deciding what to buy, run or change. They do not know how the site is built, and they should not
need to.

This extends section 3 of `BRAND_GUIDE.md`. Where they overlap, the brand guide wins.

## The one test

Read the sentence aloud to a buyer who has never seen the project. If it only makes sense to someone who watched the site
being built, rewrite it.

## Rules

1. **Talk to the reader about what they get.** State what the page gives them, then how it was made.
2. **Use "we" for the site and "you" for the reader.** A person is speaking. Passive constructions that hide who did
   what ("are researched", "is withdrawn", "gets an answer") become active ("we researched", "we withdrew", "we answer").
3. **No builder language in public copy.** These words describe our process, not the reader's decision:

   | Builder phrase | Write instead |
   |---|---|
   | researched under the current method / methodology | researched in depth |
   | Phase 1 assessment, Phase 1 context, Phase 1 profile | our earlier assessment, earlier profile |
   | Phase 1 edition (a download) | April 2026 edition |
   | competitive class | peer group |
   | calibrated (a class) | ready to compare |
   | gate, passed its gate, validated (as process) | finished, checked |
   | integrity freeze, retrofit, rail, doctrine, tracker, session, S22, TB | (cut; never public) |
   | Research Method 1 / 2 | our first method / our current method, linked once to the method page |

   The method page (`/research/method`) may name its own method versions, because that page is where a sceptic goes to
   check them. Everywhere else, link to it instead of naming it.
4. **Use the public glossary.** Internal terms from the research corpus have public terms (Setup effort, Who runs it after
   go-live, Where it breaks, How sure we are, Independently confirmed, Vendor-documented, Our analysis, Not yet confirmed,
   Peer group, Rule it out if, Strong fit when, Be careful if). Use the public term.
5. **Outcome first, short declarative sentences.** One idea per sentence. Cut words by half on every draft.
6. **No em dash or en dash. No "X, not Y" cadence.** Write the positive statement, then the second sentence if needed.
7. **Plain words first.** Spell out an acronym on first sight on a page (contact center as a service (CCaaS)), or use the
   plain phrase instead.
8. **Never change a fact.** Numbers, dates, vendor names, counts, sources, claim tokens (`[[...]]`), links and the four
   claim classes stay exactly as they are. Editing changes how a true thing is said, never what is said. A disclosure
   (scores withdrawn, not yet researched, a dated edition) stays on the page in plainer words. It is never softened away.
9. **Headings are names or plain statements.** "How we build each profile." works. "How the vendor profiles are built."
   reads as a spec.

## Worked example

Before: "22 CCaaS vendors are researched under the current method: findings with dated public sources, compared only inside
a competitive class, with where each platform breaks, what it takes to run, and what to ask for."

After: "We have researched 22 contact center platforms in depth. Every finding cites a dated public source. Each platform is
compared only with its peer group. Every profile shows where it breaks, what it takes to run, and what to ask the vendor
before you sign."

## What is out of scope

Code comments, test files, `docs/`, identifiers, CSS and data keys. Only text a visitor can read: page copy, headings,
buttons, labels, alt text, `<title>` and meta descriptions, PDF text the site generates, and prose fields in data files.

## Enforcement

`copy.test.mjs` section "builder language" fails the suite if a retired builder phrase appears in public copy outside a
code comment. The `editor` agent (`.claude/agents/editor.md`) reviews any change that adds or rewrites public copy.
