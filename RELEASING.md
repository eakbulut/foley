# Releasing

Most documentation is enforced by the test suite (see `test/freshness.test.mjs` and
friends): versions across six files, size claims, cue counts, every export documented
in README and d.ts, every attribute documented, CHANGELOG entry for the version.
`npm test` failing IS the release checklist for those.

What the tests cannot judge — review by hand, every release:

1. **The README's top feature bullets.** They describe the product's pitch, and they
   went stale once (frozen at 2.3.0 while everything below them was updated). Reread
   them as if you'd never seen the project: do they sell what this release ships?
2. **The demo's marketing copy** (hero lede, section intros). Same failure mode.
3. **agents.md guidance quality.** New API is *mentioned* automatically (tests), but is
   the *advice* still what an agent should do? (e.g. "prefer adjusting an existing cue".)
4. **CHANGELOG entry reads like release notes,** not a commit list.

## The mechanical steps

```sh
# 1. bump the version in: src/foley.js, package.json,
#    packages/react/package.json, packages/vue/package.json (+ both peer ranges),
#    and the demo badge in index.html (which also carries the size claim)
npm test                      # must be green - it enforces all of the above
git add -A && git commit -m "vX.Y.Z: ..."
git tag vX.Y.Z
git push --follow-tags        # CI tests again, then publishes all three packages
                              # via trusted publishing; Pages redeploys the site
```

npm refuses to republish an existing version, so a tag pushed without a bump fails
loudly at the publish step - annoying, never harmful.
