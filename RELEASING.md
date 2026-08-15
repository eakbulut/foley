# Releasing

Most documentation is enforced by the test suite (see `test/freshness.test.mjs` and
friends): versions across seven places, size claims, cue counts, every export documented
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
npm install                   # refreshes package-lock.json - the seventh sync point
npm test                      # must be green - it enforces all of the above
git add -A && git commit -m "vX.Y.Z: ..."
git tag vX.Y.Z
git push origin main vX.Y.Z   # CI tests again, then publishes all three packages
                              # via trusted publishing; Pages redeploys the site
```

**Push the tag by name.** `git push --follow-tags` pushes only *annotated* tags, and
every tag here is lightweight (`git tag vX.Y.Z`), so it reports "Everything
up-to-date" and silently pushes nothing - the release simply never fires. This ate a
step of the 2.7.0 release. Either name the tag as above, or create it with
`git tag -a`; do not trust `--follow-tags` with a lightweight tag.

**The size claim is minified + gzipped, not `gzip src/foley.js`.** Raw source is about
double, because this file is deliberately comment-heavy — quoting it published a number
nobody actually pays and made every added comment look like bloat. Remeasure with:

```sh
echo 'import * as f from "./src/foley.js"; globalThis.f = f;' > /tmp/all.js
npx esbuild /tmp/all.js --bundle --minify --format=esm --outfile=/tmp/all.out.js
gzip -9 -c /tmp/all.out.js | wc -c     # the badge number, in bytes
```

Swap the import for `{ bind, play, set }` to get the typical-usage figure the README
also quotes. The tests can only check that the badge and README agree, not that either
is true — so this is a by-hand step.

Releasing off a PR instead of straight from main? Merge first, then tag the *merged*
commit on main (`git checkout main && git pull`), since the tag must point at what
CI will publish. The branch's own tip is the wrong commit if the merge rebased it.

Verify afterwards - a green workflow is not proof the registry accepted it:

```sh
npm view @foleyjs/core version   # and @foleyjs/react, @foleyjs/vue
curl -sI https://usefoley.dev/ | head -1
```

npm refuses to republish an existing version, so a tag pushed without a bump fails
loudly at the publish step - annoying, never harmful.
