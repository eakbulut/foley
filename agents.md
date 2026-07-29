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
```

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
