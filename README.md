# foley

[![npm](https://img.shields.io/npm/v/%40foleyjs%2Fcore)](https://www.npmjs.com/package/@foleyjs/core)
[![CI](https://github.com/eakbulut/foley/actions/workflows/ci.yml/badge.svg)](https://github.com/eakbulut/foley/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-1B9E57)](./LICENSE)

**Sound effects for the interface, performed live.** [Play the demo →](https://usefoley.dev/)

Foley is a tiny, dependency-free library of **28 interaction sounds**, named for the film artists who perform footsteps and door-latches in sync with the picture. It does the same for your interface: every cue is synthesized with Web Audio at the instant of the action. No audio files, no network requests, no build step.

- **28 cues in 7 families** — pointer, press, toggle, feedback, notify, motion, state
- **4 themes** — default, soft, mechanical, glass — or your own transform, or a full [sound set](#sound-sets)
- **Cues are data** — edit any cue's layers with `getSpec()`/`playSpec()`, or visually in the [Cue Designer](https://usefoley.dev/#designer)
- **9.6 kB**, zero dependencies, one ES module
- **Defensive by design** — master limiter, 60ms per-cue cooldown, ±30-cent humanization; `stop()` handles, looping, and ducking built in
- **WAV export** — any cue, any custom design, or all 28 as an audio sprite with an offset map

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

- **`play(name, { pitch?, volume?, loop?, every? })`** — play a cue; returns `{ stop() }`. With `loop: true` it repeats until stopped — ideal for loading states.
- **`bind(root?)`** — wire all `data-foley-*` attributes under `root` (default `document`). Idempotent.
- **`set({ volume?, transpose?, space?, muted?, hover?, theme?, duck? })`** — update global settings. `duck` (0–1) temporarily attenuates everything, e.g. while a video plays. `theme` accepts a name or a custom transform object (`{ pitch, decay, send, ... }`).
- **`get()`** — snapshot of current settings.
- **`toBuffer(name)`** — `Promise<AudioBuffer>`: same offline render, raw — for envelope drawings, meters, or custom encoding.
- **`getSpec(name)`** — a deep, editable copy of a built-in cue's layer spec.
- **`playSpec(spec, { id?, pitch?, volume? })`** — play a custom spec; it is validated and clamped first.
- **`toWavSpec(spec)` / `toBufferSpec(spec)`** — offline-render a custom spec.
- **`normalizeSpec(spec)`** — the validator itself, for checking untrusted specs (max 8 layers, all params clamped).
- **`toSprite(gap?)`** — all 28 cues in one WAV plus a `{ name: { start, duration } }` offset map, for game engines and audio-sprite players.
- **`toWav(name)`** — `Promise<Blob>`: offline-render a cue to 16-bit 44.1 kHz stereo WAV, honoring transpose, space, and theme. Exports are deterministic (no humanization drift).
- **`unlock()`** — resume/create the AudioContext from a user gesture.
- **`getAnalyser()`** — the engine's `AnalyserNode` for scopes and meters, or `null` before unlock.
- **`on("play" | "unlock", cb)`** — subscribe to engine events; returns an unsubscribe function.
- **`cues` / `families` / `themes` / `version`** — metadata for building your own pickers and playgrounds.

## Design your own cues

Every cue is data: an array of `tone`, `noise`, and `cluster` layers. Grab one, reshape it, play it:

```js
import { getSpec, playSpec, toWavSpec } from "@foleyjs/core";

const mySound = getSpec("success");
mySound[2].f = 880;                  // raise the last note
mySound.push({ kind: "noise", at: 0.2, filter: "highpass", f: 6000,
               a: 0.01, d: 0.2, peak: 0.05, send: 0.4 });
playSpec(mySound);
const wav = await toWavSpec(mySound);
```

Or use the visual [Cue Designer on the demo](https://usefoley.dev/#designer) — edit with live playback, then export .wav/.json or share the design as a link.

## Sound sets

A sound set is your product's whole sonic identity as one portable JSON object: a
global character transform plus full replacement specs for the cues that matter most.

```js
import { set, getSet } from "@foleyjs/core";

set({ theme: {
  name: "Acme",
  transform: { pitch: 0.9, decay: 1.3 },      // every cue, reshaped
  cues: { success: [/* layers */], error: [/* layers */] }  // these two, replaced
}});

get().theme;   // "Acme"
getSet();      // snapshot the active identity - JSON-safe, version it in your repo
```

- **`getSet()`** returns the active identity; feeding it back through `set({ theme })` is lossless.
- Assigning any named theme replaces the whole identity, overrides included.
- Overrides are validated like any spec (unknown cues dropped, params clamped).
- Build one visually in the [Cue Designer](https://usefoley.dev/#designer): design a cue, pick
  which built-in it replaces, "Use site-wide", then export the set or copy a set link.

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
npm install      # once per clone — the test suite imports the framework packages,
                 # which need react and the self-linked core from node_modules
npm test         # node --test: metadata integrity, settings, docs/types consistency, build
npm run build    # regenerate the single-file demo at dist/foley-demo.html
npm run docs     # render README.md into dist/docs.html (deployed at /docs.html)
npm run demo     # serve the demo locally
```

Releases follow [RELEASING.md](./RELEASING.md). CI runs the tests on every push; merges to `main` deploy the demo to GitHub Pages (enable Pages with the "GitHub Actions" source in repo settings, once). Pushing a `v*` tag publishes all three packages to npm from CI via [trusted publishing](https://docs.npmjs.com/trusted-publishers) — no tokens. One-time setup: publish each package manually once, then in each package’s npm settings add a Trusted Publisher pointing at this repo and `release.yml`. Provenance is automatic.

## License

MIT © eakbulut and Foley contributors.
