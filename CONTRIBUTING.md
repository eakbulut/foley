# Contributing to Foley

Thanks for being here. This project has an unusual property worth knowing before
you start: **most design decisions are encoded as tests.** If `npm test` fails, it
is usually not a bug in your change - it is the project telling you a decision
exists (version sync across seven files, every export documented, marketing
numbers matching reality). Read the failure message; it says what to do.

## Setup

```sh
npm install   # once - tests import the framework packages
npm test      # plain node --test, no framework (one of them shells out to tsc)
npm run demo  # serve the demo locally
```

## Where things live

- `src/foley.js` - the entire engine, one ES module. Cues are data (`CUES` specs).
- `src/foley.d.ts` - types, hand-maintained, sync-tested against the module.
- `types/consumer.ts` - the fixture `npm test` compiles with `tsc --strict` to
  prove the published types work. Its `@ts-expect-error` lines must keep
  erroring, so widening anything to `any` fails the build. Write interface
  members as properties (`stop: () => void`), never method shorthand - the
  method form makes `const { stop } = play(...)` trip unbound-method lint rules.
- `index.html` - the demo. CSS in `<head>`, all page logic in ONE
  `<script type="module">` (the standalone build depends on this - see
  `scripts/build-standalone.mjs`). localStorage only between the
  `/* BEGIN-STORE */` markers.
- `packages/react`, `packages/vue` - thin bindings, versions locked to core.
- Design tokens are CSS custom properties in `:root`; page canvases read them
  via `cssVar()` - change a color once, both render layers follow.

## Adding a cue (the guided tour of the guard system)

1. Add a spec to `CUES` in `src/foley.js` with a family, a free key, and a
   one-line description.
2. Run `npm test`. It will now walk you through everything else: the d.ts
   `CueName` union, the README cue table, the demo's cue count claims. Each
   failure names its file.
3. Listen to it against its family on the demo board. Taste is the one test
   we can't automate - keep cues short, quiet, and distinct.

## Pull requests

- `npm test` green, `npm run build` succeeds.
- New behavior ships with a guard test in the established style (enumerate
  reality, assert the docs/UI cover it).
- Release mechanics are maintainer territory - see `RELEASING.md`.
