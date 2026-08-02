# Foley — instructions for AI coding agents

Foley (`@foleyjs/core`) adds interaction sounds to web UIs. All 28 cues are
synthesized live with Web Audio — there are no audio files to bundle or load.

## Install & initialize

```sh
npm install @foleyjs/core
```

```js
import { bind, set } from "@foleyjs/core";
bind();                 // once, at app startup — wires all data-foley-* attributes
set({ volume: 0.7 });   // optional; themes: "default" | "soft" | "mechanical" | "glass"
```

In React, prefer `@foleyjs/react`: `const { play } = useFoley({ volume: 0.7 })` — it
binds on mount and re-exports the core. In Vue 3, prefer `@foleyjs/vue`:
`app.use(FoleyPlugin, { volume: 0.7 })`, then `<button v-foley="'success'">`.

## Preferred: declarative attributes

Add attributes to existing markup; do not add event listeners for sounds the
attributes already cover.

| Attribute | Fires on | Default cue |
| --- | --- | --- |
| `data-foley-press` + `data-foley-release` | pointerdown / pointerup | press / release |
| `data-foley-click` | click | tap |
| `data-foley-toggle` | click (reads `aria-pressed`) | on / off |
| `data-foley-hover` | pointerenter | tick |
| `data-foley-type` | keydown (Enter → complete) | thock |

Any attribute takes a cue name as its value: `data-foley-click="success"`.

## Programmatic cues

Use `play()` for events the user didn't click:

```js
import { play } from "@foleyjs/core";
play("success");   // after an async save resolves
play("error");     // after it rejects
play("ping");      // an incoming message
play("complete");  // a long task finishing

const h = play("loading", { loop: true }); // repeats until stopped
await work();
h.stop();          // ~20ms fade; then play("complete")
set({ duck: 0.3 }); // attenuate everything while a video/call plays; duck: 1 restores
```

## Placement

Cues can be positioned. `pan` (-1..1) is stereo, `pos` ([x, y, z]) is 3D (HRTF) for
WebXR and canvas scenes; both are set at the trigger and never move, because a cue is
a ~200ms one-shot. There is no listener API and no repositioning — do not look for one.

```js
play("tick", { pan: -0.7 });         // left side of the screen
play("ping", { pos: [2, 0, -3] });   // 3D scenes
set({ localize: 0.6 });              // every data-foley-* cue pans to its own element
```

Prefer `set({ localize })` over hand-computing pans for DOM UI: `bind()` derives each
element's position for you. For a `play()` call you make yourself, `panFor(el)` returns
the same value. Exports (`toWav`, `toSprite`) are always centered.

## Cue selection guide

- Button press feel: `press` + `release` (two-part), or `tap` (single)
- Keystrokes: `thock` · Toggles/switches: `data-foley-toggle` (plays on/off)
- Form success: `success` · validation failure: `error` · blocked action: `denied`
- Notifications: `ping` (light), `chime`/`bell` (important), `bubble` (chat)
- Page/panel transitions: `swoosh`/`whoosh` · progress done: `complete`
- Full list: tick hover glide pop · press release tap thock · on off switch latch ·
  success error warning denied · chime ping bell bubble · swoosh whoosh drop rise ·
  loading ready complete sparkle

## Rules

1. Call `bind()` exactly once (it is idempotent, but once is the pattern).
2. Never gate `play()` behind your own throttling — the engine has a 60ms
   per-cue cooldown and a master limiter built in.
3. Do not preload, fetch, or bundle sound files for these cues; they are synthesized.
4. Audio requires a user gesture; `bind()` installs the unlock listener. Do not
   autoplay cues on page load.
5. Respect users: expose a mute (`set({ muted: true })`) in app settings.
6. WAV assets for native/video use: `const blob = await toWav("chime")`.
7. Custom sounds: see "Custom sound specs" below. Prefer adjusting an existing cue
   over building from scratch; the built-ins are tuned.

## Custom sound specs

Every cue is data: an array of layers. `getSpec(name)` returns an editable copy;
`playSpec(spec)` plays it (validated and clamped first — max 8 layers);
`toWavSpec(spec)` renders it to a WAV Blob. Layer shapes:

```js
{ kind: "tone",  at: 0,    wave: "sine|triangle|square|sawtooth",
  f: 440, f2: null,        // Hz; set f2 for a pitch sweep (40–8000)
  glide: 0.06,             // sweep time, s
  a: 0.004, d: 0.15,       // attack / decay, s
  peak: 0.15, send: 0 }    // level (0–0.4), reverb send (0–1)

{ kind: "noise", at: 0,    filter: "bandpass|lowpass|highpass",
  f: 2000, f2: null, glide: 0.1, q: 1,   // filter freq, sweep, resonance
  a: 0.002, d: 0.05, peak: 0.12, send: 0 }

{ kind: "cluster", at: 0,  // seeded random grains (sparkle, shimmer)
  n: 5, step: 0.035,       // grain count and spacing
  fMin: 1600, fMax: 4600, d: 0.1, peak: 0.04, send: 0.5, seed: 1 }
```

Common adjustments, expressed as spec edits:

- **Lower / higher**: multiply every `f`, `f2`, `fMin`, `fMax` by `2^(semitones/12)`.
- **Snappier / longer**: multiply every `d` (and `at`, to keep the gesture's rhythm).
- **Softer texture**: reduce `peak` on noise/cluster layers; prefer sine/triangle waves.
- **More distant**: raise `send` on each layer (the room itself is `set({ space })`).

```js
import { getSpec, playSpec, toWavSpec } from "@foleyjs/core";
const s = getSpec("success");
s.forEach((l) => { l.d *= 1.4; if (l.f) l.f *= 0.84; });  // longer, ~3 st lower
playSpec(s);
```

A whole sonic identity is a **sound set**: `{ name, transform, cues }` — a global
transform plus per-cue replacement specs. Load with `set({ theme: soundSet })`;
snapshot with `getSet()`. If the project has a set JSON (often `*-foley-set.json`),
load it at startup and do not re-tune individual cues by hand.

Humans can do this visually at https://usefoley.dev/#designer — its JSON export is a
valid spec and can be pasted straight into `playSpec()`, and its share links
(`#spec=...`) encode the same format. If a user hands you a designer link or JSON
file, use it verbatim rather than reconstructing the sound.
