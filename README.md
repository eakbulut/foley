# foley

[![npm](https://img.shields.io/npm/v/%40foleyjs%2Fcore)](https://www.npmjs.com/package/@foleyjs/core)
[![CI](https://github.com/eakbulut/foley/actions/workflows/ci.yml/badge.svg)](https://github.com/eakbulut/foley/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-1B9E57)](./LICENSE)

**Sound effects for the interface, performed live.** [Play the demo →](https://eakbulut.github.io/foley/)

Foley is a tiny, dependency-free library of **28 interaction sounds**, named for the film artists who perform footsteps and door-latches in sync with the picture. It does the same for your interface: every cue is synthesized with Web Audio at the instant of the action. No audio files, no network requests, no build step.

- **28 cues in 7 families** — pointer, press, toggle, feedback, notify, motion, state
- **4 themes** — default, soft, mechanical, glass — one setting reshapes every cue
- **~5 kB**, zero dependencies, one ES module
- **Defensive by design** — master limiter, 60ms per-cue cooldown, ±30-cent humanization
- **WAV export** — render any cue offline to a 16-bit .wav for Figma, video, or native apps

## Install

```sh
npm install @foleyjs/core
```

> Published under the [foleyjs org](https://www.npmjs.com/org/foleyjs) — the bare name `foley` is blocked by npm's package-name similarity rules. Framework bindings will join as `@foleyjs/react` and friends.

Or skip the install entirely and vendor the single file: copy `src/foley.js` into your project.

## Quickstart

Mark up anything that should make a sound, then bind once at startup.

```html
<button data-foley-press data-foley-release>Save</button>
<a data-foley-hover="tick">Docs</a>
<button data-foley-toggle aria-pressed="false">Dark mode</button>
<input data-foley-type="thock">
```

```js
import { bind, play, set } from "@foleyjs/core";

bind();                          // wires every data-foley-* attribute
set({ volume: 0.7, theme: "default" });

play("success");                 // programmatic cues for things the user didn't click
play("tick", { pitch: 4, volume: 0.3 });
```

Browsers require a user gesture before audio can start; `bind()` installs a one-time unlock listener for you, and `play()` resumes the context automatically.

## Declarative attributes

| Attribute | Fires on | Default cue |
| --- | --- | --- |
| `data-foley-hover` | `pointerenter` | `tick` |
| `data-foley-press` | `pointerdown` | `press` |
| `data-foley-release` | `pointerup` | `release` |
| `data-foley-click` | `click` | `tap` |
| `data-foley-toggle` | `click` (reads `aria-pressed`) | `on` / `off` |
| `data-foley-type` | `keydown` (Enter plays `complete`) | `thock` |

Every attribute accepts a cue name as its value to override the default.

## The 28 cues

| Family | Cues |
| --- | --- |
| Pointer | `tick` `hover` `glide` `pop` |
| Press | `press` `release` `tap` `thock` |
| Toggle | `on` `off` `switch` `latch` |
| Feedback | `success` `error` `warning` `denied` |
| Notify | `chime` `ping` `bell` `bubble` |
| Motion | `swoosh` `whoosh` `drop` `rise` |
| State | `loading` `ready` `complete` `sparkle` |

## API

```js
import { play, bind, set, get, toWav, unlock, getAnalyser, on, cues, families, themes, version } from "@foleyjs/core";
```

- **`play(name, { pitch?, volume? })`** — play a cue, with optional per-play transpose (semitones) and level (0–1).
- **`bind(root?)`** — wire all `data-foley-*` attributes under `root` (default `document`). Idempotent.
- **`set({ volume?, transpose?, space?, muted?, hover?, theme? })`** — update global settings.
- **`get()`** — snapshot of current settings.
- **`toBuffer(name)`** — `Promise<AudioBuffer>`: same offline render, raw — for envelope drawings, meters, or custom encoding.
- **`toWav(name)`** — `Promise<Blob>`: offline-render a cue to 16-bit 44.1 kHz stereo WAV, honoring transpose, space, and theme. Exports are deterministic (no humanization drift).
- **`unlock()`** — resume/create the AudioContext from a user gesture.
- **`getAnalyser()`** — the engine's `AnalyserNode` for scopes and meters, or `null` before unlock.
- **`on("play" | "unlock", cb)`** — subscribe to engine events; returns an unsubscribe function.
- **`cues` / `families` / `themes` / `version`** — metadata for building your own pickers and playgrounds.

## Themes

One setting reshapes all 28 cues — waveforms, envelopes, brightness, noise character, and reverb:

```js
set({ theme: "glass" }); // "default" | "soft" | "mechanical" | "glass"
```

**Soft** rounds every waveform and adds room. **Mechanical** halves the transients and dries the space — machined metal. **Glass** pitches up, rings the filters, and grows an inharmonic partial on every voice — the physics trick that makes struck glass sound like glass.

## Engine behavior you get for free

- A **master limiter** (DynamicsCompressor as brick-wall safety) so overlapping cues never clip.
- A **60ms per-cue cooldown** so hover storms and fast sliders stay musical instead of machine-gunning.
- **Humanization**: each performance drifts up to ±30 cents in pitch and ±8% in level, applied to the whole cue at once — repeated ticks sound performed, not stamped.

## Framework packages

- **React** — [`@foleyjs/react`](./packages/react): `const { play } = useFoley({ theme: "soft" })`
- **Vue 3** — [`@foleyjs/vue`](./packages/vue): `app.use(FoleyPlugin)` then `<button v-foley="'success'">`
- **AI agents** — [`agents.md`](./agents.md): integration instructions for coding assistants

Both re-export everything from the core, share its version number, and declare it as a peer dependency.

## Run the demo

The demo page (`index.html`) imports `src/foley.js` directly — it runs exactly what the package ships. ES modules need a server:

```sh
npm run demo        # or: npx serve .
```

Then open the printed URL. GitHub Pages works too: enable it on the repo root and the demo is live.

## Development

```sh
npm test         # node --test: metadata integrity, settings, docs/types consistency, build
npm run build    # regenerate the single-file demo at dist/foley-demo.html
npm run demo     # serve the demo locally
```

CI runs the tests on every push; merges to `main` deploy the demo to GitHub Pages (enable Pages with the "GitHub Actions" source in repo settings, once).

## License

MIT © eakbulut and Foley contributors.
